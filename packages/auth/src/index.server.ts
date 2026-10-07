// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Server-only surface, imported as `@steward-web/auth/server`. Every loader and action that
// needs identity or the gateway's sign-in imports this entry, never the client-safe
// `@steward-web/auth`.
export {
  beginTotpEnrolment,
  confirmTotpEnrolment,
  login,
  logout,
  sendLoginCode,
  verifyCode,
} from "./gatewayAuth.server";
export {
  requireIdentity,
  requireIdentityFromRequest,
  requirePermission,
  requirePermissionFromRequest,
} from "./guards.server";
export { identityFromRequest } from "./requestIdentity.server";
export { safeNext, signInAction, signInLoader, signOutAction } from "./signIn.server";
export { updateMyProfile, type UpdateMyProfileInput } from "./updateProfile.server";
