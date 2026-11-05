// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type {
  quickLoginBuild as RealQuickLoginBuild,
  quickLoginSignIn as RealQuickLoginSignIn,
  quickLoginUsers as RealQuickLoginUsers,
} from "./developmentQuickLogin.server";

/**
 * The release build's half of the dev quick-login swap: no accounts, ever.
 * `@steward-web/vite-config`'s `chooseDevelopmentQuickLogin` aliases
 * `@steward-web/dev-quick-login.server` to this file unless the build allows the quick login,
 * so neither the users-file reader nor the mock's sign-in is ever bundled into a release build.
 */
export const quickLoginUsers: typeof RealQuickLoginUsers = () => Promise.resolve([]);

export const quickLoginSignIn: typeof RealQuickLoginSignIn = () =>
  Promise.resolve({ kind: "missing" });

/** A release build has no quick login, so its intent is a plain 404. */
export const quickLoginBuild: typeof RealQuickLoginBuild = false;
