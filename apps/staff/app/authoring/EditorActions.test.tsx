// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Toaster } from "@steward-web/ui";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { ActionsMenu, SubmitForApproval } from "./EditorActions";

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
  render(
    <>
      <Stub />
      <Toaster />
    </>,
  );
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

  it("blocks the submit with a toast while a button has no label or link (bug log 183, 202)", async () => {
    inRouter(<SubmitForApproval document={document} incompleteButtons={2} missing={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      await screen.findByText("Give every button a label and a link before submitting."),
    ).toBeInTheDocument();
    expect(screen.getByText("2 buttons are incomplete.")).toBeInTheDocument();
  });

  it("blocks the submit with a toast while the document has no text (bug log 210)", async () => {
    inRouter(<SubmitForApproval document={document} empty missing={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(
      await screen.findByText("A document with no content can't be submitted."),
    ).toBeInTheDocument();
    expect(screen.getByText("Write something in it first.")).toBeInTheDocument();
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
    // a toast, drawn at the app root: a box inside the header would be placed against the header,
    // whose container makes it the containing block for anything fixed (bug log 202)
    expect(
      await screen.findByText("Fill every required section before submitting."),
    ).toBeInTheDocument();
    expect(screen.getByText("Empty: 3. Visitor records")).toBeInTheDocument();
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

describe("Withdraw from review", () => {
  it("is in the Actions menu while the draft is in review, and takes the submission back", async () => {
    const posted = inRouter(<ActionsMenu inReview />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Withdraw from review…" }));
    const dialog = screen.getByRole("dialog", { name: "Withdraw from review?" });
    expect(dialog).toHaveAccessibleDescription(
      "The approvers stop reviewing it and it goes back to Draft. Your changes stay.",
    );
    await userEvent.click(within(dialog).getByRole("button", { name: "Withdraw" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalledWith({ intent: "withdraw" }));
  });

  it("is not offered for a draft that is not in review", async () => {
    inRouter(<ActionsMenu inReview={false} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(screen.queryByRole("menuitem", { name: "Withdraw from review…" })).toBeNull();
  });
});

const open = async () => {
  await userEvent.click(screen.getByRole("button", { name: /^Actions/ }));
};

describe("the AI actions inside the Actions menu (U27, bug log 220)", () => {
  it("has no separate AI button", () => {
    inRouter(<ActionsMenu ai={{ available: true, onChoose: () => {} }} inReview={false} />);
    expect(screen.queryByRole("button", { name: /^AI/ })).toBeNull();
  });

  it("offers Improve draft, Rewrite a section and Review draft, ahead of Discard draft", async () => {
    const choose = vi.fn();
    inRouter(<ActionsMenu ai={{ available: true, onChoose: choose }} inReview={false} />);
    await open();
    const items = screen.getAllByRole("menuitem").map((item) => item.textContent);
    expect(items).toEqual([
      "Improve draft…",
      "Rewrite a section…",
      "Review draft",
      "Discard draft…",
    ]);
    await userEvent.click(screen.getByRole("menuitem", { name: "Review draft" }));
    expect(choose).toHaveBeenCalledWith("review");
  });

  it("offers Generate a draft on an empty draft", async () => {
    const choose = vi.fn();
    inRouter(
      <ActionsMenu ai={{ available: true, emptyDraft: true, onChoose: choose }} inReview={false} />,
    );
    await open();
    await userEvent.click(screen.getByRole("menuitem", { name: "Generate a draft…" }));
    expect(choose).toHaveBeenCalledWith("generate");
  });

  it("says on the Actions button that an AI task is working", () => {
    inRouter(
      <ActionsMenu
        ai={{ available: true, onChoose: () => {}, status: "working" }}
        inReview={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Actions, AI working" })).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("pulses when a result is ready, and offers it in the menu", async () => {
    const choose = vi.fn();
    inRouter(
      <ActionsMenu ai={{ available: true, onChoose: choose, status: "ready" }} inReview={false} />,
    );
    const button = screen.getByRole("button", { name: "Actions, AI result ready" });
    expect(button).toHaveAttribute("data-ready", "true");
    await userEvent.click(button);
    await userEvent.click(screen.getByRole("menuitem", { name: "AI result ready to review" }));
    expect(choose).toHaveBeenCalledWith("result");
  });

  it("shows the AI items off, with the reason, when AI is unavailable", async () => {
    inRouter(
      <ActionsMenu
        ai={{ available: false, onChoose: () => {}, reason: "disabled_by_admin" }}
        inReview={false}
      />,
    );
    await open();
    const off = screen.getByRole("menuitem", { name: /AI turned off by an administrator/ });
    expect(off).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("menuitem", { name: "Review draft" })).toBeNull();
  });

  it("says when the AI limit is reached", async () => {
    inRouter(
      <ActionsMenu
        ai={{ available: false, onChoose: () => {}, reason: "limit_reached" }}
        inReview={false}
      />,
    );
    await open();
    expect(screen.getByRole("menuitem", { name: /AI limit reached/ })).toBeInTheDocument();
  });

  it("leaves the AI out when the screen gives none", async () => {
    inRouter(<ActionsMenu inReview={false} />);
    await open();
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Discard draft…",
    ]);
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
