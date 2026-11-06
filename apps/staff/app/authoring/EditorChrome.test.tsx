// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import {
  AppendicesPanel,
  EditorHeader,
  NextVersion,
  Presence,
  RequiredSections,
  SaveState,
} from "./EditorChrome";

const inRouter = (node: React.ReactNode, action = vi.fn()) => {
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        action(Object.fromEntries(await request.formData()));
        return { ok: true };
      },
      Component: () => node,
      path: "/",
    },
  ]);
  render(<Stub />);
  return action;
};

describe("the editor header (U11)", () => {
  it("shows the breadcrumb, the serif title, the number and version line, Draft and the save state", () => {
    inRouter(
      <EditorHeader
        actions={<button type="button">Submit for approval</button>}
        breadcrumb={<nav aria-label="Breadcrumb">Workplace · Facilities</nav>}
        meta="POL-FACILITIES-000004 · v1.0.0 · draft"
        presence={null}
        saveState="saved"
        title="Visitor Sign-in Policy"
      />,
    );
    expect(screen.getByText("Workplace · Facilities")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Visitor Sign-in Policy" })).toHaveClass(
      "font-serif",
    );
    expect(screen.getByText("POL-FACILITIES-000004 · v1.0.0 · draft")).toHaveClass("font-mono");
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    expect(
      screen.getByText(
        "Co-authored — others with author access in this category can edit. · Draft a starting point, write from scratch, or select any text to rewrite it.",
      ),
    ).toBeInTheDocument();
  });
});

describe("the save state (U11)", () => {
  it.each([
    ["saving", "Saving…"],
    ["saved", "Saved"],
    ["unsaved", "Unsaved changes"],
  ] as const)("says %s", (state, text) => {
    render(<SaveState state={state} />);
    expect(screen.getByRole("status")).toHaveTextContent(text);
  });
});

