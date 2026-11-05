// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  addUserToGroup,
  findUserByEmail,
  listManagedGroupMembers,
  listManagedGroups,
  removeUserFromGroup,
} from "./myGroups.server";

const managerMe = {
  email: "manager@example.org",
  id: "u-manager",
  managedGroupIds: ["g-2"],
  name: "Manager",
  permissions: [],
  roles: ["reader"],
  username: "manager",
};

const nonManagerMe = {
  email: "reader@example.org",
  id: "u-reader",
  managedGroupIds: [],
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const makeUser = (overrides: Partial<User>): User => ({
  deletedAt: null,
  email: "bob@example.org",
  enabled: true,
  firstName: "Bob",
  idpGroups: [],
  isRoot: false,
  lastName: "Author",
  localAccount: true,
  memberships: [],
  mergedIntoUserId: null,
  name: "Bob Author",
  roles: [],
  userId: "u-bob",
  username: "bob",
  ...overrides,
});

const jsonOnce = (data: unknown) => Response.json({ data });

const request = () => new Request("https://admin.steward.example/my-groups");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listManagedGroups", () => {
  it("returns an empty list for a caller who manages nothing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: nonManagerMe })));
    expect(await listManagedGroups(request())).toEqual([]);
  });

  it("resolves the manager's own platform groups through myManagedGroups", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: managerMe }))
      .mockResolvedValueOnce(
        jsonOnce({ myManagedGroups: [{ id: "g-2", name: "IT Security", parentId: null }] }),
      );
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listManagedGroups(request())).toEqual([{ id: "g-2", name: "IT Security" }]);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    const body = JSON.parse(init.body as string) as { query: string };
    expect(body.query).toContain("myManagedGroups");
    expect(body.query).not.toContain("categoryChildren");
  });

  it("redirects a signed-out caller", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: null })));
    const thrown: unknown = await listManagedGroups(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
  });
});

describe("listManagedGroupMembers", () => {
  it("marks each member's source from their memberships", async () => {
    const grace = makeUser({
      email: "charlie@example.org",
      memberships: [{ groupId: "g-2", source: "manual" }],
      name: "Charlie",
      userId: "u-charlie",
    });
    const margaret = makeUser({
      email: "margaret@example.org",
      memberships: [{ groupId: "g-2", source: "idp-sync" }],
      name: "Margaret",
      userId: "u-margaret",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonOnce({ managedGroupMembers: [grace, margaret] })),
    );

    const members = await listManagedGroupMembers(request(), "g-2");
    expect(members).toEqual([
      { email: grace.email, name: grace.name, source: "manual", userId: grace.userId },
      { email: margaret.email, name: margaret.name, source: "idp-sync", userId: margaret.userId },
    ]);
  });
});

describe("findUserByEmail", () => {
  it("finds the exact email match out of the typeahead results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonOnce({
          searchUsers: [{ email: "charlie@example.org", id: "u-charlie", name: "Charlie" }],
        }),
      ),
    );
    expect(await findUserByEmail(request(), "charlie@example.org")).toEqual({
      email: "charlie@example.org",
      id: "u-charlie",
      name: "Charlie",
    });
  });

  it("returns undefined when nothing matches exactly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ searchUsers: [] })));
    expect(await findUserByEmail(request(), "nobody@example.org")).toBeUndefined();
  });
});

describe("addUserToGroup", () => {
  it("calls the gateway's addUserToGroup mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonOnce({ addUserToGroup: makeUser({ userId: "u-charlie" }) }));
    vi.stubGlobal("fetch", fetchSpy);

    await addUserToGroup(request(), "u-charlie", "g-2");
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      groupId: "g-2",
      userId: "u-charlie",
    });
  });
});

describe("removeUserFromGroup", () => {
  it("calls the gateway's removeUserFromGroup mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonOnce({ removeUserFromGroup: makeUser({ userId: "u-charlie" }) }));
    vi.stubGlobal("fetch", fetchSpy);

    await removeUserFromGroup(request(), "u-charlie", "g-2");
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      groupId: "g-2",
      userId: "u-charlie",
    });
  });
});
