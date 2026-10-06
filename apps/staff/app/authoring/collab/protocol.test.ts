// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Wire-compatibility tests for steward-collab's extension frames.
//
// These are GOLDEN-BYTE tests. The hex strings below were produced by the server's own
// encoders — steward-collab's internal/ws `EncodeSnapshot` and `EncodeControl` — so they prove
// this encoder puts exactly the bytes on the wire that the Go decoder reads back, rather than
// merely round-tripping against itself. If the Go side changes its framing, these fail, which
// is the point: the frame layout is a cross-repo contract held together by nothing but these
// two implementations agreeing.
//
// Pure logic, no DOM and no React, so it runs in vitest's node environment.
//
// The 200-byte NUL payload below is written with a unicode escape rather than a raw NUL byte or
// a hex escape (eslint's unicorn/no-hex-escape rejects the hex form, and a raw NUL byte can make
// some tools classify the file as binary).
import { describe, expect, it } from "vitest";

import {
  CONTROL_DRAFT_PUBLISHED,
  CONTROL_SNAPSHOT_ACCEPTED,
  CONTROL_SNAPSHOT_REJECTED,
  decodeControlFrame,
  decodeSnapshotFrame,
  describeRejection,
  encodeSnapshot,
  isPublishedControl,
  MSG_CONTROL,
  MSG_SNAPSHOT,
  REJECT_GRPC_ERROR,
  REJECT_PRE_CHECK_FAILED,
  REJECT_SERVER_REJECTED,
} from "./protocol";

