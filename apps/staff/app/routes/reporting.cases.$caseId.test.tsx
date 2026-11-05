// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Every gateway enum value the case page shows, rendered through the page itself, must come
// out as its translated label: never the raw value (`NOT_SURE`) or an i18n key that the
// catalog doesn't have (`riskRecipient.another_organisation`).
import type { ComponentProps } from "react";

import {
  BreachDecision,
  CaseOutcome,
  CaseStatus,
  InformationKind,
  NoticeRecipient,
  NoticeStatus,
  ReportAnswer,
  type ReportCase,
  ReportKind,
  RiskMitigation,
  RiskRecipient,
  RiskSuggestion,
  RiskViewed,
} from "@steward-web/api-client";
import { IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { fireEvent, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";

import CaseDetail from "./reporting.cases.$caseId";

// The kit's Select is a Radix popover that renders its options only while open; a native
// select shows every option label in the document, which is what this test reads.
vi.mock("@steward-web/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@steward-web/ui")>();
  return {
    ...actual,
    Select: ({ name, options }: ComponentProps<typeof actual.Select>) => (
      <select name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ),
  };
});

const ENUMS = {
  breachDecision: BreachDecision,
  informationKind: InformationKind,
  kind: ReportKind,
  noticeRecipient: NoticeRecipient,
  noticeStatus: NoticeStatus,
  outcome: CaseOutcome,
  reportAnswer: ReportAnswer,
  riskMitigation: RiskMitigation,
  riskRecipient: RiskRecipient,
  riskSuggestion: RiskSuggestion,
  riskViewed: RiskViewed,
  status: CaseStatus,
} as const;

const values = <T extends Record<string, string>>(enumeration: T): T[keyof T][] =>
  Object.values(enumeration) as T[keyof T][];

/** The longest enum sets how many renders it takes to show every value of a one-value field. */
const ROUNDS = Math.max(
  ...Object.values(ENUMS).map((enumeration) => Object.values(enumeration).length),
);

const pick = <T,>(list: T[], round: number): T => list[round % list.length]!;

const caseFor = (round: number, status: CaseStatus): ReportCase => ({
  assessment: {
    decidedAt: "2026-10-01T00:00:00Z",
    decidedByUserId: "u-officer",
    decision: pick(values(BreachDecision), round),
    factors: { information: values(InformationKind) },
    reason: "Contained quickly.",
    suggestion: pick(values(RiskSuggestion), round),
  },
  assigneeUserId: null,
  attachments: [],
  caseCode: "CASE-1",
  correctiveActions: [],
  details: {
    informationKinds: values(InformationKind),
    location: "Office",
    occurred: "Last week",
    stillHappening: pick(values(ReportAnswer), round),
    whatHappened: "A letter went to the wrong address.",
  },
  id: "c-1",
  kind: pick(values(ReportKind), round),
  notes: [],
  notices: values(NoticeRecipient).map((recipient, index) => ({
    daysAllowed: 30,
    dueOn: "2026-11-30",
    id: `n-${index}`,
    label: "Notice",
    method: "Email",
    recipient,
    status: pick(values(NoticeStatus), index + round),
  })),
  receivedAt: "2026-10-01T00:00:00Z",
  status,
  thread: [],
});

const renderCase = (reportCase: ReportCase) => {
  const props = { loaderData: { reportCase } } as unknown as ComponentProps<typeof CaseDetail>;
  const Stub = createRoutesStub([{ Component: () => <CaseDetail {...props} />, path: "/" }]);
  render(
    <IdentityProvider identity={{ ...NO_ACCESS, id: "u-officer", name: "Officer" }}>
      <Stub />
    </IdentityProvider>,
  );
};

const rawValues = Object.values(ENUMS).flatMap((enumeration) => Object.values(enumeration));

/**
 * Every piece of text the page shows, one per DOM text node, read from the whole document so
 * a portalled dialog counts too.
 */
const shownTexts = (): string[] => {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const texts: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.trim();
    if (text) texts.push(text);
  }
  return texts;
};

const expectNoRawLabel = () => {
  const texts = shownTexts();
  for (const group of Object.keys(ENUMS)) {
    const pattern = new RegExp(String.raw`(^|\s)${group}\.`);
    expect(
      texts.filter((text) => pattern.test(text)),
      `untranslated ${group} keys`,
    ).toEqual([]);
  }
  for (const value of rawValues) {
    const pattern = new RegExp(String.raw`\b${value}\b`);
    expect(
      texts.filter((text) => pattern.test(text)),
      `the raw value ${value}`,
    ).toEqual([]);
  }
};

describe("the reporting case page's enum labels", () => {
  it.each(Array.from({ length: ROUNDS }, (_, round) => round))(
    "shows a label for every value of an open case (round %i)",
    async (round) => {
      renderCase(
        caseFor(
          round,
          pick(
            values(CaseStatus).filter((s) => s !== CaseStatus.Closed),
            round,
          ),
        ),
      );
      fireEvent.click(await screen.findByRole("button", { name: "Close case" }));
      await screen.findByRole("dialog");
      expectNoRawLabel();
    },
  );

  it.each(Array.from({ length: ROUNDS }, (_, round) => round))(
    "shows a label for every value of a closed case (round %i)",
    async (round) => {
      renderCase(caseFor(round, CaseStatus.Closed));
      await screen.findByText("CASE-1");
      expectNoRawLabel();
    },
  );

  it("checks a page that does show the enums, so a blank page can't pass", async () => {
    renderCase(caseFor(0, CaseStatus.New));
    await screen.findByText("CASE-1");
    expect(shownTexts()).toEqual(expect.arrayContaining(["Another organisation", "Not sent"]));
  });
});
