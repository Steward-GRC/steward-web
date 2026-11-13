// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DraftFraming } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { CUSTOM_FRAMING_MAX, framingOf, framingProblem, wordingLength } from "./framing";

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

describe("wordingLength", () => {
  it("counts characters, not UTF-16 units, after trimming", () => {
    expect(wordingLength("  hello  ")).toBe(5);
    expect(wordingLength("\u{1F600}".repeat(3))).toBe(3);
  });
});

describe("framingProblem", () => {
  it("has none for a framing that needs no wording, whatever the wording says", () => {
    expect(framingProblem("", "")).toBeNull();
    expect(framingProblem(DraftFraming.Plain, "x".repeat(900))).toBeNull();
    expect(framingProblem(DraftFraming.Formal, "")).toBeNull();
  });

  it("needs wording for Custom, and blank wording does not count", () => {
    expect(framingProblem(DraftFraming.Custom, "")).toBe("missing");
    expect(framingProblem(DraftFraming.Custom, " \n ")).toBe("missing");
    expect(framingProblem(DraftFraming.Custom, "Warm and direct")).toBeNull();
  });

  it("allows exactly the limit and refuses one over, counted in characters", () => {
    expect(framingProblem(DraftFraming.Custom, "a".repeat(CUSTOM_FRAMING_MAX))).toBeNull();
    expect(framingProblem(DraftFraming.Custom, "a".repeat(CUSTOM_FRAMING_MAX + 1))).toBe("tooLong");
    expect(framingProblem(DraftFraming.Custom, "\u{1F600}".repeat(CUSTOM_FRAMING_MAX))).toBeNull();
    expect(framingProblem(DraftFraming.Custom, "é".repeat(CUSTOM_FRAMING_MAX))).toBeNull();
  });

  it("refuses a framing the gateway does not know", () => {
    expect(framingProblem("SHOUTING", "")).toBe("unknown");
  });
});

describe("framingOf", () => {
  it("sends nothing when no framing is chosen", () => {
    expect(framingOf(form({}))).toEqual({});
    expect(framingOf(form({ customFraming: "stray", framing: "" }))).toEqual({});
  });

  it("sends a framing without wording unless it is Custom", () => {
    expect(framingOf(form({ customFraming: "stray", framing: "PLAIN" }))).toEqual({
      framing: DraftFraming.Plain,
    });
  });

  it("sends Custom with its wording trimmed", () => {
    expect(framingOf(form({ customFraming: "  Warm and direct \n", framing: "CUSTOM" }))).toEqual({
      customFraming: "Warm and direct",
      framing: DraftFraming.Custom,
    });
  });

  it("reports the problem instead of a framing it cannot send", () => {
    expect(framingOf(form({ customFraming: " ", framing: "CUSTOM" }))).toEqual({
      problem: "missing",
    });
    expect(framingOf(form({ customFraming: "a".repeat(501), framing: "CUSTOM" }))).toEqual({
      problem: "tooLong",
    });
    expect(framingOf(form({ framing: "SHOUTING" }))).toEqual({ problem: "unknown" });
  });
});