const hex = (bytes: Uint8Array): string =>
  [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

const bytesOf = (hexString: string): Uint8Array =>
  new Uint8Array((hexString.match(/../g) ?? []).map((pair) => Number.parseInt(pair, 16)));

describe("protocol", () => {
  it("has message type bytes matching the Go constants", () => {
    // steward-collab's internal/ws protocol.go: MsgSnapshot = 100, MsgControl = 101.
    expect(MSG_SNAPSHOT).toBe(100);
    expect(MSG_CONTROL).toBe(101);
  });

  it("encodeSnapshot is byte-identical to the Go EncodeSnapshot", () => {
    // Golden bytes from `EncodeSnapshot(content, state)` in Go. Each case pins a different
    // property of the framing.
    const cases: { content: string; golden: string; name: string; state: number[] }[] = [
      {
        // The ordinary case: a document JSON blob plus the canonical empty-document Yjs
        // update (0x00 0x00).
        content: '{"root":{"children":[],"type":"root","version":1}}',
        golden:
          "64327b22726f6f74223a7b226368696c6472656e223a5b5d2c2274797065223a22726f6f74222c2276657273696f6e223a317d7d020000",
        name: "typical",
        state: [0x00, 0x00],
      },
      {
        // An EMPTY yjs state must still be written as a zero-length varUint8Array (a single
        // 0x00), not omitted — the Go decoder reads the second field when any bytes remain.
        content: '{"root":{}}',
        golden: "640b7b22726f6f74223a7b7d7d00",
        name: "empty yjs state",
        state: [],
      },
      {
        // The length prefix counts UTF-8 BYTES, not JS characters. "café — 日" is 8 code
        // points but 13 bytes; a charCode-based encoder would emit the wrong prefix and the
        // server would reject the frame.
        content: '{"t":"café — 日"}',
        golden: "64157b2274223a22636166c3a920e2809420e697a5227d03010203",
        name: "multi-byte utf-8",
        state: [0x01, 0x02, 0x03],
      },
    ];

    for (const c of cases) {
      const frame = encodeSnapshot(c.content, new Uint8Array(c.state));
      expect(hex(frame), `frame bytes for ${c.name}`).toBe(c.golden);
    }
  });

  it("writes a multi-byte varUint length past 127", () => {
    // A 200-byte payload needs a two-byte LEB128 prefix (0xc8 0x01). This is the case a naive
    // single-byte length prefix gets wrong, and every real policy document is far past it.
    const content = "\u0000".repeat(200);
    const frame = encodeSnapshot(content, new Uint8Array([255]));
    const golden = `64c801${"00".repeat(200)}01ff`;
    expect(hex(frame)).toBe(golden);
  });

  it("round-trips a snapshot frame through the same length rules", () => {
    const content = '{"root":{"type":"root","children":[{"type":"paragraph"}]}}';
    const state = new Uint8Array([1, 2, 3, 250, 255]);
    const parsed = decodeSnapshotFrame(encodeSnapshot(content, state));
    expect(parsed).toBeDefined();
    expect(parsed?.contentJSON).toBe(content);
    expect([...(parsed?.yjsState ?? [])]).toEqual([...state]);
  });

  it("decodeControlFrame parses the Go EncodeControl output", () => {
    // Golden bytes from `EncodeControl(ControlMessage{...})` in Go. Note the snake_case
    // keys — they are the Go struct's JSON tags.
    const accepted = decodeControlFrame(
      bytesOf(
        "652c7b2274797065223a22736e617073686f742e6163636570746564222c2264726166745f6964223a226431227d",
      ),
    );
    expect(accepted).toEqual({ draft_id: "d1", type: CONTROL_SNAPSHOT_ACCEPTED });

    const rejected = decodeControlFrame(
      bytesOf(
        "65747b2274797065223a22736e617073686f742e72656a6563746564222c2264726166745f6964223a226431222c22726561736f6e223a227365727665725f72656a6563746564222c2264657461696c223a226d697373696e672072657175697265642073656374696f6e3a20507572706f7365227d",
      ),
    );
    expect(rejected?.type).toBe(CONTROL_SNAPSHOT_REJECTED);
    expect(rejected?.reason).toBe(REJECT_SERVER_REJECTED);
    expect(rejected?.detail).toBe("missing required section: Purpose");

    const published = decodeControlFrame(
      bytesOf(
        "653d7b2274797065223a2264726166742e7075626c6973686564222c2264726166745f6964223a226431222c2276657273696f6e5f6e756d626572223a377d",
      ),
    );
    expect(published?.type).toBe(CONTROL_DRAFT_PUBLISHED);
    expect(published?.version_number).toBe(7);
    expect(published && isPublishedControl(published)).toBe(true);
  });

  it("has control type strings matching the Go constants", () => {
    expect(CONTROL_SNAPSHOT_ACCEPTED).toBe("snapshot.accepted");
    expect(CONTROL_SNAPSHOT_REJECTED).toBe("snapshot.rejected");
    expect(CONTROL_DRAFT_PUBLISHED).toBe("draft.published");
    expect(REJECT_PRE_CHECK_FAILED).toBe("pre_check_failed");
    expect(REJECT_GRPC_ERROR).toBe("grpc_error");
    expect(REJECT_SERVER_REJECTED).toBe("server_rejected");
  });

  it("decodes a malformed control frame to undefined, never throws", () => {
    // Advisory notifications must not be able to take down a live session.
    expect(decodeControlFrame(new Uint8Array([]))).toBeUndefined();
    // Right type byte, truncated length prefix.
    expect(decodeControlFrame(new Uint8Array([MSG_CONTROL]))).toBeUndefined();
    // Length prefix claims more bytes than are present.
    expect(decodeControlFrame(new Uint8Array([MSG_CONTROL, 40, 123 /* '{' */]))).toBeUndefined();
    // Valid framing, but the body is not JSON.
    expect(
      decodeControlFrame(new Uint8Array([MSG_CONTROL, 2, 123, 123 /* '{{' */])),
    ).toBeUndefined();
    // Valid JSON, but no `type` — not a control message.
    const noType = new TextEncoder().encode('{"draft_id":"d1"}');
    expect(
      decodeControlFrame(new Uint8Array([MSG_CONTROL, noType.byteLength, ...noType])),
    ).toBeUndefined();
    // Wrong message type byte entirely.
    expect(decodeControlFrame(new Uint8Array([MSG_SNAPSHOT, 0]))).toBeUndefined();
  });

  it("prefers core's detail over the machine reason in describeRejection", () => {
    // `detail` carries the useful part — which required section is missing — while `reason`
    // cannot even distinguish invalid content from core being down (both arrive as
    // grpc_error).
    expect(
      describeRejection({
        detail: "content validation: boilerplate edited",
        reason: REJECT_GRPC_ERROR,
        type: CONTROL_SNAPSHOT_REJECTED,
      }),
    ).toBe("content validation: boilerplate edited");
    // Blank detail falls back to the reason's prose.
    expect(
      describeRejection({
        detail: " ".repeat(3),
        reason: REJECT_PRE_CHECK_FAILED,
        type: CONTROL_SNAPSHOT_REJECTED,
      }),
    ).toBe("The document failed a validation check before saving.");
    // An unknown reason still produces something an author can read.
    expect(describeRejection({ reason: "future_reason", type: "snapshot.rejected" })).toBe(
      "The document could not be saved.",
    );
  });

  it("fires isPublishedControl only for draft.published", () => {
    expect(isPublishedControl({ type: CONTROL_DRAFT_PUBLISHED })).toBe(true);
    expect(isPublishedControl({ type: CONTROL_SNAPSHOT_ACCEPTED })).toBe(false);
    expect(isPublishedControl({ type: CONTROL_SNAPSHOT_REJECTED })).toBe(false);
  });
});
