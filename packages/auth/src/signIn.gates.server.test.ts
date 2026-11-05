// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The designed sign-in gates on the server (Gates G3–G9): what the page offers, choosing a
// second factor, the SSO identifier step, the password reset and passkey sign-in, each against
// a fake that keeps steward-gateway's contract for those routes.
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  FAKE_CODE,
  FAKE_CREDENTIAL,
  FAKE_PASSKEY_USER,
  type FakeGateway,
  startFakeGateway,
  THROTTLED_PASSWORD,
} from "./fakeGateway.testing";
import { requireIdentityFromRequest } from "./guards.server";
import { signInAction, signInLoader } from "./signIn.server";

const ORIGIN = "https://steward.example";
let full: FakeGateway;
let bare: FakeGateway;
let previousGatewayUrl: string | undefined;

beforeAll(async () => {
  const accounts = [
    { password: "right-password", userId: "u-plain", username: "plain.sample" },
    {
      mfa: "challenge" as const,
      password: "right-password",
      userId: "u-erin",
      username: "erin@example.org",
    },
    {
      factors: ["totp"],
      mfa: "challenge" as const,
      password: "right-password",
      userId: "u-totp",
      username: "totp.sample",
    },
    { password: "unused", userId: "u-passkey", username: FAKE_PASSKEY_USER },
  ];
  full = await startFakeGateway(accounts, {
    authConfig: {
      defaultLoginMethod: "local",
      login2faEnabled: true,
      passkeyEnabled: true,
      ssoAvailable: true,
    },
    sso: { "dana@example.org": "partner-saml" },
  });
  bare = await startFakeGateway(accounts);
  previousGatewayUrl = process.env.GATEWAY_URL;
  process.env.GATEWAY_URL = full.queryUrl;
});

afterEach(() => {
  process.env.GATEWAY_URL = full.queryUrl;
});

afterAll(async () => {
  process.env.GATEWAY_URL = previousGatewayUrl;
  await full.close();
  await bare.close();
});

const post = (fields: Record<string, string>) =>
  new Request(`${ORIGIN}/sign-in?next=%2Fpolicies`, {
    body: new URLSearchParams({ next: "/policies", ...fields }),
    method: "POST",
  });

const stateOf = (value: unknown) => (value as { data: Record<string, unknown> }).data;
const statusOf = (value: unknown) => (value as { init: { status?: number } | null }).init?.status;

const cookieFrom = (response: Response): string =>
  response.headers
    .getSetCookie()
    .map((c) => c.split(";", 1)[0])
    .join("; ");

/** The step the sign-in page opens on for a query. */
const at = async (query: string) => {
  const page = await signInLoader(new Request(`${ORIGIN}/sign-in${query}`));
  return page.state;
};

const identityWith = (cookie: string) =>
  requireIdentityFromRequest(new Request(`${ORIGIN}/policies`, { headers: { cookie } }));

describe("what the sign-in page offers (G3)", () => {
  it("offers the reset, passkey and SSO only as far as the gateway's sign-in settings say", async () => {
    const page = await signInLoader(new Request(`${ORIGIN}/sign-in`));
    expect(page.capabilities).toEqual({ passkey: true, passwordReset: true, sso: true });
  });

  it("offers none of them when the gateway has no sign-in settings to give", async () => {
    process.env.GATEWAY_URL = bare.queryUrl;
    const page = await signInLoader(new Request(`${ORIGIN}/sign-in`));
    expect(page.capabilities).toEqual({ passkey: false, passwordReset: false, sso: false });
  });

  it("opens the SSO and reset steps from their links, and the password step otherwise", async () => {
    expect(await at("?step=sso")).toEqual({ view: "sso" });
    expect(await at("?step=reset")).toEqual({ step: "request", view: "reset" });
    expect(await at("?step=elsewhere")).toEqual({ view: "password" });
  });

  it("doesn't open the reset step on a gateway that can't reset a password", async () => {
    process.env.GATEWAY_URL = bare.queryUrl;
    const page = await signInLoader(new Request(`${ORIGIN}/sign-in?step=reset`));
    expect(page.state).toEqual({ view: "password" });
  });

  it("says to wait when the gateway is turning away too many attempts", async () => {
    const result = await signInAction(
      post({ identifier: "plain.sample", intent: "login", password: THROTTLED_PASSWORD }),
    );
    expect(stateOf(result)).toEqual({
      identifier: "plain.sample",
      problem: "throttled",
      view: "password",
    });
    expect(statusOf(result)).toBe(429);
  });
});

