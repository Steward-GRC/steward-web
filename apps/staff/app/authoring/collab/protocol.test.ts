// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { decodeServerMessage, encodeJoin, encodeUpdate } from "./protocol";

describe("encodeJoin / encodeUpdate", () => {
  it("round-trips a presence message's own shape through decodeServerMessage's expectations", () => {
    expect(JSON.parse(encodeJoin("tok-1"))).toEqual({ token: "tok-1", type: "join" });
  });

  it("encodes an update message", () => {
    expect(JSON.parse(encodeUpdate("purpose", "hello"))).toEqual({
      sectionKey: "purpose",
      text: "hello",
      type: "update",
    });
  });
});

describe("decodeServerMessage", () => {
  it("decodes a presence message", () => {
    expect(decodeServerMessage(JSON.stringify({ count: 3, type: "presence" }))).toEqual({
      count: 3,
      type: "presence",
    });
  });

  it("decodes an update message", () => {
    expect(
      decodeServerMessage(JSON.stringify({ sectionKey: "scope", text: "hi", type: "update" })),
    ).toEqual({ sectionKey: "scope", text: "hi", type: "update" });
  });

  it("answers null for malformed JSON", () => {
    expect(decodeServerMessage("{not json")).toBeNull();
  });

  it("answers null for a well-formed but unrecognized frame", () => {
    expect(decodeServerMessage(JSON.stringify({ type: "something-else" }))).toBeNull();
    expect(decodeServerMessage(JSON.stringify({ type: "presence" }))).toBeNull();
    expect(decodeServerMessage(JSON.stringify({ sectionKey: "x", type: "update" }))).toBeNull();
    expect(decodeServerMessage("null")).toBeNull();
    expect(decodeServerMessage('"a string"')).toBeNull();
  });
});
