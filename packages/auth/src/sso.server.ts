// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { gatewayOrigin, reportApiError } from "@steward-web/api-client";

/** The gateway's SSO routes: start, callback and idp-initiated (steward-gateway `internal/bff`). */
const SSO_ROUTE = /^[a-z]+(?:-[a-z]+)*$/;

/** The request headers the gateway's SSO routes read, besides nothing else. */
const FORWARDED = ["accept", "content-type", "cookie", "x-steward-edge"] as const;

/**
 * The gateway sends people back to `/home` with a session, or to `/login` with `pendingMfa`
 * and `mfaFactors` or an `error`. This app's home is its root and its sign-in is `/sign-in`,
 * under the app's basename (so an SSO sign-in started from the admin console comes back there).
 */
export const appReturnPath = (location: string, basename = "/"): string => {
  const base = basename.replace(/\/+$/, "");
  const [path = "", query] = location.split(/\?(.*)/s, 2);
  if (path === "/home") return `${base}/${query ? `?${query}` : ""}`;
  if (path === "/login") return `${base}/sign-in${query ? `?${query}` : ""}`;
  return location;
};

/** The answer headers the browser needs back: where to go and the cookies to keep. */
const RELAYED = ["cache-control", "content-type", "location", "retry-after"] as const;

/**
 * The app's own `/auth/sso/<route>` (#54): the gateway's SSO start, its callback and the
 * IdP-initiated post, passed straight through to `GATEWAY_URL`'s origin. The gateway runs the
 * flow on the app's origin (its `SSO_REDIRECT_BASE`), so the browser has to reach it here, in
 * dev and behind the production server alike. Redirects are relayed, not followed, with every
 * `Set-Cookie`, so the session lands on the app's origin, and the gateway's return paths are
 * turned into this app's (`appReturnPath`). When the gateway can't be reached, the person goes
 * back to sign-in with the calm SSO error.
 */
export const ssoGatewayProxy = async (
  request: Request,
  route: string,
  options: { basename?: string; queryUrl?: string } = {},
): Promise<Response> => {
  if (!SSO_ROUTE.test(route)) return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const headers = new Headers();
  for (const name of FORWARDED) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const post = request.method === "POST";
  let answer: Response;
  try {
    answer = await fetch(`${gatewayOrigin(options.queryUrl)}/auth/sso/${route}${url.search}`, {
      ...(post ? { body: await request.text() } : {}),
      headers,
      method: post ? "POST" : "GET",
      redirect: "manual",
    });
  } catch (error) {
    reportApiError(`SSO ${route}`, error instanceof Error ? error.message : String(error));
    const location = appReturnPath("/login?error=sso_unavailable", options.basename);
    return new Response(null, { headers: { location }, status: 302 });
  }
  const relayed = new Headers();
  for (const name of RELAYED) {
    const value = answer.headers.get(name);
    if (value) relayed.set(name, value);
  }
  const location = relayed.get("location");
  if (location) relayed.set("location", appReturnPath(location, options.basename));
  for (const cookie of answer.headers.getSetCookie()) relayed.append("set-cookie", cookie);
  return new Response(answer.body, { headers: relayed, status: answer.status });
};