describe("choosing a second factor (G6)", () => {
  it("asks which method to use when there are several, naming the masked address", async () => {
    const result = await signInAction(
      post({ identifier: "erin@example.org", intent: "login", password: "right-password" }),
    );
    expect(stateOf(result)).toMatchObject({
      choose: true,
      factor: "totp",
      factors: ["totp", "email"],
      sentTo: "e•••@example.org",
      view: "code",
    });
  });

  it("goes straight to the code when there is only one method", async () => {
    const result = stateOf(
      await signInAction(
        post({ identifier: "totp.sample", intent: "login", password: "right-password" }),
      ),
    );
    expect(result).toMatchObject({ factor: "totp", factors: ["totp"], view: "code" });
    expect(result.choose).toBeUndefined();
  });

  it("takes the authenticator app without calling the gateway", async () => {
    const before = full.requests.length;
    const result = await signInAction(
      post({
        factor: "totp",
        factors: "totp,email",
        intent: "choose",
        pendingId: "parked",
        sentTo: "e•••@example.org",
      }),
    );
    expect(stateOf(result)).toEqual({
      factor: "totp",
      factors: ["totp", "email"],
      pendingId: "parked",
      sentTo: "e•••@example.org",
      view: "code",
    });
    expect(full.requests.length).toBe(before);
  });

  it("goes back to the list of methods", async () => {
    const result = await signInAction(
      post({ factor: "totp", factors: "totp,email", intent: "method", pendingId: "parked" }),
    );
    expect(stateOf(result)).toMatchObject({ choose: true, pendingId: "parked", view: "code" });
  });

  it("keeps the masked address when it emails the code", async () => {
    const challenge = stateOf(
      await signInAction(
        post({ identifier: "erin@example.org", intent: "login", password: "right-password" }),
      ),
    );
    const sent = await signInAction(
      post({
        factors: "totp,email",
        intent: "email",
        pendingId: String(challenge.pendingId),
        sentTo: String(challenge.sentTo),
      }),
    );
    expect(stateOf(sent)).toMatchObject({
      emailSent: "sent",
      factor: "email",
      sentTo: "e•••@example.org",
    });
  });
});

describe("the SSO identifier step (G4)", () => {
  it("hands someone whose organisation uses SSO to the gateway's SSO start", async () => {
    const result = await signInAction(post({ identifier: "dana@example.org", intent: "sso" }));
    const answer = result as Response;
    expect(answer.status).toBe(302);
    expect(answer.headers.get("location")).toBe("/auth/sso/start?connection=partner-saml");
    expect(answer.headers.get("x-remix-reload-document")).toBe("true");
  });

  it("returns anyone else to the password step with their name filled in", async () => {
    const result = await signInAction(post({ identifier: "plain.sample", intent: "sso" }));
    expect(stateOf(result)).toEqual({ identifier: "plain.sample", view: "password" });
  });

  it("asks for the name before calling the gateway", async () => {
    const before = full.requests.length;
    const result = await signInAction(post({ identifier: " ", intent: "sso" }));
    expect(stateOf(result)).toEqual({ problem: "missing", view: "sso" });
    expect(full.requests.length).toBe(before);
  });

  it("says SSO isn't available when the gateway can't look the name up", async () => {
    process.env.GATEWAY_URL = bare.queryUrl;
    await bare.close();
    const result = await signInAction(post({ identifier: "dana@example.org", intent: "sso" }));
    expect(stateOf(result)).toEqual({
      identifier: "dana@example.org",
      problem: "unavailable",
      view: "sso",
    });
    bare = await startFakeGateway([]);
  });
});

