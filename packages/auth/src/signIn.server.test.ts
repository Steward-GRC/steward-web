// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Sign-in end to end on the server: the route's own action and loaders against a gateway that
// keeps steward-gateway's session contract (see fakeGateway.testing.ts), then a protected
// loader with the cookie the browser was given.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FAKE_CODE, type FakeGateway, startFakeGateway } from "./fakeGateway.testing";
import { requireIdentityFromRequest } from "./guards.server";
import { safeNext, signInAction, signInLoader, signOutAction } from "./signIn.server";

const ORIGIN = "https://steward.example";
let gateway: FakeGateway;
let previousGatewayUrl: string | undefined;

beforeAll(async () => {
  gateway = await startFakeGateway([
    { password: "right-password", userId: "u-plain", username: "plain.sample" },
    { mfa: "challenge", password: "right-password", userId: "u-mfa", username: "mfa.sample" },
    { mfa: "enrol", password: "right-password", userId: "u-new", username: "new.sample" },
  ]);
  previousGatewayUrl = process.env.GATEWAY_URL;
  process.env.GATEWAY_URL = gateway.queryUrl;
});

afterAll(async () => {
  process.env.GATEWAY_URL = previousGatewayUrl;
  await gateway.close();
});

const post = (fields: Record<string, string>, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}/sign-in?next=%2Fpolicies`, {
    body: new URLSearchParams(fields),
    headers,
    method: "POST",
  });

/** The browser's next `Cookie` header, from the `Set-Cookie` the action answered with. */
const cookieFrom = (response: Response): string =>
  response.headers
    .getSetCookie()
    .map((c) => c.split(";", 1)[0])
    .join("; ");

const page = (cookie: string, path = "/policies") =>
  new Request(`${ORIGIN}${path}`, { headers: { cookie } });

/** A protected loader's guard: resolves with the identity, or throws a redirect Response. */
const reach = async (cookie: string) => {
  try {
    return { identity: await requireIdentityFromRequest(page(cookie)) };
  } catch (error) {
    if (error instanceof Response) return { redirect: error.headers.get("location") };
    throw error;
  }
};

const isResponse = (value: unknown): value is Response => value instanceof Response;

/** The state a `data()` answer carries. */
const stateOf = (value: unknown) => (value as { data: Record<string, unknown> }).data;

describe("password sign-in through the gateway session", () => {
  it("relays the gateway's session cookie and reaches a protected page with it", async () => {
    const response = await signInAction(
      post({ identifier: "plain.sample", intent: "login", password: "right-password" }),
    );

    expect(isResponse(response)).toBe(true);
    const answer = response as Response;
    expect(answer.status).toBe(303);
    expect(answer.headers.get("location")).toBe("/policies");
    const cookie = cookieFrom(answer);
    expect(cookie).toMatch(/^steward_sid=/);

    const result = await reach(cookie);
    expect(result).toMatchObject({ identity: { id: "u-plain", username: "plain.sample" } });

    const query = gateway.requests.findLast((r) => r.path === "/query");
    const sid = cookie.replace("steward_sid=", "");
    expect(query?.headers["x-csrf-token"]).toBe(gateway.sessions.get(sid)?.csrf);
  });

  it("sends a signed-in visitor at the sign-in page straight on", async () => {
    const signed = (await signInAction(
      post({ identifier: "plain.sample", intent: "login", password: "right-password" }),
    )) as Response;

    await expect(
      signInLoader(
        new Request(`${ORIGIN}/sign-in?next=%2Fdrafts`, {
          headers: { cookie: cookieFrom(signed) },
        }),
      ),
    ).rejects.toMatchObject({ status: 302 });
  });

  it("keeps the visitor on the password step for a wrong password, with no cookie", async () => {
    const result = await signInAction(
      post({ identifier: "plain.sample", intent: "login", password: "wrong" }),
    );

    expect(isResponse(result)).toBe(false);
    expect(stateOf(result)).toEqual({
      identifier: "plain.sample",
      problem: "invalid",
      view: "password",
    });
  });

  it("asks for both fields before calling the gateway", async () => {
    const before = gateway.requests.length;
    const result = await signInAction(post({ identifier: "plain.sample", intent: "login" }));
    expect(stateOf(result)).toMatchObject({ problem: "missing", view: "password" });
    expect(gateway.requests.length).toBe(before);
  });

  it("forwards the public edge marker so the gateway's second-factor rule sees it", async () => {
    await signInAction(
      post(
        { identifier: "plain.sample", intent: "login", password: "right-password" },
        { "x-steward-edge": "public" },
      ),
    );
    const login = gateway.requests.findLast((r) => r.path === "/auth/login");
    expect(login?.headers["x-steward-edge"]).toBe("public");
  });

  it("refuses a page with no session, sending it to sign-in", async () => {
    expect(await reach("steward_sid=not-a-session")).toEqual({
      redirect: "/sign-in?next=https%3A%2F%2Fsteward.example%2Fpolicies",
    });
  });
});

describe("second factor", () => {
  it("asks for the code, refuses a wrong one, then opens the session", async () => {
    const challenge = await signInAction(
      post({ identifier: "mfa.sample", intent: "login", password: "right-password" }),
    );
    const state = stateOf(challenge);
    expect(state).toMatchObject({ factor: "totp", factors: ["totp", "email"], view: "code" });
    const pendingId = String(state.pendingId);

    const carried = { factor: "totp", factors: "totp,email", next: "/policies", pendingId };
    const wrong = await signInAction(post({ ...carried, code: "000000", intent: "verify" }));
    expect(stateOf(wrong)).toMatchObject({ problem: "wrong", view: "code" });

    const sent = await signInAction(post({ ...carried, intent: "email" }));
    expect(stateOf(sent)).toMatchObject({ emailSent: "sent", factor: "email", view: "code" });

    const opened = (await signInAction(
      post({ ...carried, code: FAKE_CODE, intent: "verify" }),
    )) as Response;
    expect(opened.status).toBe(303);
    expect(await reach(cookieFrom(opened))).toMatchObject({ identity: { id: "u-mfa" } });
  });

  it("starts over when the parked sign-in has expired", async () => {
    const result = await signInAction(
      post({ code: FAKE_CODE, factor: "totp", intent: "verify", pendingId: "gone" }),
    );
    expect(stateOf(result)).toEqual({ problem: "expired", view: "password" });
  });

  it("enrols an authenticator on a first sign-in, then opens the session", async () => {
    const enrol = stateOf(
      await signInAction(
        post({ identifier: "new.sample", intent: "login", password: "right-password" }),
      ),
    );
    expect(enrol).toMatchObject({
      otpauthUri: "otpauth://totp/Steward:sample",
      secret: "ABCD****",
      view: "enrol",
    });

    const opened = (await signInAction(
      post({
        code: FAKE_CODE,
        intent: "enrol",
        otpauthUri: String(enrol.otpauthUri),
        pendingId: String(enrol.pendingId),
        secret: String(enrol.secret),
      }),
    )) as Response;
    expect(opened.status).toBe(303);
    expect(await reach(cookieFrom(opened))).toMatchObject({ identity: { id: "u-new" } });
  });
});

describe("sign-out", () => {
  it("ends the session at the gateway and clears the cookie", async () => {
    const signed = (await signInAction(
      post({ identifier: "plain.sample", intent: "login", password: "right-password" }),
    )) as Response;
    const cookie = cookieFrom(signed);

    const out = await signOutAction(
      new Request(`${ORIGIN}/sign-out`, { headers: { cookie }, method: "POST" }),
    );

    expect(out.status).toBe(302);
    expect(out.headers.get("location")).toBe("/sign-in");
    expect(out.headers.getSetCookie().join(",")).toMatch(/steward_sid=;.*Max-Age=0/);
    expect(await reach(cookie)).toMatchObject({ redirect: expect.stringMatching(/^\/sign-in/) });
  });
});

describe("safeNext", () => {
  it("keeps an in-app path and refuses anything that could leave the app", () => {
    expect(safeNext("/policies")).toBe("/policies");
    expect(safeNext("//elsewhere.example")).toBe("/");
    expect(safeNext("https://elsewhere.example")).toBe("/");
    expect(safeNext(null)).toBe("/");
  });
});
