// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { notify, Toaster } from "@steward-web/ui";
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

  it.each([
    ["no content", { empty: true, missing: [] as string[] }],
    ["a missing required section", { missing: ["Purpose"] }],
    ["an incomplete button", { incompleteButtons: 1, missing: [] as string[] }],
  ])("closes the blocked-submit toast by itself: %s (bug log 238)", async (_name, props) => {
    const warning = vi.spyOn(notify, "warning").mockImplementation(() => "id");
    inRouter(<SubmitForApproval document={document} {...props} />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    const options = warning.mock.calls.at(-1)?.[1];
    expect(options?.duration).toBeDefined();
    expect(Number.isFinite(options?.duration)).toBe(true);
    warning.mockRestore();
  });

  it("names the workflow when it's known", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} workflow="Finance sign-off" />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.getByRole("dialog")).toHaveAccessibleDescription(/goes to Finance sign-off\./);
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

  it("closes its dialog once the withdraw is done (bug log 233)", async () => {
    const posted = inRouter(<ActionsMenu inReview />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Withdraw from review…" }));
    const dialog = screen.getByRole("dialog", { name: "Withdraw from review?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Withdraw" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalled());
    await vi.waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Withdraw from review?" })).toBeNull(),
    );
  });

  it("stays open and says why when the withdraw is refused (bug log 233)", async () => {
    inRouter(<ActionsMenu inReview />, () => ({
      error: { code: "FAILED_PRECONDITION", message: "no longer active" },
      ok: false,
    }));
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Withdraw from review…" }));
    const dialog = screen.getByRole("dialog", { name: "Withdraw from review?" });
    await userEvent.click(within(dialog).getByRole("button", { name: "Withdraw" }));
    expect(await within(dialog).findByText("It is no longer in review.")).toBeInTheDocument();
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

const openPicker = async (props: Partial<React.ComponentProps<typeof SubmitForApproval>> = {}) => {
  const posted = inRouter(
    <SubmitForApproval
      document={document}
      missing={[]}
      published="1.2.3"
      suggested="minor"
      {...props}
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
  return { dialog: screen.getByRole("dialog", { name: "Submit for approval?" }), posted };
};

describe("Submit for approval: the author picks the change (#390)", () => {
  it("shows what Steward suggests and starts on it", async () => {
    const { dialog } = await openPicker();
    const kinds = within(dialog).getByRole("radiogroup", { name: "Change type" });
    expect(
      within(kinds)
        .getAllByRole("radio")
        .map((radio) => radio.getAttribute("value")),
    ).toEqual(["major", "minor", "fix"]);
    expect(within(kinds).getByRole("radio", { name: "Minor" })).toBeChecked();
    expect(within(dialog).getByText("Steward suggests Minor")).toBeInTheDocument();
    expect(within(dialog).getByText("v1.2.3")).toHaveClass("line-through");
    expect(within(dialog).getByTestId("next-version")).toHaveTextContent("v1.3.0");
    expect(within(dialog).queryByRole("textbox")).toBeNull();
  });

  it("raises the version freely, with no reason", async () => {
    const { dialog, posted } = await openPicker();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Major" }));
    expect(within(dialog).getByTestId("next-version")).toHaveTextContent("v2.0.0");
    expect(within(dialog).queryByRole("textbox")).toBeNull();
    await userEvent.click(within(dialog).getByRole("button", { name: "Submit for approval" }));
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({ changeType: "major", intent: "submit-review" }),
    );
  });

  it("needs a reason to go lower, says the first stage must agree, and sends both", async () => {
    const { dialog, posted } = await openPicker();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Fix" }));
    const submit = within(dialog).getByRole("button", { name: "Submit for approval" });
    expect(
      within(dialog).getByText(
        "The first approval stage has to agree before a lower type applies. Until then it publishes as Minor.",
      ),
    ).toBeInTheDocument();
    // the version does not drop until the approvers agree
    expect(within(dialog).getByTestId("next-version")).toHaveTextContent("v1.3.0");
    expect(submit).toBeDisabled();
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "Why is it lower?" }),
      "Only a typo moved.",
    );
    expect(submit).toBeEnabled();
    await userEvent.click(submit);
    await vi.waitFor(() =>
      expect(posted).toHaveBeenCalledWith({
        changeType: "fix",
        changeTypeReason: "Only a typo moved.",
        intent: "submit-review",
      }),
    );
  });

  it("does not take a blank reason", async () => {
    const { dialog } = await openPicker();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Fix" }));
    await userEvent.type(
      within(dialog).getByRole("textbox", { name: "Why is it lower?" }),
      " ".repeat(3),
    );
    expect(within(dialog).getByRole("button", { name: "Submit for approval" })).toBeDisabled();
  });

  it("goes back to no reason when the pick comes back up to the suggestion", async () => {
    const { dialog } = await openPicker({ suggested: "major" });
    await userEvent.click(within(dialog).getByRole("radio", { name: "Minor" }));
    expect(within(dialog).getByRole("textbox", { name: "Why is it lower?" })).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Major" }));
    expect(within(dialog).queryByRole("textbox")).toBeNull();
    expect(within(dialog).getByRole("button", { name: "Submit for approval" })).toBeEnabled();
  });

  it("has no picker for a first publish, which is always v1.0.0", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} suggested="minor" />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByRole("radiogroup", { name: "Change type" })).toBeNull();
  });

  it("has no picker when core sent no suggestion", async () => {
    inRouter(<SubmitForApproval document={document} missing={[]} published="1.2.3" />);
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByRole("radiogroup", { name: "Change type" })).toBeNull();
  });

  it("says what is wrong when the service refuses the pick", async () => {
    const posted = inRouter(
      <SubmitForApproval document={document} missing={[]} published="1.2.3" suggested="minor" />,
      () => ({ error: { code: "INVALID_ARGUMENT", operation: "SubmitWorkflow" }, ok: false }),
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Submit for approval" }));
    await vi.waitFor(() => expect(posted).toHaveBeenCalled());
    expect(
      await within(dialog).findByText("That change type could not be used."),
    ).toBeInTheDocument();
  });
});

