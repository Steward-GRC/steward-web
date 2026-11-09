// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./Button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  type DialogContentProps,
  DialogFooter,
  DialogNote,
  SideSheetBody,
  SideSheetContent,
  StepUpDialog,
  TypeToConfirm,
} from "./Overlays";

const Frame = ({ input, ...props }: { input?: boolean } & Partial<DialogContentProps>) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <span>{open ? "open" : "closed"}</span>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent
          description="It's in review. Discarding withdraws it."
          title="Discard this draft?"
          {...props}
        >
          <DialogBody>{input ? <input aria-label="Reason" /> : null}</DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Keep draft</Button>
            </DialogClose>
            <Button variant="danger">Discard draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Confirm = ({ onDelete }: { onDelete: () => void }) => (
  <Dialog open>
    <DialogContent title="Delete the Purchasing category?" tone="danger">
      <TypeToConfirm phrase="Purchasing">
        {(confirmed) => (
          <DialogFooter>
            <Button variant="secondary">Cancel</Button>
            <Button disabled={!confirmed} onClick={onDelete} variant="danger">
              Delete category
            </Button>
          </DialogFooter>
        )}
      </TypeToConfirm>
    </DialogContent>
  </Dialog>
);

const Toggle = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button onClick={() => setOpen((o) => !o)} type="button">
        Toggle
      </button>
      <Dialog open={open}>
        <DialogContent title="Delete Carol?">
          <TypeToConfirm phrase="carol@example.org">
            {(confirmed) => (
              <Button disabled={!confirmed} variant="danger">
                Delete user
              </Button>
            )}
          </TypeToConfirm>
        </DialogContent>
      </Dialog>
    </>
  );
};

const renderStepUp = (props: Partial<Parameters<typeof StepUpDialog>[0]> = {}) => {
  const onConfirm = vi.fn();
  const onResend = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <StepUpDialog
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      onResend={onResend}
      open
      {...props}
    />,
  );
  return { onConfirm, onOpenChange, onResend };
};

const Sheet = () => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <span>{open ? "open" : "closed"}</span>
      <Dialog onOpenChange={setOpen} open={open}>
        <SideSheetContent
          description="Desk Booking Policy · POL-FACILITIES-000001"
          title="Magic links"
        >
          <SideSheetBody>No magic links issued for this policy yet.</SideSheetBody>
        </SideSheetContent>
      </Dialog>
    </>
  );
};

