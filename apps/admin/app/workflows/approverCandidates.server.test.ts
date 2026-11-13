// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { beforeEach, describe, expect, it, vi } from "vitest";

const candidates = vi.hoisted(() => vi.fn());
const permission = vi.hoisted(() => vi.fn());

vi.mock("@steward-web/edge.server", () => ({
  default: { workflowApproverCandidates: candidates },
}));
vi.mock("@steward-web/auth/server", () => ({ requirePermissionFromRequest: permission }));

import { getApproverCandidates, groupMembersOf } from "./approverCandidates.server";

const request = new Request("https://localhost/workflows/w-1", { headers: { cookie: "s=1" } });

beforeEach(() => {
  candidates.mockReset();
  permission.mockReset().mockResolvedValue(null);
});

describe("getApproverCandidates", () => {
  it("asks the gateway for the one workflow and maps the people", async () => {
    candidates.mockResolvedValue({
      attached: true,
      categoryIds: ["c-1"],
      users: [{ name: "Dave", userId: "u-dave" }],
      workflowId: "w-1",
    });
    expect(await getApproverCandidates(request, "w-1")).toEqual({
      attached: true,
      users: [{ id: "u-dave", name: "Dave" }],
    });
    expect(candidates).toHaveBeenCalledWith("w-1", "s=1");
  });

  it("offers nobody for a workflow no category uses", async () => {
    candidates.mockResolvedValue({
      attached: false,
      categoryIds: [],
      users: [{ name: "Leaked", userId: "u-x" }],
      workflowId: "w-1",
    });
    expect(await getApproverCandidates(request, "w-1")).toEqual({ attached: false, users: [] });
  });

  it("answers null, not unattached, when the gateway refuses", async () => {
    candidates.mockRejectedValue(new Error("refused"));
    expect(await getApproverCandidates(request, "w-1")).toBeNull();
  });

  it("lets the permission redirect through", async () => {
    permission.mockRejectedValue(new Response(null, { status: 302 }));
    await expect(getApproverCandidates(request, "w-1")).rejects.toBeInstanceOf(Response);
    expect(candidates).not.toHaveBeenCalled();
  });
});

describe("groupMembersOf", () => {
  it("lists each group's direct members and skips deleted users", () => {
    const users = [
      { deletedAt: null, groupIds: ["g-1", "g-2"], userId: "u-1" },
      { deletedAt: null, groupIds: ["g-1"], userId: "u-2" },
      { deletedAt: "2026-01-01T00:00:00Z", groupIds: ["g-1"], userId: "u-3" },
    ] as unknown as User[];
    expect(groupMembersOf(users)).toEqual({ "g-1": ["u-1", "u-2"], "g-2": ["u-1"] });
  });
});
