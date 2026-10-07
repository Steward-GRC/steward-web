// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { createPlatformGroup, listPlatformGroups } from "./platformGroups.server";

const siteAdminMe = {
  email: "admin@example.com",
  firstName: "",
  lastName: "",
  managedGroupIds: [],
  name: "Admin",
  permissions: ["user.manage"],
  roles: ["site-admin"],
  scopes: { author: [] },
  userId: "u-admin",
  username: "admin",
};

const readerMe = { ...siteAdminMe, permissions: ["policy.read"], roles: ["reader"], userId: "u-r" };

const jsonOnce = (data: unknown) => Response.json({ data });

const request = () => new Request("https://admin.steward.example/platform-groups");

/** The operation name each stubbed gateway call carried, in order. */
const operations = (spy: ReturnType<typeof vi.fn>) =>
  spy.mock.calls.map(([, init]) => {
    const body = JSON.parse(String((init as RequestInit).body)) as { query: string };
    return /(?:query|mutation) (\w+)/.exec(body.query)?.[1];
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listPlatformGroups", () => {
  it("walks the whole tree and names each group by its path", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(
        jsonOnce({ platformGroups: [{ id: "g-1", name: "Privacy Officers", parentId: null }] }),
      )
      .mockResolvedValueOnce(
        jsonOnce({ platformGroups: [{ id: "g-2", name: "Deputies", parentId: "g-1" }] }),
      )
      .mockResolvedValueOnce(jsonOnce({ platformGroups: [] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await listPlatformGroups(request())).toEqual([
      { id: "g-1", name: "Privacy Officers", parentId: null, path: "Privacy Officers" },
      { id: "g-2", name: "Deputies", parentId: "g-1", path: "Privacy Officers / Deputies" },
    ]);
    expect(operations(fetchSpy)).toEqual([
      "Me",
      "PlatformGroups",
      "PlatformGroups",
      "PlatformGroups",
    ]);
  });

  it("sends a caller without user.manage home without asking for groups", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(jsonOnce({ me: readerMe }));
    vi.stubGlobal("fetch", fetchSpy);

    const thrown: unknown = await listPlatformGroups(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
    expect(operations(fetchSpy)).toEqual(["Me"]);
  });
});

describe("createPlatformGroup", () => {
  it("creates the group under the chosen parent", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(
        jsonOnce({ createPlatformGroup: { id: "g-3", name: "Reviewers", parentId: "g-1" } }),
      );
    vi.stubGlobal("fetch", fetchSpy);

    expect(await createPlatformGroup(request(), "Reviewers", "g-1")).toEqual({
      id: "g-3",
      name: "Reviewers",
      parentId: "g-1",
    });
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(String(init.body)).variables).toEqual({ name: "Reviewers", parentId: "g-1" });
  });
});
