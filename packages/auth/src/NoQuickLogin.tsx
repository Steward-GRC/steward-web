// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { QuickLoginProps } from "./QuickLogin";

/**
 * The release build's half of the dev quick-login swap: nothing.
 * `@steward-web/vite-config`'s `chooseDevelopmentQuickLogin` aliases
 * `@steward-web/dev-quick-login` to this file unless the build allows the quick login, so the
 * picker's code (and its marker string) is never bundled into a release build.
 */
export const QuickLogin: (props: QuickLoginProps) => null = () => null;
