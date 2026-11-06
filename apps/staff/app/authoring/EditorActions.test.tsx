// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ActionsMenu, AiMenu, SubmitForApproval } from "./EditorActions";

const inRouter = (node: React.ReactNode, answer: () => unknown = () => ({ ok: true })) => {
  const posted = vi.fn();
  const Stub = createRoutesStub([
    {
      action: async ({ request }) => {
        posted(Object.fromEntries(await request.formData()));
        return answer();
      },
      Component: () => node,
      path: "/",
    },
  ]);
  render(<Stub />);
  return posted;
};

const document = { number: "POL-EXPENSES-000002", title: "Expense Claims Policy" };

describe("Submit for approval (D37)", () => {
  it("asks first, with the document, and submits for approval", async () => {
    const posted = inRouter(<SubmitForApproval document={document} missing={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    const dialog = screen.getByRole("dialog", { name: "Submit for approval?" });
    expect(dialog).toHaveAccessibleDescription(
      "Expense Claims Policy (POL-EXPENSES-000002) goes to its approvers. You can't edit it while it's in review.",
    );
    expect(within(dialog).getByRole("button", { name: "Keep editing" })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("button", { name: "Submit for approval" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalledWith({ intent: "submit-review" }));
  });

  it("names the workflow when it's known", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} workflow="Finance sign-off" />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(/goes to Finance sign-off\./);
  });

  it("shows the version Steward worked out, why, and the change type, when the gateway sends it", async () => {
    inRouter(
      <SubmitForApproval
        document={document}
        missing={[]}
        version={{
          change: "major",
          from: "2.0.0",
          reacknowledge: true,
          reasons: ["A deadline changed in 2. Making a claim"],
          to: "3.0.0",
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("v2.0.0")).toHaveClass("line-through");
    expect(within(dialog).getByText("v3.0.0")).toBeInTheDocument();
    expect(within(dialog).getByText("Worked out by Steward")).toBeInTheDocument();
    expect(within(dialog).getByText("Why Major")).toBeInTheDocument();
    expect(within(dialog).getByText("A deadline changed in 2. Making a claim")).toBeInTheDocument();
    expect(
      within(dialog).getByText("Everyone in the audience will be asked to acknowledge again."),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("radio", { name: "Major" })).toBeChecked();
    expect(within(dialog).getByText("Lowering it needs a reason")).toBeInTheDocument();
  });

  it("leaves the version out when the gateway doesn't send it", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByText("Worked out by Steward")).toBeNull();
  });

  it("says which required sections are empty instead of submitting", async () => {
    inRouter(<SubmitForApproval document={document} missing={["3. Visitor records"]} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Fill every required section before submitting. Empty: 3. Visitor records",
    );
  });

  it("explains a refusal for a group with no workflow", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} />, () => ({
      error: { code: "FAILED_PRECONDITION" },
      ok: false,
    }));
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    await userEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Submit for approval" }),
    );
    expect(await screen.findByText("This draft can't go for review yet")).toBeInTheDocument();
  });
});

describe("Actions (U11) and Discard draft (D3)", () => {
  it.each([
    [
      { inReview: true, published: "2.0.0" },
      "It's in review. Discarding withdraws it from approval and deletes your changes. The published v2.0.0 stays live.",
    ],
    [
      { inReview: false, published: "2.0.0" },
      "Discarding deletes your changes. The published v2.0.0 stays live.",
    ],
    [{ inReview: false }, "Discarding deletes this draft. It has never been published."],
  ])("discards from the Actions menu with the wording for its state", async (state, wording) => {
    const posted = inRouter(<ActionsMenu {...state} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Discard draft…" }));
    const dialog = screen.getByRole("dialog", { name: "Discard this draft?" });
    expect(dialog).toHaveAccessibleDescription(wording);
    expect(dialog).toHaveAttribute("data-tone", "danger");
    await userEvent.click(within(dialog).getByRole("button", { name: "Discard draft" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalledWith({ intent: "discard" }));
  });
});

describe("the AI menu (U27)", () => {
  it("offers Improve draft, Rewrite a section and Review draft", async () => {
    const choose = vi.fn();
    render(<AiMenu available onChoose={choose} />);
    await userEvent.click(screen.getByRole("button", { name: "AI" }));
    const items = screen.getAllByRole("menuitem").map((item) => item.textContent);
    expect(items).toEqual(["Improve draft…", "Rewrite a section…", "Review draft"]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Review draft" }));
    expect(choose).toHaveBeenCalledWith("review");
  });

  it("offers Generate a draft on an empty draft", async () => {
    const choose = vi.fn();
    render(<AiMenu available emptyDraft onChoose={choose} />);
    await userEvent.click(screen.getByRole("button", { name: "AI" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Generate a draft…" }));
    expect(choose).toHaveBeenCalledWith("generate");
  });

  it("says it's working while an AI task runs", () => {
    render(<AiMenu available onChoose={() => {}} status="working" />);
    expect(screen.getByRole("button", { name: "AI, working" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("pulses when a result is ready, and offers it in the menu", async () => {
    const choose = vi.fn();
    render(<AiMenu available onChoose={choose} status="ready" />);
    const button = screen.getByRole("button", { name: "AI, result ready" });
    expect(button).toHaveAttribute("data-ready", "true");
    await userEvent.click(button);
    await userEvent.click(screen.getByRole("menuitem", { name: "AI result ready to review" }));
    expect(choose).toHaveBeenCalledWith("result");
  });

  it("is off with the reason when AI is unavailable", () => {
    render(<AiMenu available={false} onChoose={() => {}} reason="disabled_by_admin" />);
    const button = screen.getByRole("button", { name: "AI" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAccessibleDescription("AI turned off by an administrator");
  });

  it("says when the AI limit is reached", () => {
    render(<AiMenu available={false} onChoose={() => {}} reason="limit_reached" />);
    expect(screen.getByRole("button", { name: "AI" })).toHaveAccessibleDescription(
      "AI limit reached",
    );
  });
});

describe("Submit for approval: the author picks the change (#156)", () => {
  it("offers Major, Minor and Fix and shows the version each one gives", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} published="1.2.3" />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    const dialog = screen.getByRole("dialog", { name: "Submit for approval?" });
    const kinds = within(dialog).getByRole("radiogroup", { name: "Change type" });
    expect(
      within(kinds)
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value")),
    ).toEqual(["major", "minor", "fix"]);
    expect(within(kinds).getByRole("radio", { name: "Minor" })).toBeChecked();
    expect(within(dialog).getByText("v1.3.0")).toBeInTheDocument();
    await userEvent.click(within(kinds).getByRole("radio", { name: "Major" }));
    expect(within(dialog).getByText("v2.0.0")).toBeInTheDocument();
    await userEvent.click(within(kinds).getByRole("radio", { name: "Fix" }));
    expect(within(dialog).getByText("v1.2.4")).toBeInTheDocument();
  });

  it("sends the pick with the submit", async () => {
    const posted = inRouter(
      <SubmitForApproval document={document} missing={[]} published="1.2.3" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    const dialog = screen.getByRole("dialog", { name: "Submit for approval?" });
    await userEvent.click(within(dialog).getByRole("radio", { name: "Fix" }));
    await userEvent.click(within(dialog).getByRole("button", { name: "Submit for approval" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({ changeType: "fix", intent: "submit-review" }),
    );
  });

  it("has no picker for a first publish, which is always v1.0.0", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByRole("radiogroup", { name: "Change type" })).toBeNull();
  });
});
