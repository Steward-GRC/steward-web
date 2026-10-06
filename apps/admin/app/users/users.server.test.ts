// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteUser,
  findUser,
  listUsers,
  revokeUserSessions,
  setUserEnabled,
  setUserGlobalRoles,
} from "./users.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  name: "Admin",
  permissions: ["user.manage", "session.manage"],
  roles: ["site-admin"],
  username: "admin",
};

const readerMe = {
  email: "reader@example.com",
  id: "u-reader",
  name: "Reader",
  permissions: [],
  roles: ["reader"],
  username: "reader",
};

const jsonOnce = (data: unknown) => Response.json({ data });

const testUser: User = {
  adGroups: [],
  deletedAt: null,
  email: "ada@example.com",
  enabled: true,
  firstName: "Ada",
  isRoot: false,
  lastName: "Lovelace",
  localAccount: true,
  mergedIntoUserId: null,
  name: "Ada Lovelace",
  roles: [],
  userId: "u-ada",
  username: "alovelace",
};

const request = () => new Request("https://admin.steward.example/users");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listUsers", () => {
  it("redirects a caller who lacks user.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await listUsers(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("returns the directory page for a site-admin", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ users: { nextPageToken: "", users: [testUser] } }));
    vi.stubGlobal("fetch", fetchSpy);

    const users = await listUsers(request(), { search: "ada" });
    expect(users).toEqual([testUser]);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ search: "ada" });
  });
});

describe("findUser", () => {
  it("finds a user by id out of the full directory, deleted accounts included", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ users: { nextPageToken: "", users: [testUser] } }));
    vi.stubGlobal("fetch", fetchSpy);

    const found = await findUser(request(), "u-ada");
    expect(found).toEqual(testUser);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ includeDeleted: true });
  });
});

describe("setUserEnabled", () => {
  it("calls disableUser when turning the account off", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ disableUser: { ...testUser, enabled: false } }));
    vi.stubGlobal("fetch", fetchSpy);

    const updated = await setUserEnabled(request(), "u-ada", false);
    expect(updated.enabled).toBe(false);
    expect(JSON.parse((fetchSpy.mock.calls[1]![1] as RequestInit).body as string).query).toContain(
      "disableUser",
    );
  });
});

describe("setUserGlobalRoles", () => {
  it("grants a role the caller just added", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ grantRole: { ...testUser, roles: ["site-admin"] } }));
    vi.stubGlobal("fetch", fetchSpy);

    const updated = await setUserGlobalRoles(request(), testUser, ["site-admin"]);
    expect(updated.roles).toEqual(["site-admin"]);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ role: "site-admin" });
  });

  it("revokes a role no longer in the requested set", async () => {
    const withSiteAdmin = { ...testUser, roles: ["site-admin"] };
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ revokeRole: testUser }));
    vi.stubGlobal("fetch", fetchSpy);

    const updated = await setUserGlobalRoles(request(), withSiteAdmin, []);
    expect(updated.roles).toEqual([]);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ role: "site-admin" });
  });

  it("is a no-op when the requested set already matches", async () => {
    const fetchSpy = vi.fn().mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }));
    vi.stubGlobal("fetch", fetchSpy);

    const updated = await setUserGlobalRoles(request(), testUser, []);
    expect(updated).toBe(testUser);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });
});

describe("revokeUserSessions", () => {
  it("requires session.manage, not just user.manage", async () => {
    const limitedMe = { ...siteAdminMe, permissions: ["user.manage"] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: limitedMe })));
    const thrown: unknown = await revokeUserSessions(request(), "u-ada").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
  });
});

describe("deleteUser", () => {
  it("returns the gateway's revoked-session count", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ deleteUser: { revokedSessions: 2, userId: "u-ada" } }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await deleteUser(request(), "u-ada");
    expect(result).toEqual({ revokedSessions: 2, userId: "u-ada" });
  });
});
