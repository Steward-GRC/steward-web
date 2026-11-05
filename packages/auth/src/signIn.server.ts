// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { signInPreview } from "@steward-web/dev-gate-preview.server";
import { quickLoginAccount, quickLoginUsers } from "@steward-web/dev-quick-login.server";
import { data, redirect, redirectDocument } from "react-router";

import type { PasskeyChallenge, SignInFactor, SignInLoaderData, SignInState } from "./signInState";

import {
  type AuthStep,
  beginPasskeyFactor,
  beginPasskeyLogin,
  beginTotpEnrolment,
  confirmPasswordReset,
  confirmTotpEnrolment,
  discover,
  fetchSignInCapabilities,
  finishPasskeyLogin,
  login,
  logout,
  requestPasswordReset,
  sendLoginCode,
  verifyCode,
  verifyPasskey,
} from "./gatewayAuth.server";
import { identityFromRequest } from "./requestIdentity.server";

/**
 * Takes the app's basename off a path inside it. The router puts the basename back on every
 * redirect a loader or action returns, so leaving it on would send `/admin/x` to `/admin/admin/x`.
 */
const withoutBasename = (path: string, basename: string): string => {
  const base = basename.replace(/\/+$/, "");
  if (base === "" || !path.toLowerCase().startsWith(base.toLowerCase())) return path;
  const rest = path.slice(base.length);
  if (rest === "") return "/";
  if (rest.startsWith("?") || rest.startsWith("#")) return `/${rest}`;
  return rest.startsWith("/") ? rest : path;
};

const isInAppPath = (path: string): boolean =>
  // A backslash or a tab or line break is read as `/` or dropped by the browser's URL
  // parser, which would turn `/\host` or `/<tab>/host` into a protocol-relative URL.
  path.startsWith("/") && !path.startsWith("//") && !/[\t\n\r\\]/.test(path);

/**
 * Only an in-app relative path is a safe redirect target; anything else falls back to "/".
 * `basename` is the app's own (`/admin`), taken off so the router can put it back on.
 */
export const safeNext = (next: unknown, basename = "/"): string => {
  if (typeof next !== "string" || !isInAppPath(next)) return "/";
  const path = withoutBasename(next, basename);
  return isInAppPath(path) ? path : "/";
};

export interface SignInOptions {
  /** The app's router basename (`/admin` for the admin app); `/` when it has none. */
  basename?: string;
}

const field = (form: FormData, key: string): string => String(form.get(key) ?? "").trim();

const codeOf = (form: FormData): string => field(form, "code").replaceAll(/\D/g, "");

const relay = (setCookie: readonly string[], init?: HeadersInit): Headers => {
  const headers = new Headers(init);
  for (const cookie of setCookie) headers.append("set-cookie", cookie);
  return headers;
};

const signedIn = (setCookie: readonly string[], next: string): Response =>
  new Response(null, { headers: relay(setCookie, { location: next }), status: 303 });

const state = (value: SignInState, status = 200) => data<SignInState>(value, { status });

/**
 * The address an emailed code goes to, masked ("e•••@example.org"), when the name typed in is
 * an email address. The gateway doesn't say where it sends the code, so a username gives none.
 */
const maskedAddress = (identifier: string): string | undefined => {
  const at = identifier.lastIndexOf("@");
  if (at < 1 || at === identifier.length - 1) return undefined;
  return `${identifier.charAt(0)}•••${identifier.slice(at)}`;
};

/** The methods G6 lists: the authenticator app, an emailed code and a passkey. */
const CHOOSABLE: ReadonlySet<SignInFactor> = new Set(["email", "passkey", "totp"]);

/** Where the password step leads: in, a code to ask for, an enrolment, or back with a reason. */
const afterPassword = async (
  step: AuthStep,
  identifier: string,
  next: string,
  incoming: Request,
) => {
  switch (step.kind) {
    case "challenge": {
      const factor =
        step.factors.includes("totp") || !step.factors.includes("email") ? "totp" : "email";
      const sentTo = maskedAddress(identifier);
      const several = step.factors.filter((f) => CHOOSABLE.has(f)).length > 1;
      return state({
        ...(several ? { choose: true } : {}),
        factor,
        factors: step.factors,
        pendingId: step.pendingId,
        ...(sentTo ? { sentTo } : {}),
        view: "code",
      });
    }
    case "enrol": {
      const enrolment = await beginTotpEnrolment(step.pendingId, { incoming });
      if (!enrolment) return state({ identifier, problem: "unavailable", view: "password" }, 502);
      return state({ ...enrolment, pendingId: step.pendingId, view: "enrol" });
    }
    case "rejected": {
      return state(
        { identifier, problem: step.reason, view: "password" },
        step.reason === "throttled" ? 429 : 401,
      );
    }
    case "session": {
      return signedIn(step.setCookie, next);
    }
    case "unavailable": {
      return state({ identifier, problem: "unavailable", view: "password" }, 502);
    }
  }
};

