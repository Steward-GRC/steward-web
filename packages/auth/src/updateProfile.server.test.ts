// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { updateMyProfile } from "./updateProfile.server";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("updateMyProfile", () => {
  it("sends the request's own cookie and returns the saved identity", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      Response.json({
        data: {
          updateMyProfile: {
            email: "a@example.com",
            firstName: "Ada",
            id: "u-1",
            lastName: "Lovelace",
            name: "Ada Lovelace",
            permissions: ["policy.read"],
            roles: ["reader"],
            username: "ada",
          },
        },
      }),
    );
    vi.stubGlobal("fetch", fetchSpy);

    const request = new Request("https://staff.steward.example/profile", {
      headers: { cookie: "steward_session=abc" },
    });
    const identity = await updateMyProfile(request, { firstName: "Ada", lastName: "Lovelace" });

    expect(identity).toMatchObject({ firstName: "Ada", id: "u-1", lastName: "Lovelace" });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).cookie).toBe("steward_session=abc");
  });

  it("rejects with GatewayError when the gateway refuses the save", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "signed out" }],
        }),
      ),
    );

    await expect(
      updateMyProfile(new Request("https://staff.steward.example/profile"), {
        firstName: "Ada",
        lastName: "Lovelace",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHENTICATED", name: "GatewayError" });
  });
});
