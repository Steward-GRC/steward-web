// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { adminCreates, staffCreates } from "./createActions";

const may =
  (...permissions: string[]) =>
  (permission: string) =>
    permissions.includes(permission);

describe("the command bar's create actions", () => {
  it("lets a staff author create a policy, a procedure and a draft from a template", () => {
    expect(staffCreates(may("policy.read", "policy.author"))).toEqual([
      { id: "policy", label: "shell:create.policy", to: "/drafts/new/policy" },
      { id: "procedure", label: "shell:create.procedure", to: "/drafts/new/procedure" },
      { id: "fromTemplate", label: "shell:create.fromTemplate", to: "/templates" },
    ]);
  });

  it("gives a staff reader nothing to create", () => {
    expect(staffCreates(may("policy.read"))).toEqual([]);
  });

  it("gives an admin each type their permissions allow", () => {
    expect(
      adminCreates(may("group.manage", "user.manage", "settings.manage")).map((a) => [a.id, a.to]),
    ).toEqual([
      ["category", "/categories/new"],
      ["group", "/platform-groups"],
      ["template", "/templates/new"],
      ["workflow", "/workflows/new"],
      ["organisation", "/organisations/new"],
      ["magicLink", "/magic-links"],
    ]);
    expect(adminCreates(may("user.manage")).map((a) => a.id)).toEqual(["group"]);
  });
});
