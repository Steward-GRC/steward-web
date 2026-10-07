// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from "node:fs";

import type { QuickLoginUser } from "./signInState";

/**
 * The dev quick login's accounts, for a local live build only. `@steward-web/vite-config`'s
 * `chooseDevelopmentQuickLogin` aliases `@steward-web/dev-quick-login.server` to this file
 * only for the dev server or a build made with `DEV_QUICK_LOGIN=true`; every other build gets
 * `NoDevelopmentQuickLogin.server.ts`, so this code never ships in a release image.
 *
 * At runtime it is on only with `STEWARD_DEV_QUICK_LOGIN=true`, and reads the accounts from
 * the JSON file `STEWARD_DEV_QUICK_LOGIN_USERS` names: an array of `{ username, password,
 * label?, note? }`. The passwords stay on the server; the page only ever gets the username,
 * label and note.
 */

export interface QuickLoginAccount {
  label?: string;
  note?: string;
  password: string;
  username: string;
}

const isAccount = (value: unknown): value is QuickLoginAccount => {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.username === "string" &&
    entry.username !== "" &&
    typeof entry.password === "string" &&
    (entry.label === undefined || typeof entry.label === "string") &&
    (entry.note === undefined || typeof entry.note === "string")
  );
};

/** Every valid account in the users file; none when the switch is off or the file is unusable. */
export const quickLoginAccounts = (
  environment: NodeJS.ProcessEnv = process.env,
): QuickLoginAccount[] => {
  if (environment.STEWARD_DEV_QUICK_LOGIN !== "true") return [];
  const file = environment.STEWARD_DEV_QUICK_LOGIN_USERS;
  if (!file) return [];
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((entry) => isAccount(entry)) : [];
  } catch {
    return [];
  }
};

/** What the sign-in page may show: never a password. */
export const quickLoginUsers = (environment?: NodeJS.ProcessEnv): QuickLoginUser[] =>
  quickLoginAccounts(environment).map(({ label, note, username }) => ({
    label: label ?? username,
    username,
    ...(note ? { note } : {}),
  }));

/** The account a quick-login pick names, with its password, or undefined. */
export const quickLoginAccount = (
  username: string,
  environment?: NodeJS.ProcessEnv,
): QuickLoginAccount | undefined =>
  quickLoginAccounts(environment).find((account) => account.username === username);
