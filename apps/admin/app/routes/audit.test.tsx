// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { asPhone } from "../test/phone";
import AuditLog from "./audit";

const record = (id: string, action: string, actorName: string, subjectLabel: string) => ({
  action,
  actorName,
  actorUserId: `u-${actorName.toLowerCase()}`,
  groupId: "g-all",
  groupName: "All staff",
  id,
  occurredAt: "2026-10-02T12:00:00Z",
  subject: `s-${id}`,
  subjectLabel,
});

const RECORDS = [
  record("101", "policy.published", "Grace", "POL-0012"),
  record("102", "role.granted", "Alice", "Bob"),
];

type AuditProps = Parameters<typeof AuditLog>[0];

const openAudit = (records: object[] = RECORDS) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <AuditLog {...({ loaderData: { filters: {}, records } } as unknown as AuditProps)} />
      ),
      path: "/audit",
    },
  ]);
  render(<Stub initialEntries={["/audit"]} />);
};

describe("Audit log (A15)", () => {
  it("lists when, action, actor, subject and group", async () => {
    openAudit();
    const table = await screen.findByRole("table", { name: "Audit log" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual(["When", "Action", "Actor", "Subject", "Group"]);
    const published = within(table).getByRole("row", { name: /Policy published/ });
    expect(within(published).getByText("Grace")).toBeInTheDocument();
    expect(within(published).getByText("POL-0012")).toBeInTheDocument();
  });

  it("says when no records match", async () => {
    openAudit([]);
    expect(await screen.findByText("No records found")).toBeInTheDocument();
  });
});

describe("Audit log on a phone (7-responsive.s3)", () => {
  it("lists each record as a card: the action, then when, who and what, then the group", async () => {
    asPhone();
    openAudit();
    const list = await screen.findByRole("list", { name: "Audit log" });
    expect(screen.queryByRole("table")).toBeNull();
    const [published] = within(list).getAllByRole("listitem");
    // The action, the muted line (when · who · what), then the group's badge.
    expect(published).toHaveTextContent(
      /^Policy published2 Oct 2026.* · Grace · POL-0012All staff$/,
    );
  });

  it("narrows the cards from the search", async () => {
    asPhone();
    openAudit();
    await userEvent.type(
      await screen.findByRole("searchbox", { name: "Search these records" }),
      "alice",
    );
    const cards = within(screen.getByRole("list", { name: "Audit log" })).getAllByRole("listitem");
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Role granted");
  });
});