describe("Submit for approval: whether people acknowledge again (#397)", () => {
  it("says publishing asks people to acknowledge again when the gateway says so", async () => {
    const { dialog } = await openPicker({ reacknowledge: true, suggested: "major" });
    expect(
      within(dialog).getByText("Publishing asks people to acknowledge this again."),
    ).toBeInTheDocument();
  });

  it("says it does not when the gateway says so", async () => {
    const { dialog } = await openPicker({ reacknowledge: false });
    expect(
      within(dialog).getByText("Publishing does not ask people to acknowledge this again."),
    ).toBeInTheDocument();
  });

  it("says nothing when the gateway sent no answer", async () => {
    const { dialog } = await openPicker();
    expect(within(dialog).queryByText(/acknowledge this again/)).toBeNull();
  });

  it("says nothing for a first publish, where there is nothing to acknowledge again", async () => {
    inRouter(
      <SubmitForApproval document={document} missing={[]} reacknowledge suggested="major" />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Submit for approval" }));
    expect(screen.queryByText(/acknowledge this again/)).toBeNull();
  });

  it("hides the answer once the pick moves off the type it was worked out for", async () => {
    const { dialog } = await openPicker({ reacknowledge: false });
    expect(within(dialog).getByText(/acknowledge this again/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Major" }));
    expect(within(dialog).queryByText(/acknowledge this again/)).toBeNull();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Minor" }));
    expect(within(dialog).getByText(/acknowledge this again/)).toBeInTheDocument();
  });

  it("reads the answer against the version's own change type when it has one", async () => {
    const { dialog } = await openPicker({ reacknowledge: true, reacknowledgeFor: "major" });
    // the picker starts on the suggestion (minor), not the type the answer is for
    expect(within(dialog).queryByText(/acknowledge this again/)).toBeNull();
    await userEvent.click(within(dialog).getByRole("radio", { name: "Major" }));
    expect(
      within(dialog).getByText("Publishing asks people to acknowledge this again."),
    ).toBeInTheDocument();
  });
});