/**
 * A signed-in visitor goes straight on; everyone else gets the password step, or the SSO or
 * reset step its link opened (`?step=sso`, `?step=reset`). The page offers what the gateway's
 * sign-in settings allow. In a dev build, `?gate=<frame id>` previews a gate with sample data.
 */
export const signInLoader = async (
  request: Request,
  { basename }: SignInOptions = {},
): Promise<SignInLoaderData> => {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"), basename);
  const identity = await identityFromRequest(request);
  if (identity.id !== "") throw redirect(next);
  const quickLogin = quickLoginUsers();
  const preview = signInPreview(url);
  if (preview) {
    return {
      capabilities: preview.capabilities,
      next,
      preview: preview.gate,
      quickLoginUsers: quickLogin,
      state: preview.state,
    };
  }
  const capabilities = await fetchSignInCapabilities({ incoming: request });
  const step = url.searchParams.get("step");
  const opened: SignInState =
    step === "sso"
      ? { view: "sso" }
      : step === "reset" && capabilities.passwordReset
        ? { step: "request", view: "reset" }
        : { view: "password" };
  return { capabilities, next, quickLoginUsers: quickLogin, state: opened };
};

const passkeyChallenge = (passkey: PasskeyChallenge["passkey"]) =>
  data<PasskeyChallenge>({ passkey });

/**
 * One step of signing in, chosen by the form's `intent`: the password, a second-factor code,
 * emailing a code, or confirming a new authenticator during a first sign-in. Each step goes to
 * the gateway; a step that opens a session answers 303 with the gateway's own cookie relayed.
 */
