// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Server-only surface, imported as `@steward-web/auth/server`. Every loader and action that
// needs identity or Kratos imports this entry, never the client-safe `@steward-web/auth`.
export {
  requireIdentity,
  requireIdentityFromRequest,
  requirePermission,
  requirePermissionFromRequest,
} from "./guards.server";
export { fetchLoginFlow, KratosError, submitLogin } from "./kratosClient.server";
export { identityFromRequest } from "./requestIdentity.server";
export { updateMyProfile, type UpdateMyProfileInput } from "./updateProfile.server";
