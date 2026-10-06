// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { redirect } from "react-router";

import type { Identity } from "./identity";

import { can } from "./can";
import { identityFromRequest } from "./requestIdentity.server";

/**
 * Route guards for a loader or action. Each one throws React Router's own `redirect`
 * (a `Response`, not a value) rather than rendering a client-side `<Navigate>`, because the
 * gate runs server-side before the page's HTML is sent: a signed-out visitor never sees the
 * protected screen flash before the redirect, because it is never rendered.
 */

/** Sends a signed-out visitor to sign in, carrying where they were headed. */
export const requireIdentity = (identity: Identity, currentUrl: string): Identity => {
  if (identity.id === "") {
    const next = encodeURIComponent(currentUrl);
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
