// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" in a build made with `--mode mock`, "false" otherwise. Set at build time only. */
  readonly STEWARD_MOCK: "false" | "true";
}

/** The build's version, from the VERSION build argument ("dev" when unstamped). */
declare const __STEWARD_VERSION__: string;

/** The build's source commit, from the COMMIT build argument ("unknown" when unstamped). */
declare const __STEWARD_COMMIT__: string;