describe("the password reset (G8)", () => {
  it("always moves on to the code, so it never reveals whether an account exists", async () => {
    const result = await signInAction(
      post({ email: "nobody@example.org", intent: "reset-request" }),
    );
    expect(stateOf(result)).toEqual({
      email: "nobody@example.org",
      step: "confirm",
      view: "reset",
    });
  });

  it("asks for the address before calling the gateway", async () => {
    const result = await signInAction(post({ email: "", intent: "reset-request" }));
    expect(stateOf(result)).toEqual({ problem: "missing", step: "request", view: "reset" });
  });

  it("refuses a bad code, then sets the password and returns to sign-in", async () => {
    const carried = { email: "erin@example.org", intent: "reset-confirm", newPassword: "new-one" };
    const wrong = await signInAction(post({ ...carried, code: "000000" }));
    expect(stateOf(wrong)).toEqual({
      email: "erin@example.org",
      problem: "code",
      step: "confirm",
      view: "reset",
    });

    const done = await signInAction(post({ ...carried, code: FAKE_CODE }));
    expect(stateOf(done)).toEqual({
      identifier: "erin@example.org",
      notice: "passwordReset",
      view: "password",
    });
  });

  it("asks for both the code and the new password", async () => {
    const result = await signInAction(
      post({ code: FAKE_CODE, email: "erin@example.org", intent: "reset-confirm" }),
    );
    expect(stateOf(result)).toMatchObject({ problem: "missing", step: "confirm" });
  });
});

describe("passkey sign-in (G5)", () => {
  it("hands the browser the gateway's passkey challenge", async () => {
    const result = await signInAction(post({ intent: "passkey-begin" }));
    expect(stateOf(result)).toEqual({
      passkey: { flowId: "flow-1", optionsJson: '{"publicKey":{"challenge":"Y2hhbGxlbmdl"}}' },
    });
  });

  it("opens the session from a signed assertion", async () => {
    const opened = (await signInAction(
      post({ credentialJson: FAKE_CREDENTIAL, flowId: "flow-1", intent: "passkey-finish" }),
    )) as Response;
    expect(opened.status).toBe(303);
    expect(opened.headers.get("location")).toBe("/policies");
    expect(await identityWith(cookieFrom(opened))).toMatchObject({ id: "u-passkey" });
  });

  it("returns to the password step when the gateway refuses the passkey", async () => {
    const result = await signInAction(
      post({ credentialJson: '{"id":"other"}', flowId: "flow-1", intent: "passkey-finish" }),
    );
    expect(stateOf(result)).toEqual({ problem: "passkey", view: "password" });
  });

  it("takes a passkey as the second factor", async () => {
    const challenge = stateOf(
      await signInAction(
        post({ identifier: "erin@example.org", intent: "login", password: "right-password" }),
      ),
    );
    const pendingId = String(challenge.pendingId);
    const begun = await signInAction(post({ intent: "mfa-passkey-begin", pendingId }));
    expect(stateOf(begun)).toEqual({
      passkey: { optionsJson: '{"publicKey":{"challenge":"bWZh"}}' },
    });

    const opened = (await signInAction(
      post({
        credentialJson: FAKE_CREDENTIAL,
        factor: "passkey",
        factors: "totp,email,passkey",
        intent: "verify",
        pendingId,
      }),
    )) as Response;
    expect(opened.status).toBe(303);
    expect(await identityWith(cookieFrom(opened))).toMatchObject({ id: "u-erin" });
  });
});

describe("the dev gate preview in a release build", () => {
  it("ignores the gate parameter", async () => {
    const page = await signInLoader(new Request(`${ORIGIN}/sign-in?gate=G4`));
    expect(page.state).toEqual({ view: "password" });
    expect(page.preview).toBeUndefined();
  });
});
