// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ShellConfig } from "./shellConfig";

const DEFAULT_DOCS_URL = "https://steward-grc.com";
const DEFAULT_ADMIN_URL = "/admin";
const DEFAULT_STAFF_URL = "/";
const PRODUCTION = new Set(["prod", "production"]);

const setting = (value: string | undefined): null | string => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

/**
 * The shell's install settings, from the server's environment:
 *
 * - `STEWARD_ENVIRONMENT` names a non-production environment for the banner (H4): "test",
 *   "training"… Unset, or "production", shows no banner.
 * - `STEWARD_ORGANISATION` is the organisation's name for the header slot and the footer.
 * - `STEWARD_DOCS_URL`, `STEWARD_ADMIN_URL` and `STEWARD_STAFF_URL` are where Docs, the staff
 *   header's Admin and the admin header's Staff go.
 */
export const shellConfigFromEnvironment = (
  environment: NodeJS.ProcessEnv = process.env,
): ShellConfig => {
  const name = setting(environment.STEWARD_ENVIRONMENT);
  return {
    adminUrl: setting(environment.STEWARD_ADMIN_URL) ?? DEFAULT_ADMIN_URL,
    docsUrl: setting(environment.STEWARD_DOCS_URL) ?? DEFAULT_DOCS_URL,
    environment: name && !PRODUCTION.has(name.toLowerCase()) ? name : null,
    organisation: setting(environment.STEWARD_ORGANISATION),
    staffUrl: setting(environment.STEWARD_STAFF_URL) ?? DEFAULT_STAFF_URL,
  };
};
