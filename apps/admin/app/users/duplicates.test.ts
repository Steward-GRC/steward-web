// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { likelyDuplicates } from "./duplicates";

const account = (userId: string, email: string, overrides: Record<string, unknown> = {}) => ({
  deletedAt: null,
  email,
  localAccount: true,
  name: userId,
  roles: [] as string[],
  userId,
  ...overrides,
});

describe("likelyDuplicates (#110)", () => {
  it("offers accounts that share an email, whatever the case", () => {
    const found = likelyDuplicates([
      account("a", "Jon@example.org"),
      account("b", "jon@example.org"),
      account("c", "other@example.org"),
    ]);
    expect(found).toHaveLength(1);
    expect(found[0]?.accounts.map((entry) => entry.userId)).toEqual(["a", "b"]);
  });

  it("does not offer two accounts with one name and different emails", () => {
    expect(
      likelyDuplicates([
        account("a", "pat.quinn@example.org", { name: "Pat Quinn" }),
        account("b", "p.quinn@example.net", { name: "Pat Quinn" }),
      ]),
    ).toEqual([]);
  });

  it("leaves out closed accounts", () => {
    expect(
      likelyDuplicates([
        account("a", "x@example.org"),
        account("b", "x@example.org", { deletedAt: "2026-10-01T00:00:00Z" }),
      ]),
    ).toEqual([]);
  });

  it("proposes keeping the account that holds roles, else the local one, and merging the other into it", () => {
    const [withRoles] = likelyDuplicates([
      account("sso", "x@example.org", { localAccount: false }),
      account("local", "x@example.org", { roles: ["author"] }),
    ]);
    expect(withRoles).toMatchObject({ sourceUserId: "sso", targetUserId: "local" });
    const [byKind] = likelyDuplicates([
      account("sso", "y@example.org", { localAccount: false }),
      account("local", "y@example.org"),
    ]);
    expect(byKind).toMatchObject({ sourceUserId: "sso", targetUserId: "local" });
  });

  it("lists the biggest groups first", () => {
    const found = likelyDuplicates([
      account("a", "one@example.org"),
      account("b", "one@example.org"),
      account("c", "two@example.org"),
      account("d", "two@example.org"),
      account("e", "two@example.org"),
    ]);
    expect(found.map((entry) => entry.email)).toEqual(["two@example.org", "one@example.org"]);
  });
});
