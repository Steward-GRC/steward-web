// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The dev quick login through the sign-in action, with the build alias pointed at the real
// accounts reader (as the dev server or a DEV_QUICK_LOGIN=true build has it), against the
// gateway-contract fake.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

  it("answers 404 for an account the file doesn't list", async () => {
    await expect(signInAction(pick("nobody"))).rejects.toMatchObject({ status: 404 });
  });
});
