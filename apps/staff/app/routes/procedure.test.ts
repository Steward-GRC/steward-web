// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from "vitest";

vi.mock("@steward-web/auth/server", () => ({
  requireIdentityFromRequest: vi.fn(() => Promise.resolve({})),
}));

import { action } from "./procedure";

type ActionArguments = Parameters<typeof action>[0];

const post = (intent: string) => {
  const body = new FormData();
  body.set("intent", intent);
  return action({
    request: new Request("https://staff.steward.example/procedures/PRC-TRAVEL-000003", {
      body,
      method: "POST",
    }),
  } as unknown as ActionArguments);
};

describe("procedures/:number action (bug log 213)", () => {
  it("refuses an acknowledge: a procedure has none", async () => {
    await expect(post("acknowledge")).rejects.toMatchObject({ status: 400 });
  });
});
