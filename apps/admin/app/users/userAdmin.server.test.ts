// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { OverrideEffect } from "@steward-web/api-client";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  actAsUser,
  generatePassword,
  listUserFactors,
  makeRoot,
  reassignPolicies,
  removeUserFactor,
  renameUserFactor,
  resendWelcome,
  resetPassword,
  sendStepUpCode,
  setPolicyException,
} from "./userAdmin.server";

const ALICE = {
  email: "alice@example.org",
  managedGroupIds: [],
  name: "Alice",
  permissions: ["user.manage", "session.manage"],
  roles: ["site-admin"],
  userId: "mock-user-alice",
  username: "alice",
};

const READER = { ...ALICE, permissions: [], roles: [] };

interface Call {
  operation: string;
  variables: Record<string, unknown>;
}

const gateway = (identity: object, answers: Record<string, unknown>) => {
  const calls: Call[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string) as {
        query: string;
        variables: Record<string, unknown>;
      };
      const operation = /(?:query|mutation) (\w+)/.exec(body.query)![1]!;
      if (operation === "Me") return Response.json({ data: { me: identity } });
      calls.push({ operation, variables: body.variables });
      if (!(operation in answers)) throw new Error(`unexpected ${operation}`);
      return Response.json({ data: answers[operation] });
    }),
  );
  return calls;
};

const request = () =>
  new Request("https://admin.steward.example/users/mock-user-erin", { method: "POST" });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the user detail's admin actions", () => {
  it("refuses someone who can't manage users", async () => {
    gateway(READER, {});
    const thrown: unknown = await listUserFactors(request(), "mock-user-erin").catch(
      (error: unknown) => error,
    );
    expect(thrown).toBeInstanceOf(Response);
  });

  it("lists, renames and resets a user's second factors (A18)", async () => {
    const factors = [{ enrolledAt: "2026-10-02T09:00:00Z", id: "totp", kind: "totp", label: "" }];
    const calls = gateway(ALICE, {
      RemoveUserMfaFactor: { removeUserMfaFactor: true },
      RenameUserMfaFactor: { renameUserMfaFactor: true },
      UserFactors: { userFactors: factors },
    });
    expect(await listUserFactors(request(), "mock-user-erin")).toEqual(factors);
    await renameUserFactor(request(), "mock-user-erin", "totp", "Work phone");
    await removeUserFactor(request(), "mock-user-erin", "totp");
    expect(calls.slice(-2).map((call) => call.variables)).toEqual([
      { label: "Work phone", methodId: "totp", userId: "mock-user-erin" },
      { methodId: "totp", userId: "mock-user-erin" },
    ]);
  });

  it("generates a strong password and sets it, handing it back once (A17, D24)", async () => {
    const calls = gateway(ALICE, { ResetUserPassword: { resetUserPassword: true } });
    const password = await resetPassword(request(), "mock-user-erin");
    expect(password).toHaveLength(20);
    expect(calls.at(-1)?.variables).toEqual({ newPassword: password, userId: "mock-user-erin" });
    expect(generatePassword()).not.toBe(generatePassword());
  });

  it("sends the welcome email again", async () => {
    const calls = gateway(ALICE, { ResendWelcomeEmail: { resendWelcomeEmail: true } });
    await resendWelcome(request(), "mock-user-erin");
    expect(calls.at(-1)?.operation).toBe("ResendWelcomeEmail");
  });

  it("sets and clears a per-policy exception (A19)", async () => {
    const calls = gateway(ALICE, { SetUserPolicyOverride: { setUserPolicyOverride: {} } });
    await setPolicyException(request(), "mock-user-erin", "POL-TRAVEL-000001", OverrideEffect.Deny);
    await setPolicyException(request(), "mock-user-erin", "POL-TRAVEL-000001", null);
    expect(calls.slice(-2).map((call) => call.variables.effect)).toEqual(["DENY", null]);
  });

  it("starts acting as the user with the reason, and sends the admin to staff (D19)", async () => {
    const calls = gateway(ALICE, {
      StartImpersonation: {
        startImpersonation: {
          expiresAt: "2026-11-05T10:30:00Z",
          targetName: "Erin",
          targetUserId: "mock-user-erin",
        },
      },
    });
    await actAsUser(request(), "mock-user-erin", "  Erin can't see Travel.  ");
    expect(calls.at(-1)?.variables).toEqual({
      reason: "Erin can't see Travel.",
      userId: "mock-user-erin",
    });
  });

  it("refuses to act as someone without a reason", async () => {
    gateway(ALICE, {});
    await expect(actAsUser(request(), "mock-user-erin", " ")).rejects.toThrow();
  });

  it("emails a step-up code, then makes the user root with it (D22, D18)", async () => {
    const calls = gateway(ALICE, {
      GrantRoot: { grantRoot: { userId: "mock-user-grace" } },
      RequestStepUpOtp: { requestStepUpOtp: true },
    });
    await sendStepUpCode(request());
    await makeRoot(request(), "mock-user-grace", "482113");
    expect(calls.slice(-2)).toEqual([
      { operation: "RequestStepUpOtp", variables: {} },
      { operation: "GrantRoot", variables: { otp: "482113", userId: "mock-user-grace" } },
    ]);
  });

  it("moves a user's policies to someone else before a delete (D20)", async () => {
    const calls = gateway(ALICE, {
      ReassignUserPolicies: {
        reassignUserPolicies: { reassignedAuthorGrants: 1, reassignedOwnerCount: 3 },
      },
    });
    await reassignPolicies(request(), "mock-user-carol", "mock-user-dave");
    expect(calls.at(-1)?.variables).toEqual({
      fromUserId: "mock-user-carol",
      toUserId: "mock-user-dave",
    });
  });
});
