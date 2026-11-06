// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { CommandActionsProvider, useCommandActions } from "@steward-web/ui";
import { type PolicyDetail } from "@steward-web/ui/domain";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { AdminPolicyReader } from "./AdminPolicyReader";

const published: PolicyDetail = {
  ack: null,
  appendices: [],
  body: [{ depth: 1, kind: "heading", sectionKey: "purpose", text: "Purpose" }],
  bodyText: "",
  bodyUnreadable: false,
  canBreakGlass: false,
  category: "Workplace",
  contacts: [],
  contentObfuscated: false,
  currentVersionId: "v-1",
  definitions: [],
  documentType: DocumentType.Policy,
  history: [],
  id: "p-desk",
  number: "POL-FACILITIES-000001",
  ownerName: "Dave",
  priorVersion: null,
  published: "2026-10-02T12:00:00Z",
  references: [],
  related: [],
  revision: null,
  sensitivity: Sensitivity.Standard,
  status: PolicyStatus.Published,
  subcategory: "Facilities",
  summary: null,
  title: "Desk Booking Policy",
  updated: "2026-10-02T12:00:00Z",
  version: "1.0.0",
};

const draft: PolicyDetail = {
  ...published,
  currentVersionId: null,
  published: null,
  status: PolicyStatus.Draft,
  title: "Visitor Sign-in Policy",
};

const Offered = () => (
  <ul aria-label="offered">
    {useCommandActions().map((action) => (
      <li key={action.id}>{action.label}</li>
    ))}
  </ul>
);

const open = (detail: PolicyDetail, isSiteAdmin: boolean) => {
  const Stub = createRoutesStub([
    {
      Component: () => (
        <CommandActionsProvider>
          <AdminPolicyReader detail={detail} isSiteAdmin={isSiteAdmin} />
          <Offered />
        </CommandActionsProvider>
      ),
      path: "/policies/:number",
    },
  ]);
  render(<Stub initialEntries={[`/policies/${detail.number}`]} />);
};

const offered = () =>
  within(screen.getByRole("list", { name: "offered" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent);

describe("the admin policy page on the command bar (bug log 26)", () => {
  it("offers the governance actions the Actions menu offers, for a site admin", () => {
    open(published, true);
    expect(offered()).toEqual(
      expect.arrayContaining([
        "Export PDF",
        "Magic link",
        "Change author",
        "Move to section",
        "Retire",
        "Delete",
      ]),
    );
  });

  it("leaves out what this person may not do, and Export PDF on a draft", () => {
    open(draft, false);
    const names = offered();
    expect(names).not.toContain("Change author");
    expect(names).not.toContain("Move to section");
    expect(names).not.toContain("Export PDF");
    expect(names).toContain("Retire");
  });

  it("opens the retire dialog on Shift+R", async () => {
    open(published, true);
    await userEvent.keyboard("{Shift>}R{/Shift}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
