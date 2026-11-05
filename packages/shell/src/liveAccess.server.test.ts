// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { LiveEvent } from "@steward-web/api-client";

import { GatewayError } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { ACCESS_TOPICS, isOwnAccessChange, liveAccessResponse } from "./liveAccess.server";

const ME = "u-1";
const event = (type: string, entityId: null | string): LiveEvent => ({
  at: "2026-11-05T10:00:00Z",
  entityId,
  type,
});

type Watch = NonNullable<Parameters<typeof liveAccessResponse>[2]>;

/** A stand-in for the gateway subscription: delivers `events`, then ends as `end` says. */
const fakeWatch =
  (events: LiveEvent[], end: "abort" | "complete" | Error = "abort"): Watch =>
  (_topics, _cookie, onEvent, signal) =>
    new Promise<void>((resolve, reject) => {
      for (const delivered of events) onEvent(delivered);
      if (end === "complete") resolve();
      else if (end === "abort") signal.addEventListener("abort", () => resolve(), { once: true });
      else reject(end);
    });

const readAll = async (response: Response): Promise<string> => await response.text();

const readFirst = async (response: Response): Promise<string> => {
  const reader = response.body!.getReader();
  const { value } = await reader.read();
  await reader.cancel();
  return new TextDecoder().decode(value);
};

const request = () => new Request("https://staff.example/resources/live-access");

describe("isOwnAccessChange", () => {
  it("is true for a change to the signed-in person's groups, roles or overrides", () => {
    expect(isOwnAccessChange(event("group.member_added", `user:${ME}`), ME)).toBe(true);
    expect(isOwnAccessChange(event("group.member_removed", `user:${ME}`), ME)).toBe(true);
    expect(isOwnAccessChange(event("role.granted", `user:${ME}`), ME)).toBe(true);
    expect(isOwnAccessChange(event("role.revoked", `user:${ME}`), ME)).toBe(true);
    expect(isOwnAccessChange(event("user.policy_override_set", `user:${ME}`), ME)).toBe(true);
    expect(isOwnAccessChange(event("user.permissions_changed", `user:${ME}`), ME)).toBe(true);
  });

  it("is false for someone else's change", () => {
    expect(isOwnAccessChange(event("group.member_added", "user:u-2"), ME)).toBe(false);
    expect(isOwnAccessChange(event("role.granted", "user:u-2"), ME)).toBe(false);
    expect(isOwnAccessChange(event("user.permissions_changed", "user:u-2"), ME)).toBe(false);
  });

  it("is true for a group being deleted or moved, which can change anyone's scope", () => {
    expect(isOwnAccessChange(event("group.deleted", "group:g-1"), ME)).toBe(true);
    expect(isOwnAccessChange(event("group.reparented", "group:g-1"), ME)).toBe(true);
    expect(isOwnAccessChange(event("group.renamed", "group:g-1"), ME)).toBe(false);
  });

  it("asks the gateway only for the topics it acts on", () => {
    for (const type of [
      "group.member_added",
      "role.revoked",
      "group.deleted",
      "user.permissions_changed",
    ]) {
      expect(ACCESS_TOPICS.some((topic) => type.startsWith(topic))).toBe(true);
    }
    expect(ACCESS_TOPICS.some((topic) => "policy.published".startsWith(topic))).toBe(false);
  });
});

describe("liveAccessResponse", () => {
  it("streams server-sent events that are never cached", () => {
    const response = liveAccessResponse(request(), ME, fakeWatch([]));
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get("cache-control")).toBe("no-cache");
  });

  it("sends a message for the signed-in person's own change and skips others", async () => {
    const response = liveAccessResponse(
      request(),
      ME,
      fakeWatch([event("role.granted", "user:u-2"), event("group.member_added", `user:${ME}`)]),
    );
    expect(await readFirst(response)).toBe("data: access-changed\n\n");
  });

  it("tells the browser to stop when the gateway refuses the subscription", async () => {
    const refused = new GatewayError("LiveEvents", "audit.read required", {
      code: "PERMISSION_DENIED",
    });
    const response = liveAccessResponse(request(), ME, fakeWatch([], refused));
    expect(await readAll(response)).toBe("event: unsupported\ndata: refused\n\n");
  });

  it("tells a signed-out browser to stop without subscribing", async () => {
    let subscribed = false;
    const response = liveAccessResponse(request(), "", (...arguments_) => {
      subscribed = true;
      return fakeWatch([])(...arguments_);
    });
    expect(await readAll(response)).toBe("event: unsupported\ndata: signed-out\n\n");
    expect(subscribed).toBe(false);
  });

  it("asks the browser to reconnect later when the stream drops", async () => {
    const response = liveAccessResponse(request(), ME, fakeWatch([], new Error("socket closed")));
    expect(await readAll(response)).toBe("retry: 30000\n\n");
  });

  it("asks the browser to reconnect later when the gateway ends the stream", async () => {
    const response = liveAccessResponse(request(), ME, fakeWatch([], "complete"));
    expect(await readAll(response)).toBe("retry: 30000\n\n");
  });
});
