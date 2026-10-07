// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { apiErrorMessage, reportApiError } from "./apiErrorReporter";

/** The gateway's own BFF session cookie (steward-gateway `internal/bff`, `CookieName`). */
export const SESSION_COOKIE = "steward_sid";

/** How long a session's CSRF token is reused before `GET /auth/session` is asked again. */
const CSRF_TTL_MS = 30_000;
/** A bound on the cache, so a flood of distinct cookies can't grow it without limit. */
const CSRF_CACHE_LIMIT = 5000;

interface CachedToken {
  expiresAt: number;
  token: Promise<string | undefined>;
}

const cache = new Map<string, CachedToken>();

const defaultQueryUrl = (): string => process.env.GATEWAY_URL ?? "http://localhost:8080/query";

/** The gateway's origin: `GATEWAY_URL` names its `/query` endpoint, `/auth/*` sits beside it. */
export const gatewayOrigin = (queryUrl: string = defaultQueryUrl()): string =>
  queryUrl.replace(/\/query$/, "");

/** The value of one cookie in a `Cookie` header, or undefined. */
export const readCookie = (header: string | undefined, name: string): string | undefined => {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
};

const remember = (sid: string, token: Promise<string | undefined>): void => {
  if (cache.size >= CSRF_CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(sid, { expiresAt: Date.now() + CSRF_TTL_MS, token });
};

const lookUp = async (sid: string, queryUrl: string): Promise<string | undefined> => {
  let response: Response;
  try {
    response = await fetch(`${gatewayOrigin(queryUrl)}/auth/session`, {
      headers: { accept: "application/json", cookie: `${SESSION_COOKIE}=${sid}` },
    });
  } catch (error) {
    reportApiError("Session", apiErrorMessage(error));
    return undefined;
  }
  if (!response.ok) {
    reportApiError("Session", `session returned ${response.status}`);
    return undefined;
  }
  const session = (await response.json().catch(() => ({}))) as {
    authenticated?: boolean;
    csrfToken?: string;
  };
  return session.authenticated && session.csrfToken ? session.csrfToken : undefined;
};

/**
 * The gateway's double-submit CSRF token for the session in `cookie`, which every
 * authenticated gateway call must echo in `X-CSRF-Token`. It is read from `GET /auth/session`
 * on the server, never handed to the browser, and reused for a short while so one page's
 * parallel loaders cost one lookup. Undefined when the cookie carries no live session.
 */
export const csrfTokenFor = (
  cookie: string | undefined,
  queryUrl: string = defaultQueryUrl(),
): Promise<string | undefined> => {
  const sid = readCookie(cookie, SESSION_COOKIE);
  if (!sid) return Promise.resolve(undefined);
  const cached = cache.get(sid);
  if (cached && cached.expiresAt > Date.now()) return cached.token;
  const token = lookUp(sid, queryUrl);
  remember(sid, token);
  void token.then((value) => {
    if (value === undefined) cache.delete(sid);
  });
  return token;
};

/** Records the token a sign-in just answered with, so the first page after it needs no lookup. */
export const rememberCsrfToken = (sid: string, token: string): void => {
  remember(sid, Promise.resolve(token));
};

/** Drops a session's token: after sign-out, or when the gateway refused it. */
export const forgetCsrfToken = (cookie: string | undefined): void => {
  const sid = readCookie(cookie, SESSION_COOKIE);
  if (sid) cache.delete(sid);
};

/** The session id a gateway `Set-Cookie` answer sets, or undefined when it sets none or clears it. */
export const sessionIdFromSetCookie = (setCookie: readonly string[]): string | undefined => {
  for (const header of setCookie) {
    const [pair] = header.split(";");
    const [name, ...rest] = (pair ?? "").split("=");
    if (name?.trim() !== SESSION_COOKIE) continue;
    const value = rest.join("=");
    if (value === "" || /max-age=(0|-\d+)\b/i.test(header)) return undefined;
    return value;
  }
  return undefined;
};

/** The headers every gateway call made for a signed-in user carries: the cookie and its token. */
export const sessionHeaders = async (
  cookie: string | undefined,
  queryUrl?: string,
): Promise<Record<string, string>> => {
  if (!cookie) return {};
  const csrf = await csrfTokenFor(cookie, queryUrl);
  return csrf ? { cookie, "x-csrf-token": csrf } : { cookie };
};
