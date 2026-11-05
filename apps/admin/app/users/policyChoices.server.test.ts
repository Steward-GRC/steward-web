// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";

import { listPolicyChoices } from "./userAdmin.server";

vi.mock("@steward-web/edge.server", () => ({
  default: {
    me: async () => ({
      email: "alice@example.org",
      managedGroupIds: [],
      name: "Alice",
      permissions: ["user.manage"],
      roles: ["site-admin"],
      userId: "mock-user-alice",
      username: "alice",
    }),
    policies: async () => [
      { number: "POL-B", title: "Beta" },
      { number: "POL-A", title: "Alpha" },
    ],
  },
}));

describe("the policies an exception can name (A19)", () => {
  it("lists every policy by number and title, in title order", async () => {
    expect(await listPolicyChoices(new Request("https://admin.steward.example/users/x"))).toEqual([
      { number: "POL-A", title: "Alpha" },
      { number: "POL-B", title: "Beta" },
    ]);
  });
});
