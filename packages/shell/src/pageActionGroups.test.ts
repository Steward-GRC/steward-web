// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";

import { pageActionGroups } from "./pageActionGroups";

const actions = [
  { id: "print", label: "Print / Export", run: vi.fn() },
  { id: "retire", kind: "admin" as const, label: "Retire", run: vi.fn() },
  { id: "move", kind: "admin" as const, label: "Move to section", run: vi.fn() },
];
const headings = { actions: "Actions", admin: "Admin" };

describe("pageActionGroups (#103)", () => {
  it("has the everyday actions in Actions and the admin ones in their own Admin group, after", () => {
    const groups = pageActionGroups(actions, "", headings);
    expect(groups.map((group) => group.heading)).toEqual(["Actions", "Admin"]);
    expect(groups[1]?.items.map((item) => item.label)).toEqual(["Retire", "Move to section"]);
  });

  it("marks each admin entry so it reads differently from an everyday one", () => {
    const [everyday, admin] = pageActionGroups(actions, "", headings);
    expect(everyday?.items[0]?.admin).toBeUndefined();
    expect(admin?.items.every((item) => item.admin === true)).toBe(true);
  });

  it("leaves the Admin group out when there are no admin actions", () => {
    expect(pageActionGroups([actions[0]!], "", headings)).toHaveLength(1);
  });

  it("narrows by the words typed, and typing admin lists the admin group", () => {
    expect(
      pageActionGroups(actions, "ret", headings).flatMap((g) =>
        g.items.map((index) => index.label),
      ),
    ).toEqual(["Retire"]);
    const byWord = pageActionGroups(actions, "admin", headings);
    expect(byWord[0]?.items).toEqual([]);
    expect(byWord[1]?.items.map((item) => item.label)).toEqual(["Retire", "Move to section"]);
  });
});