export const signInAction = async (
  request: Request,
  form?: FormData,
  { basename }: SignInOptions = {},
) => {
  const body = form ?? (await request.formData());
  const intent = field(body, "intent");
  const next = safeNext(
    body.get("next") ?? new URL(request.url).searchParams.get("next"),
    basename,
  );
  const options = { incoming: request };

  if (intent === "login") {
    const identifier = field(body, "identifier");
    const password = String(body.get("password") ?? "");
    if (!identifier || !password)
      return state({ identifier, problem: "missing", view: "password" }, 400);
    return afterPassword(await login(identifier, password, options), identifier, next, request);
  }

  // A release build's alias answers no account here, so this intent is a 404 there.
  if (intent === "dev-quick-login") {
    const account = quickLoginAccount(field(body, "username"));
    if (!account) throw new Response("Not found", { status: 404 });
    return afterPassword(
      await login(account.username, account.password, options),
      account.username,
      next,
      request,
    );
  }

  if (intent === "sso") {
    const identifier = field(body, "identifier");
    if (!identifier) return state({ problem: "missing", view: "sso" }, 400);
    const found = await discover(identifier, options);
    // The gateway's SSO start runs on the app's own origin (its SSO_REDIRECT_BASE), so the
    // browser leaves this app for it with a full page load.
    if (found.method === "sso")
      return redirectDocument(
        `/auth/sso/start?${new URLSearchParams({ connection: found.connection })}`,
      );
    if (found.method === "local") return state({ identifier, view: "password" });
    if (found.method === "missing") return state({ problem: "missing", view: "sso" }, 400);
    return state({ identifier, problem: "unavailable", view: "sso" }, 502);
  }

  if (intent === "reset-request") {
    const email = field(body, "email");
    if (!email) return state({ problem: "missing", step: "request", view: "reset" }, 400);
    const sent = await requestPasswordReset(email, options);
    if (sent === "sent") return state({ email, step: "confirm", view: "reset" });
    if (sent === "missing")
      return state({ problem: "missing", step: "request", view: "reset" }, 400);
    return state({ email, problem: "unavailable", step: "request", view: "reset" }, 502);
  }

  if (intent === "reset-confirm") {
    const email = field(body, "email");
    const value = codeOf(body);
    const newPassword = String(body.get("newPassword") ?? "");
    const confirm = { email, step: "confirm", view: "reset" } as const;
    if (!value || !newPassword) return state({ ...confirm, problem: "missing" }, 400);
    const result = await confirmPasswordReset(email, value, newPassword, options);
    if (result === "set")
      return state({ identifier: email, notice: "passwordReset", view: "password" });
    if (result === "code") return state({ ...confirm, problem: "code" }, 400);
    return state({ ...confirm, problem: "unavailable" }, 502);
  }

  if (intent === "passkey-begin") {
    const challenge = await beginPasskeyLogin(options);
    if (!challenge) return state({ problem: "unavailable", view: "password" }, 502);
    return passkeyChallenge(challenge);
  }

  if (intent === "passkey-finish") {
    const step = await finishPasskeyLogin(
      field(body, "flowId"),
      String(body.get("credentialJson") ?? ""),
      options,
    );
    if (step.kind === "session") return signedIn(step.setCookie, next);
    if (step.kind === "rejected") return state({ problem: "passkey", view: "password" }, 401);
    return state({ problem: "unavailable", view: "password" }, 502);
  }

  const pendingId = field(body, "pendingId");
  const factors = field(body, "factors")
    .split(",")
    .filter((f): f is SignInFactor => ["email", "passkey", "totp"].includes(f));
  const factor = field(body, "factor") === "email" ? "email" : "totp";
  const sentTo = field(body, "sentTo");
  const code: SignInState = {
    factor,
    factors,
    pendingId,
    ...(sentTo ? { sentTo } : {}),
    view: "code",
  };

  if (intent === "choose") return state(code);
  if (intent === "method") return state({ ...code, choose: true });

  if (intent === "mfa-passkey-begin") {
    const challenge = await beginPasskeyFactor(pendingId, options);
    if (challenge === "expired") return state({ problem: "expired", view: "password" }, 401);
    if (!challenge) return state({ ...code, problem: "unavailable" }, 502);
    return passkeyChallenge(challenge);
  }

  if (intent === "email") {
    const sent = await sendLoginCode(pendingId, options);
    if (sent === "expired") return state({ problem: "expired", view: "password" }, 401);
    if (sent === "failed") return state({ ...code, factor: "email", problem: "send" }, 502);
    return state({ ...code, emailSent: sent, factor: "email" });
  }

  if (intent === "verify" && field(body, "factor") === "passkey") {
    const step = await verifyPasskey(pendingId, String(body.get("credentialJson") ?? ""), options);
    if (step.kind === "session") return signedIn(step.setCookie, next);
    if (step.kind === "rejected" && step.reason === "expired") {
      return state({ problem: "expired", view: "password" }, 401);
    }
    if (step.kind === "rejected") return state({ ...code, problem: "wrong" }, 401);
    return state({ ...code, problem: "unavailable" }, 502);
  }

  if (intent === "verify") {
    const value = codeOf(body);
    if (value.length !== 6) return state({ ...code, problem: "wrong" }, 400);
    const step = await verifyCode(pendingId, factor, value, options);
    if (step.kind === "session") return signedIn(step.setCookie, next);
    if (step.kind === "rejected" && step.reason === "expired") {
      return state({ problem: "expired", view: "password" }, 401);
    }
    if (step.kind === "rejected") return state({ ...code, problem: "wrong" }, 401);
    return state({ ...code, problem: "unavailable" }, 502);
  }

  if (intent === "enrol") {
    const enrol: SignInState = {
      otpauthUri: field(body, "otpauthUri"),
      pendingId,
      secret: field(body, "secret"),
      view: "enrol",
    };
    const value = codeOf(body);
    if (value.length !== 6) return state({ ...enrol, problem: "wrong" }, 400);
    const step = await confirmTotpEnrolment(pendingId, value, options);
    if (step.kind === "session") return signedIn(step.setCookie, next);
    if (step.kind === "rejected" && step.reason === "expired") {
      return state({ problem: "expired", view: "password" }, 401);
    }
    if (step.kind === "rejected") return state({ ...enrol, problem: "wrong" }, 401);
    return state({ ...enrol, problem: "unavailable" }, 502);
  }

  return state({ view: "password" }, 400);
};

/**
 * Ends the session at the gateway, relays its cleared cookie, and goes back to sign-in. When
 * the gateway can't be reached the cookie is cleared here anyway, so the browser never keeps
 * a session it was told is over.
 */
export const signOutAction = async (request: Request, signInPath = "/sign-in") => {
  const cookie = request.headers.get("cookie") ?? undefined;
  let setCookie: string[] = [];
  try {
    setCookie = await logout(cookie, { incoming: request });
  } catch {
    setCookie = [];
  }
  if (setCookie.length === 0) {
    setCookie = ["steward_sid=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"];
  }
  return redirect(signInPath, { headers: relay(setCookie) });
};
