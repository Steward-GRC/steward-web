// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { quickLoginAccount, quickLoginUsers } from "./developmentQuickLogin.server";

let directory: string | undefined;

afterEach(() => {
  if (directory) rmSync(directory, { force: true, recursive: true });
  directory = undefined;
});

const usersFile = (content: string): string => {
  directory = mkdtempSync(path.join(tmpdir(), "quick-login-"));
  const file = path.join(directory, "users.json");
  writeFileSync(file, content);
  return file;
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
