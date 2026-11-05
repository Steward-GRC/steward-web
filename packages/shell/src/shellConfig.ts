// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
/** The install settings the shell shows, read on the server by `shellConfigFromEnvironment`. */
export interface ShellConfig {
  /** Where the header's Admin link goes. */
  adminUrl: string;
  /** Where the header's Docs link goes. */
  docsUrl: string;
  /** A non-production environment's name for the banner (H4), or null in production. */
  environment: null | string;
  /** The organisation's name for the header slot and the footer, or null when none is set. */
  organisation: null | string;
  /** Where the admin header's Staff link goes back to. */
  staffUrl: string;
}
