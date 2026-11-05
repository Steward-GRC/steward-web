// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The welcome page on the server (Gates G10): who still owes first-run onboarding, and
// finishing it through the gateway's completeOnboarding.
import { afterEach, describe, expect, it, vi } from "vitest";

import { welcomeAction, welcomeLoader } from "./welcome.server";

const ORIGIN = "https://steward.example";

const erin = (needsOnboarding: boolean) => ({
  email: "erin@example.org",
  firstName: "",
  lastName: "",
  managedGroupIds: [],
  name: "erin",
  needsOnboarding,
  permissions: ["policy.read"],
  roles: [],
  scopes: { author: [] },
  userId: "u-erin",
  username: "erin",
});

/** A gateway that knows Erin by her cookie and records what reaches it. */
const gateway = (
  needsOnboarding: boolean,
  onboard: (variables: Record<string, unknown>) => Response = () =>
    Response.json({ data: { completeOnboarding: erin(false) } }),
) => {
  const calls: { operation: string; variables: Record<string, unknown> }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init: RequestInit) => {
      if (String(url).endsWith("/auth/session"))
        return Response.json({ authenticated: true, csrfToken: "t" });
      const headers = new Headers(init.headers);
      const body = JSON.parse(String(init.body ?? "{}")) as {
        query?: string;
        variables: Record<string, unknown>;
      };
      const operation = /^(?:query|mutation) (\w+)/m.exec(body.query ?? "")?.[1] ?? "";
      calls.push({ operation, variables: body.variables });
      if (!(headers.get("cookie") ?? "").includes("steward_sid")) {
        return Response.json({
          errors: [{ extensions: { code: "UNAUTHENTICATED" }, message: "signed out" }],
        });
      }
      if (operation === "Me") return Response.json({ data: { me: erin(needsOnboarding) } });
      if (operation === "CompleteOnboarding") return onboard(body.variables);
      return Response.json({ errors: [{ message: `unexpected ${operation}` }] });
    }),
  );
  return calls;
};

const signedIn = { cookie: "steward_sid=s-1" };

const post = (fields: Record<string, string>) =>
  new Request(`${ORIGIN}/welcome?next=%2Fpolicies`, {
    body: new URLSearchParams(fields),
    headers: signedIn,
    method: "POST",
  });

const stateOf = (value: unknown) => (value as { data: Record<string, unknown> }).data;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("welcomeLoader", () => {
  it("sends a signed-out visitor to sign in first", async () => {
    gateway(true);
    await expect(welcomeLoader(new Request(`${ORIGIN}/welcome`))).rejects.toMatchObject({
      headers: expect.any(Headers),
      status: 302,
    });
  });

  it("sends someone already onboarded straight on", async () => {
    gateway(false);
    const thrown = await welcomeLoader(
      new Request(`${ORIGIN}/welcome?next=%2Fpolicies`, { headers: signedIn }),
    ).catch((error: unknown) => error);
    expect((thrown as Response).headers.get("location")).toBe("/policies");
  });

  it("hands the page what the sign-in already knows about the person", async () => {
    gateway(true);
    const page = await welcomeLoader(
      new Request(`${ORIGIN}/welcome?next=%2Fpolicies`, { headers: signedIn }),
    );
    expect(page).toMatchObject({
      next: "/policies",
      person: { email: "erin@example.org", firstName: "", lastName: "", username: "erin" },
    });
  });
});

describe("welcomeAction", () => {
  it("asks for the terms to be accepted before calling the gateway", async () => {
    const calls = gateway(true);
    const result = await welcomeAction(post({ firstName: "Erin", lastName: "Example" }));
    expect(stateOf(result)).toEqual({ problem: "terms" });
    expect(calls.some((call) => call.operation === "CompleteOnboarding")).toBe(false);
  });

  it("finishes onboarding with the confirmed names and username, then goes on", async () => {
    const calls = gateway(true);
    const result = (await welcomeAction(
      post({
        acceptTerms: "on",
        firstName: " Erin ",
        lastName: "Example",
        next: "/policies",
        username: "erin",
      }),
    )) as Response;
    expect(result.status).toBe(302);
    expect(result.headers.get("location")).toBe("/policies");
    expect(calls.find((call) => call.operation === "CompleteOnboarding")?.variables).toEqual({
      acceptTerms: true,
      firstName: "Erin",
      lastName: "Example",
      username: "erin",
    });
  });

  it("says it couldn't finish when the gateway refuses", async () => {
    gateway(true, () =>
      Response.json({
        errors: [{ extensions: { code: "INVALID_ARGUMENT" }, message: "username taken" }],
      }),
    );
    const result = await welcomeAction(
      post({ acceptTerms: "on", firstName: "Erin", lastName: "Example", username: "alice" }),
    );
    expect(stateOf(result)).toEqual({ problem: "failed" });
  });
});

describe("the dev gate preview in a release build", () => {
  it("ignores ?gate=G10", async () => {
    gateway(true);
    await expect(welcomeLoader(new Request(`${ORIGIN}/welcome?gate=G10`))).rejects.toMatchObject({
      status: 302,
    });
  });
});
