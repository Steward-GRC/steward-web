// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { CaseStatus } from "@steward-web/api-client";
import { IdentityProvider, NO_ACCESS } from "@steward-web/auth";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ComponentProps } from "react";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import ReportingCases from "./reporting.cases";

type Props = ComponentProps<typeof ReportingCases>;

const row = (id: string, receivedAt: string, nextDeadline: null | string) => ({
  assigneeUserId: "",
  caseCode: `CASE-${id}`,
  id,
  kind: "CONCERN",
  nextDeadline,
  receivedAt,
  status: CaseStatus.Open,
  summary: `Summary ${id}`,
});

const show = (cases: ReturnType<typeof row>[]) => {
  const loaderData = { filter: "open", queue: { cases, counts: [] } };
  const props = { loaderData } as unknown as Props;
  const Stub = createRoutesStub([{ Component: () => <ReportingCases {...props} />, path: "/" }]);
  render(
    <IdentityProvider identity={{ ...NO_ACCESS, id: "u-officer", name: "Officer" }}>
      <Stub />
    </IdentityProvider>,
  );
};

const codes = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((r) => within(r).getAllByRole("cell")[0]?.textContent?.slice(0, 6));

describe("the reporting case queue", () => {
  it("writes the received date in the app's date style, not as an ISO slice", async () => {
    show([row("A1", "2026-10-02T09:30:00Z", null)]);
    expect(await screen.findByText("2 Oct 2026")).toBeInTheDocument();
    expect(screen.queryByText("2026-10-02")).not.toBeInTheDocument();
  });

  it("sorts by received date from its header", async () => {
    show([
      row("A1", "2026-10-02T09:30:00Z", null),
      row("B2", "2026-09-01T09:30:00Z", null),
      row("C3", "2026-11-01T09:30:00Z", null),
    ]);
    const header = await screen.findByRole("columnheader", { name: /Received/ });
    await userEvent.click(within(header).getByRole("button"));
    expect(codes()).toEqual(["CASE-B", "CASE-A", "CASE-C"]);
    await userEvent.click(within(header).getByRole("button"));
    expect(codes()).toEqual(["CASE-C", "CASE-A", "CASE-B"]);
  });
});
