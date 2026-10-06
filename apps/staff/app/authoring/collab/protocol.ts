// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Wire codec for steward-collab's y-websocket extension frames.
//
// The gateway's collab proxy (steward-gateway's internal/collabws) relays the standard
// y-websocket envelope — `[messageType varUint] [payload ...]` — for message types 0-3, which
// `y-websocket`'s WebsocketProvider already handles. Two message types are steward-collab's
// own, and this module is the only place on the web side that knows their bytes. They mirror,
// field for field, the encoders in steward-collab's internal/ws protocol; if that changes,
// change this.
//
// MSG_SNAPSHOT — client to server, and the ONLY path by which live edits reach durable
// storage. The relay runs no Y.Doc of its own and never persists the update stream, so a room
// that never sends a snapshot loses every edit:
//
//   [varUint 100]
//   [varUint8Array contentJSON]   // the draft's sections JSON, UTF-8
//   [varUint8Array yjsState]      // Y.encodeStateAsUpdate(doc), may be empty
//
// contentJSON is authoritative: steward-collab forwards it to steward-core's
// UpdateDraftContent, which validates and persists it as the draft's ContentJSON — the same
// string `saveDraft` writes. yjsState is stored verbatim for room rehydration and never
// decoded server-side.
//
// MSG_CONTROL — server to client, things the editor cannot observe from the document stream
// alone (a snapshot core refused, the draft being published):
//
//   [varUint 101]
//   [varUint8Array controlJSON]   // JSON-encoded ControlMessage
//
// Both use lib0's varUint8Array framing (a varUint byte-length prefix then the bytes), which
// is what the Go side reads with decodeVarUint8Array.
import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";

/** Collab extension message types. y-websocket allocates 0-3; 100+ is steward-collab's own. */
export const MSG_SNAPSHOT = 100;
export const MSG_CONTROL = 101;

/**
 * `ControlMessage.type` values, matching steward-collab's Go constants of the same name.
 * `snapshot.accepted` is an ack (core persisted the checkpoint); `snapshot.rejected` means the
 * edits are NOT durable and the author must be told; `draft.published` means the draft is now
 * an immutable version and the editor must drop to read-only.
 */
export const CONTROL_SNAPSHOT_ACCEPTED = "snapshot.accepted";
export const CONTROL_SNAPSHOT_REJECTED = "snapshot.rejected";
export const CONTROL_DRAFT_PUBLISHED = "draft.published";

/**
 * Stable machine tokens for `ControlMessage.reason` on a rejected snapshot. `pre_check_failed`
 * — the relay's own shape check refused it; `grpc_error` — core was unreachable;
 * `server_rejected` — core validated and said no (e.g. a required section is missing), and
 * `detail` carries its message.
 */
export const REJECT_PRE_CHECK_FAILED = "pre_check_failed";
export const REJECT_GRPC_ERROR = "grpc_error";
export const REJECT_SERVER_REJECTED = "server_rejected";

/**
 * The JSON payload of a MSG_CONTROL frame. Snake-case keys because these are steward-collab's
 * Go struct's JSON tags — do not camel-case them.
 */
export interface ControlMessage {
  detail?: string;
  draft_id?: string;
  reason?: string;
  type: string;
  version_number?: number;
}

/**
 * Build a MSG_SNAPSHOT frame. `yjsState` is the compacted whole-document state
 * (`Y.encodeStateAsUpdate(doc)`); pass an empty array to send only the JSON, which the server
 * reads as "keep the Yjs state you already have".
 */
export const encodeSnapshot = (contentJSON: string, yjsState: Uint8Array): Uint8Array => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MSG_SNAPSHOT);
  encoding.writeVarUint8Array(encoder, new TextEncoder().encode(contentJSON));
  encoding.writeVarUint8Array(encoder, yjsState);
  return encoding.toUint8Array(encoder);
};

/**
 * Parse the PAYLOAD of a MSG_CONTROL frame — i.e. the bytes after the message type, which is
 * what y-websocket's message handlers receive (the type varUint is already consumed off the
 * decoder).
 *
 * Returns undefined rather than throwing on a malformed frame: a control notification is
 * advisory, and a decode failure must never take down a live editing session.
 */
export const decodeControlPayload = (decoder: decoding.Decoder): ControlMessage | undefined => {
  try {
    const body = decoding.readVarUint8Array(decoder);
    const parsed: unknown = JSON.parse(new TextDecoder().decode(body));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as { type?: unknown }).type !== "string"
    ) {
      return undefined;
    }
    return parsed as ControlMessage;
  } catch {
    return undefined;
  }
};

/**
 * Parse a WHOLE MSG_CONTROL frame (type byte included). Used by tests; the provider hook uses
 * `decodeControlPayload` because y-websocket hands handlers a decoder already positioned past
 * the message type.
 */
export const decodeControlFrame = (frame: Uint8Array): ControlMessage | undefined => {
  try {
    const decoder = decoding.createDecoder(frame);
    if (decoding.readVarUint(decoder) !== MSG_CONTROL) return undefined;
    return decodeControlPayload(decoder);
  } catch {
    return undefined;
  }
};

/**
 * Parse a whole MSG_SNAPSHOT frame back into its two fields. The client never receives one of
 * these (MSG_SNAPSHOT is client to server), so this exists purely so tests can assert what we
 * put on the wire.
 */
export const decodeSnapshotFrame = (
  frame: Uint8Array,
): { contentJSON: string; yjsState: Uint8Array } | undefined => {
  try {
    const decoder = decoding.createDecoder(frame);
    if (decoding.readVarUint(decoder) !== MSG_SNAPSHOT) return undefined;
    const contentJSON = new TextDecoder().decode(decoding.readVarUint8Array(decoder));
    const yjsState = decoding.readVarUint8Array(decoder);
    return { contentJSON, yjsState };
  } catch {
    return undefined;
  }
};

/** True when a control message means the draft is now immutable. */
export const isPublishedControl = (message: ControlMessage): boolean =>
  message.type === CONTROL_DRAFT_PUBLISHED;

/**
 * Human-readable text for a rejected snapshot. `detail` is core's own message (the useful
 * part — e.g. which required section is missing), so prefer it and fall back to the machine
 * reason only when core sent nothing.
 */
export const describeRejection = (message: ControlMessage): string => {
  if (message.detail && message.detail.trim() !== "") return message.detail;
  switch (message.reason) {
    case REJECT_GRPC_ERROR: {
      return "The policy service could not be reached.";
    }
    case REJECT_PRE_CHECK_FAILED: {
      return "The document failed a validation check before saving.";
    }
    case REJECT_SERVER_REJECTED: {
      return "The policy service rejected the document.";
    }
    default: {
      return "The document could not be saved.";
    }
  }
};
