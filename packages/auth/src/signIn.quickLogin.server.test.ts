import type { AddressInfo } from "node:net";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The dev quick login through the sign-in action, with the build alias pointed at the real
// accounts reader (as the dev server or a DEV_QUICK_LOGIN=true build has it), against the
// gateway-contract fake.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type FakeGateway, startFakeGateway } from "./fakeGateway.testing";
import { requireIdentityFromRequest } from "./guards.server";
import { signInAction, signInLoader } from "./signIn.server";

vi.mock("@steward-web/dev-quick-login.server", () => import("./developmentQuickLogin.server"));

const ORIGIN = "https://steward.example";
const saved: Record<string, string | undefined> = {};
let gateway: FakeGateway;
let directory: string;

beforeAll(async () => {
  gateway = await startFakeGateway([
    { password: "pw-staff", userId: "u-staff", username: "staff.sample" },
    { mfa: "challenge", password: "pw-mfa", userId: "u-mfa", username: "mfa.sample" },
  ]);
  directory = mkdtempSync(path.join(tmpdir(), "quick-login-action-"));
  const file = path.join(directory, "users.json");
  writeFileSync(
    file,
    JSON.stringify([
      { label: "Staff (sample)", password: "pw-staff", username: "staff.sample" },
      { password: "pw-mfa", username: "mfa.sample" },
    ]),
  );
  for (const key of ["GATEWAY_URL", "STEWARD_DEV_QUICK_LOGIN", "STEWARD_DEV_QUICK_LOGIN_USERS"]) {
    saved[key] = process.env[key];
  }
  process.env.GATEWAY_URL = gateway.queryUrl;
  process.env.STEWARD_DEV_QUICK_LOGIN = "true";
  process.env.STEWARD_DEV_QUICK_LOGIN_USERS = file;
});

afterAll(async () => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  rmSync(directory, { force: true, recursive: true });
  await gateway.close();
});

const pick = (username: string) =>
  new Request(`${ORIGIN}/sign-in`, {
    body: new URLSearchParams({ intent: "dev-quick-login", next: "/policies", username }),
    method: "POST",
  });

describe("dev quick login", () => {
  it("offers the file's accounts on the sign-in page, without passwords", async () => {
    const page = await signInLoader(new Request(`${ORIGIN}/sign-in`));
    expect(page.quickLoginUsers).toEqual([
      { label: "Staff (sample)", username: "staff.sample" },
      { label: "mfa.sample", username: "mfa.sample" },
    ]);
  });

  it("signs the picked account in through the gateway login and reaches a protected page", async () => {
    const response = (await signInAction(pick("staff.sample"))) as Response;
    expect(response.status).toBe(303);
    const cookie = response.headers
      .getSetCookie()
      .map((c) => c.split(";", 1)[0])
      .join("; ");
    const identity = await requireIdentityFromRequest(
      new Request(`${ORIGIN}/policies`, { headers: { cookie } }),
    );
    expect(identity.id).toBe("u-staff");
    expect(gateway.requests.some((r) => r.path === "/auth/login")).toBe(true);
  });

  it("still asks for the second factor", async () => {
    const result = await signInAction(pick("mfa.sample"));
    expect((result as { data: unknown }).data).toMatchObject({ view: "code" });
  });

  it("says the quick login isn't available for an account the server doesn't list", async () => {
    const result = (await signInAction(pick("nobody"))) as {
      data: unknown;
      init: { status: number };
    };
    expect(result.data).toEqual({ problem: "quickLoginUnavailable", view: "password" });
    expect(result.init.status).toBe(404);
  });

  it("says so too when the server switch is off", async () => {
    process.env.STEWARD_DEV_QUICK_LOGIN = "false";
    try {
      const result = (await signInAction(pick("staff.sample"))) as { data: unknown };
      expect(result.data).toEqual({ problem: "quickLoginUnavailable", view: "password" });
    } finally {
      process.env.STEWARD_DEV_QUICK_LOGIN = "true";
    }
  });

  it("shows the gateway's own refusal for a listed account it turns down", async () => {
    writeFileSync(
      path.join(directory, "users.json"),
      JSON.stringify([{ password: "stale", username: "staff.sample" }]),
    );
    const result = (await signInAction(pick("staff.sample"))) as { data: unknown };
    expect(result.data).toEqual({
      identifier: "staff.sample",
      problem: "invalid",
      view: "password",
    });
  });
});

describe("dev quick login against the mock's managed people", () => {
  it("signs the person in through the mock and moves on, or shows the mock's refusal", async () => {
    const mock = createServer((request, response) => {
      if (request.url === "/_mock/people") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end(
          JSON.stringify([
            { id: "user-bob", name: "Bob Author", username: "bob" },
            { disabled: true, id: "user-frank", name: "Frank Disabled", username: "frank" },
            { id: "user-gone", name: "Gina Gone", username: "gina" },
          ]),
        );
        return;
      }
      const chunks: Buffer[] = [];
      request.on("data", (chunk: Buffer) => chunks.push(chunk));
      request.on("end", () => {
        const { personId } = JSON.parse(Buffer.concat(chunks).toString()) as { personId: string };
        if (personId === "user-gone") {
          // The mock refuses a person it no longer has with a code and no message.
          response.writeHead(404, { "content-type": "application/json" });
          response.end(JSON.stringify({ error: "unknown_person" }));
          return;
        }
        if (personId === "user-frank") {
          response.writeHead(403, { "content-type": "application/json" });
          response.end(
            JSON.stringify({ error: "account_disabled", message: "Frank is disabled." }),
          );
          return;
        }
        response.writeHead(200, { "set-cookie": "steward_sid=sid-bob; Path=/; HttpOnly" });
        response.end("{}");
      });
    });
    await new Promise<void>((resolve) => mock.listen(0, "127.0.0.1", resolve));
    process.env.STEWARD_DEV_MOCK_URL = `http://127.0.0.1:${(mock.address() as AddressInfo).port}`;
    try {
      const page = await signInLoader(new Request(`${ORIGIN}/sign-in`));
      expect(page.quickLoginUsers.map((user) => user.label)).toEqual([
        "Bob Author",
        "Frank Disabled",
        "Gina Gone",
      ]);

      const signedIn = (await signInAction(pick("bob"))) as Response;
      expect(signedIn.status).toBe(303);
      expect(signedIn.headers.get("location")).toBe("/policies");
      expect(signedIn.headers.getSetCookie()).toEqual(["steward_sid=sid-bob; Path=/; HttpOnly"]);

      const refused = (await signInAction(pick("frank"))) as { data: unknown };
      expect(refused.data).toEqual({
        message: "Frank is disabled.",
        problem: "quickLoginRefused",
        view: "password",
      });

      // Not "Couldn't reach Steward": the mock answered, so say who and why.
      const gone = (await signInAction(pick("gina"))) as { data: unknown };
      expect(gone.data).toEqual({
        code: "unknown_person",
        name: "Gina Gone",
        problem: "quickLoginRefused",
        view: "password",
      });
    } finally {
      delete process.env.STEWARD_DEV_MOCK_URL;
      await new Promise((resolve) => mock.close(resolve));
    }
  });
});
