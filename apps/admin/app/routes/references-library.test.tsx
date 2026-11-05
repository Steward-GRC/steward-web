// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ReferenceKind } from "@steward-web/api-client";
import { type Identity, IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import ReferencesLibrary from "./references-library";

const ADMIN: Identity = { ...NO_ACCESS, id: "u-alice", isSiteAdmin: true, name: "Alice" };

const REFS = [
  {
    archived: false,
    body: null,
    clause: "§4.2",
    createdByUserId: "u-alice",
    id: "r-1",
    kind: ReferenceKind.Standard,
    label: "Workplace health standard",
    url: null,
    usedByCount: 3,
  },
  {
    archived: false,
    body: null,
    clause: null,
    createdByUserId: "u-alice",
    id: "r-2",
    kind: ReferenceKind.Link,
    label: "Travel portal",
    url: "https://travel.example.org",
    usedByCount: 0,
  },
];

type Props = Parameters<typeof ReferencesLibrary>[0];

const openReferences = () => {
  const posted: Record<string, string>[] = [];
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        const body = await request.formData();
        posted.push(Object.fromEntries([...body.entries()].map(([k, v]) => [k, String(v)])));
        return { intent: String(body.get("intent")), ok: true };
      },
      Component: () => (
        <IdentityProvider identity={ADMIN}>
          <ReferencesLibrary {...({ loaderData: { refs: REFS } } as unknown as Props)} />
        </IdentityProvider>
      ),
      path: "/references-library",
    },
  ]);
  render(<Stub initialEntries={["/references-library"]} />);
  return posted;
};

describe("References & standards (A26)", () => {
  it("heads the page, with + New reference and no eyebrow", async () => {
    openReferences();
    expect(
      await screen.findByRole("heading", { level: 1, name: "References & standards" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reusable standards, reference text, and links attached by policy authors."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Structure")).toBeNull();
    expect(screen.getByRole("button", { name: "New reference" })).toBeInTheDocument();
  });

  it("lists each entry with its kind badge and how many policies use it", () => {
    openReferences();
    const health = screen.getByRole("row", { name: /Workplace health standard/ });
    expect(within(health).getByText("Standard")).toBeInTheDocument();
    expect(within(health).getByText("3 policies")).toBeInTheDocument();
    const portal = screen.getByRole("row", { name: /Travel portal/ });
    expect(within(portal).getByText("Link")).toBeInTheDocument();
    expect(within(portal).getByText("0 policies")).toBeInTheDocument();
  });

  it("won't delete an entry in use, and says why", () => {
    openReferences();
    const health = screen.getByRole("row", { name: /Workplace health standard/ });
    const remove = within(health).getByRole("button", { name: "Delete" });
    expect(remove).toHaveAttribute("aria-disabled", "true");
    expect(remove).toHaveAccessibleDescription("In use — archive instead of deleting.");
  });

  it("archives after D33, which says policies keep showing it", async () => {
    const posted = openReferences();
    const health = screen.getByRole("row", { name: /Workplace health standard/ });
    await userEvent.click(within(health).getByRole("button", { name: "Archive" }));
    const dialog = await screen.findByRole("dialog", { name: "Archive this reference?" });
    expect(
      within(dialog).getByText("Policies that already reference it keep showing it."),
    ).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Archive reference" }));
    expect(posted).toEqual([{ archived: "true", id: "r-1", intent: "archive" }]);
  });

  it("opens New reference (D12) with the kinds and Create reference", async () => {
    openReferences();
    await userEvent.click(screen.getByRole("button", { name: "New reference" }));
    const dialog = await screen.findByRole("dialog", { name: "New reference" });
    expect(within(dialog).getByRole("radio", { name: /Standard/ })).toBeChecked();
    expect(within(dialog).getByRole("textbox", { name: "Clause" })).toHaveClass("font-mono");
    expect(within(dialog).getByRole("button", { name: "Create reference" })).toBeInTheDocument();
  });

  it("deletes an entry nothing uses after its confirm", async () => {
    const posted = openReferences();
    const portal = screen.getByRole("row", { name: /Travel portal/ });
    await userEvent.click(within(portal).getByRole("button", { name: "Delete" }));
    const dialog = await screen.findByRole("dialog", { name: "Delete this reference?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete reference" }));
    expect(posted).toEqual([{ id: "r-2", intent: "delete" }]);
  });
});
