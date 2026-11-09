// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import AppendixRoute from "./drafts.$number.appendices.$letter";

const room = vi.hoisted(() => ({
  collaborators: [] as { activity?: "typing"; color: string; name: string; uid: string }[],
}));

// jsdom has no elementFromPoint, which the editor's listeners call (this file's own `document`
// helper hides the global one)
globalThis.document.elementFromPoint ??= () => null;

const collabTouch = vi.hoisted(() => vi.fn());
vi.mock("../authoring/collab/useCollabSession", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../authoring/collab/useCollabSession")>()),
  useCollabSession: () => ({
    collaboration: null,
    collaborators: room.collaborators,
    mode: "solo",
    presenceCount: 0,
    reconnecting: false,
    touch: collabTouch,
  }),
}));

const document = (words: string) =>
  JSON.stringify({
    root: {
      children: [
        { children: [{ text: words, type: "text", version: 1 }], type: "paragraph", version: 1 },
      ],
      type: "root",
      version: 1,
    },
  });

const row = (
  versionNo: number,
  state: "DRAFT" | "PUBLISHED",
  words: string,
  title = "Desk zones",
) => ({
  contentJson: document(words),
  id: `row-${versionNo}-${state}`,
  publishedAt: state === "PUBLISHED" ? `2026-0${versionNo}-01T00:00:00Z` : null,
  publishedBy: null,
  state,
  title,
  updatedAt: "2026-10-01T00:00:00Z",
  updatedBy: "u-1",
  versionNo,
});

const base = {
  appendix: {
    contributors: [
      { active: true, name: "Bob Author", userId: "u-1" },
      { active: false, name: "Former Fran", userId: "u-9" },
    ],
    draft: row(3, "DRAFT", "Draft words"),
    id: "a-1",
    letter: "A",
    orderIndex: 0,
    policyId: "p-1",
    published: row(2, "PUBLISHED", "Second words"),
    publishedVersions: [row(2, "PUBLISHED", "Second words"), row(1, "PUBLISHED", "First words")],
    retiredAt: null,
    versions: [],
  },
  meId: "u-1",
  policy: { number: "POL-EXPENSES-000002", title: "Expense Claims Policy" },
};

type Props = Parameters<typeof AppendixRoute>[0];

const mount = (data: Record<string, unknown> = base) => {
  const Stub = createRoutesStub([
    {
      action: () => ({ ok: false }),
      Component: () => (
        <AppendixRoute {...({ actionData: undefined, loaderData: data } as unknown as Props)} />
      ),
      path: "/drafts/:number/appendices/:letter",
    },
  ]);
  render(<Stub initialEntries={["/drafts/POL-EXPENSES-000002/appendices/A"]} />);
};

describe("the appendix page (bug log 223)", () => {
  it("has a Draft tab, first and selected, and a Published tab", () => {
    mount();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.map((tab) => tab.textContent)).toEqual(["Draft", "Published"]);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
  });

  it("is only a Draft tab until something is published", () => {
    mount({
      ...base,
      appendix: { ...base.appendix, published: null, publishedVersions: [] },
    });
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual(["Draft"]);
  });

  it("says nothing about readers seeing the published appendix", () => {
    mount();
    expect(screen.queryByText(/Readers still see the published appendix/)).toBeNull();
  });

  it("no longer shows the changes in a box of its own", () => {
    mount();
    expect(
      screen.queryByRole("region", { name: "Changes from the published appendix" }),
    ).toBeNull();
  });

  it("shows the latest published version on the Published tab, with no diff", async () => {
    mount();
    await userEvent.click(screen.getByRole("tab", { name: "Published" }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("Second words")).toBeInTheDocument();
    expect(within(panel).queryByText("Draft words")).toBeNull();
  });

  it("lists the published versions, latest first, and opens an earlier one", async () => {
    mount();
    await userEvent.click(screen.getByRole("tab", { name: "Published" }));
    const choose = screen.getByRole("combobox", { name: "Published version" });
    const options = within(choose).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringMatching(/^v2 .*latest/),
      expect.stringMatching(/^v1/),
    ]);
    await userEvent.selectOptions(choose, options[1]!);
    expect(within(screen.getByRole("tabpanel")).getByText("First words")).toBeInTheDocument();
  });

  it("lists everyone who contributed, and marks the people who are no longer active", () => {
    mount();
    const list = screen.getByRole("list", { name: "Contributors" });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Bob Author", "Former Fran (no longer active)"]);
  });

  it("shows no contributors list for someone the gateway lists none to", () => {
    mount({ ...base, appendix: { ...base.appendix, contributors: [] } });
    expect(screen.queryByRole("list", { name: "Contributors" })).toBeNull();
  });

  it("offers the person Unified or Diff on the draft, starting on Diff", () => {
    mount();
    expect(screen.getByRole("radio", { name: "Diff" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Unified" })).not.toBeChecked();
  });

  it("offers no view choice when there is nothing published to compare with", () => {
    mount({ ...base, appendix: { ...base.appendix, published: null, publishedVersions: [] } });
    expect(screen.queryByRole("radio", { name: "Diff" })).toBeNull();
  });

  it("remembers the person's own choice", async () => {
    mount();
    await userEvent.click(screen.getByRole("radio", { name: "Unified" }));
    await waitFor(() =>
      expect(localStorage.getItem("steward-web:staff:editor-view:u-1")).toBe("unified"),
    );
  });
});

describe("an appendix nobody changed (bug log 246)", () => {
  it("arms no checkpoint when the editor reports the text it was given", async () => {
    collabTouch.mockClear();
    mount({ ...base, appendix: { ...base.appendix, draft: null } });
    expect(await screen.findByText("Second words")).toBeInTheDocument();
    expect(collabTouch).not.toHaveBeenCalled();
  });
});

describe("who else is in the appendix (bug log 250)", () => {
  it("names each other person and whether they are editing or typing", () => {
    room.collaborators = [
      { color: "#0091FF", name: "Bob Author", uid: "u-bob" },
      { activity: "typing", color: "#E5484D", name: "Alice Admin", uid: "u-alice" },
    ];
    mount();
    const list = screen.getByRole("list", { name: "Who is here" });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Bob Author editing", "Alice Admin typing"]);
    room.collaborators = [];
  });
});
