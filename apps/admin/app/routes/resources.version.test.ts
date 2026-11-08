// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { loader } from "./resources.version";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("resources/version (steward-web#217)", () => {
  it("answers this app's build and the mock's commit as JSON that is never cached", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ commit: "5d39b5c", name: "Steward", version: "0.1.0" })),
    );
    const response = await loader();
    expect(response.headers.get("cache-control")).toBe("no-store");
    const { app, commit, mock } = (await response.json()) as {
      app: string;
      commit: string;
      mock: unknown;
    };
    expect(app).toBe("admin");
    expect(commit).toBeTruthy();
    expect(mock).toEqual({ commit: "5d39b5c" });
  });
});
