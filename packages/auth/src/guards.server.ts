// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { data, redirect } from "react-router";

import type { Identity } from "./identity";

import { can } from "./can";
import { identityFromRequest } from "./requestIdentity.server";

/**
 * Route guards for a loader or action. Each one throws React Router's own `redirect`
 * (a `Response`, not a value) rather than rendering a client-side `<Navigate>`, because the
 * gate runs server-side before the page's HTML is sent: a signed-out visitor never sees the
 * protected screen flash before the redirect, because it is never rendered.
 */

/**
 * Where a visitor was headed, as the sign-in page's `next` takes it: the path and query only,
 * since `safeNext` refuses anything with an origin. A client navigation reaches the loader as
 * a data request (`/policies.data?_routes=...`), so that is turned back into the page's own
 * URL the way React Router itself does. The app's basename stays on; sign-in takes it off.
 */
const returnPath = (currentUrl: string): string => {
  const url = new URL(currentUrl, "http://localhost");
  const pathname = url.pathname.endsWith("/_.data")
    ? url.pathname.replace(/_\.data$/, "")
    : url.pathname.replace(/\.data$/, "");
  url.searchParams.delete("_routes");
  const search = url.searchParams.toString();
  return search ? `${pathname}?${search}` : pathname;
};

/** Sends a signed-out visitor to sign in, carrying where they were headed. */
export const requireIdentity = (identity: Identity, currentUrl: string): Identity => {
  if (identity.id === "") {
    const next = encodeURIComponent(returnPath(currentUrl));
    throw redirect(`/sign-in?next=${next}`);
  }
  return identity;
};

/** As `requireIdentity`, then refuses a signed-in visitor who lacks the permission. */
export const requirePermission = (
  identity: Identity,
  permission: string,
  currentUrl: string,
  redirectTo = "/",
): Identity => {
  requireIdentity(identity, currentUrl);
  if (!can(identity, permission)) throw redirect(redirectTo);
  return identity;
};

/**
 * As `requirePermission`, but a signed-in visitor who lacks the permission gets a 403 naming the
 * role they need (`{ needs }`), which the route error page explains, instead of a silent
 * redirect that leaves them guessing why a screen won't open.
 */
export const requireRole = (
  identity: Identity,
  permission: string,
  needs: string,
  currentUrl: string,
): Identity => {
  requireIdentity(identity, currentUrl);
  if (!can(identity, permission)) throw data({ needs }, { status: 403 });
  return identity;
};

export const requireRoleFromRequest = async (
  request: Request,
  permission: string,
  needs: string,
): Promise<Identity> =>
  requireRole(await identityFromRequest(request), permission, needs, request.url);

/**
 * The two guards above, reading identity from the request's own cookie (cached per request;
 * see `identityFromRequest`) instead of a value the caller already resolved. The usual
 * choice for a route loader that has no other reason to call `identityFromRequest` itself.
 */
export const requireIdentityFromRequest = async (request: Request): Promise<Identity> =>
  requireIdentity(await identityFromRequest(request), request.url);

export const requirePermissionFromRequest = async (
  request: Request,
  permission: string,
  redirectTo = "/",
): Promise<Identity> =>
  requirePermission(await identityFromRequest(request), permission, request.url, redirectTo);
