// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  forgetCsrfToken,
  gatewayOrigin,
  rememberCsrfToken,
  sessionIdFromSetCookie,
} from "@steward-web/api-client";

/**
 * The gateway's sign-in routes (steward-gateway `internal/bff`, `/auth/*`). The gateway does
 * the work with Ory Kratos and issues its own session cookie (`steward_sid`); these calls run
 * on the app server only, and the browser only ever holds that HttpOnly cookie, relayed from
 * the gateway's own `Set-Cookie`. Like setup, sign-in never goes through the mock/live edge
 * swap: it always talks to a real gateway.
 */

/** One answer from a sign-in step. */
export type AuthStep =
  | { factors: SecondFactor[]; kind: "challenge"; pendingId: string }
  | { kind: "enrol"; pendingId: string }
  | { kind: "rejected"; reason: "expired" | "invalid" }
  | { kind: "session"; setCookie: string[] }
  | { kind: "unavailable"; status: number };

export type SecondFactor = "email" | "passkey" | "totp";

export interface TotpEnrolment {
  otpauthUri: string;
  /** Masked by the gateway: shown for recognition only, never typed in. */
  secret: string;
}

/**
 * The incoming request's header the gateway's second-factor rule reads: the public edge
 * marks a request with `X-Steward-Edge` (steward-gateway `MFA_ENFORCE=edge`), so it has to
 * reach the gateway's `/auth/login` or a sign-in through the public edge would skip MFA.
 */
const FORWARDED_HEADERS = ["x-steward-edge"] as const;

export interface AuthCallOptions {
  /** The incoming browser request, for the forwarded headers above. */
  incoming?: Request;
  /** Overrides `process.env.GATEWAY_URL` (the `/query` endpoint; `/auth/*` sits beside it). */
  queryUrl?: string;
}

const FACTORS = new Set<string>(["email", "passkey", "totp"]);

const factorList = (raw: unknown): SecondFactor[] =>
  Array.isArray(raw) ? raw.filter((f): f is SecondFactor => FACTORS.has(String(f))) : [];

const forwarded = (incoming?: Request): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (!incoming) return headers;
  for (const name of FORWARDED_HEADERS) {
    const value = incoming.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
};

interface Answer {
  body: Record<string, unknown>;
  setCookie: string[];
  status: number;
}

const post = async (
  path: string,
  body: Record<string, unknown>,
  options: { cookie?: string } & AuthCallOptions = {},
): Promise<Answer> => {
  const response = await fetch(`${gatewayOrigin(options.queryUrl)}${path}`, {
    body: JSON.stringify(body),
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...forwarded(options.incoming),
      ...(options.cookie ? { cookie: options.cookie } : {}),
    },
    method: "POST",
    redirect: "manual",
  });
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { body: json, setCookie: response.headers.getSetCookie(), status: response.status };
};

/**
 * Maps the gateway's answer to a sign-in step: a session (cookie and CSRF token), a parked
 * sign-in owing a second factor or an enrolment, a refusal, or the gateway being unable to
 * answer. A session's CSRF token is remembered server-side for the next gateway call.
 */
const toStep = ({ body, setCookie, status }: Answer): AuthStep => {
  if (status === 200 && body.mfaRequired === true && typeof body.pendingId === "string") {
    if (body.enrollmentRequired === true) return { kind: "enrol", pendingId: body.pendingId };
    return { factors: factorList(body.factors), kind: "challenge", pendingId: body.pendingId };
  }
  if (status === 200) {
    const sid = sessionIdFromSetCookie(setCookie);
    if (sid && typeof body.csrfToken === "string") rememberCsrfToken(sid, body.csrfToken);
    return { kind: "session", setCookie };
  }
  if (status === 401 && body.error === "invalid_pending")
    return { kind: "rejected", reason: "expired" };
  if (status === 400 || status === 401) return { kind: "rejected", reason: "invalid" };
  return { kind: "unavailable", status };
};

/** `POST /auth/login`: the password step. */
export const login = async (
  username: string,
  password: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> => toStep(await post("/auth/login", { password, username }, options));

/** `POST /auth/mfa/verify`: finish a parked sign-in with a TOTP or emailed code. */
export const verifyCode = async (
  pendingId: string,
  kind: "email" | "totp",
  code: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> => toStep(await post("/auth/mfa/verify", { code, kind, pendingId }, options));

/** `POST /auth/mfa/otp/send`: email a sign-in code. "wait" means one was sent a moment ago. */
export const sendLoginCode = async (
  pendingId: string,
  options: AuthCallOptions = {},
): Promise<"expired" | "failed" | "sent" | "wait"> => {
  const { body, status } = await post("/auth/mfa/otp/send", { pendingId }, options);
  if (status === 200) return "sent";
  if (status === 429) return "wait";
  if (status === 401 && body.error === "invalid_pending") return "expired";
  return "failed";
};

/** `POST /auth/mfa/enroll/totp/begin`: start authenticator-app enrolment for a parked sign-in. */
export const beginTotpEnrolment = async (
  pendingId: string,
  options: AuthCallOptions = {},
): Promise<TotpEnrolment | undefined> => {
  const { body, status } = await post("/auth/mfa/enroll/totp/begin", { pendingId }, options);
  if (status !== 200 || typeof body.otpauthUri !== "string") return undefined;
  return {
    otpauthUri: body.otpauthUri,
    secret: typeof body.secret === "string" ? body.secret : "",
  };
};

/** `POST /auth/mfa/enroll/totp/confirm`: prove the new authenticator, which opens the session. */
export const confirmTotpEnrolment = async (
  pendingId: string,
  code: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> =>
  toStep(await post("/auth/mfa/enroll/totp/confirm", { code, pendingId }, options));

/**
 * `POST /auth/logout`: the gateway revokes the Kratos session and clears its cookie. Returns
 * the gateway's `Set-Cookie` answers to relay; a failure still forgets the CSRF token here.
 */
export const logout = async (
  cookie: string | undefined,
  options: AuthCallOptions = {},
): Promise<string[]> => {
  forgetCsrfToken(cookie);
  if (!cookie) return [];
  const { setCookie } = await post("/auth/logout", {}, { ...options, cookie });
  return setCookie;
};
