// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { formatDate, formatDateTime } from "@steward-web/i18n";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { PolicyDetail } from "./policyReaderModel";

import { PAGE, pageRules, PAGES, PolicyPrint } from "./PolicyPrint";
import { PolicyReader } from "./PolicyReader";

const detail: PolicyDetail = {
  ack: null,
  appendices: [
    {
      id: "appendix-1",
      letter: "A",
      text: "Quiet zone, team zone and drop-in zone.",
      title: "Desk zones",
    },
  ],
  body: [
    { depth: 1, kind: "heading", sectionKey: "purpose", text: "Purpose" },
    { kind: "paragraph", runs: [{ text: "How staff book a desk." }] },
    { depth: 1, kind: "heading", sectionKey: "booking-a-desk", text: "Booking a desk" },
    {
      kind: "paragraph",
      runs: [
        { text: "Book a shared desk through " },
        { href: "https://example.org/desks", text: "the booking page" },
        { text: "." },
      ],
    },
    { depth: 2, kind: "heading", sectionKey: "changing-a-booking", text: "Changing a booking" },
    { depth: 1, kind: "heading", sectionKey: "responsibilities", text: "Responsibilities" },
    {
      kind: "table",
      rows: [
        { cells: ["Role", "Responsibility"], header: true },
        { cells: ["Staff", "Book ahead."], header: false },
      ],
    },
  ],
  bodyText: "",
  bodyUnreadable: false,
  canBreakGlass: false,
  category: "Workplace",
  contacts: [],
  contentObfuscated: false,
  currentVersionId: "version-1",
  definitions: [
    { definition: "A desk anyone can book for the day.", id: "d-1", term: "Shared desk" },
  ],
  documentType: DocumentType.Policy,
  history: [
    {
      actorName: "Bob",
      at: "2026-09-28T16:41:00Z",
      comment: null,
      kind: "submitted",
      stage: null,
      versionLabel: "1",
    },
    {
      actorName: "Carol",
      at: "2026-10-02T13:58:00Z",
      comment: "Clear and ready.",
      kind: "approved",
      stage: "Final approval",
      versionLabel: "1",
    },
    {
      actorName: null,
      at: "2026-10-02T14:02:00Z",
      comment: null,
      kind: "published",
      stage: null,
      versionLabel: "1",
    },
  ],
  id: "policy-9",
  nextReview: "2027-10-02T00:00:00Z",
  number: "POL-FACILITIES-000001",
  ownerName: "Dave",
  priorVersion: null,
  published: "2026-10-02T14:02:00Z",
  references: [],
  related: [],
  revision: null,
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Facilities",
  summary: null,
  title: "Desk Booking Policy",
  updated: "2026-10-02T14:02:00Z",
  version: "1",
};

const printed = new Date("2026-10-03T09:30:00Z");

const renderPrint = (overrides: Partial<PolicyDetail> = {}) =>
  render(
    <PolicyPrint
      detail={{ ...detail, ...overrides }}
      organisation="Example Organisation"
      printedAt={printed}
      viewerName="Erin"
    />,
  );

describe("PolicyPrint (R1)", () => {
  it("heads the document with the kicker, the serif title and the four-up strip", () => {
    renderPrint();
    const page = screen.getByRole("document", { name: "Desk Booking Policy" });
    expect(within(page).getByText("Workplace · Facilities")).toBeInTheDocument();
    expect(
      within(page).getByRole("heading", { level: 1, name: "Desk Booking Policy" }),
    ).toBeInTheDocument();
    const strip = within(page).getByRole("list", { name: "Details" });
    expect(strip).toHaveTextContent("StatusPublished");
    expect(strip).toHaveTextContent("OwnerDave");
    expect(strip).toHaveTextContent(`Published${formatDate("2026-10-02T14:02:00Z")}`);
    expect(strip).toHaveTextContent(`Next review${formatDate("2027-10-02T00:00:00Z")}`);
  });

  it("numbers the sections as the reader does, and marks defined terms for the end notes", () => {
    renderPrint();
    expect(screen.getByRole("heading", { level: 2, name: "1. Purpose" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "2.1 Changing a booking" }),
    ).toBeInTheDocument();
    expect(screen.getByText("†", { selector: "sup" })).toBeInTheDocument();
  });

  it("prints a link's address as a numbered footnote", () => {
    renderPrint();
    expect(screen.getByText("1", { selector: "sup" })).toBeInTheDocument();
    const links = screen.getByRole("list", { name: "Links" });
    expect(links).toHaveTextContent("https://example.org/desks");
  });

  it("ends with the appendix on its own page, the definitions as end notes and the full history", () => {
    renderPrint();
    expect(screen.getByRole("heading", { name: "Appendix A: Desk zones" })).toHaveClass(
      "break-before-page",
    );
    expect(screen.getByRole("list", { name: "Defined terms" })).toHaveTextContent(
      "† Shared desk — A desk anyone can book for the day.",
    );
    const history = screen.getByRole("list", { name: "History & approvals · v1" });
    expect(within(history).getAllByRole("listitem")).toHaveLength(3);
    expect(history).toHaveTextContent("Carol · “Clear and ready.”");
  });

  it("prints only that the content is hidden when the caller can't read it", () => {
    renderPrint({ canBreakGlass: false, contentObfuscated: true });
    expect(screen.getByText("Sensitive content is hidden")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "1. Purpose" })).toBeNull();
    expect(screen.queryByRole("list", { name: "Defined terms" })).toBeNull();
  });
});

describe("pageRules", () => {
  it("puts the running header and footer in the page margins, with page n of N", () => {
    const css = pageRules({
      footer: `Printed ${formatDateTime(printed)} by Erin · Check Steward for the current version`,
      header: "POL-FACILITIES-000001 · v1 · Published",
      organisation: "Example Organisation",
      pageCounter: `Steward · Page ${PAGE} of ${PAGES}`,
    });
    expect(css).toContain("@page");
    expect(css).toContain("margin: 20mm 18mm");
    expect(css).toContain('content: "Example Organisation"');
    expect(css).toContain('content: "POL-FACILITIES-000001 · v1 · Published"');
    expect(css).toContain('content: "Steward · Page " counter(page) " of " counter(pages);');
  });

  it("escapes anything that could end the string or the style element", () => {
    const css = pageRules({
      footer: String.raw`a "quoted" \ </style> line`,
      header: "x",
      organisation: null,
      pageCounter: `Page ${PAGE}`,
    });
    expect(css).not.toContain("</style>");
    expect(css).toContain(String.raw`a \22 quoted\22  \5C  \3C /style> line`);
  });
});

describe("printing from the reader", () => {
  it("draws the print layout only while the browser prints", async () => {
    const print = vi.spyOn(globalThis, "print").mockImplementation(() => {
      globalThis.dispatchEvent(new Event("beforeprint"));
    });
    const Stub = createRoutesStub([
      {
        Component: () => (
          <PolicyReader detail={detail} organisation="Example Organisation" viewerName="Erin" />
        ),
        path: "/policies/:number",
      },
    ]);
    render(<Stub initialEntries={["/policies/POL-FACILITIES-000001"]} />);
    expect(screen.queryByRole("document", { name: "Desk Booking Policy" })).toBeNull();
    await userEvent.click(await screen.findByRole("button", { name: /Actions/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Print/ }));
    expect(screen.getByRole("document", { name: "Desk Booking Policy" })).toBeInTheDocument();
    act(() => {
      globalThis.dispatchEvent(new Event("afterprint"));
    });
    expect(screen.queryByRole("document", { name: "Desk Booking Policy" })).toBeNull();
    print.mockRestore();
  });
});
