// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Group } from "@steward-web/api-client";

import { ReviewCadence } from "@steward-web/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createGroup,
  deleteGroup,
  depthOf,
  descendantIds,
  effectiveOwners,
  findGroup,
  isValidSlug,
  listGroups,
  moveCandidates,
  moveGroup,
  orderedWithPaths,
  ownsOwners,
  renameGroup,
  slugify,
  subtreeHeight,
  updateGroupSettings,
} from "./groups.server";

const siteAdminMe = {
  email: "admin@example.com",
  id: "u-admin",
  name: "Admin",
  permissions: ["group.manage"],
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

const makeGroup = (overrides: Partial<Group> & Pick<Group, "id" | "name">): Group => ({
  defaultTemplateId: null,
  defaultTemplateNone: false,
  defaultWorkflowId: null,
  owners: [],
  parentId: null,
  reviewCadence: ReviewCadence.None,
  reviewDate: null,
  slug: overrides.id,
  ...overrides,
});

const request = () => new Request("https://admin.steward.example/groups");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listGroups", () => {
  it("redirects a caller who lacks group.manage", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonOnce({ me: readerMe })));
    const thrown: unknown = await listGroups(request()).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).headers.get("location")).toBe("/");
  });

  it("walks the tree breadth-first into a flat list", async () => {
    const root = makeGroup({ id: "g-root", name: "Root" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ groupChildren: [root] }))
      .mockResolvedValueOnce(jsonOnce({ groupChildren: [] }));
    vi.stubGlobal("fetch", fetchSpy);

    const groups = await listGroups(request());
    expect(groups).toEqual([root]);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
  });
});

describe("findGroup", () => {
  it("finds a group by id out of the flat directory", async () => {
    const root = makeGroup({ id: "g-root", name: "Root" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ groupChildren: [root] }))
      .mockResolvedValueOnce(jsonOnce({ groupChildren: [] }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await findGroup(request(), "g-root")).toEqual(root);
  });
});

describe("createGroup", () => {
  it("requires group.manage and posts the create mutation", async () => {
    const created = makeGroup({ id: "g-new", name: "New" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ createGroup: created }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await createGroup(request(), { name: "New", parentId: null, slug: "new" });
    expect(result).toEqual(created);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({ name: "New", slug: "new" });
  });
});

describe("renameGroup", () => {
  it("posts the rename mutation", async () => {
    const renamed = makeGroup({ id: "g-1", name: "Renamed" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ renameGroup: renamed }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await renameGroup(request(), {
      groupId: "g-1",
      name: "Renamed",
      slug: "renamed",
    });
    expect(result).toEqual(renamed);
  });
});

describe("deleteGroup", () => {
  it("posts the delete mutation", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ deleteGroup: true }));
    vi.stubGlobal("fetch", fetchSpy);

    await expect(deleteGroup(request(), "g-1")).resolves.toBeUndefined();
  });
});

describe("moveGroup", () => {
  it("posts the move mutation with the new parent", async () => {
    const moved = makeGroup({ id: "g-1", name: "Moved", parentId: "g-2" });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ moveGroup: moved }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await moveGroup(request(), "g-1", "g-2");
    expect(result).toEqual(moved);
  });
});

describe("updateGroupSettings", () => {
  it("posts defaults and governance together", async () => {
    const updated = makeGroup({ id: "g-1", name: "G1", owners: ["u-1"] });
    const fetchSpy = vi
      .fn()
      .mockResolvedValueOnce(jsonOnce({ me: siteAdminMe }))
      .mockResolvedValueOnce(jsonOnce({ updateGroupSettings: updated }));
    vi.stubGlobal("fetch", fetchSpy);

    const result = await updateGroupSettings(request(), "g-1", {
      defaultTemplateId: null,
      defaultTemplateNone: true,
      defaultWorkflowId: null,
      owners: ["u-1"],
      reviewCadence: ReviewCadence.Annual,
      reviewDate: null,
    });
    expect(result).toEqual(updated);
    const [, init] = fetchSpy.mock.calls[1] as [string, RequestInit];
    expect(JSON.parse(init.body as string).variables).toMatchObject({
      owners: ["u-1"],
      reviewCadence: "ANNUAL",
    });
  });
});

describe("slugify / isValidSlug", () => {
  it("derives a slug from a name", () => {
    expect(slugify("Information Security")).toBe("information-security");
    expect(slugify("  Café & Bar!! ")).toBe("caf-bar");
  });

  it("accepts lowercase hyphenated segments only", () => {
    expect(isValidSlug("it-security")).toBe(true);
    expect(isValidSlug("IT-Security")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
  });
});

describe("the hierarchy helpers", () => {
  const root = makeGroup({ id: "root", name: "Meridian Holdings" });
  const dept = makeGroup({ id: "dept", name: "IT Security", parentId: "root" });
  const sub = makeGroup({ id: "sub", name: "Infrastructure", parentId: "dept" });
  const groups = [root, dept, sub];

  it("depthOf counts from the root at depth 1", () => {
    expect(depthOf(groups, "root")).toBe(1);
    expect(depthOf(groups, "dept")).toBe(2);
    expect(depthOf(groups, "sub")).toBe(3);
  });

  it("subtreeHeight treats a leaf as height 1", () => {
    expect(subtreeHeight(groups, "sub")).toBe(1);
    expect(subtreeHeight(groups, "dept")).toBe(2);
    expect(subtreeHeight(groups, "root")).toBe(3);
  });

  it("descendantIds includes the group itself and every descendant", () => {
    expect(descendantIds(groups, "root")).toEqual(new Set(["dept", "root", "sub"]));
    expect(descendantIds(groups, "dept")).toEqual(new Set(["dept", "sub"]));
  });

  it("orderedWithPaths renders the full lineage, depth-first", () => {
    expect(orderedWithPaths(groups)).toEqual([
      { id: "root", path: "Meridian Holdings" },
      { id: "dept", path: "Meridian Holdings › IT Security" },
      { id: "sub", path: "Meridian Holdings › IT Security › Infrastructure" },
    ]);
  });

  it("moveCandidates excludes the group's own subtree and anything too deep to take it", () => {
    const candidates = moveCandidates(groups, "dept").map((c) => c.id);
    expect(candidates).not.toContain("dept");
    expect(candidates).not.toContain("sub");
    expect(candidates).toContain("root");
  });

  it("ownsOwners is true for a root or top-level department, false for a sub-group", () => {
    expect(ownsOwners(groups, root)).toBe(true);
    expect(ownsOwners(groups, dept)).toBe(true);
    expect(ownsOwners(groups, sub)).toBe(false);
  });

  it("effectiveOwners resolves a sub-group's owners from its top-level department", () => {
    const deptWithOwners = { ...dept, owners: ["u-owner"] };
    const groupsWithOwners = [root, deptWithOwners, sub];
    expect(effectiveOwners(groupsWithOwners, sub)).toEqual(["u-owner"]);
    expect(effectiveOwners(groupsWithOwners, deptWithOwners)).toEqual(["u-owner"]);
  });
});
