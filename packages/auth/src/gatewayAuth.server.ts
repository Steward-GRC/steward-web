// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  apiErrorMessage,
  forgetCsrfToken,
  gatewayOrigin,
  rememberCsrfToken,
  reportApiError,
  sessionIdFromSetCookie,
} from "@steward-web/api-client";

import type { SignInCapabilities } from "./signInState";

import { NO_CAPABILITIES } from "./signInState";

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
  | { kind: "rejected"; reason: "disabled" | "expired" | "invalid" | "throttled" }
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

const call = async (
  method: "GET" | "POST",
  path: string,
  body: Record<string, unknown> | undefined,
  options: { cookie?: string } & AuthCallOptions = {},
): Promise<Answer> => {
  let response: Response;
  try {
    const init: RequestInit = body ? { body: JSON.stringify(body) } : {};
    response = await fetch(`${gatewayOrigin(options.queryUrl)}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
        ...forwarded(options.incoming),
        ...(options.cookie ? { cookie: options.cookie } : {}),
      },
      method,
      redirect: "manual",
    });
  } catch (error) {
    reportApiError(`Auth ${path}`, apiErrorMessage(error));
    throw error;
  }
  if (response.status >= 500) reportApiError(`Auth ${path}`, `auth returned ${response.status}`);
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return { body: json, setCookie: response.headers.getSetCookie(), status: response.status };
};

const post = (
  path: string,
  body: Record<string, unknown>,
  options: { cookie?: string } & AuthCallOptions = {},
): Promise<Answer> => call("POST", path, body, options);

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
  if (status === 403 && body.error === "account_disabled")
    return { kind: "rejected", reason: "disabled" };
  if (status === 429) return { kind: "rejected", reason: "throttled" };
  return { kind: "unavailable", status };
};

/** A sign-in step's call, with a gateway that doesn't answer at all (status 0) as a step too,
 *  so the page can say it couldn't reach Steward rather than fail. */
const step = async (answer: () => Promise<Answer>): Promise<AuthStep> => {
  try {
    return toStep(await answer());
  } catch {
    return { kind: "unavailable", status: 0 };
  }
};

/** `POST /auth/login`: the password step. */
export const login = async (
  username: string,
  password: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> => step(() => post("/auth/login", { password, username }, options));

/** `POST /auth/mfa/verify`: finish a parked sign-in with a TOTP or emailed code. */
export const verifyCode = async (
  pendingId: string,
  kind: "email" | "totp",
  code: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> => step(() => post("/auth/mfa/verify", { code, kind, pendingId }, options));

/** `POST /auth/mfa/verify` with `kind: "passkey"`: finish a parked sign-in with a passkey. */
export const verifyPasskey = async (
  pendingId: string,
  credentialJson: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> =>
  step(() => post("/auth/mfa/verify", { credentialJson, kind: "passkey", pendingId }, options));

/**
 * `GET /auth/config` (steward-gateway `internal/passwordreset`): the sign-in settings the page
 * loads first. The same gateway package serves the password reset, so a gateway that answers
 * this can reset a password; one that can't answer (an older gateway, or the mock) offers
 * nothing beyond the password.
 */
export const fetchSignInCapabilities = async (
  options: AuthCallOptions = {},
): Promise<SignInCapabilities> => {
  try {
    const { body, status } = await call("GET", "/auth/config", undefined, options);
    if (status !== 200) return NO_CAPABILITIES;
    return {
      passkey: body.passkeyEnabled === true,
      passwordReset: true,
      sso: body.ssoAvailable === true,
    };
  } catch {
    return NO_CAPABILITIES;
  }
};

/** Where `POST /auth/discover` sends someone: their organisation's SSO, or the password. */
export type Discovery =
  | { connection: string; method: "sso" }
  | { method: "local" }
  | { method: "missing" }
  | { method: "unavailable" };

/** `POST /auth/discover`: whether an email or username signs in through SSO, and where. */
export const discover = async (
  identifier: string,
  options: AuthCallOptions = {},
): Promise<Discovery> => {
  try {
    const { body, status } = await post("/auth/discover", { identifier }, options);
    if (status === 400) return { method: "missing" };
    if (status !== 200) return { method: "unavailable" };
    if (body.method === "sso" && typeof body.connectionAlias === "string" && body.connectionAlias)
      return { connection: body.connectionAlias, method: "sso" };
    return { method: "local" };
  } catch {
    return { method: "unavailable" };
  }
};

/**
 * `POST /auth/password-reset/request`: email a reset code. The gateway answers the same
 * whether or not the account exists, so "sent" says nothing about the account.
 */
export const requestPasswordReset = async (
  email: string,
  options: AuthCallOptions = {},
): Promise<"missing" | "sent" | "unavailable"> => {
  try {
    const { status } = await post("/auth/password-reset/request", { email }, options);
    if (status === 200) return "sent";
    return status === 400 ? "missing" : "unavailable";
  } catch {
    return "unavailable";
  }
};

/** `POST /auth/password-reset/confirm`: set the new password with the emailed code. */
export const confirmPasswordReset = async (
  email: string,
  code: string,
  newPassword: string,
  options: AuthCallOptions = {},
): Promise<"code" | "set" | "unavailable"> => {
  try {
    const { status } = await post(
      "/auth/password-reset/confirm",
      { code, email, newPassword },
      options,
    );
    if (status === 200) return "set";
    return status === 400 ? "code" : "unavailable";
  } catch {
    return "unavailable";
  }
};

/** `POST /auth/passkey/login/begin`: a passkey challenge for the browser, or undefined. */
export const beginPasskeyLogin = async (
  options: AuthCallOptions = {},
): Promise<{ flowId: string; optionsJson: string } | undefined> => {
  const { body, status } = await post("/auth/passkey/login/begin", {}, options);
  if (status !== 200 || typeof body.flowId !== "string" || typeof body.optionsJson !== "string")
    return undefined;
  return { flowId: body.flowId, optionsJson: body.optionsJson };
};

/** `POST /auth/passkey/login/finish`: the signed assertion opens the session on its own. */
export const finishPasskeyLogin = async (
  flowId: string,
  credentialJson: string,
  options: AuthCallOptions = {},
): Promise<AuthStep> =>
  step(() => post("/auth/passkey/login/finish", { credentialJson, flowId }, options));

/** `POST /auth/mfa/webauthn/begin`: a passkey challenge for a parked sign-in's second factor. */
export const beginPasskeyFactor = async (
  pendingId: string,
  options: AuthCallOptions = {},
): Promise<"expired" | { optionsJson: string } | undefined> => {
  const { body, status } = await post("/auth/mfa/webauthn/begin", { pendingId }, options);
  if (status === 401 && body.error === "invalid_pending") return "expired";
  if (status !== 200 || typeof body.optionsJson !== "string") return undefined;
  return { optionsJson: body.optionsJson };
};

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
  step(() => post("/auth/mfa/enroll/totp/confirm", { code, pendingId }, options));

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
