// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { gatewayOrigin } from "@steward-web/api-client";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import type { QuickLoginUser } from "./signInState";

import { type AuthCallOptions, type AuthStep, login } from "./gatewayAuth.server";

/**
 * The dev quick login's accounts, for a local live build only. `@steward-web/vite-config`'s
 * `chooseDevelopmentQuickLogin` aliases `@steward-web/dev-quick-login.server` to this file
 * only for the dev server or a build made with `DEV_QUICK_LOGIN=true`; every other build gets
 * `NoDevelopmentQuickLogin.server.ts`, so this code never ships in a release image.
 *
 * At runtime it is on only with `STEWARD_DEV_QUICK_LOGIN=true`. Against steward-mock-server it
 * lists the mock's own managed people (`GET /_mock/people`) and signs one in through the
 * mock's controls; anywhere else it reads the accounts from either users source below (the
 * directory wins when both are set) and signs in through the gateway's `/auth/login`.
 * Passwords stay on the server; the page only ever gets the username, label and note.
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

/** True in a build that carries the dev quick login, so a pick that goes nowhere can say why. */
export const quickLoginBuild: boolean = true;

/**
 * Where the quick login's accounts come from, and how one signs in. The sign-in page only sees
 * the users and the step, so a source can be swapped without touching it.
 */
export interface QuickLoginSource {
  signIn: (username: string, options: AuthCallOptions) => Promise<QuickLoginStep>;
  users: () => QuickLoginUser[];
}

/** What signing in a quick-login pick came to: a gateway sign-in step, the mock refusing it
 *  with its own message, or no such account here. */
export type QuickLoginStep = { kind: "missing" } | { kind: "refused"; message: string } | AuthStep;

/** The users file or directory: each account signs in with its password at `/auth/login`. */
export const fileSource = (accounts: readonly QuickLoginAccount[]): QuickLoginSource => ({
  signIn: async (username, options) => {
    const account = accounts.find((entry) => entry.username === username);
    if (!account) return { kind: "missing" };
    return login(account.username, account.password, options);
  },
  users: () =>
    accounts.map(({ label, note, username }) => ({
      label: label ?? username,
      username,
      ...(note ? { note } : {}),
    })),
});

/** One of steward-mock-server's managed people, as `GET /_mock/people` lists them. */
interface MockPerson {
  disabled?: boolean;
  hasPassword?: boolean;
  id: string;
  name?: string;
  roles?: string[];
  secondFactor?: boolean;
  username: string;
}

const isMockPerson = (value: unknown): value is MockPerson => {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    entry.id !== "" &&
    typeof entry.username === "string" &&
    entry.username !== ""
  );
};

/** The mock's address: `STEWARD_DEV_MOCK_URL`, else the gateway's (the mock serves both). */
const mockBase = (environment: NodeJS.ProcessEnv): string =>
  (environment.STEWARD_DEV_MOCK_URL || gatewayOrigin(environment.GATEWAY_URL)).replace(/\/+$/, "");

/** How long the mock gets to answer before the quick login falls back to the users file. */
const MOCK_TIMEOUT_MS = 1500;

/** How long one look at the mock's people is reused: every page's root loader asks. */
const MOCK_REUSE_MS = 5000;
const lastLook = new Map<string, { at: number; people: MockPerson[] | undefined }>();

/** The mock's managed people, or undefined when nothing there answers as the mock. */
const mockPeople = async (base: string): Promise<MockPerson[] | undefined> => {
  const seen = lastLook.get(base);
  if (seen && Date.now() - seen.at < MOCK_REUSE_MS) return seen.people;
  const people = await lookAtMock(base);
  lastLook.set(base, { at: Date.now(), people });
  return people;
};

const lookAtMock = async (base: string): Promise<MockPerson[] | undefined> => {
  try {
    const response = await fetch(`${base}/_mock/people`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(MOCK_TIMEOUT_MS),
    });
    if (!response.ok) return undefined;
    const body: unknown = await response.json();
    return Array.isArray(body) ? body.filter((entry) => isMockPerson(entry)) : undefined;
  } catch {
    return undefined;
  }
};

/** A person's note: their roles, then what the mock will say about signing them in. */
const noteOf = (person: MockPerson): string | undefined => {
  const parts = [
    ...(person.roles ?? []),
    ...(person.disabled ? ["disabled"] : []),
    ...(person.hasPassword === false ? ["no password"] : []),
  ];
  return parts.length > 0 ? parts.join(", ") : undefined;
};

/** The relayable cookies from the mock's answer. */
const cookiesOf = (response: Response): string[] => response.headers.getSetCookie();

/**
 * steward-mock-server's managed people: listed from `GET /_mock/people`, signed in with
 * `POST /_mock/controls {"kind":"sign-in","personId"}`, which checks the stored password as
 * `/auth/login` does and skips the second factor. Its refusals (`no_password`,
 * `account_disabled`) come back with their own message.
 */
export const mockSource = (base: string, people: readonly MockPerson[]): QuickLoginSource => ({
  signIn: async (username) => {
    const person = people.find((entry) => entry.username === username);
    if (!person) return { kind: "missing" };
    let response: Response;
    try {
      response = await fetch(`${base}/_mock/controls`, {
        body: JSON.stringify({ kind: "sign-in", personId: person.id }),
        headers: { accept: "application/json", "content-type": "application/json" },
        method: "POST",
      });
    } catch {
      return { kind: "unavailable", status: 0 };
    }
    if (response.ok) return { kind: "session", setCookie: cookiesOf(response) };
    const body = (await response.json().catch(() => ({}))) as { message?: unknown };
    if (typeof body.message === "string" && body.message !== "")
      return { kind: "refused", message: body.message };
    return { kind: "unavailable", status: response.status };
  },
  users: () =>
    people.map((person) => {
      const note = noteOf(person);
      return {
        label: person.name || person.username,
        username: person.username,
        ...(note ? { note } : {}),
      };
    }),
});

/** The source in use: the mock's people when it answers, else the users file or directory. */
export const quickLoginSource = async (
  environment: NodeJS.ProcessEnv = process.env,
): Promise<QuickLoginSource | undefined> => {
  if (environment.STEWARD_DEV_QUICK_LOGIN !== "true") return undefined;
  const base = mockBase(environment);
  const people = await mockPeople(base);
  if (people) return mockSource(base, people);
  return fileSource(quickLoginAccounts(environment));
};

/** The users file or directory's accounts; none when the switch is off. */
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
export const quickLoginUsers = async (
  environment?: NodeJS.ProcessEnv,
): Promise<QuickLoginUser[]> => {
  const source = await quickLoginSource(environment);
  return source ? source.users() : [];
};

/** Signs a quick-login pick in through the source in use. */
export const quickLoginSignIn = async (
  username: string,
  options: AuthCallOptions = {},
  environment?: NodeJS.ProcessEnv,
): Promise<QuickLoginStep> => {
  const source = await quickLoginSource(environment);
  return source ? source.signIn(username, options) : { kind: "missing" };
};

/** The users file's account a pick names, with its password, or undefined. */
export const quickLoginAccount = (
  username: string,
  environment?: NodeJS.ProcessEnv,
): QuickLoginAccount | undefined =>
  quickLoginAccounts(environment).find((account) => account.username === username);
