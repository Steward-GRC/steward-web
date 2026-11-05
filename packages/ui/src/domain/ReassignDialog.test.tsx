// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ReassignDialog, type ReassignDialogProps } from "./ReassignDialog";

const props: ReassignDialogProps = {
  candidates: [
    { id: "u-grace", name: "Grace", role: "Compliance admin" },
    { id: "u-dave", name: "Dave", role: "Category owner" },
    { id: "u-bob", name: "Bob", refused: "author of this draft" },
  ],
  current: { name: "Alice", role: "Site admin" },
  onOpenChange: () => {},
  onReassign: () => {},
  open: true,
  stageName: "Final approval",
};

describe("the reassign approver dialog (D14)", () => {
  it("says which seat it hands on, and who holds it now", () => {
    render(<ReassignDialog {...props} />);
    const dialog = screen.getByRole("dialog", { name: "Reassign approver" });
    expect(dialog).toHaveAccessibleDescription(
      "Hands the pending Final approval seat to someone else…",
    );
    expect(within(dialog).getByText("Current")).toBeVisible();
    expect(within(dialog).getByText("Alice")).toBeVisible();
  });

  it("lists the eligible approvers with their roles, and the refused ones with why", () => {
    render(<ReassignDialog {...props} />);
    const list = screen.getByRole("radiogroup", { name: "Eligible approvers" });
    expect(within(list).getByRole("radio", { name: /Grace · Compliance admin/ })).toBeEnabled();
    const bob = within(list).getByRole("radio", { name: /Bob/ });
    expect(bob).toBeDisabled();
    expect(within(list).getByText("Refused")).toBeVisible();
    expect(within(list).getByText("author of this draft")).toBeVisible();
  });

  it("asks for a person and a reason before it reassigns", async () => {
    const onReassign = vi.fn();
    render(<ReassignDialog {...props} onReassign={onReassign} />);
    const reassign = screen.getByRole("button", { name: "Reassign" });
    expect(reassign).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: /Grace/ }));
    expect(reassign).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Reason (required)"), "Alice is on leave.");
    await userEvent.click(reassign);
    expect(onReassign).toHaveBeenCalledWith({ reason: "Alice is on leave.", toUserId: "u-grace" });
  });

  it("offers someone outside the list to site admins only, with an acknowledgement", async () => {
    const onReassign = vi.fn();
    const { unmount } = render(<ReassignDialog {...props} />);
    expect(screen.queryByRole("button", { name: /Someone outside the list/ })).toBeNull();
    unmount();

    render(<ReassignDialog {...props} canPickOutside onReassign={onReassign} />);
    await userEvent.click(
      screen.getByRole("button", { name: "+ Someone outside the list (site admins only)" }),
    );
    await userEvent.type(screen.getByLabelText("Username or email"), "heidi");
    await userEvent.type(screen.getByLabelText("Reason (required)"), "Covering the team.");
    const reassign = screen.getByRole("button", { name: "Reassign" });
    expect(reassign).toBeDisabled();
    await userEvent.click(
      screen.getByRole("checkbox", {
        name: "I understand this person isn't on the stage's approver list, and this is recorded.",
      }),
    );
    await userEvent.click(reassign);
    expect(onReassign).toHaveBeenCalledWith({
      outside: "heidi",
      reason: "Covering the team.",
    });
  });

  it("shows the refusal when the reassignment fails", () => {
    render(<ReassignDialog {...props} error="Grace can't take this seat." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Grace can't take this seat.");
  });
});
