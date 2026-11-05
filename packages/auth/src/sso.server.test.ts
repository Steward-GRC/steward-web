// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// SSO sign-in end to end on the server (#54): the G4 hand-off carries the identifier, the
// app's own /auth/sso/* reaches the gateway, and the gateway's return paths land on the right
// gate.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { type FakeGateway, startFakeGateway } from "./fakeGateway.testing";
import { requireIdentityFromRequest } from "./guards.server";
import { signInAction, signInLoader } from "./signIn.server";
import { ssoGatewayProxy } from "./sso.server";

const ORIGIN = "https://steward.example";
let gateway: FakeGateway;
let previousGatewayUrl: string | undefined;

beforeAll(async () => {
  gateway = await startFakeGateway(
    [
      { password: "unused", userId: "u-erin", username: "erin" },
      { mfa: "challenge", password: "unused", userId: "u-alice", username: "alice" },
    ],
    { sso: { erin: "example-oidc" } },
  );
  previousGatewayUrl = process.env.GATEWAY_URL;
  process.env.GATEWAY_URL = gateway.queryUrl;
});

afterAll(async () => {
  process.env.GATEWAY_URL = previousGatewayUrl;
  await gateway.close();
});

const stateOf = (value: unknown) => (value as { data: Record<string, unknown> }).data;

describe("the G4 hand-off", () => {
  it("sends the identifier to the gateway's SSO start along with the connection", async () => {
    const result = (await signInAction(
      new Request(`${ORIGIN}/sign-in`, {
        body: new URLSearchParams({ identifier: "erin", intent: "sso", next: "/" }),
        method: "POST",
      }),
    )) as Response;
    expect(result.headers.get("location")).toBe(
      "/auth/sso/start?connection=example-oidc&identifier=erin",
    );
  });
});

describe("ssoGatewayProxy", () => {
  it("passes the app's own /auth/sso/* through to the gateway, query and cookies included", async () => {
    const response = await ssoGatewayProxy(
      new Request(`${ORIGIN}/auth/sso/start?connection=example-oidc&identifier=erin`, {
        headers: { cookie: "sso_state=abc", "x-steward-edge": "public" },
      }),
      "start",
    );
    const seen = gateway.requests.findLast((r) => r.path === "/auth/sso/start");
    expect(seen?.query).toBe("connection=example-oidc&identifier=erin");
    expect(seen?.headers.cookie).toBe("sso_state=abc");
    expect(seen?.headers["x-steward-edge"]).toBe("public");

    // The gateway sends people to /home; this app's home is "/".
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/");
    const cookie = response.headers.getSetCookie().join("; ");
    expect(cookie).toMatch(/^steward_sid=/);
    const identity = await requireIdentityFromRequest(
      new Request(`${ORIGIN}/`, { headers: { cookie: cookie.split(";", 1)[0] ?? "" } }),
    );
    expect(identity).toMatchObject({ id: "u-erin" });
  });

  it("turns the gateway's second-factor return path into this app's sign-in", async () => {
    const response = await ssoGatewayProxy(
      new Request(`${ORIGIN}/auth/sso/start?connection=example-oidc&identifier=alice`),
      "start",
    );
    expect(response.headers.get("location")).toMatch(
      /^\/sign-in\?pendingMfa=[\w-]+&mfaFactors=totp%2Cemail$/,
    );
  });

  it("brings an SSO sign-in started from the admin console back under /admin", async () => {
    const home = await ssoGatewayProxy(
      new Request(`${ORIGIN}/admin/auth/sso/start?connection=example-oidc&identifier=erin`),
      "start",
      { basename: "/admin" },
    );
    expect(home.headers.get("location")).toBe("/admin/");
    const mfa = await ssoGatewayProxy(
      new Request(`${ORIGIN}/admin/auth/sso/start?connection=example-oidc&identifier=alice`),
      "start",
      { basename: "/admin" },
    );
    expect(mfa.headers.get("location")).toMatch(/^\/admin\/sign-in\?pendingMfa=/);
  });

  it("sends the person back to sign-in with a calm error when the gateway can't be reached", async () => {
    const response = await ssoGatewayProxy(
      new Request(`${ORIGIN}/auth/sso/start?connection=example-oidc`),
      "start",
      { queryUrl: "http://127.0.0.1:9/query" },
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/sign-in?error=sso_unavailable");
  });

  it("only ever reaches the gateway's /auth/sso routes", async () => {
    const response = await ssoGatewayProxy(
      new Request(`${ORIGIN}/auth/sso/../logout`),
      "../logout",
    );
    expect(response.status).toBe(404);
  });
});

/** The state the sign-in page opens on for the gateway's return query. */
const land = async (query: string) => {
  const page = await signInLoader(new Request(`${ORIGIN}/sign-in?${query}`));
  return page.state;
};

describe("the gateway's return paths on the sign-in page", () => {
  it("asks for the second factor the gateway parked the SSO sign-in for (G6)", async () => {
    expect(await land("pendingMfa=p-1&mfaFactors=totp%2Cemail")).toEqual({
      choose: true,
      factor: "totp",
      factors: ["totp", "email"],
      pendingId: "p-1",
      view: "code",
    });
    expect(await land("pendingMfa=p-2&mfaFactors=email")).toEqual({
      factor: "email",
      factors: ["email"],
      pendingId: "p-2",
      view: "code",
    });
  });

  it("shows why SSO didn't finish, inline on the password card", async () => {
    expect(await land("error=sso_exchange")).toEqual({ problem: "sso", view: "password" });
    expect(await land("error=sso_not_active")).toEqual({
      problem: "ssoNotActive",
      view: "password",
    });
  });

  it("finishes the SSO second factor like any other", async () => {
    const start = await ssoGatewayProxy(
      new Request(`${ORIGIN}/auth/sso/start?connection=example-oidc&identifier=alice`),
      "start",
    );
    const resume = new URL(start.headers.get("location") ?? "", ORIGIN);
    const state = await land(resume.searchParams.toString());
    const opened = (await signInAction(
      new Request(`${ORIGIN}/sign-in`, {
        body: new URLSearchParams({
          code: "123456",
          factor: "totp",
          factors: "totp,email",
          intent: "verify",
          next: "/",
          pendingId: String(stateOf({ data: state }).pendingId),
        }),
        method: "POST",
      }),
    )) as Response;
    expect(opened.status).toBe(303);
  });
});
