// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { beforeEach, describe, expect, it, vi } from "vitest";

const listGroups = vi.fn();
const moveGroup = vi.fn();
const reorderGroups = vi.fn();

vi.mock("../categories/categories.server", () => ({ listGroups, moveGroup, reorderGroups }));

const { action } = await import("./categories");

const groups = [
  { id: "a", name: "Alpha", order: 1, owners: [], parentId: null },
  { id: "b", name: "Beta", order: 2, owners: [], parentId: null },
  { id: "a1", name: "Alpha one", order: 1, owners: [], parentId: "a" },
];

const post = (fields: Record<string, string>) =>
  action({
    context: {},
    params: {},
    request: new Request("http://localhost/categories", {
      body: new URLSearchParams(fields),
      method: "POST",
    }),
  } as unknown as Parameters<typeof action>[0]);

beforeEach(() => {
  vi.clearAllMocks();
  listGroups.mockResolvedValue(groups);
  reorderGroups.mockResolvedValue([]);
});

describe("the categories action: reorder", () => {
  it("sends the parent (null for the top level) and the full sibling order", async () => {
    const result = await post({
      groupId: "b",
      intent: "reorder",
      orderedIds: "b,a",
      parentId: "__top__",
    });
    expect(reorderGroups).toHaveBeenCalledWith(expect.any(Request), null, ["b", "a"]);
    expect(result).toMatchObject({ data: { id: "b", ok: true, reordered: true } });
  });

  it("turns a stale list away without calling the gateway", async () => {
    const result = await post({
      groupId: "b",
      intent: "reorder",
      orderedIds: "b,a,gone",
      parentId: "__top__",
    });
    expect(reorderGroups).not.toHaveBeenCalled();
    expect(result).toMatchObject({ data: { ok: false }, init: { status: 400 } });
  });

  it("refuses an empty list", async () => {
    const result = await post({ groupId: "b", intent: "reorder", orderedIds: "", parentId: "" });
    expect(reorderGroups).not.toHaveBeenCalled();
    expect(result).toMatchObject({ init: { status: 400 } });
  });

  it("reports a gateway refusal as a failure for that category", async () => {
    reorderGroups.mockRejectedValueOnce(new Error("invalid"));
    const result = await post({
      groupId: "a1",
      intent: "reorder",
      orderedIds: "a1",
      parentId: "a",
    });
    expect(result).toMatchObject({ data: { id: "a1", ok: false }, init: { status: 400 } });
  });
});
