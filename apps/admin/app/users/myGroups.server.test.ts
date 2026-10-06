// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group, User } from "@steward-web/api-client";

import { AckTrigger, ReviewCadence } from "@steward-web/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  addUserToGroup,
  findUserByEmail,
  listManagedGroupMembers,
  listManagedGroups,
  removeUserFromGroup,
} from "./myGroups.server";

const managerMe = {
  email: "manager@example.com",
  id: "u-manager",
  managedGroupIds: ["g-2"],
  name: "Manager",
  permissions: [],
  roles: ["reader"],
  username: "manager",
};

const nonManagerMe = {
  email: "reader@example.com",
  id: "u-reader",
  managedGroupIds: [],
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const makeGroup = (overrides: Partial<Group>): Group => ({
  ackEveryone: false,
  ackEveryoneSet: false,
  ackTriggers: AckTrigger.None,
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  exclusionGroupIds: null,
  id: "g-1",
  idpGroupIds: null,
  name: "Group",
  owners: [],
  parentId: null,
  reviewCadence: ReviewCadence.None,
  reviewDate: null,
  slug: "group",
  ...overrides,
});

const makeUser = (overrides: Partial<User>): User => ({
  deletedAt: null,
  email: "ada@example.com",
  enabled: true,
  firstName: "Ada",
  idpGroups: [],
  isRoot: false,
  lastName: "Lovelace",
  localAccount: true,
  memberships: [],
  mergedIntoUserId: null,
  name: "Ada Lovelace",
  roles: [],
  userId: "u-ada",
  username: "alovelace",
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

  it("resolves the manager's own groups by name, alphabetically", async () => {
    const itSecurity = makeGroup({ id: "g-2", name: "IT Security" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: managerMe }))
      .mockResolvedValueOnce(jsonOnce({ categoryChildren: [itSecurity] }))
      .mockResolvedValueOnce(jsonOnce({ categoryChildren: [] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listManagedGroups(request())).toEqual([{ id: "g-2", name: "IT Security" }]);
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
      email: "grace@example.com",
      memberships: [{ groupId: "g-2", source: "manual" }],
      name: "Grace",
      userId: "u-grace",
    });
    const margaret = makeUser({
      email: "margaret@example.com",
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
          searchUsers: [{ email: "grace@example.com", id: "u-grace", name: "Grace" }],
        }),
      ),
    );
    expect(await findUserByEmail(request(), "grace@example.com")).toEqual({
      email: "grace@example.com",
      id: "u-grace",
      name: "Grace",
    });
  });

  it("returns undefined when nothing matches exactly", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ searchUsers: [] })));
    expect(await findUserByEmail(request(), "nobody@example.com")).toBeUndefined();
  });
});

describe("addUserToGroup", () => {
  it("calls the gateway's addUserToGroup mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonOnce({ addUserToGroup: makeUser({ userId: "u-grace" }) }));
    vi.stubGlobal("fetch", fetchSpy);

    await addUserToGroup(request(), "u-grace", "g-2");
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      groupId: "g-2",
      userId: "u-grace",
    });
  });
});

describe("removeUserFromGroup", () => {
  it("calls the gateway's removeUserFromGroup mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(jsonOnce({ removeUserFromGroup: makeUser({ userId: "u-grace" }) }));
    vi.stubGlobal("fetch", fetchSpy);

    await removeUserFromGroup(request(), "u-grace", "g-2");
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      groupId: "g-2",
      userId: "u-grace",
    });
  });
});
