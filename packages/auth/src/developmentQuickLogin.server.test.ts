// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { quickLoginAccount, quickLoginUsers } from "./developmentQuickLogin.server";

let directory: string | undefined;
let secretDirectory: string | undefined;

afterEach(() => {
  if (directory) rmSync(directory, { force: true, recursive: true });
  if (secretDirectory) rmSync(secretDirectory, { force: true, recursive: true });
  directory = undefined;
  secretDirectory = undefined;
});

const usersFile = (content: string): string => {
  directory = mkdtempSync(path.join(tmpdir(), "quick-login-"));
  const file = path.join(directory, "users.json");
  writeFileSync(file, content);
  return file;
};

/**
 * A Kubernetes Secret volume mount, one key per account: a `..data` symlinked subdirectory
 * holding the real files, and a top-level symlink per key pointing into it (the shape
 * `kubelet` creates). `quickLoginAccounts` reads the top-level entries only.
 */
const usersSecretDirectory = (accountsByKey: Record<string, string>): string => {
  secretDirectory = mkdtempSync(path.join(tmpdir(), "quick-login-secret-"));
  const dataDirectory = path.join(secretDirectory, "..2026_01_01");
  mkdirSync(dataDirectory);
  for (const [key, content] of Object.entries(accountsByKey)) {
    writeFileSync(path.join(dataDirectory, key), content);
    symlinkSync(path.join("..2026_01_01", key), path.join(secretDirectory, key));
  }
  symlinkSync("..2026_01_01", path.join(secretDirectory, "..data"));
  return secretDirectory;
};

const accounts = JSON.stringify([
  { label: "Staff (sample)", note: "no second factor", password: "pw-1", username: "staff.sample" },
  { password: "pw-2", username: "approver.sample" },
  { password: 7, username: "broken.sample" },
]);

describe("quickLoginUsers", () => {
  it("lists the file's accounts without their passwords", () => {
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: usersFile(accounts),
    };
    expect(quickLoginUsers(environment)).toEqual([
      { label: "Staff (sample)", note: "no second factor", username: "staff.sample" },
      { label: "approver.sample", username: "approver.sample" },
    ]);
    expect(JSON.stringify(quickLoginUsers(environment))).not.toContain("pw-");
  });

  it("is off without the server switch, without a file, or for a malformed one", () => {
    const file = usersFile(accounts);
    expect(quickLoginUsers({ STEWARD_DEV_QUICK_LOGIN_USERS: file })).toEqual([]);
    expect(quickLoginUsers({ STEWARD_DEV_QUICK_LOGIN: "true" })).toEqual([]);
    expect(
      quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS: usersFile("{not json"),
      }),
    ).toEqual([]);
    expect(
      quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS: "/nonexistent/users.json",
      }),
    ).toEqual([]);
  });
});

describe("quickLoginAccount", () => {
  it("finds a listed account with its password, and nothing else", () => {
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: usersFile(accounts),
    };
    expect(quickLoginAccount("approver.sample", environment)).toEqual({
      password: "pw-2",
      username: "approver.sample",
    });
    expect(quickLoginAccount("broken.sample", environment)).toBeUndefined();
    expect(quickLoginAccount("nobody", environment)).toBeUndefined();
  });
});

describe("quickLoginAccounts from a Secret-volume directory", () => {
  it("lists one account per mounted key, ignoring the Kubernetes bookkeeping entries", () => {
    const directory = usersSecretDirectory({
      "site-admin": JSON.stringify({
        label: "Site admin",
        password: "pw-admin",
        username: "site-admin.sample",
      }),
      staff: JSON.stringify({ label: "Staff", password: "pw-staff", username: "staff.sample" }),
    });
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS_DIR: directory,
    };
    expect(quickLoginUsers(environment)).toEqual(
      expect.arrayContaining([
        { label: "Site admin", username: "site-admin.sample" },
        { label: "Staff", username: "staff.sample" },
      ]),
    );
    expect(quickLoginUsers(environment)).toHaveLength(2);
    expect(quickLoginAccount("site-admin.sample", environment)).toEqual({
      label: "Site admin",
      password: "pw-admin",
      username: "site-admin.sample",
    });
  });

  it("takes the directory over the single-file variable when both are set", () => {
    const directory = usersSecretDirectory({
      staff: JSON.stringify({ password: "pw-staff", username: "staff.sample" }),
    });
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: usersFile(accounts),
      STEWARD_DEV_QUICK_LOGIN_USERS_DIR: directory,
    };
    expect(quickLoginUsers(environment)).toEqual([
      { label: "staff.sample", username: "staff.sample" },
    ]);
  });

  it("is off for a missing directory or one with no usable entries", () => {
    expect(
      quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS_DIR: "/nonexistent/dev-users",
      }),
    ).toEqual([]);
    const directory = usersSecretDirectory({ broken: "{not json" });
    expect(
      quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS_DIR: directory,
      }),
    ).toEqual([]);
  });
});
