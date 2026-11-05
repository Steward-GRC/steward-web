// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The server half of live access (#7): a server-sent-events stream that tells the browser
// when the signed-in person's groups, roles or overrides change, so the shell reloads the
// identity without a new sign-in. It relays the gateway's `liveEvents` subscription, which
// carries every audit event, and passes on only the person's own.
import type { LiveEvent } from "@steward-web/api-client";

import edge from "@steward-web/edge.server";

/**
 * The audit actions that can change what someone may see or do. `user.permissions_changed`
 * is the one event steward-mock-server publishes for any change to a person's roles, groups,
 * password or disabled state.
 */
export const ACCESS_TOPICS: readonly string[] = [
  "group.member_",
  "group.deleted",
  "group.reparented",
  "role.",
  "user.policy_override",
  "user.category_rules",
  "user.accounts_merged",
  "user.permissions_changed",
];

// Deleting or moving a group changes the scope of everyone in it, and the event names the
// group, not its members, so it counts for anyone.
const GROUP_WIDE = new Set(["group.deleted", "group.reparented"]);

/** Whether `event` changes the access of the person signed in as `userId`. */
export const isOwnAccessChange = (
  event: Pick<LiveEvent, "entityId" | "type">,
  userId: string,
): boolean => {
  if (!ACCESS_TOPICS.some((topic) => event.type.startsWith(topic))) return false;
  if (GROUP_WIDE.has(event.type)) return true;
  return event.entityId === `user:${userId}`;
};

type Watch = typeof edge.liveEvents;

// Codes that won't change by trying again: the browser stops, and the focus refresh is all
// it has. Anything else (a dropped socket, the gateway restarting) reconnects later.
const FINAL_CODES = new Set(["PERMISSION_DENIED", "UNAUTHENTICATED"]);
const RECONNECT_MS = 30_000;

const encoder = new TextEncoder();
const codeOf = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "code" in error
    ? (error as { code?: string }).code
    : undefined;

/**
 * The `resources/live-access` stream for the person signed in as `userId`: one
 * `access-changed` message per change to their access, `event: unsupported` when the gateway
 * won't stream to them, and a reconnect hint when the stream drops.
 */
export const liveAccessResponse = (
  request: Request,
  userId: string,
  watch: Watch = edge.liveEvents,
): Response => {
  const abort = new AbortController();
  request.signal.addEventListener("abort", () => abort.abort(), { once: true });

  const stream = new ReadableStream<Uint8Array>({
    cancel() {
      abort.abort();
    },
    async start(controller) {
      const send = (text: string) => {
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // The browser already went away.
        }
      };
      const end = (text: string) => {
        send(text);
        try {
          controller.close();
        } catch {
          // Already closed.
        }
      };

      if (!userId) {
        end("event: unsupported\ndata: signed-out\n\n");
        return;
      }
      try {
        await watch(
          ACCESS_TOPICS,
          request.headers.get("cookie") ?? undefined,
          (event) => {
            if (isOwnAccessChange(event, userId)) send("data: access-changed\n\n");
          },
          abort.signal,
        );
        if (abort.signal.aborted) return;
        end(`retry: ${RECONNECT_MS}\n\n`);
      } catch (error) {
        end(
          FINAL_CODES.has(codeOf(error) ?? "")
            ? "event: unsupported\ndata: refused\n\n"
            : `retry: ${RECONNECT_MS}\n\n`,
        );
      }
    },
  });

  return new Response(stream, {
    headers: { "cache-control": "no-cache", "content-type": "text/event-stream" },
  });
};
