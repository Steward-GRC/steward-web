// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import shared from "@bugs5382/node-oxlint-config/oxfmt";

// The shared Prettier-compatible settings, at this repo's 100-column width.
export default {
  ...shared,
  ignorePatterns: [
    ...shared.ignorePatterns,
    "**/dist/**",
    "**/build/**",
    "**/coverage/**",
    "**/.react-router/**",
    "packages/api-client/schema/**",
    "packages/editor/src/generated/**",
    "pnpm-lock.yaml",
    ".github/**",
    ".claude/**",
    "packages/editor/src/koenig-lexical/**",
    "packages/editor/src/kg-default-nodes/**",
    "packages/editor/src/kg-default-transforms/**",
    "packages/editor/tailwind.config.cjs",
    "CLAUDE.md",
  ],
  printWidth: 100,
};
