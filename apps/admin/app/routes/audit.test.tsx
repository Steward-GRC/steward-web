// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub, useLocation } from "react-router";
import { describe, expect, it, vi } from "vitest";

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

const Where = () => <p data-testid="where">{useLocation().search}</p>;

const NO_FILTERS = { actions: [] };

const openAudit = (records: object[] = RECORDS, filters: object = NO_FILTERS, path = "/audit") => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <>
          <AuditLog
            {...({
              loaderData: { cursor: {}, filters, records },
            } as unknown as AuditProps)}
          />
          <Where />
        </>
      ),
      path: "/audit",
    },
  ]);
  render(<Stub initialEntries={[path]} />);
};

describe("Audit log striped rows (#105)", () => {
  it("alternates the row shades", async () => {
    openAudit();
    expect(await screen.findByRole("table", { name: "Audit log" })).toHaveAttribute("data-striped");
  });
});

const where = () => screen.getByTestId("where").textContent ?? "";

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

describe("Audit log filters (#106)", () => {
  it("has typeahead pickers for actor, group and subject, a type dropdown and an action menu", async () => {
    openAudit();
    expect(await screen.findByRole("combobox", { name: "Actor" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Group" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Subject" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Subject type" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actions" })).toBeInTheDocument();
  });

  it("puts a chosen action in the address and shows it as a chip", async () => {
    openAudit();
    await userEvent.click(await screen.findByRole("button", { name: "Actions" }));
    await userEvent.click(await screen.findByRole("menuitemcheckbox", { name: "Role granted" }));
    expect(where()).toContain("action=role.granted");
  });

  it("shows each active filter as a chip that removes it", async () => {
    openAudit(
      RECORDS,
      { actions: ["role.granted"], actor: { id: "u-alice", label: "Alice" }, subjectType: "user" },
      "/audit?actor=u-alice&actorName=Alice&type=user&action=role.granted",
    );
    const chips = await screen.findByRole("list", { name: "Active filters" });
    expect(within(chips).getByText("Actor: Alice")).toBeInTheDocument();
    expect(within(chips).getByText("Role granted")).toBeInTheDocument();
    await userEvent.click(
      within(chips).getByRole("button", { name: "Remove filter Actor: Alice" }),
    );
    expect(where()).not.toContain("actor=");
    expect(where()).toContain("type=user");
  });

  it("clears every filter at once", async () => {
    openAudit(RECORDS, { actions: ["role.granted"] }, "/audit?action=role.granted&type=user");
    await userEvent.click(await screen.findByRole("button", { name: "Clear all filters" }));
    expect(where()).toBe("");
  });

  it("asks the server for people as you type, and keeps the person's id in the address", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          options: [{ detail: "alice@example.org", id: "u-alice", label: "Alice" }],
        }),
      ),
    );
    openAudit();
    await userEvent.type(await screen.findByRole("combobox", { name: "Actor" }), "ali");
    await userEvent.click(await screen.findByRole("option", { name: /Alice/ }));
    expect(where()).toContain("actor=u-alice");
    expect(where()).toContain("actorName=Alice");
    vi.unstubAllGlobals();
  });
});

describe("Audit log row menu (#104)", () => {
  it("offers to show just this actor, subject or group", async () => {
    openAudit();
    fireEvent.contextMenu(await screen.findByRole("row", { name: /Policy published/ }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Only this actor" }));
    expect(where()).toContain("actor=u-grace");
  });
});

describe("Audit log table (#104)", () => {
  it("shows the group by its full category path", async () => {
    openAudit([{ ...RECORDS[0], groupPath: "Finance › Expenses" }]);
    expect(await screen.findByText("Finance › Expenses")).toBeInTheDocument();
  });
});
