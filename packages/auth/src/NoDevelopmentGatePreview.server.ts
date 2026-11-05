// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { signInPreview as RealSignInPreview } from "./developmentGatePreview.server";

/**
 * The release build's half of the dev gate preview swap: no previews, ever.
 * `@steward-web/vite-config`'s `chooseDevelopmentQuickLogin` aliases
 * `@steward-web/dev-gate-preview.server` to this file unless the build allows the dev tools, so
 * the preview's sample gates never reach a release build.
 */
export const signInPreview: typeof RealSignInPreview = () => {};
