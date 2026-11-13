// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { HardResetCard, type HardResetRow } from "./HardResetCard";

const NAMES = { ada: "Ada Admin", root: "Rosa Root" };

const ROW: HardResetRow = {
  approvalExpiresAt: null,
  approvedAt: null,
  approvedBy: null,
  cancelledAt: null,
  consumedAt: null,
  consumedBy: null,
  expiresAt: "2026-11-14T10:00:00Z",
  id: "req-1",
  module: "compliance",
  reason: "End of the pilot",
  requestedAt: "2026-11-13T10:00:00Z",
  requestedBy: "root",
  state: "pending",
};
const APPROVED: HardResetRow = {
  ...ROW,
  approvalExpiresAt: "2026-11-13T12:00:00Z",
  approvedAt: "2026-11-13T11:00:00Z",
  approvedBy: "ada",
  state: "approved",
};

const open = (props: Partial<Parameters<typeof HardResetCard>[0]> = {}) => {
  const handlers = {
    onApprove: vi.fn(),
    onCancel: vi.fn(),
    onExecute: vi.fn(),
    onRequest: vi.fn(),
  };
  render(
    <HardResetCard
      busy={false}
      moduleEnabled={false}
      names={NAMES}
      requests={[]}
      viewer={{ id: "root", isRoot: true }}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

const pill = () =>
  within(screen.getByRole("region", { name: "Hard reset of compliance data" })).getByTestId(
    "status-pill",
  );

describe("HardResetCard request", () => {
  it("lets the root admin ask with a reason", async () => {
    const { onRequest } = open();
    expect(pill()).toHaveTextContent("None open");
    const submit = screen.getByRole("button", { name: "Request hard reset" });
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByRole("textbox", { name: "Reason" }), "End of the pilot");
    await userEvent.click(submit);
    expect(onRequest).toHaveBeenCalledWith("End of the pilot");
  });

  it("does not offer the request form to a site admin who is not root", () => {
    open({ viewer: { id: "ada", isRoot: false } });
    expect(screen.queryByRole("textbox", { name: "Reason" })).not.toBeInTheDocument();
    expect(screen.getByText(/Only the root admin can ask for a hard reset/)).toBeVisible();
  });

  it("hides the form while a request is open", () => {
    open({ requests: [ROW] });
    expect(pill()).toHaveTextContent("1 open");
    expect(screen.queryByRole("textbox", { name: "Reason" })).not.toBeInTheDocument();
    expect(screen.getByText(/A request is already open/)).toBeVisible();
  });

  it("states what the reset does and what it keeps", () => {
    open();
    expect(screen.getByText(/must be off first/)).toBeVisible();
    expect(screen.getByText(/legal hold on any case blocks the whole reset/)).toBeVisible();
    expect(screen.getByText(/settings and the module's off switch are kept/)).toBeVisible();
  });
});

describe("HardResetCard approval", () => {
  it("shows a pending request with who asked and why", () => {
    open({ requests: [ROW], viewer: { id: "ada", isRoot: false } });
    expect(screen.getByText("End of the pilot")).toBeVisible();
    expect(screen.getByText(/Asked by Rosa Root/)).toBeVisible();
    expect(screen.getByText("Waiting for approval")).toBeVisible();
  });

  it("lets a different site admin approve it", async () => {
    const { onApprove } = open({ requests: [ROW], viewer: { id: "ada", isRoot: false } });
    await userEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(onApprove).toHaveBeenCalledWith("req-1");
  });

  it("does not let the requester approve their own request", () => {
    open({ requests: [ROW] });
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(screen.getByText(/you cannot approve it/)).toBeVisible();
  });

  it("lets only the requester cancel", async () => {
    const asker = open({ requests: [ROW] });
    await userEvent.click(screen.getByRole("button", { name: "Cancel request" }));
    expect(asker.onCancel).toHaveBeenCalledWith("req-1");
  });

  it("does not offer Cancel to another site admin", () => {
    open({ requests: [ROW], viewer: { id: "ada", isRoot: false } });
    expect(screen.queryByRole("button", { name: "Cancel request" })).not.toBeInTheDocument();
  });

  it("tells a site admin that only root can run an approved request", () => {
    open({ requests: [APPROVED], viewer: { id: "ada", isRoot: false } });
    expect(screen.queryByRole("button", { name: "Run the reset" })).not.toBeInTheDocument();
    expect(screen.getByText(/Only the root admin can run it/)).toBeVisible();
  });

  it("keeps finished requests out of the open count", () => {
    open({
      requests: [
        { ...ROW, id: "a", state: "cancelled" },
        { ...ROW, id: "b", state: "consumed" },
        { ...ROW, id: "c", state: "expired" },
      ],
    });
    expect(pill()).toHaveTextContent("None open");
    expect(screen.getByText("Cancelled")).toBeVisible();
    expect(screen.getByText("Done")).toBeVisible();
    expect(screen.getByText("Expired")).toBeVisible();
  });
});

const openDialog = async (props: Partial<Parameters<typeof HardResetCard>[0]> = {}) => {
  const handlers = open({ requests: [APPROVED], ...props });
  await userEvent.click(screen.getByRole("button", { name: "Run the reset" }));
  const dialog = await screen.findByRole("dialog", { name: "Delete all compliance data?" });
  return { dialog, ...handlers };
};

describe("HardResetCard execute", () => {
  it("needs the export tick and the exact phrase before it can run", async () => {
    const { dialog, onExecute } = await openDialog();
    const run = within(dialog).getByRole("button", { name: "Delete all compliance data" });
    expect(within(dialog).getByText(/export every case you need to keep/)).toBeVisible();
    expect(run).toBeDisabled();

    await userEvent.type(within(dialog).getByRole("textbox"), "RESET COMPLIANCE DATA");
    expect(run).toBeDisabled();

    await userEvent.click(
      within(dialog).getByRole("checkbox", {
        name: "I have exported what I need to keep, or I accept that it will be lost.",
      }),
    );
    expect(run).toBeEnabled();
    await userEvent.click(run);
    expect(onExecute).toHaveBeenCalledWith("req-1", "RESET COMPLIANCE DATA");
  });

  it("stays disabled with only the tick and a wrong phrase", async () => {
    const { dialog } = await openDialog();
    await userEvent.click(within(dialog).getByRole("checkbox"));
    await userEvent.type(within(dialog).getByRole("textbox"), "reset compliance data");
    expect(
      within(dialog).getByRole("button", { name: "Delete all compliance data" }),
    ).toBeDisabled();
  });

  it("cannot run while the module is on, and says why", async () => {
    const { dialog } = await openDialog({ moduleEnabled: true });
    await userEvent.click(within(dialog).getByRole("checkbox"));
    await userEvent.type(within(dialog).getByRole("textbox"), "RESET COMPLIANCE DATA");
    expect(
      within(dialog).getByRole("button", { name: "Delete all compliance data" }),
    ).toBeDisabled();
    expect(within(dialog).getByText(/Turn it off above/)).toBeVisible();
  });

  it("shows the case count once it ran", () => {
    open({
      requests: [{ ...APPROVED, state: "consumed" }],
      result: { approvedBy: "ada", casesDeleted: 42, requestedBy: "root" },
    });
    expect(screen.getByText("Hard reset complete")).toBeVisible();
    expect(
      screen.getByText("42 cases were deleted. Asked by Rosa Root, approved by Ada Admin."),
    ).toBeVisible();
  });

  it("says one case in the singular", () => {
    open({ result: { approvedBy: "ada", casesDeleted: 1, requestedBy: "root" } });
    expect(
      screen.getByText("1 case was deleted. Asked by Rosa Root, approved by Ada Admin."),
    ).toBeVisible();
  });
});

describe("HardResetCard errors", () => {
  it.each([
    ["HARD_RESET_CONFIRMATION", /Type RESET COMPLIANCE DATA exactly/],
    ["HARD_RESET_MODULE_ON", /still on/],
    ["HARD_RESET_LEGAL_HOLD", /legal hold, so nothing was deleted/],
    ["HARD_RESET_NOT_APPROVED", /no approved request that can still be used/],
    ["HARD_RESET_ROOT_REQUIRED", /Only the root admin can run a hard reset/],
    ["MODULE_OFF", /module is off/],
  ])("words %s", (code, text) => {
    open({ errorCode: code });
    expect(screen.getByRole("alert")).toHaveTextContent(text);
  });

  it("falls back to a generic failure for an unknown refusal", () => {
    open({ failure: { code: "PERMISSION_DENIED", status: 403 } });
    expect(screen.getByText("Couldn't update the hard reset")).toBeVisible();
  });
});
