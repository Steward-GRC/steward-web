// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { formatDate, formatTime } from "@steward-web/i18n";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { Toaster } from "#ui/feedback/Toast";

import type { PolicyDetail } from "./policyReaderModel";

import { PolicyReader } from "./PolicyReader";
import { ReaderNotices } from "./ReaderNotices";

const baseDetail: PolicyDetail = {
  ack: { ackedAt: null, acknowledged: false, required: true },
  appendices: [{ id: "appendix-1", letter: "A", text: "Per-diem rates.", title: "Per-diem rates" }],
  body: [
    { depth: 1, kind: "heading", text: "Purpose" },
    {
      kind: "paragraph",
      runs: [
        { text: "This policy sets out what the " },
        { bold: true, text: "organisation" },
        { text: " expects of a shared desk." },
      ],
    },
    { depth: 2, kind: "heading", text: "Exceptions" },
    { depth: 1, kind: "heading", text: "Responsibilities" },
    {
      kind: "table",
      rows: [
        { cells: ["Role", "Responsibility"], header: true },
        { cells: ["Staff", "Book ahead."], header: false },
      ],
    },
  ],
  bodyText: "This policy sets out what the organisation expects.",
  bodyUnreadable: false,
  canBreakGlass: false,
  category: "Finance",
  contacts: [],
  contentObfuscated: false,
  currentVersionId: "version-1",
  definitions: [
    { definition: "A desk anyone can book for the day.", id: "d-1", term: "Shared desk" },
  ],
  documentType: DocumentType.Policy,
  history: [
    {
      actorName: "Bob Author",
      at: "2026-08-12T00:00:00Z",
      comment: null,
      kind: "published",
      stage: null,
      versionLabel: "2.0.0",
    },
  ],
  id: "policy-1",
  number: "POL-FINANCE-001",
  ownerName: "Bob Author",
  priorVersion: null,
  published: "2026-08-12T00:00:00Z",
  references: [],
  related: [],
  revision: null,
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Reimbursement",
  summary: null,
  title: "Expense Claims",
  updated: "2026-08-14T00:00:00Z",
  version: "2.0.0",
};

const renderAt = (detail: PolicyDetail, action?: (arguments_: { request: Request }) => unknown) => {
  const Stub = createRoutesStub([
    {
      action,
      Component: () => (
        <>
          <PolicyReader detail={detail} viewerName="Erin Reader" />
          <Toaster />
        </>
      ),
      path: "/policies/:number",
    },
  ]);
  render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
};

