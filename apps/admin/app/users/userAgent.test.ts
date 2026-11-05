// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { browserOf } from "./userAgent";

describe("a session's browser and system", () => {
  it.each([
    ["Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0", "Firefox · Linux"],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      "Chrome · macOS",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0",
      "Edge · Windows",
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Safari · iOS",
    ],
    ["Steward/1.0 (Android 14)", "Mobile app · Android"],
  ])("reads %s", (agent, expected) => {
    expect(browserOf(agent)).toBe(expected);
  });

  it("falls back to the raw agent when it knows neither part", () => {
    expect(browserOf("curl/8.4")).toBe("curl/8.4");
    expect(browserOf("")).toBe("");
  });
});
