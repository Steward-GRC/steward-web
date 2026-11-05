import type { AddressInfo } from "node:net";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  quickLoginAccount,
  quickLoginSignIn,
  quickLoginUsers,
} from "./developmentQuickLogin.server";

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
  it("lists the file's accounts without their passwords", async () => {
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: usersFile(accounts),
    };
    expect(await quickLoginUsers(environment)).toEqual([
      { label: "Staff (sample)", note: "no second factor", username: "staff.sample" },
      { label: "approver.sample", username: "approver.sample" },
    ]);
    expect(JSON.stringify(quickLoginUsers(environment))).not.toContain("pw-");
  });

  it("is off without the server switch, without a file, or for a malformed one", async () => {
    const file = usersFile(accounts);
    expect(await quickLoginUsers({ STEWARD_DEV_QUICK_LOGIN_USERS: file })).toEqual([]);
    expect(await quickLoginUsers({ STEWARD_DEV_QUICK_LOGIN: "true" })).toEqual([]);
    expect(
      await quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS: usersFile("{not json"),
      }),
    ).toEqual([]);
    expect(
      await quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS: "/nonexistent/users.json",
      }),
    ).toEqual([]);
  });
});

describe("quickLoginAccount", () => {
  it("finds a listed account with its password, and nothing else", async () => {
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: usersFile(accounts),
    };
    expect(await quickLoginAccount("approver.sample", environment)).toEqual({
      password: "pw-2",
      username: "approver.sample",
    });
    expect(await quickLoginAccount("broken.sample", environment)).toBeUndefined();
    expect(await quickLoginAccount("nobody", environment)).toBeUndefined();
  });
});

describe("quickLoginAccounts from a Secret-volume directory", () => {
  it("lists one account per mounted key, ignoring the Kubernetes bookkeeping entries", async () => {
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
    expect(await quickLoginUsers(environment)).toEqual(
      expect.arrayContaining([
        { label: "Site admin", username: "site-admin.sample" },
        { label: "Staff", username: "staff.sample" },
      ]),
    );
    expect(await quickLoginUsers(environment)).toHaveLength(2);
    expect(await quickLoginAccount("site-admin.sample", environment)).toEqual({
      label: "Site admin",
      password: "pw-admin",
      username: "site-admin.sample",
    });
  });

  it("takes the directory over the single-file variable when both are set", async () => {
    const directory = usersSecretDirectory({
      staff: JSON.stringify({ password: "pw-staff", username: "staff.sample" }),
    });
    const environment = {
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: usersFile(accounts),
      STEWARD_DEV_QUICK_LOGIN_USERS_DIR: directory,
    };
    expect(await quickLoginUsers(environment)).toEqual([
      { label: "staff.sample", username: "staff.sample" },
    ]);
  });

  it("is off for a missing directory or one with no usable entries", async () => {
    expect(
      await quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS_DIR: "/nonexistent/dev-users",
      }),
    ).toEqual([]);
    const directory = usersSecretDirectory({ broken: "{not json" });
    expect(
      await quickLoginUsers({
        STEWARD_DEV_QUICK_LOGIN: "true",
        STEWARD_DEV_QUICK_LOGIN_USERS_DIR: directory,
      }),
    ).toEqual([]);
  });
});

/**
 * steward-mock-server's managed people, as its `/_mock` controls will answer them: the people
 * list (never a password) and the sign-in control, which refuses with `{ error, message }`.
 */
const people = [
  {
    email: "bob@example.org",
    hasPassword: true,
    id: "user-bob",
    name: "Bob Author",
    roles: ["author"],
    secondFactor: false,
    username: "bob",
  },
  {
    email: "frank@example.org",
    disabled: true,
    hasPassword: true,
    id: "user-frank",
    name: "Frank Disabled",
    roles: [],
    secondFactor: false,
    username: "frank",
  },
  {
    email: "nora@example.org",
    hasPassword: false,
    id: "user-nora",
    name: "Nora New",
    roles: [],
    secondFactor: false,
    username: "nora",
  },
  // Refusals without a message: a person the mock no longer has, the mock down for a moment,
  // and an answer it gives no reason for.
  { id: "user-gone", name: "Gina Gone", username: "gina" },
  { id: "user-busy", name: "Bruno Busy", username: "bruno" },
  { id: "user-odd", name: "Olly Odd", username: "olly" },
];

let mock: Server;
let mockUrl: string;
const signIns: unknown[] = [];

const readJson = async (request: IncomingMessage): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString() || "{}") as Record<string, unknown>;
};

