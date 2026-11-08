// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, ReferenceKind, Sensitivity } from "@steward-web/api-client";
import { formatDate, formatTime } from "@steward-web/i18n";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { createRoutesStub, useLoaderData } from "react-router";
import { describe, expect, it, vi } from "vitest";

import { CommandActionsProvider, useCommandActions } from "#ui/commands/CommandActions";
import { MenuItem } from "#ui/components/Overlays";
import { Toaster } from "#ui/feedback/Toast";

import type { PolicyDetail } from "./policyReaderModel";

import { PolicyReader } from "./PolicyReader";
import { ReaderNotices } from "./ReaderNotices";

const baseDetail: PolicyDetail = {
  ack: { ackedAt: null, acknowledged: false, required: true },
  appendices: [{ id: "appendix-1", letter: "A", text: "Per-diem rates.", title: "Per-diem rates" }],
  body: [
    { depth: 1, kind: "heading", sectionKey: "purpose", text: "Purpose" },
    {
      kind: "paragraph",
      runs: [
        { text: "This policy sets out what the " },
        { bold: true, text: "organisation" },
        { text: " expects of a shared desk." },
      ],
    },
    { depth: 2, kind: "heading", sectionKey: "exceptions", text: "Exceptions" },
    { depth: 1, kind: "heading", sectionKey: "responsibilities", text: "Responsibilities" },
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

/** A third version, published, with two earlier ones to compare against. */
const compared: PolicyDetail = {
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
    fromVersionId: "version-v2",
    toVersionId: "version-v3",
    version: "2",
  },
  versions: [
    { id: "version-v1", status: "superseded", version: "1" },
    { id: "version-v2", status: "superseded", version: "2" },
    { id: "version-v3", status: "published", version: "3" },
  ],
};

/** One section of a version diff, titled with its key in capitals. */
const section = (sectionKey: string, changeType: string, wordDiffHtml = "") => ({
  changeType,
  sectionKey,
  sectionTitle: sectionKey.toUpperCase(),
  wordDiffHtml,
});

const renderAt = (
  detail: PolicyDetail,
  action?: (arguments_: { request: Request }) => unknown,
  adminActions?: ReactNode,
) => {
  const Stub = createRoutesStub([
    {
      action,
      Component: () => (
        <>
          <PolicyReader adminActions={adminActions} detail={detail} viewerName="Erin Reader" />
          <Toaster />
        </>
      ),
      path: "/policies/:number",
    },
  ]);
  render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
};

const contact = (id: string) => ({
  department: "Facilities",
  email: "dave@example.org",
  hours: "Mon-Fri",
  id,
  label: `Contact ${id}`,
  name: "Dave",
  phone: "+44 0000 000000",
  role: "Owner",
});

describe("PolicyReader", () => {
  it("heads the page with the back link, the breadcrumb, serif title and number", () => {
    renderAt(baseDetail);
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")])).toEqual(
      [
        ["Policies", "/policies"],
        ["Finance", "/policies?category=Finance"],
        ["Reimbursement", "/policies?category=Finance&subcategory=Reimbursement"],
      ],
    );
    expect(crumbs.getByText("Expense Claims")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("heading", { level: 1, name: "Expense Claims" })).toHaveClass(
      "font-serif",
    );
    expect(screen.getByText("POL-FINANCE-001 · v2.0.0")).toHaveClass("font-mono");
  });

  it("says how many words the policy has and how long it takes to read (bug log 172)", () => {
    renderAt(baseDetail);
    // the fixture's body: 20 words, so under one reading speed's minute
    expect(screen.getByText("20 words")).toBeInTheDocument();
    expect(screen.getByText("1 min read")).toBeInTheDocument();
  });

  it("shows no count for a policy with no body", () => {
    renderAt({ ...baseDetail, body: [] });
    expect(screen.queryByText(/\d+ words?$/)).toBeNull();
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

  it("draws the star with the shared gold star, filled once starred (#152)", async () => {
    renderAt(baseDetail);
    const star = screen.getByRole("button", { name: "Star" });
    expect(within(star).getByTestId("favorite-star")).toHaveAttribute("data-starred", "false");
    await userEvent.click(star);
    expect(within(star).getByTestId("favorite-star")).toHaveAttribute("data-starred", "true");
  });

  it("keeps the staff Actions menu to its two items when there's no governance group", async () => {
    renderAt(baseDetail);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const menu = await screen.findByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Print / Export", "History & approvals"]);
    expect(within(menu).queryByRole("separator")).not.toBeInTheDocument();
  });

  it("has no Admin actions button for someone with no admin tasks (#103)", () => {
    renderAt(baseDetail);
    expect(screen.queryByRole("button", { name: "Admin actions" })).toBeNull();
  });

  it("puts the admin tasks in their own Admin actions button next to Actions (#103, A11)", async () => {
    renderAt(baseDetail, undefined, <MenuItem>Retire</MenuItem>);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    const everyday = await screen.findByRole("menu");
    expect(
      within(everyday)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Print / Export", "History & approvals"]);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Admin actions" }));
    const admin = await screen.findByRole("menu");
    expect(
      within(admin)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Retire"]);
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

  it("marks the document for Read aloud, so it reads the text and not the tabs around it", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("article")).toHaveAttribute("data-read-aloud");
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

  it("lists the appendices after the body, each folded until opened", async () => {
    renderAt(baseDetail);
    const article = screen.getByRole("article");
    const summary = within(article).getByText("Appendix A: Per-diem rates");
    expect(within(article).getByText("Per-diem rates.")).not.toBeVisible();
    await userEvent.click(summary);
    expect(within(article).getByText("Per-diem rates.")).toBeVisible();
  });

  it("starts every appendix with a note that it is supporting material, not policy", async () => {
    renderAt(baseDetail);
    const article = screen.getByRole("article");
    await userEvent.click(within(article).getByText("Appendix A: Per-diem rates"));
    expect(within(article).getByRole("complementary", { name: /not policy/i })).toHaveTextContent(
      "This appendix is supporting material, not policy.",
    );
  });

  it("draws an appendix written in the editor with its formatting", async () => {
    renderAt({
      ...baseDetail,
      appendices: [
        {
          blocks: [
            { depth: 2, kind: "heading", sectionKey: "x", text: "Limits" },
            {
              items: [[{ text: "Up to $2,000" }], [{ bold: true, text: "Over $20,000" }]],
              kind: "list",
              ordered: false,
            },
          ],
          id: "appendix-1",
          letter: "A",
          text: "",
          title: "Approval limits",
        },
      ],
    });
    const article = screen.getByRole("article");
    await userEvent.click(within(article).getByText("Appendix A: Approval limits"));
    expect(within(article).getByRole("heading", { name: "Limits" })).toBeVisible();
    expect(
      within(article)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Up to $2,000", "Over $20,000"]);
  });

  it("opens the appendix an address points to", () => {
    const Stub = createRoutesStub([
      {
        Component: () => <PolicyReader detail={baseDetail} viewerName="Erin Reader" />,
        path: "/policies/:number",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001#appendix-a"]} />);
    expect(screen.getByText("Per-diem rates.")).toBeVisible();
  });

  it("opens the appendix the outline chooses", async () => {
    renderAt(baseDetail);
    const outline = screen.getByRole("navigation", { name: "On this page" });
    await userEvent.click(within(outline).getByText("Appendix A: Per-diem rates"));
    expect(screen.getByText("Per-diem rates.")).toBeVisible();
  });

  it("lists the sections and appendices in the On this page outline", () => {
    renderAt(baseDetail);
    const outline = screen.getByRole("complementary", { name: "On this page" });
    for (const label of ["Purpose", "Exceptions", "Responsibilities", "Appendix A: Per-diem rates"])
      expect(within(outline).getByRole("link", { name: new RegExp(label) })).toBeInTheDocument();
  });

  it("marks the active tab with the amber accent underline", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("tab", { selected: true }).className).toContain(
      "data-[state=active]:shadow-[inset_0_-3px_var(--accent)]",
    );
  });

  it("lays the reader's tabs out in equal-width columns, whatever their labels", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("tablist")).toHaveClass("grid-flow-col", "auto-cols-fr");
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

  it("dates the stored summary in its badge", async () => {
    renderAt({
      ...baseDetail,
      summary: { generatedAt: "2026-08-12T00:00:00Z", text: "Book ahead." },
    });
    await userEvent.click(screen.getByRole("switch", { name: "AI summary" }));
    const card = screen.getByRole("region", { name: "AI summary" });
    expect(card).toHaveTextContent(`Generated ${formatDate("2026-08-12T00:00:00Z")}`);
  });

  it("offers the AI summary on every published document, saying when there isn't one yet", async () => {
    renderAt(baseDetail);
    await userEvent.click(screen.getByRole("switch", { name: "AI summary" }));
    expect(screen.getByRole("region", { name: "AI summary" })).toHaveTextContent(
      "Summary will appear after the next publish.",
    );
  });

  it("says the AI summary is unavailable while AI is down and nothing is stored", async () => {
    renderAt({ ...baseDetail, ai: { available: false, reason: "provider_unavailable" } });
    await userEvent.click(screen.getByRole("switch", { name: "AI summary" }));
    expect(screen.getByRole("region", { name: "AI summary" })).toHaveTextContent(
      "AI summaries are temporarily unavailable. Everything else in the app keeps working as usual.",
    );
  });

  it("still shows a stored summary while AI is down", async () => {
    renderAt({
      ...baseDetail,
      ai: { available: false, reason: "ai_service_unavailable" },
      summary: { generatedAt: "2026-08-12T00:00:00Z", text: "Cancel early." },
    });
    await userEvent.click(screen.getByRole("switch", { name: "AI summary" }));
    expect(screen.getByText("Cancel early.")).toBeVisible();
  });

  it("removes every AI control when an administrator has turned AI off", () => {
    renderAt({ ...baseDetail, ai: { available: false, reason: "disabled_by_admin" } });
    expect(screen.queryByRole("switch", { name: "AI summary" })).toBeNull();
  });

  it("leaves the AI summary out of a document that isn't published", () => {
    renderAt({ ...baseDetail, currentVersionId: null, status: PolicyStatus.Draft });
    expect(screen.queryByRole("switch", { name: "AI summary" })).toBeNull();
  });

  it("gives each section the anchor an AI citation links to (#sectionKey)", () => {
    renderAt(baseDetail);
    expect(screen.getByRole("heading", { level: 2, name: "1. Purpose" })).toHaveAttribute(
      "id",
      "purpose",
    );
    const outline = screen.getByRole("complementary", { name: "On this page" });
    expect(within(outline).getByRole("link", { name: /Responsibilities/ })).toHaveAttribute(
      "href",
      "#responsibilities",
    );
  });

  it("scrolls to the section a citation names when the reader opens", async () => {
    const scroll = vi.spyOn(Element.prototype, "scrollIntoView");
    const Stub = createRoutesStub([
      { Component: () => <PolicyReader detail={baseDetail} />, path: "/policies/:number" },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001#responsibilities"]} />);
    const heading = await screen.findByRole("heading", { level: 2, name: "2. Responsibilities" });
    await waitFor(() => expect(scroll.mock.contexts).toContain(heading));
    scroll.mockRestore();
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

  it("never offers an acknowledgement on a procedure, even when the backend says one is required (bug log 213)", () => {
    renderAt({ ...baseDetail, documentType: DocumentType.Procedure });
    expect(screen.queryByRole("button", { name: "Acknowledge" })).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
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

  it("tells a reader nothing about a version in review", () => {
    renderAt({ ...baseDetail, revision: { status: PolicyStatus.InReview, version: "3.0.0" } });
    expect(screen.queryByText("A new version is in review")).toBeNull();
    expect(screen.queryByText(/waiting on approval/)).toBeNull();
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

  it("counts each tab from its own list: 1 related, 2 references, 2 contacts (bug log 49)", () => {
    renderAt({
      ...baseDetail,
      contacts: [contact("c-1"), contact("c-2")],
      references: [
        { id: "r-1", kind: ReferenceKind.Standard, label: "One" },
        { id: "r-2", kind: ReferenceKind.Standard, label: "Two" },
      ],
      related: [{ number: "POL-X-000001", policyId: "p-4", title: "Other" }],
    });
    for (const [name, count] of [
      ["Definitions 1", "1"],
      ["Related 1", "1"],
      ["References 2", "2"],
      ["Contacts 2", "2"],
    ] as const)
      expect(within(screen.getByRole("tab", { name })).getByText(count)).toBeInTheDocument();
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
    renderAt(compared);
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByText("30").tagName).toBe("INS");
    expect(screen.getByText("60").tagName).toBe("DEL");
  });

  it("compares any two versions (U19), from the one before the current to the current", async () => {
    renderAt(compared);
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByRole("heading", { level: 2, name: "Compare versions" })).toBeVisible();
    expect(
      screen.getByText("Diff any two versions of this policy — from v1 to present."),
    ).toBeVisible();
    expect(screen.getByRole("combobox", { name: "From version" })).toHaveTextContent(
      "v2 · superseded",
    );
    expect(screen.getByRole("combobox", { name: "To version" })).toHaveTextContent(
      "v3 · published",
    );
  });

  it("loads the diff between the versions picked", async () => {
    const asked: string[] = [];
    const Stub = createRoutesStub([
      { Component: () => <PolicyReader detail={compared} />, path: "/policies/:number" },
      {
        loader: ({ request }) => {
          asked.push(new URL(request.url).search);
          return {
            diff: [
              {
                changeType: "modified",
                sectionKey: "receipts",
                sectionTitle: "3. Receipts",
                wordDiffHtml: "Attach <del>originals</del> <ins>photos</ins>.",
              },
            ],
          };
        },
        path: "/resources/version-diff",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
    await userEvent.click(await screen.findByRole("tab", { name: "Changes" }));
    await userEvent.click(screen.getByRole("combobox", { name: "From version" }));
    await userEvent.click(screen.getByRole("option", { name: "v1 · superseded" }));
    expect(await screen.findByText("photos")).toHaveProperty("tagName", "INS");
    expect(asked).toEqual(["?from=version-v1&to=version-v3"]);
  });

  it("says when the picked versions' diff couldn't be loaded, keeping the page", async () => {
    const Stub = createRoutesStub([
      { Component: () => <PolicyReader detail={compared} />, path: "/policies/:number" },
      {
        loader: () => ({ diff: [], failure: { code: "INTERNAL", operation: "DiffVersions" } }),
        path: "/resources/version-diff",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
    await userEvent.click(await screen.findByRole("tab", { name: "Changes" }));
    await userEvent.click(screen.getByRole("combobox", { name: "From version" }));
    await userEvent.click(screen.getByRole("option", { name: "v1 · superseded" }));
    expect(await screen.findByText("These versions couldn't be compared")).toBeVisible();
    expect(screen.getByRole("heading", { level: 1, name: "Expense Claims" })).toBeVisible();
  });

  it("folds the sections that didn't change into one line each run", async () => {
    renderAt({
      ...compared,
      priorVersion: {
        ...compared.priorVersion!,
        diff: [
          section("scope", "unchanged"),
          section("audience", "unchanged"),
          section("claim", "changed", "File within <del>60</del> <ins>30</ins> days."),
          section("rates", "unchanged"),
        ],
      },
    });
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByText("2 unchanged sections")).toBeVisible();
    expect(screen.getByText("1 unchanged section")).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "CLAIM" })).toBeVisible();
    expect(screen.queryByRole("heading", { level: 3, name: "SCOPE" })).toBeNull();
  });

  it("says when two versions have no differences", async () => {
    renderAt({ ...compared, priorVersion: { ...compared.priorVersion!, diff: [] } });
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByText("No changes between these versions.")).toBeVisible();
  });

  it("says so when every section is unchanged", async () => {
    renderAt({
      ...compared,
      priorVersion: { ...compared.priorVersion!, diff: [section("scope", "unchanged")] },
    });
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    expect(screen.getByText("No changes between these versions.")).toBeVisible();
  });

  it("says the change summary is unavailable while AI is down (U12)", async () => {
    renderAt({ ...compared, ai: { available: false, reason: "provider_unavailable" } });
    await userEvent.click(screen.getByRole("tab", { name: "Changes" }));
    const panel = screen.getByRole("region", { name: "Summarise changes" });
    expect(panel).toHaveTextContent(
      "AI summaries are temporarily unavailable. Everything else in the app keeps working as usual.",
    );
  });

  it("restyles Related, References and Contacts to their panels (U14–U16)", async () => {
    renderAt({
      ...baseDetail,
      contacts: [
        {
          department: "Facilities",
          email: "dave@example.org",
          hours: "Mon–Fri, 09:00–17:00",
          id: "c-1",
          label: "Facilities help",
          name: "Dave",
          phone: "+44 0000 000000",
          role: "Category owner",
        },
      ],
      references: [
        {
          clause: "§4.2",
          id: "r-1",
          kind: ReferenceKind.Standard,
          label: "Workplace health standard",
        },
        {
          id: "r-2",
          kind: ReferenceKind.Link,
          label: "Desk booking page",
          url: "https://example.org/desks",
        },
      ],
      related: [
        { number: "POL-FACILITIES-000004", policyId: "p-4", title: "Visitor Sign-in Policy" },
      ],
    });

    // Every count tab shows its count in the same amber badge.
    for (const [name, count] of [
      ["Definitions 1", "1"],
      ["Related 1", "1"],
      ["References 2", "2"],
      ["Contacts 1", "1"],
    ] as const) {
      expect(within(screen.getByRole("tab", { name })).getByText(count)).toHaveClass(
        "bg-accent-fill",
      );
    }
    await userEvent.click(screen.getByRole("tab", { name: "Related 1" }));
    const related = screen.getByRole("region", { name: "Related" });
    expect(within(related).getByRole("link", { name: /Visitor Sign-in Policy/ })).toHaveAttribute(
      "href",
      "/policies/POL-FACILITIES-000004",
    );
    expect(within(related).getByText("POL-FACILITIES-000004")).toHaveClass("font-mono");

    await userEvent.click(screen.getByRole("tab", { name: "References 2" }));
    const references = screen.getByRole("region", { name: "References" });
    expect(within(references).getByText("Standard")).toBeVisible();
    expect(within(references).getByText("§4.2")).toHaveClass("font-mono");
    expect(within(references).getByRole("link", { name: "Desk booking page" })).toHaveAttribute(
      "href",
      "https://example.org/desks",
    );

    await userEvent.click(screen.getByRole("tab", { name: "Contacts 1" }));
    const contacts = screen.getByRole("region", { name: "Contacts" });
    const card = within(contacts).getByRole("group", { name: "Facilities help" });
    expect(within(card).getByText("Dave")).toBeVisible();
    for (const [term, value] of [
      ["Role", "Category owner"],
      ["Department", "Facilities"],
      ["Hours", "Mon–Fri, 09:00–17:00"],
    ])
      expect(card).toHaveTextContent(`${term}${value}`);
    expect(within(card).getByRole("link", { name: "dave@example.org" })).toHaveAttribute(
      "href",
      "mailto:dave@example.org",
    );
    expect(within(card).getByText("+44 0000 000000")).toHaveClass("font-mono");
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

const Offered = () => (
  <ul aria-label="offered">
    {useCommandActions().map((action) => (
      <li key={action.id}>{action.label}</li>
    ))}
  </ul>
);
const mount = (detail: PolicyDetail) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <CommandActionsProvider>
          <PolicyReader detail={detail} viewerName="Erin Reader" />
          <Offered />
        </CommandActionsProvider>
      ),
      path: "/policies/:number",
    },
  ]);
  render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
};
const offered = () =>
  within(screen.getByRole("list", { name: "offered" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent);

describe("the reader on the command bar (bug log 26)", () => {
  it("offers Acknowledge only while the person can, and opens the dialog on A", async () => {
    mount(baseDetail);
    expect(offered()).toContain("Acknowledge");
    await userEvent.keyboard("a");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("offers no Acknowledge once it is done, but keeps History and Print", () => {
    mount({
      ...baseDetail,
      ack: { ackedAt: "2026-08-13T00:00:00Z", acknowledged: true, required: true },
    });
    expect(offered()).not.toContain("Acknowledge");
    expect(offered()).toEqual(expect.arrayContaining(["Print / Export", "History & approvals"]));
  });
});

describe("Edit on the reader (bug log 59)", () => {
  const posted = vi.fn();
  const mountEditable = (editAction?: string, detail: PolicyDetail = baseDetail) => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <CommandActionsProvider>
            <PolicyReader detail={detail} editAction={editAction} viewerName="Bob Author" />
            <Offered />
          </CommandActionsProvider>
        ),
        path: "/policies/:number",
      },
      {
        action: async ({ request }) => {
          posted(await request.formData());
          return null;
        },
        Component: () => <p>Editor</p>,
        path: "/drafts/:number",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
  };

  it("offers Edit in the Actions menu and opens the edit screen without starting a draft (bug log 219)", async () => {
    posted.mockClear();
    mountEditable("/drafts/p-1");
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(await screen.findByText("Editor")).toBeInTheDocument();
    expect(posted).not.toHaveBeenCalled();
  });

  it("registers Edit on the command bar too", async () => {
    mountEditable("/drafts/p-1");
    expect(offered()).toContain("Edit");
  });

  it("has no Edit without an edit action (a reader, or the admin console)", async () => {
    mountEditable();
    expect(offered()).not.toContain("Edit");
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");
    expect(screen.queryByRole("menuitem", { name: "Edit" })).toBeNull();
  });

  describe("with a saved draft (#75)", () => {
    const withDraft = {
      ...baseDetail,
      revision: { status: PolicyStatus.Draft, version: "3.0.0" },
    };

    it("says so in a banner with View the current draft, for someone who can edit", async () => {
      mountEditable("/drafts/POL-FINANCE-001", withDraft);
      const banner = screen.getByRole("note");
      expect(within(banner).getByText("This policy has a saved draft")).toBeInTheDocument();
      posted.mockClear();
      await userEvent.click(within(banner).getByRole("button", { name: "View the current draft" }));
      expect(await screen.findByText("Editor")).toBeInTheDocument();
      expect(posted).not.toHaveBeenCalled();
    });

    it("turns Edit into Continue draft in the Actions menu and on the command bar", async () => {
      mountEditable("/drafts/POL-FINANCE-001", withDraft);
      expect(offered()).toContain("Continue draft");
      expect(offered()).not.toContain("Edit");
      await userEvent.click(screen.getByRole("button", { name: "Actions" }));
      expect(await screen.findByRole("menuitem", { name: "Continue draft" })).toBeInTheDocument();
      expect(screen.queryByRole("menuitem", { name: "Edit" })).toBeNull();
    });

    it("names a procedure as a procedure", () => {
      mountEditable("/drafts/PRC-A-000001", { ...withDraft, documentType: DocumentType.Procedure });
      expect(screen.getByText("This procedure has a saved draft")).toBeInTheDocument();
    });

    it("shows nothing about a draft to someone who can't edit", () => {
      mountEditable(undefined, withDraft);
      expect(screen.queryByText("A draft revision is in progress")).toBeNull();
      expect(screen.queryByRole("note")).toBeNull();
      expect(screen.queryByRole("button", { name: "View the current draft" })).toBeNull();
    });

    it("keeps Edit when there is no draft", async () => {
      mountEditable("/drafts/POL-FINANCE-001");
      expect(offered()).toContain("Edit");
      expect(screen.queryByRole("button", { name: "View the current draft" })).toBeNull();
    });
  });

  describe.each([
    ["policy", DocumentType.Policy, "POL-FINANCE-001", "policy"],
    ["procedure", DocumentType.Procedure, "PRC-A-000001", "procedure"],
  ])("with a %s version in review (bug log 215)", (_label, documentType, number, noun) => {
    const inReview = {
      ...baseDetail,
      documentType,
      revision: { status: PolicyStatus.InReview, version: "3.0.0" },
    };

    it("gives the author one area to open the submitted version, still reading the published one", async () => {
      mountEditable(`/drafts/${number}`, inReview);
      const area = screen.getByRole("note");
      expect(within(area).getByText(`Your ${noun} has a version in review`)).toBeInTheDocument();
      expect(within(area).getByText(/v3\.0\.0 is waiting on approval/)).toBeInTheDocument();
      posted.mockClear();
      await userEvent.click(
        within(area).getByRole("button", { name: "View your submitted version" }),
      );
      expect(await screen.findByText("Editor")).toBeInTheDocument();
      expect(posted).not.toHaveBeenCalled();
    });

    it("shows a draft and a version in review in the same single area", () => {
      mountEditable(`/drafts/${number}`, inReview);
      expect(screen.getAllByRole("note")).toHaveLength(1);
    });

    it("shows nothing about it to someone who can't edit", () => {
      mountEditable(undefined, inReview);
      expect(screen.queryByRole("note")).toBeNull();
      expect(screen.queryByRole("button", { name: "View your submitted version" })).toBeNull();
    });

    it("says, before anything is published, that there is no published version yet", () => {
      mountEditable(`/drafts/${number}`, {
        ...inReview,
        body: [],
        currentVersionId: null,
        status: PolicyStatus.InReview,
        version: "",
      });
      const area = screen.getByRole("note");
      expect(within(area).getByText(/Nothing has been published yet/)).toBeInTheDocument();
      expect(screen.queryByText(/You're reading the published/)).toBeNull();
    });
  });
});

describe("a related item's relationship (bug log 227)", () => {
  it("says how it relates, next to its title and number", async () => {
    const Stub = createRoutesStub([
      {
        Component: () => (
          <CommandActionsProvider>
            <PolicyReader
              detail={{
                ...baseDetail,
                related: [
                  {
                    label: "supersedes",
                    number: "POL-A-000001",
                    policyId: "p-a",
                    title: "Old policy",
                  },
                  { number: "POL-B-000001", policyId: "p-b", title: "Plain link" },
                ],
              }}
              viewerName="Bob Author"
            />
          </CommandActionsProvider>
        ),
        path: "/policies/:number",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FINANCE-001"]} />);
    await userEvent.click(screen.getByRole("tab", { name: /Related/ }));
    const panel = screen.getByRole("tabpanel");
    expect(within(panel).getByText("supersedes")).toBeInTheDocument();
    expect(within(panel).getByText("Plain link")).toBeInTheDocument();
    expect(within(panel).getAllByRole("listitem")).toHaveLength(2);
  });
});
