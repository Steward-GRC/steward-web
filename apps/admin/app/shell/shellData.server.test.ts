// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { NO_ACCESS } from "@steward-web/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

import { adminShellData } from "./shellData.server";

const someone = (permissions: string[]) => ({
  ...NO_ACCESS,
  id: "mock-user-alice",
  name: "Alice",
  permissions: new Set(permissions),
});

const FINANCE = { id: "c-finance", name: "Finance", parentId: null };

const stubTree = () => {
  const fetch = vi.fn(async (_url: string, init: RequestInit) => {
    const { variables } = JSON.parse(init.body as string) as {
      variables: { parentId: null | string };
    };
    return Response.json({
      data: { categoryChildren: variables.parentId === null ? [FINANCE] : [] },
    });
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
};

const request = new Request("https://admin.steward.example/");

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the admin shell's category tree", () => {
  it("is read for a template admin too, who views category access (A5)", async () => {
    stubTree();
    const shell = await adminShellData(request, someone(["template.manage"]));
    expect(shell.categories).toEqual([FINANCE]);
  });

  it("isn't read for someone who can neither manage categories nor view their access", async () => {
    const fetch = stubTree();
    const shell = await adminShellData(request, someone(["audit.read"]));
    expect(shell.categories).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
