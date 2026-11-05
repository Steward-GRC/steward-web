// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import TemplateDetail from "./templates.$code";

const section = (key: string, title: string, order: number, level: number, required: boolean) => ({
  blocks: [],
  key,
  level,
  order,
  required,
  title,
});

const PUBLISHED = [
  section("purpose", "Purpose", 0, 1, true),
  section("scope", "Scope", 1, 1, true),
  section("statement", "Policy statement", 2, 1, true),
  section("exceptions", "Exceptions", 3, 2, false),
];

const DRAFT = [...PUBLISHED, section("related", "Related rules", 4, 2, false)];

const VERSIONS = [
  { id: "v-3", sections: DRAFT, status: "draft", templateId: "t-1", versionNo: 3 },
  { id: "v-2", sections: PUBLISHED, status: "published", templateId: "t-1", versionNo: 2 },
  {
    id: "v-1",
    sections: PUBLISHED.slice(0, 2),
    status: "superseded",
    templateId: "t-1",
    versionNo: 1,
  },
];

const TEMPLATE = {
  code: "TPL-001",
  id: "t-1",
  name: "Standard Policy",
  ownerCategoryId: null,
  retiredAt: null,
};

type DetailProps = Parameters<typeof TemplateDetail>[0];

const openTemplate = (versions: object[] = VERSIONS) => {
  const posted: FormData[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const form = await request.formData();
        posted.push(form);
        return { intent: form.get("intent"), ok: true };
      },
      Component: () => (
        <TemplateDetail
          {...({ loaderData: { template: TEMPLATE, versions } } as unknown as DetailProps)}
        />
      ),
      path: "/templates/:code",
    },
  ]);
  render(<Stub initialEntries={["/templates/TPL-001"]} />);
  return posted;
};

const last = (posted: FormData[]) => posted.at(-1)!;
const rows = () => within(screen.getByRole("list", { name: "Sections" })).getAllByRole("listitem");

describe("Template detail, the draft wizard (A7)", () => {
  it("opens with the name, the active and draft versions, and Discard draft", async () => {
    openTemplate();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Standard Policy" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Templates")).toBeInTheDocument();
    expect(screen.getByText("v2 active · v3 draft")).toBeInTheDocument();
    const steps = screen.getByRole("list", { name: "Draft steps" });
    expect(within(steps).getByRole("button", { name: "1 Sections" })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });

  it("lists the sections with their numbers, levels and required switches", async () => {
    openTemplate();
    await screen.findByRole("heading", { level: 1 });
    const list = rows();
    const first = list[0];
    const exceptions = list[3];
    const related = list[4];
    expect(within(first!).getByText("1")).toBeInTheDocument();
    expect(within(first!).getByText("H1")).toBeInTheDocument();
    expect(within(first!).getByRole("switch", { name: "Required" })).toBeChecked();
    expect(within(exceptions!).getByText("3.1")).toBeInTheDocument();
    expect(within(exceptions!).getByRole("switch", { name: "Required" })).not.toBeChecked();
    expect(within(related!).getByText("3.2")).toBeInTheDocument();
  });

  it("indents with the right arrow on a grip and toggles required", async () => {
    openTemplate();
    await screen.findByRole("heading", { level: 1 });
    within(rows()[1]!).getByRole("button", { name: "Move Scope" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(within(rows()[1]!).getByText("H2")).toBeInTheDocument();
    expect(within(rows()[1]!).getByText("1.1")).toBeInTheDocument();
    await userEvent.click(within(rows()[1]!).getByRole("switch", { name: "Required" }));
    expect(within(rows()[1]!).getByRole("switch", { name: "Required" })).not.toBeChecked();
  });

  it("saves on Next: Review, shows the changes, then publishes", async () => {
    const posted = openTemplate();
    await userEvent.click(await screen.findByRole("button", { name: "Next: Review" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("save-sections"));
    expect(last(posted).get("versionId")).toBe("v-3");

    expect(await screen.findByText("Changes against v2")).toBeInTheDocument();
    expect(screen.getByText("Added Related rules")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2 Review" })).toHaveAttribute(
      "aria-current",
      "step",
    );

    await userEvent.click(screen.getByRole("button", { name: "Next: Publish" }));
    expect(
      screen.getByText("This becomes the active template version for new policies."),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Publish version" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("publish"));
    expect(last(posted).get("versionId")).toBe("v-3");
  });

  it("discards the draft after asking (D30)", async () => {
    const posted = openTemplate();
    await userEvent.click(await screen.findByRole("button", { name: "Discard draft" }));
    const dialog = screen.getByRole("dialog", { name: "Discard the v3 draft?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Discard draft" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("discard-draft"));
  });

  it("offers Create version when there's no draft, and shows the version history", async () => {
    const posted = openTemplate(VERSIONS.slice(1));
    expect(await screen.findByText("v2 active")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Draft steps" })).not.toBeInTheDocument();
    const history = screen.getByRole("list", { name: "Version history" });
    expect(within(history).getByText("v2 · 4 sections")).toBeInTheDocument();
    expect(within(history).getByText("published")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Create version" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("create-version"));
  });

  it("retires from the actions menu after asking (D30)", async () => {
    const posted = openTemplate();
    await userEvent.click(await screen.findByRole("button", { name: "More actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Retire" }));
    const dialog = screen.getByRole("dialog", { name: "Retire Standard Policy?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Retire template" }));
    await vi.waitFor(() => expect(last(posted).get("intent")).toBe("retire"));
  });
});