describe("the dialog frame (Dialogs canvas)", () => {
  it("is centred with auto margins, not a translate (bug log 237)", () => {
    // the editor's stylesheet resets --tw-translate-x/y outside any layer, which beats a
    // translate utility and leaves a translate-centred frame hanging from the window's centre
    render(<Frame />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).not.toMatch(/translate/);
    expect(dialog).toHaveClass("sm:inset-0", "sm:m-auto", "sm:h-fit");
  });

  it("names the dialog by its title and describes it by its one line", () => {
    render(<Frame />);
    const dialog = screen.getByRole("dialog", { name: "Discard this draft?" });
    expect(dialog).toHaveAccessibleDescription("It's in review. Discarding withdraws it.");
  });

  it("has no corner close button: the actions are the only way out besides Esc", () => {
    render(<Frame />);
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByRole("button", { name: "Close" })).toBeNull();
    expect(
      within(dialog)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Keep draft", "Discard draft"]);
  });

  it.each<[DialogContentProps["tone"], string]>([
    [undefined, "plain"],
    ["primary", "primary"],
    ["danger", "danger"],
  ])("carries the %s top edge", (tone, edge) => {
    render(<Frame tone={tone} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-tone", edge);
  });

  it.each<[DialogContentProps["size"], string]>([
    [undefined, "standard"],
    ["wide", "wide"],
  ])("is the %s width", (size, expected) => {
    render(<Frame size={size} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("data-size", expected);
  });

  it("closes on Esc", async () => {
    render(<Frame />);
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("refuses Esc while busy", async () => {
    render(<Frame busy />);
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("open")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-busy", "true");
  });

  it("never closes on an outside click when it holds input", async () => {
    render(<Frame hasInput input />);
    // The modal sets pointer-events: none outside it; the outside press still reaches Radix.
    await userEvent.setup({ pointerEventsCheck: 0 }).click(document.body);
    expect(screen.getByText("open")).toBeInTheDocument();
  });

  it("closes on an outside click when it holds no input", async () => {
    render(<Frame />);
    await userEvent.setup({ pointerEventsCheck: 0 }).click(document.body);
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("shows a note in the body", () => {
    render(
      <Dialog open>
        <DialogContent title="Delete this policy?">
          <DialogBody>
            <DialogNote>Published policies cannot be deleted.</DialogNote>
          </DialogBody>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Published policies cannot be deleted.")).toBeInTheDocument();
  });
});

describe("type to confirm (D17)", () => {
  it("keeps the danger button disabled until the phrase matches", async () => {
    const onDelete = vi.fn();
    render(<Confirm onDelete={onDelete} />);
    const field = screen.getByLabelText("Type Purchasing to confirm");
    const button = screen.getByRole("button", { name: "Delete category" });
    expect(button).toBeDisabled();
    await userEvent.type(field, "Purch");
    expect(button).toBeDisabled();
    await userEvent.type(field, "asing");
    expect(button).toBeEnabled();
    await userEvent.click(button);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("is case sensitive", async () => {
    render(<Confirm onDelete={() => {}} />);
    await userEvent.type(screen.getByLabelText("Type Purchasing to confirm"), "purchasing");
    expect(screen.getByRole("button", { name: "Delete category" })).toBeDisabled();
  });

  it("starts empty every time the dialog opens", async () => {
    render(<Toggle />);
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await user.type(
      screen.getByLabelText("Type carol@example.org to confirm"),
      "carol@example.org",
    );
    expect(screen.getByRole("button", { name: "Delete user" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Toggle", hidden: true }));
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getByLabelText("Type carol@example.org to confirm")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Delete user" })).toBeDisabled();
  });

  it("puts extra body content before the field", () => {
    render(
      <Dialog open>
        <DialogContent title="Merge these accounts?">
          <TypeToConfirm before={<p>SOURCE — CLOSED AFTER MERGE</p>} phrase="erin.old@example.org">
            {() => null}
          </TypeToConfirm>
        </DialogContent>
      </Dialog>,
    );
    const source = screen.getByText("SOURCE — CLOSED AFTER MERGE");
    const field = screen.getByLabelText("Type erin.old@example.org to confirm");
    expect(source.compareDocumentPosition(field) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("the step-up code (D18)", () => {
  it("asks for the emailed code with the designed copy and a plum edge", () => {
    renderStepUp();
    const dialog = screen.getByRole("dialog", { name: "Confirm it's you" });
    expect(dialog).toHaveAccessibleDescription("Enter the 6-digit code sent to your email");
    expect(dialog).toHaveAttribute("data-tone", "primary");
    expect(within(dialog).getByLabelText("Code")).toHaveAttribute("autocomplete", "one-time-code");
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("confirms with the six digits typed", async () => {
    const { onConfirm } = renderStepUp();
    await userEvent.type(screen.getByLabelText("Code"), "48a2190");
    expect(screen.getByLabelText("Code")).toHaveValue("482190");
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith("482190");
  });

  it("doesn't confirm a short code", async () => {
    const { onConfirm } = renderStepUp();
    await userEvent.type(screen.getByLabelText("Code"), "4821");
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("resends the code", async () => {
    const { onResend } = renderStepUp();
    await userEvent.click(screen.getByRole("button", { name: "Resend" }));
    expect(onResend).toHaveBeenCalledOnce();
  });

  it("explains what the code is for in the note", () => {
    renderStepUp({ note: "Used for transferring root and other high-risk actions." });
    expect(
      screen.getByText("Used for transferring root and other high-risk actions.", { exact: false }),
    ).toBeInTheDocument();
  });

  it("shows a wrong code inline on the field", () => {
    renderStepUp({ error: "That code didn't work. Try again." });
    expect(screen.getByLabelText("Code")).toHaveAccessibleDescription(
      "That code didn't work. Try again.",
    );
  });

  it("blocks Cancel and Esc while busy", async () => {
    const { onOpenChange } = renderStepUp({ busy: true });
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

describe("the side sheet (D31, D35)", () => {
  it("names the sheet and describes it", () => {
    render(<Sheet />);
    const sheet = screen.getByRole("dialog", { name: "Magic links" });
    expect(sheet).toHaveAccessibleDescription("Desk Booking Policy · POL-FACILITIES-000001");
    expect(sheet).toHaveAttribute("data-side", "right");
    expect(within(sheet).getByText("No magic links issued for this policy yet.")).toBeVisible();
  });

  it("closes from its header close button", async () => {
    render(<Sheet />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByText("closed")).toBeInTheDocument();
  });

  it("closes on Esc", async () => {
    render(<Sheet />);
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("closed")).toBeInTheDocument();
  });
});
