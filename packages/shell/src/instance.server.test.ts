// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import { instanceState } from "./instance.server";

const QUERY_URL = "https://gateway.steward.example/query";

const answer = (response: () => Promise<Response>) => {
  const fetchSpy = vi.fn(response);
  vi.stubGlobal("fetch", fetchSpy);
  return fetchSpy;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("instanceState", () => {
  it("asks the gateway's public setup state", async () => {
    const fetchSpy = answer(async () => Response.json({ needsSetup: true }));
    expect(await instanceState({ queryUrl: QUERY_URL })).toBe("needsSetup");
    expect(fetchSpy).toHaveBeenCalledWith("https://gateway.steward.example/setup/state", expect.anything());
  });

  it("is ready once the root administrator exists", async () => {
    answer(async () => Response.json({ needsSetup: false }));
    expect(await instanceState({ queryUrl: QUERY_URL })).toBe("ready");
  });

  it("can't tell while the gateway can't answer", async () => {
    answer(async () => Response.json({ error: "maintenance" }, { status: 503 }));
    expect(await instanceState({ queryUrl: QUERY_URL })).toBe("unknown");
    answer(() => Promise.reject(new Error("connection refused")));
    expect(await instanceState({ queryUrl: QUERY_URL })).toBe("unknown");
  });
});
