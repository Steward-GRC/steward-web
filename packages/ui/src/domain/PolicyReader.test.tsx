// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { PolicyDetail } from "./policyReader";

import { PolicyReader } from "./PolicyReader";

const baseDetail: PolicyDetail = {
  ack: { ackedAt: null, acknowledged: false, required: true },
  appendices: [{ id: "appendix-1", letter: "A", text: "Per-diem rates.", title: "Per-diem rates" }],
  bodyText: "This policy sets out what the organisation expects.",
  canBreakGlass: false,
  category: "Finance",
  contacts: [],
  contentObfuscated: false,
  currentVersionId: "version-1",
  definitions: [],
  documentType: DocumentType.Policy,
  history: [
    {
      actorName: "Ada Lovelace",
      at: "2026-08-12T00:00:00Z",
      comment: null,
      kind: "published",
      stage: null,
      versionLabel: "2.0.0",
    },
  ],
  id: "policy-1",
  number: "POL-FINANCE-001",
  ownerName: "Ada Lovelace",
  priorVersion: null,
  published: "2026-08-12T00:00:00Z",
  references: [],
  related: [],
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Reimbursement",
  title: "Expense Claims",
  updated: "2026-08-12T00:00:00Z",
  version: "2.0.0",
};

const renderAt = (detail: PolicyDetail, action?: (arguments_: { request: Request }) => unknown) => {
  const Stub = createRoutesStub([
    {
      action,
      Component: () => <PolicyReader detail={detail} />,
      path: "/policies/:number",
    },
  ]);
  render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
};

describe("PolicyReader", () => {
  it("shows the header, metadata and body", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("heading", { name: "Expense Claims" })).toBeInTheDocument();
    expect(screen.getByText("Finance · Reimbursement")).toBeInTheDocument();
    expect(screen.getByText("POL-FINANCE-001 · 2.0.0")).toBeInTheDocument();
    expect(screen.getByText(baseDetail.bodyText)).toBeInTheDocument();
  });

  it("shows the pending acknowledgement banner when the caller owes an ack", () => {
    renderAt(baseDetail);
    expect(screen.getByText("Please review and confirm")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acknowledge" })).toBeInTheDocument();
  });

  it("shows the done banner once the caller has acknowledged", () => {
    renderAt({
      ...baseDetail,
      ack: { ackedAt: "2026-08-13T00:00:00Z", acknowledged: true, required: true },
    });
    expect(screen.getByText("Acknowledged")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Acknowledge" })).not.toBeInTheDocument();
  });

  it("shows no acknowledgement banner for a procedure", () => {
    renderAt({ ...baseDetail, ack: null, documentType: DocumentType.Procedure });
    expect(screen.queryByText("Please review and confirm")).not.toBeInTheDocument();
    expect(screen.queryByText("Acknowledged")).not.toBeInTheDocument();
  });

  it("hides the tabs and offers a break-glass reveal for redacted, breakable content", () => {
    renderAt({ ...baseDetail, canBreakGlass: true, contentObfuscated: true });
    expect(screen.getByText("Sensitive content is hidden")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Break glass to reveal" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "View" })).not.toBeInTheDocument();
  });

  it("hides the reveal action when the caller cannot break glass", () => {
    renderAt({ ...baseDetail, canBreakGlass: false, contentObfuscated: true });
    expect(screen.getByText(/You don't have permission to reveal it/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Break glass to reveal" })).not.toBeInTheDocument();
  });

  it("shows a revision notice for a superseded version, none for a published one", () => {
    renderAt({ ...baseDetail, status: PolicyStatus.Superseded });
    expect(screen.getByText("This version has been superseded.")).toBeInTheDocument();
  });

  it("renders every tab and the appendix accordion when visible", () => {
    renderAt(baseDetail);
    for (const tab of ["View", "Definitions", "Related", "References", "Contacts", "Changes"]) {
      expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
    }
    expect(screen.getByText(/Appendices A: Per-diem rates/)).toBeInTheDocument();
  });

  it("shows the history accordion grouped by version", () => {
    renderAt(baseDetail);
    expect(screen.getByText("History & approvals")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2.0.0" })).toBeInTheDocument();
  });

  it("submits the acknowledge dialog's form with the current version id", async () => {
    const action = vi.fn(async ({ request }: { request: Request }) => {
      const form = await request.formData();
      expect(form.get("intent")).toBe("acknowledge");
      expect(form.get("policyVersionId")).toBe("version-1");
      return { ok: true };
    });
    renderAt(baseDetail, action);

    await userEvent.click(screen.getByRole("button", { name: "Acknowledge" }));
    const dialog = screen.getByRole("dialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Acknowledge" }));

    expect(action).toHaveBeenCalled();
  });
});