describe("PolicyReader", () => {
  it("heads the page with the back link, eyebrow, serif title and number", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("link", { name: "Policies" })).toHaveAttribute("href", "/policies");
    expect(screen.getByText("Finance · Reimbursement")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Expense Claims" })).toHaveClass(
      "font-serif",
    );
    expect(screen.getByText("POL-FINANCE-001 · v2.0.0")).toHaveClass("font-mono");
  });

  it("stars the policy and opens the Actions menu", async () => {
    renderAt(baseDetail);
    const star = screen.getByRole("button", { name: "Star" });
    expect(star).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(star);
    expect(star).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menuitem", { name: "Print / Export" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "History & approvals" })).toBeInTheDocument();
  });

  it("puts the acknowledgement banner above the six-up detail strip", () => {
    renderAt(baseDetail);
    const strip = screen.getByRole("list", { name: "Details" });
    const banner = screen.getByTestId("ack-banner");
    expect(banner.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const cells = within(strip).getAllByRole("listitem");
    expect(cells.map((cell) => cell.textContent)).toEqual([
      "StatusPublished",
      "SensitivityStandard",
      "OwnerBob Author",
      "Versionv2.0.0",
      `Published${formatDate("2026-08-12T00:00:00Z")}`,
      `Last updated${formatDate("2026-08-14T00:00:00Z")}`,
    ]);
  });

  it("draws the body in the reading serif, with numbered sections and the table", () => {
    renderAt(baseDetail);
    const article = screen.getByRole("article");
    expect(article).toHaveClass("font-serif");
    expect(within(article).getByRole("heading", { level: 2, name: "1. Purpose" })).toBeVisible();
    expect(
      within(article).getByRole("heading", { level: 3, name: "1.1 Exceptions" }),
    ).toBeVisible();
    expect(
      within(article).getByRole("heading", { level: 2, name: "2. Responsibilities" }),
    ).toBeVisible();
    expect(within(article).getByText("organisation").tagName).toBe("STRONG");
    expect(within(article).getByRole("columnheader", { name: "Role" })).toBeVisible();
    expect(within(article).getByRole("cell", { name: "Book ahead." })).toBeVisible();
  });

  it("reads appendices as sections after the body, not an accordion", () => {
    renderAt(baseDetail);
    const article = screen.getByRole("article");
    expect(
      within(article).getByRole("heading", { level: 2, name: "Appendix A: Per-diem rates" }),
    ).toBeVisible();
    expect(within(article).getByText("Per-diem rates.")).toBeVisible();
    expect(screen.queryByText(/Appendices A:/)).toBeNull();
  });

  it("lists the sections and appendices in the On this page outline", () => {
    renderAt(baseDetail);
    const outline = screen.getByRole("complementary", { name: "On this page" });
    for (const label of ["Purpose", "Exceptions", "Responsibilities", "Appendix A: Per-diem rates"])
      expect(within(outline).getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
  });

  it("links a defined term to its definition", async () => {
    renderAt(baseDetail);
    await userEvent.click(screen.getByRole("button", { name: "shared desk" }));
    expect(screen.getByRole("tab", { name: "Definitions 1" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("definition-d-1")).toHaveAttribute("data-highlighted", "true");
  });

  it("says when there is no body, and when the body couldn't be displayed", () => {
    const { unmount } = render(
      <PolicyReaderShell detail={{ ...baseDetail, appendices: [], body: [] }} />,
    );
    expect(screen.getByText("No rendered content")).toBeInTheDocument();
    unmount();
    render(<PolicyReaderShell detail={{ ...baseDetail, body: [], bodyUnreadable: true }} />);
    expect(screen.getByText("This document's content couldn't be displayed")).toBeVisible();
    expect(screen.getByText("The rest of the page is unaffected…")).toBeVisible();
  });

  it("shows the stored AI summary behind its toggle", async () => {
    renderAt({
      ...baseDetail,
      summary: { generatedAt: "2026-08-12T00:00:00Z", text: "Book ahead; cancel early." },
    });
    const toggle = screen.getByRole("switch", { name: "AI summary" });
    expect(screen.queryByText("Book ahead; cancel early.")).toBeNull();
    await userEvent.click(toggle);
    expect(screen.getByText("Book ahead; cancel early.")).toBeVisible();
    expect(
      screen.getByText(
        "AI-generated summary — always check it against the policy text before relying on it.",
      ),
    ).toBeVisible();
  });

  it("leaves the AI summary toggle out when there is no summary", () => {
    renderAt(baseDetail);
    expect(screen.queryByRole("switch", { name: "AI summary" })).toBeNull();
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
    expect(screen.getByTestId("ack-banner")).toHaveAttribute("data-state", "done");
    expect(screen.getByRole("status")).toHaveTextContent("Acknowledged");
    expect(screen.queryByRole("button", { name: "Acknowledge" })).not.toBeInTheDocument();
  });

  it("shows no acknowledgement banner for a procedure", () => {
    renderAt({ ...baseDetail, ack: null, documentType: DocumentType.Procedure });
    expect(screen.queryByText("Please review and confirm")).not.toBeInTheDocument();
    expect(screen.queryByText("Acknowledged")).not.toBeInTheDocument();
  });

  it("redacts a sensitive policy's body but keeps its shape (U9)", () => {
    renderAt({
      ...baseDetail,
      canBreakGlass: true,
      contentObfuscated: true,
      sensitivity: Sensitivity.Sensitive,
      summary: { generatedAt: "2026-08-12T00:00:00Z", text: "Book ahead." },
    });
    // Once in the detail strip, once as the pill beside the number.
    expect(screen.getAllByText("Sensitive")).toHaveLength(2);
    const redacted = screen.getByRole("img", {
      name: "Redacted policy content: 2 sections, 1 table",
    });
    expect(within(redacted).getByText(/^1\. /)).toBeInTheDocument();
    expect(within(redacted).queryByText(/Purpose/)).toBeNull();
    expect(screen.queryByRole("tab", { name: "View" })).toBeNull();
    expect(screen.queryByTestId("ack-banner")).toBeNull();
    expect(screen.queryByRole("switch", { name: "AI summary" })).toBeNull();
    expect(screen.queryByRole("button", { name: "shared desk" })).toBeNull();
  });

  it("offers the break-glass reveal to someone who may use it", () => {
    renderAt({ ...baseDetail, canBreakGlass: true, contentObfuscated: true });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Sensitive content is hidden");
    expect(alert).toHaveTextContent(
      "You're outside this sensitive policy's read audience, so its content is obfuscated.",
    );
    expect(alert).toHaveTextContent(
      "You may break the glass to reveal it — this access is recorded for audit.",
    );
    expect(within(alert).getByRole("button", { name: "Break glass to reveal" })).toBeVisible();
  });

  it("hides the reveal action when the caller cannot break glass", () => {
    renderAt({ ...baseDetail, canBreakGlass: false, contentObfuscated: true });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You don't have permission to reveal it. Contact a compliance admin if you need access.",
    );
    expect(screen.queryByRole("button", { name: "Break glass to reveal" })).toBeNull();
  });

  it("asks why before revealing (D2), naming the policy", async () => {
    renderAt({ ...baseDetail, canBreakGlass: true, contentObfuscated: true });
    await userEvent.click(screen.getByRole("button", { name: "Break glass to reveal" }));
    const dialog = screen.getByRole("dialog", { name: "Reveal sensitive content?" });
    expect(dialog).toHaveAccessibleDescription(
      "Revealing the content of Expense Claims (POL-FINANCE-001) is recorded against your name with the reason you give below. Only break the glass when you have a legitimate need.",
    );
    const reveal = within(dialog).getByRole("button", { name: "Reveal content" });
    expect(reveal).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText("Reason (required)"), "Lost laptop.");
    expect(reveal).toBeEnabled();
  });

  it("reveals for the time the grant allows, then hides again on request (U9r)", async () => {
    const until = new Date(Date.now() + 30 * 60_000).toISOString();
    let revealed = false;
    const Stub = createRoutesStub([
      {
        action: async ({ request }) => {
          const form = await request.formData();
          expect(form.get("intent")).toBe("breakGlass");
          expect(form.get("policyId")).toBe("policy-1");
          expect(form.get("reason")).toBe("Lost laptop.");
          revealed = true;
          return { grantedUntil: until, ok: true };
        },
        Component: () => {
          const { detail } = useLoaderData() as { detail: PolicyDetail };
          return (
            <>
              <PolicyReader detail={detail} />
              <Toaster />
            </>
          );
        },
        loader: () => ({
          detail: { ...baseDetail, canBreakGlass: !revealed, contentObfuscated: !revealed },
        }),
        path: "/policies/:number",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
    await userEvent.click(await screen.findByRole("button", { name: "Break glass to reveal" }));
    await userEvent.type(screen.getByLabelText("Reason (required)"), "Lost laptop.");
    await userEvent.click(screen.getByRole("button", { name: "Reveal content" }));

    const bar = await screen.findByRole("status", { name: /Revealed for you until/ });
    expect(bar).toHaveTextContent(`Revealed for you until ${formatTime(until)}`);
    expect(bar).toHaveTextContent("· recorded with your reason");
    expect(within(bar).getByText(/^\d{1,2}:\d{2}$/)).toHaveClass("font-mono");
    expect(
      await screen.findByText("Content revealed — this access is recorded."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "1. Purpose" })).toBeVisible();

    await userEvent.click(within(bar).getByRole("button", { name: "Hide now" }));
    expect(screen.queryByRole("heading", { level: 2, name: "1. Purpose" })).toBeNull();
    expect(screen.getByRole("img", { name: /^Redacted policy content/ })).toBeVisible();
    expect(screen.queryByRole("status", { name: /Revealed for you until/ })).toBeNull();
  });

  it("says a new version is in review beside the published one", () => {
    renderAt({ ...baseDetail, revision: { status: PolicyStatus.InReview, version: "3.0.0" } });
    expect(screen.getByText("A new version is in review")).toBeInTheDocument();
    expect(
      screen.getByText("v3.0.0 is waiting on approval. You're reading the published v2.0.0."),
    ).toBeInTheDocument();
  });

  it("shows a notice for a superseded version, none for a published one", () => {
    renderAt({ ...baseDetail, status: PolicyStatus.Superseded });
    expect(screen.getByText("This version has been superseded")).toBeInTheDocument();
  });

  it("shows only the tabs that have something in them, with their counts", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("tab", { name: "View" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Definitions 1" })).toBeInTheDocument();
    for (const tab of [/Related/, /References/, /Contacts/, /Changes/])
      expect(screen.queryByRole("tab", { name: tab })).toBeNull();
  });

  it("shows the history timeline grouped by version", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("heading", { name: "History & approvals" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /v2\.0\.0/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows the changes as a word-level diff, not plain text", async () => {
    renderAt({
      ...baseDetail,
      priorVersion: {
        diff: [
          {
            changeType: "modified",
            sectionKey: "claim",
            sectionTitle: "2. Making a claim",
            wordDiffHtml: "File within <del>60</del> <ins>30</ins> days.",
          },
        ],
        version: "1.0.0",
      },
    });
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByText("30").tagName).toBe("INS");
    expect(screen.getByText("60").tagName).toBe("DEL");
  });

  it("uses the soft plum acknowledgement banner, not a warning", () => {
    renderAt(baseDetail);
    expect(screen.getByTestId("ack-banner")).toHaveClass("bg-primary-soft");
  });

  it("names the version a published event published", () => {
    renderAt(baseDetail);
    expect(screen.getByText("Published v2.0.0")).toBeInTheDocument();
    expect(screen.queryByText(/\{\{version\}\}/)).not.toBeInTheDocument();
  });

  it("marks each history event with a status dot, not a text glyph", () => {
    renderAt(baseDetail);
    const events = within(screen.getByRole("list", { name: "v2.0.0" })).getAllByRole("listitem");
    expect(events.length).toBeGreaterThan(0);
    for (const event of events) expect(event).toHaveAttribute("data-tone");
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
    expect(await screen.findByText(/^Acknowledged · recorded \d{2}:\d{2}$/)).toBeInTheDocument();
  });

  it("frames D1 as the moment of record: the policy, then who, which version and when", async () => {
    renderAt(baseDetail);
    await userEvent.click(screen.getByRole("button", { name: "Acknowledge" }));
    const dialog = screen.getByRole("dialog", { name: "Acknowledge this policy?" });
    expect(dialog).toHaveAccessibleDescription(
      "You're confirming you've read and understood Expense Claims (POL-FINANCE-001). This is recorded against your name with a timestamp.",
    );
    const record = within(dialog).getByRole("list", { name: "What's recorded" });
    expect(within(record).getByText("Erin Reader")).toBeInTheDocument();
    expect(within(record).getByText("v2.0.0")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Acknowledge" })).toHaveFocus();
  });
});

/** The reader inside a router, without the outline's observers, for the body states. */
const PolicyReaderShell = ({ detail }: { detail: PolicyDetail }) => {
  const Stub = createRoutesStub([
    { Component: () => <PolicyReader detail={detail} />, path: "/policies/:number" },
  ]);
  return <Stub initialEntries={["/policies/POL-FINANCE-001"]} />;
};

const notice = (title: string) => ({ body: "", id: title, title, tone: "info" as const });

describe("ReaderNotices", () => {
  it("shows at most three notices and folds the rest", async () => {
    render(<ReaderNotices notices={["A", "B", "C", "D", "E"].map((t) => notice(t))} />);
    expect(screen.getAllByRole("note")).toHaveLength(3);
    await userEvent.click(screen.getByRole("button", { name: "+2 more notices" }));
    expect(screen.getAllByRole("note")).toHaveLength(5);
  });
});
