// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { QuickLoginUser } from "./signInState";

/**
 * The dev quick login's accounts, for a local live build only. `@steward-web/vite-config`'s
 * `chooseDevelopmentQuickLogin` aliases `@steward-web/dev-quick-login.server` to this file
 * only for the dev server or a build made with `DEV_QUICK_LOGIN=true`; every other build gets
 * `NoDevelopmentQuickLogin.server.ts`, so this code never ships in a release image.
 *
 * At runtime it is on only with `STEWARD_DEV_QUICK_LOGIN=true`, and reads the accounts from
 * either source below (the directory wins when both are set). The passwords stay on the
 * server; the page only ever gets the username, label and note.
 *
 * - `STEWARD_DEV_QUICK_LOGIN_USERS_DIR`: a directory with one JSON-object account per file
 *   (`{ username, password, label?, note? }`), the shape a Kubernetes Secret volume mounts —
 *   one key per account, each key its own file, plus `..data` and a dated subdirectory kubelet
 *   manages; both are skipped by their leading `..`.
 * - `STEWARD_DEV_QUICK_LOGIN_USERS`: one JSON file holding an array of the same account shape,
 *   for a local run outside a cluster.
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

/** One account per file in a Secret-volume-shaped directory; a bad or missing directory is empty. */
const accountsFromDirectory = (directory: string): QuickLoginAccount[] => {
  try {
    return readdirSync(directory)
      .filter((name) => !name.startsWith(".."))
      .map((name): unknown => {
        try {
          return JSON.parse(readFileSync(path.join(directory, name), "utf8"));
        } catch {
          return undefined;
        }
      })
      .filter((entry): entry is QuickLoginAccount => isAccount(entry));
  } catch {
    return [];
  }
};

/** One array's worth of accounts from a single JSON file; a bad or missing file is empty. */
const accountsFromFile = (file: string): QuickLoginAccount[] => {
  try {
    const parsed: unknown = JSON.parse(readFileSync(file, "utf8"));
    return Array.isArray(parsed) ? parsed.filter((entry) => isAccount(entry)) : [];
  } catch {
    return [];
  }
};

/** Every valid account, from whichever source is configured; none when the switch is off. */
export const quickLoginAccounts = (
  environment: NodeJS.ProcessEnv = process.env,
): QuickLoginAccount[] => {
  if (environment.STEWARD_DEV_QUICK_LOGIN !== "true") return [];
  const directory = environment.STEWARD_DEV_QUICK_LOGIN_USERS_DIR;
  if (directory) return accountsFromDirectory(directory);
  const file = environment.STEWARD_DEV_QUICK_LOGIN_USERS;
  return file ? accountsFromFile(file) : [];
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
