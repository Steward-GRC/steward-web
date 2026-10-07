// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { data, redirect } from "react-router";

import type { SignInLoaderData, SignInState } from "./signInState";

import {
  type AuthStep,
  beginTotpEnrolment,
  confirmTotpEnrolment,
  login,
  logout,
  sendLoginCode,
  verifyCode,
} from "./gatewayAuth.server";
import { identityFromRequest } from "./requestIdentity.server";

/** Only an in-app relative path is a safe redirect target; anything else falls back to "/". */
export const safeNext = (next: unknown): string =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/";

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
      return state({ factor, factors: step.factors, pendingId: step.pendingId, view: "code" });
    }
    case "enrol": {
      const enrolment = await beginTotpEnrolment(step.pendingId, { incoming });
      if (!enrolment) return state({ identifier, problem: "unavailable", view: "password" }, 502);
      return state({ ...enrolment, pendingId: step.pendingId, view: "enrol" });
    }
    case "rejected": {
      return state({ identifier, problem: step.reason, view: "password" }, 401);
    }
    case "session": {
      return signedIn(step.setCookie, next);
    }
    case "unavailable": {
      return state({ identifier, problem: "unavailable", view: "password" }, 502);
    }
  }
};

/** A signed-in visitor goes straight on; everyone else gets the password step. */
export const signInLoader = async (request: Request): Promise<SignInLoaderData> => {
  const next = safeNext(new URL(request.url).searchParams.get("next"));
  const identity = await identityFromRequest(request);
  if (identity.id !== "") throw redirect(next);
  return { next, state: { view: "password" } };
};

/**
 * One step of signing in, chosen by the form's `intent`: the password, a second-factor code,
 * emailing a code, or confirming a new authenticator during a first sign-in. Each step goes to
 * the gateway; a step that opens a session answers 303 with the gateway's own cookie relayed.
 */
export const signInAction = async (request: Request, form?: FormData) => {
  const body = form ?? (await request.formData());
  const intent = field(body, "intent");
  const next = safeNext(body.get("next") ?? new URL(request.url).searchParams.get("next"));
  const options = { incoming: request };

  if (intent === "login") {
    const identifier = field(body, "identifier");
    const password = String(body.get("password") ?? "");
    if (!identifier || !password)
      return state({ identifier, problem: "missing", view: "password" }, 400);
    return afterPassword(await login(identifier, password, options), identifier, next, request);
  }

  const pendingId = field(body, "pendingId");
  const factors = field(body, "factors")
    .split(",")
    .filter((f): f is "email" | "passkey" | "totp" => ["email", "passkey", "totp"].includes(f));
  const factor = field(body, "factor") === "email" ? "email" : "totp";
  const code: SignInState = { factor, factors, pendingId, view: "code" };

  if (intent === "email") {
    const sent = await sendLoginCode(pendingId, options);
    if (sent === "expired") return state({ problem: "expired", view: "password" }, 401);
    if (sent === "failed") return state({ ...code, factor: "email", problem: "send" }, 502);
    return state({ ...code, emailSent: sent, factor: "email" });
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
