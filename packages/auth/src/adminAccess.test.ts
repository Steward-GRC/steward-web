// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from "vitest";

import { canOpenAdmin } from "./adminAccess";
import { identityFromMe, NO_ACCESS } from "./identity";

const person = (roles: string[], permissions: string[], managedGroupIds: string[] = []) =>
  identityFromMe({
    email: "erin@example.org",
    firstName: "Erin",
    id: "u-erin",
    lastName: "Reader",
    managedGroupIds,
    name: "Erin Reader",
    permissions,
    roles,
    username: "erin",
  });

describe("canOpenAdmin", () => {
  it("lets in site, template and compliance admins and group managers", () => {
    expect(canOpenAdmin(person(["site-admin"], []))).toBe(true);
    expect(canOpenAdmin(person([], ["template.manage"]))).toBe(true);
    expect(canOpenAdmin(person([], ["audit.read"]))).toBe(true);
    expect(canOpenAdmin(person([], ["policy.read"], ["g-1"]))).toBe(true);
  });

  it("keeps out a reader, and anyone signed out", () => {
    expect(canOpenAdmin(person([], ["policy.read", "policy.ack"]))).toBe(false);
    expect(canOpenAdmin(NO_ACCESS)).toBe(false);
  });
});

describe("identityFromMe", () => {
  it("carries whether first-run onboarding is still owed, false when the gateway doesn't say", () => {
    expect(person([], []).needsOnboarding).toBe(false);
    expect(
      identityFromMe({ ...person([], []), id: "u-1", needsOnboarding: true, permissions: [] })
        .needsOnboarding,
    ).toBe(true);
  });
});
