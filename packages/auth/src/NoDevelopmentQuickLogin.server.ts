// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  quickLoginAccount as RealQuickLoginAccount,
  quickLoginUsers as RealQuickLoginUsers,
} from "./developmentQuickLogin.server";

/**
 * The release build's half of the dev quick-login swap: no accounts, ever.
 * `@steward-web/vite-config`'s `chooseDevelopmentQuickLogin` aliases
 * `@steward-web/dev-quick-login.server` to this file unless the build allows the quick login,
 * so the users-file reader is never bundled into a release build.
 */
export const quickLoginUsers: typeof RealQuickLoginUsers = () => [];

export const quickLoginAccount: typeof RealQuickLoginAccount = () => {};
