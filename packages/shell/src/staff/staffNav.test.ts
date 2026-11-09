// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { i18n } from "@steward-web/i18n";
import { describe, expect, it } from "vitest";

import { COMING_SOON_PATHS, staffNav, type StaffNavInput } from "./staffNav";

const ALL = new Set(["audit.read", "policy.approve", "policy.author", "policy.read"]);

const input = (overrides: Partial<StaffNavInput> = {}): StaffNavInput => ({
  can: (permission) => ALL.has(permission),
  counts: {},
  reporting: true,
  ...overrides,
});

/** The sections as the design's H1 frame reads them: heading, then item labels. */
const outline = (nav: ReturnType<typeof staffNav>) =>
  nav.map((section) => [
    i18n.t(section.label).toUpperCase(),
    section.items.map((item) => i18n.t(item.label)),
  ]);

const only = (permission: string) =>
  staffNav(input({ can: (p) => p === "policy.read" || p === permission, reporting: false }))
    .flatMap((section) => section.items)
    .map((item) => i18n.t(item.label));

const approvals = (count?: number) =>
  staffNav(input({ counts: { approvals: count } }))
    .flatMap((section) => section.items)
    .find((item) => item.id === "approvals");

// A reader with no approver role, holding a seat in a workflow
const seatHolder = (count?: number) =>
  staffNav(
    input({ can: (p) => p === "policy.read", counts: { approvals: count }, reporting: false }),
  )
    .flatMap((section) => section.items)
    .find((item) => item.id === "approvals");

const toAcknowledge = (count?: number) =>
  staffNav(input({ counts: { acknowledge: count } }))
    .flatMap((section) => section.items)
    .find((item) => item.id === "toAcknowledge");

describe("staffNav", () => {
  it("lists H1's sections and items, in order, for someone who can do everything", () => {
    expect(outline(staffNav(input()))).toEqual([
      ["OVERVIEW", ["My work"]],
      ["POLICIES", ["Library", "To acknowledge"]],
      ["PROCEDURES", ["Library"]],
      ["COMPLIANCE", ["Report a concern", "My reports"]],
      ["ASSIST", ["Ask policies & procedures", "Templates"]],
      ["WORKFLOW", ["Approvals", "Audit log"]],
    ]);
  });

  it("never shows Ethics: it is a v0.2.0 module", () => {
    const labels = staffNav(input()).map((section) => section.id);
    expect(labels).not.toContain("ethics");
  });

  it("hides Compliance while reporting is off", () => {
    const labels = staffNav(input({ reporting: false })).map((section) => section.id);
    expect(labels).toEqual(["overview", "policies", "procedures", "assist", "workflow"]);
  });

  it("hides what a reader can't use and drops the sections left empty", () => {
    const reader = staffNav(
      input({ can: (permission) => permission === "policy.read", reporting: false }),
    );
    expect(outline(reader)).toEqual([
      ["OVERVIEW", ["My work"]],
      ["POLICIES", ["Library", "To acknowledge"]],
      ["PROCEDURES", ["Library"]],
      ["ASSIST", ["Ask policies & procedures"]],
    ]);
  });

  it("shows Templates to authors, Approvals to approvers and Audit log to auditors", () => {
    expect(only("policy.author")).toContain("Templates");
    expect(only("policy.author")).not.toContain("Approvals");
    expect(only("policy.approve")).toContain("Approvals");
    expect(only("audit.read")).toContain("Audit log");
  });

  it("shows Approvals to someone with approvals waiting on them, even without the approver role (bug log 257)", () => {
    expect(seatHolder(2)?.badge).toBe(2);
    expect(seatHolder(0)).toBeUndefined();
    expect(seatHolder()).toBeUndefined();
  });

  it("counts what's left to acknowledge on To acknowledge, and shows no badge at zero", () => {
    expect(toAcknowledge(2)?.badge).toBe(2);
    expect(toAcknowledge(0)?.badge).toBeUndefined();
  });

  it("counts pending approvals on the Approvals item, and shows no badge at zero", () => {
    expect(approvals(3)?.badge).toBe(3);
    expect(approvals(0)?.badge).toBeUndefined();
    expect(approvals()?.badge).toBeUndefined();
  });

  it("links built pages to their routes and the rest to a coming-soon page", () => {
    const links = Object.fromEntries(
      staffNav(input())
        .flatMap((section) => section.items)
        .map((item) => [item.id, item.to]),
    );
    expect(links).toMatchObject({
      approvals: "/approvals",
      myWork: "/",
      policies: "/policies",
      procedures: "/procedures",
      toAcknowledge: "/acknowledge",
    });
    expect(COMING_SOON_PATHS).not.toContain("/acknowledge");
    expect(links.ask).toBe("/ask");
    expect(COMING_SOON_PATHS).not.toContain("/ask");
    expect(links.templates).toBe("/templates");
    expect(COMING_SOON_PATHS).not.toContain("/templates");
    expect(COMING_SOON_PATHS).not.toContain("/drafts/import");
    expect(links.auditLog).toBe("/audit");
    expect(COMING_SOON_PATHS).not.toContain("/audit");
    for (const id of ["reportConcern", "myReports"]) {
      expect(COMING_SOON_PATHS).toContain(links[id]);
    }
  });
});
