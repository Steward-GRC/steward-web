// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  csrfTokenFor,
  forgetCsrfToken,
  gatewayOrigin,
  readCookie,
  rememberCsrfToken,
  sessionHeaders,
  sessionIdFromSetCookie,
} from "./gatewaySession";

const QUERY = "https://gateway.example/query";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gatewayOrigin", () => {
  it("strips the /query suffix", () => {
    expect(gatewayOrigin(QUERY)).toBe("https://gateway.example");
  });
});

describe("readCookie", () => {
  it("finds one cookie among several", () => {
    expect(readCookie("a=1; steward_sid=xyz; b=2", "steward_sid")).toBe("xyz");
    expect(readCookie("a=1", "steward_sid")).toBeUndefined();
    expect(readCookie(undefined, "steward_sid")).toBeUndefined();
  });
});

describe("csrfTokenFor", () => {
  it("asks GET /auth/session with only the session cookie and reuses the answer", async () => {
    const fetchSpy = vi
      .fn()
      .mockResolvedValue(Response.json({ authenticated: true, csrfToken: "csrf-a" }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await csrfTokenFor("other=1; steward_sid=sid-a", QUERY)).toBe("csrf-a");
    expect(await csrfTokenFor("steward_sid=sid-a", QUERY)).toBe("csrf-a");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://gateway.example/auth/session");
    expect((init.headers as Record<string, string>).cookie).toBe("steward_sid=sid-a");
  });

  it("answers undefined, and asks again next time, when the session is not live", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json({ authenticated: false }));
    vi.stubGlobal("fetch", fetchSpy);

    expect(await csrfTokenFor("steward_sid=sid-b", QUERY)).toBeUndefined();
    expect(await csrfTokenFor("steward_sid=sid-b", QUERY)).toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("makes no call for a request with no session cookie", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    expect(await csrfTokenFor("other=1", QUERY)).toBeUndefined();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("uses a remembered token with no call, until it is forgotten", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(Response.json({ authenticated: false }));
    vi.stubGlobal("fetch", fetchSpy);

    rememberCsrfToken("sid-c", "csrf-c");
    expect(await csrfTokenFor("steward_sid=sid-c", QUERY)).toBe("csrf-c");
    expect(fetchSpy).not.toHaveBeenCalled();

    forgetCsrfToken("steward_sid=sid-c");
    expect(await csrfTokenFor("steward_sid=sid-c", QUERY)).toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});

describe("sessionHeaders", () => {
  it("adds the token beside the forwarded cookie", async () => {
    rememberCsrfToken("sid-d", "csrf-d");
    expect(await sessionHeaders("steward_sid=sid-d", QUERY)).toEqual({
      cookie: "steward_sid=sid-d",
      "x-csrf-token": "csrf-d",
    });
  });

  it("is empty with no cookie", async () => {
    expect(await sessionHeaders(undefined, QUERY)).toEqual({});
  });
});

describe("sessionIdFromSetCookie", () => {
  it("reads the session a sign-in set", () => {
    expect(
      sessionIdFromSetCookie(["steward_sid=new-id; Path=/; Max-Age=28800; HttpOnly; SameSite=Lax"]),
    ).toBe("new-id");
  });

  it("ignores a cleared session and other cookies", () => {
    expect(sessionIdFromSetCookie(["steward_sid=; Path=/; Max-Age=0; HttpOnly"])).toBeUndefined();
    expect(sessionIdFromSetCookie(["other=1; Path=/"])).toBeUndefined();
  });
});