describe("presence (U11)", () => {
  const people = ["Carol", "Dave", "Erin", "Frank", "Grace", "Ivan"].map((name, index) => ({
    color: `#00000${index}`,
    name,
    uid: name.toLowerCase(),
  }));

  it("shows up to four avatars, +N, and Editing together", () => {
    render(<Presence collaborators={people} state="together" />);
    const group = screen.getByRole("group", { name: "Editing now" });
    expect(within(group).getAllByRole("img")).toHaveLength(4);
    expect(within(group).getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("Editing together")).toBeInTheDocument();
  });

  it.each([
    ["live", "Live"],
    ["reconnecting", "Reconnecting…"],
  ] as const)("says %s", (state, text) => {
    render(<Presence collaborators={[]} state={state} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("says it's read-only once published elsewhere", () => {
    render(<Presence collaborators={[]} publishedVersion="3" state="published" />);
    expect(screen.getByText("Published as v3 — read-only")).toBeInTheDocument();
  });
});

describe("required sections (U11)", () => {
  it("ticks the filled ones, marks the empty ones and counts them", () => {
    render(
      <RequiredSections
        sections={[
          { filled: true, title: "1. Purpose" },
          { filled: true, title: "2. Signing in" },
          { filled: false, title: "3. Visitor records" },
        ]}
      />,
    );
    const panel = screen.getByRole("region", { name: "Required sections" });
    expect(panel).toHaveTextContent("2 of 3");
    const items = within(panel).getAllByRole("listitem");
    expect(items[0]).toHaveAttribute("data-filled", "true");
    expect(items[2]).toHaveAttribute("data-filled", "false");
    expect(items[2]).toHaveTextContent("3. Visitor records · empty");
  });

  it("is green when everything's filled", () => {
    render(<RequiredSections sections={[{ filled: true, title: "1. Purpose" }]} />);
    expect(screen.getByRole("region", { name: "Required sections" })).toHaveAttribute(
      "data-complete",
      "true",
    );
  });
});

describe("next version (U11)", () => {
  it("is v1.0.0 for a first publish", () => {
    render(<NextVersion firstPublish />);
    const card = screen.getByRole("region", { name: "Next version" });
    expect(card).toHaveTextContent("v1.0.0· first publish");
    expect(card).toHaveTextContent("The type is worked out when you submit.");
  });

  it("names the version it follows otherwise", () => {
    render(<NextVersion firstPublish={false} published="2.0.0" />);
    expect(screen.getByRole("region", { name: "Next version" })).toHaveTextContent("After v2.0.0");
  });
});

describe("appendices (U17)", () => {
  const appendices = [
    {
      id: "a1",
      letter: "A",
      text: "Visitor, contractor and delivery.",
      title: "Visitor badge types",
    },
    { id: "a2", letter: "B", text: "", title: "Reception hours" },
  ];

  it("lists each appendix by letter, collapsed, with Add appendix", async () => {
    const action = inRouter(<AppendicesPanel appendices={appendices} draftId="d1" />);
    const panel = screen.getByRole("region", { name: "Appendices" });
    const toggles = within(panel).getAllByRole("button", { expanded: false });
    expect(toggles.map((b) => b.textContent)).toEqual(["AVisitor badge types", "BReception hours"]);
    await userEvent.click(within(panel).getByRole("button", { name: "Add appendix" }));
    await vi.waitFor(() =>
      expect(action).toHaveBeenCalledWith({ intent: "add-appendix", policyVersionId: "d1" }),
    );
  });

  it("opens one to edit its title and text, and saves it", async () => {
    const action = inRouter(<AppendicesPanel appendices={appendices} draftId="d1" />);
    await userEvent.click(screen.getByRole("button", { name: /Visitor badge types/ }));
    const title = screen.getByLabelText("Appendix A title");
    await userEvent.clear(title);
    await userEvent.type(title, "Badge types");
    await userEvent.click(screen.getByRole("button", { name: "Save appendix" }));
    await vi.waitFor(() =>
      expect(action).toHaveBeenCalledWith({
        appendixId: "a1",
        intent: "update-appendix",
        text: "Visitor, contractor and delivery.",
        title: "Badge types",
      }),
    );
  });

  it("moves an appendix down, keeping the first from moving up", async () => {
    const action = inRouter(<AppendicesPanel appendices={appendices} draftId="d1" />);
    await userEvent.click(screen.getByRole("button", { name: /Visitor badge types/ }));
    expect(screen.getByRole("button", { name: "Move appendix A up" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Move appendix A down" }));
    await vi.waitFor(() =>
      expect(action).toHaveBeenCalledWith({
        intent: "reorder-appendices",
        orderedIds: "a2,a1",
        policyVersionId: "d1",
      }),
    );
  });

  it("reorders by dragging one onto another", async () => {
    const action = inRouter(<AppendicesPanel appendices={appendices} draftId="d1" />);
    const [first, second] = within(screen.getByRole("region", { name: "Appendices" })).getAllByRole(
      "listitem",
    );
    fireEvent.dragStart(second!);
    fireEvent.dragOver(first!);
    fireEvent.drop(first!);
    await vi.waitFor(() =>
      expect(action).toHaveBeenCalledWith({
        intent: "reorder-appendices",
        orderedIds: "a2,a1",
        policyVersionId: "d1",
      }),
    );
  });

  it("asks before deleting one (D15)", async () => {
    const action = inRouter(<AppendicesPanel appendices={appendices} draftId="d1" />);
    await userEvent.click(screen.getByRole("button", { name: /Reception hours/ }));
    await userEvent.click(screen.getByRole("button", { name: "Delete appendix" }));
    const dialog = screen.getByRole("dialog", { name: "Delete this appendix?" });
    expect(dialog).toHaveAccessibleDescription(
      "Appendix B: Reception hours and its content will be removed from this draft.",
    );
    expect(action).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole("button", { name: "Delete appendix" }));
    await vi.waitFor(() =>
      expect(action).toHaveBeenCalledWith({ appendixId: "a2", intent: "delete-appendix" }),
    );
  });

  it("says when there are none", () => {
    inRouter(<AppendicesPanel appendices={[]} draftId="d1" />);
    expect(
      screen.getByText("No appendices yet. Add one to attach supplementary material."),
    ).toBeInTheDocument();
  });
});