beforeAll(async () => {
  mock = createServer((request, response) => {
    void (async () => {
      if (request.method === "GET" && request.url === "/_mock/people") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(people));
        return;
      }
      if (request.method === "POST" && request.url === "/_mock/controls") {
        const body = await readJson(request);
        signIns.push(body);
        const answer = (status: number, json: unknown, headers: Record<string, string> = {}) => {
          response.writeHead(status, { "content-type": "application/json", ...headers });
          response.end(JSON.stringify(json));
        };
        if (body.personId === "user-frank")
          return answer(403, { error: "account_disabled", message: "Frank Disabled is disabled." });
        if (body.personId === "user-nora")
          return answer(409, { error: "no_password", message: "Nora New has no password yet." });
        if (body.personId === "user-gone") return answer(404, { error: "unknown_person" });
        if (body.personId === "user-busy") return answer(503, { error: "unavailable" });
        if (body.personId === "user-odd") return answer(500, {});
        return answer(200, { ok: true }, { "set-cookie": "steward_sid=sid-bob; Path=/; HttpOnly" });
      }
      response.writeHead(404);
      response.end();
    })();
  });
  await new Promise<void>((resolve) => mock.listen(0, "127.0.0.1", resolve));
  mockUrl = `http://127.0.0.1:${(mock.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise((resolve) => mock.close(resolve));
});

/** A dev server pointed at the fake mock, with the quick login switched on. */
const environment = () => ({ GATEWAY_URL: `${mockUrl}/query`, STEWARD_DEV_QUICK_LOGIN: "true" });

describe("the mock's managed people", () => {
  it("lists the mock's people by name when the gateway is the mock, never a password", async () => {
    expect(await quickLoginUsers(environment())).toEqual([
      { label: "Bob Author", note: "author", username: "bob" },
      { label: "Frank Disabled", note: "disabled", username: "frank" },
      { label: "Nora New", note: "no password", username: "nora" },
      { label: "Gina Gone", username: "gina" },
      { label: "Bruno Busy", username: "bruno" },
      { label: "Olly Odd", username: "olly" },
    ]);
  });

  it("takes the mock's people over a users file", async () => {
    const file = usersFile(accounts);
    const users = await quickLoginUsers({ ...environment(), STEWARD_DEV_QUICK_LOGIN_USERS: file });
    expect(users.map((user) => user.username)).toEqual([
      "bob",
      "frank",
      "nora",
      "gina",
      "bruno",
      "olly",
    ]);
  });

  it("finds the mock at STEWARD_DEV_MOCK_URL when the gateway is elsewhere", async () => {
    const users = await quickLoginUsers({
      GATEWAY_URL: "http://127.0.0.1:1/query",
      STEWARD_DEV_MOCK_URL: mockUrl,
      STEWARD_DEV_QUICK_LOGIN: "true",
    });
    expect(users).toHaveLength(6);
  });

  it("falls back to the users file when nothing answers as the mock", async () => {
    const file = usersFile(accounts);
    const users = await quickLoginUsers({
      GATEWAY_URL: `${mockUrl}/elsewhere/query`,
      STEWARD_DEV_QUICK_LOGIN: "true",
      STEWARD_DEV_QUICK_LOGIN_USERS: file,
    });
    expect(users.map((user) => user.username)).toContain("approver.sample");
  });

  it("signs a person in through the mock's control and hands back its cookie", async () => {
    signIns.length = 0;
    expect(await quickLoginSignIn("bob", {}, environment())).toEqual({
      kind: "session",
      setCookie: ["steward_sid=sid-bob; Path=/; HttpOnly"],
    });
    expect(signIns).toEqual([{ kind: "sign-in", personId: "user-bob" }]);
  });

  it("hands back the mock's own message when it refuses", async () => {
    expect(await quickLoginSignIn("frank", {}, environment())).toEqual({
      kind: "refused",
      message: "Frank Disabled is disabled.",
    });
    expect(await quickLoginSignIn("nora", {}, environment())).toEqual({
      kind: "refused",
      message: "Nora New has no password yet.",
    });
  });

  it("names the person and the mock's reason when it refuses without a message", async () => {
    expect(await quickLoginSignIn("gina", {}, environment())).toEqual({
      code: "unknown_person",
      kind: "refused",
      name: "Gina Gone",
    });
    expect(await quickLoginSignIn("olly", {}, environment())).toEqual({
      kind: "refused",
      name: "Olly Odd",
    });
  });

  it("calls only a mock that is down or can't answer unreachable", async () => {
    expect(await quickLoginSignIn("bruno", {}, environment())).toEqual({
      kind: "unavailable",
      status: 503,
    });
  });

  it("knows nobody the mock doesn't list, and nobody at all with the switch off", async () => {
    expect(await quickLoginSignIn("ghost", {}, environment())).toEqual({ kind: "missing" });
    expect(await quickLoginSignIn("bob", {}, { GATEWAY_URL: `${mockUrl}/query` })).toEqual({
      kind: "missing",
    });
  });
});
