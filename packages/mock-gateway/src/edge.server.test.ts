// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { mockEdge } from "./edge.server";
import { MOCK_MARKER, mockId } from "./marker";

describe("mockEdge", () => {
  it("answers me() with a mock-id persona, no network and no cookie", async () => {
    const me = await mockEdge.me();
    expect(me?.id).toContain(MOCK_MARKER);
    expect(me?.permissions.length).toBeGreaterThan(0);
  });

  it("answers diagnostics() with a mock-id trace and a mock version", async () => {
    const diagnostics = await mockEdge.diagnostics();
    expect(diagnostics.traceId).toContain(MOCK_MARKER);
    expect(diagnostics.gateway.version).toBe("mock");
  });

  it("updateMyProfile() persists the edited name for later me() calls", async () => {
    const updated = await mockEdge.updateMyProfile({ firstName: "Ada", lastName: "Lovelace" });
    expect(updated).toMatchObject({ firstName: "Ada", lastName: "Lovelace", name: "Ada Lovelace" });

    const me = await mockEdge.me();
    expect(me).toMatchObject({ firstName: "Ada", lastName: "Lovelace", name: "Ada Lovelace" });
  });

  it("categories() answers the mock-id taxonomy, no network and no cookie", async () => {
    const categories = await mockEdge.categories();
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) expect(category.id).toContain(MOCK_MARKER);
  });

  it("policies() filters the catalog to the requested document type", async () => {
    const policies = await mockEdge.policies(DocumentType.Policy);
    expect(policies.length).toBeGreaterThan(0);
    for (const policy of policies) expect(policy.documentType).toBe(DocumentType.Policy);

    const procedures = await mockEdge.policies(DocumentType.Procedure);
    expect(procedures.length).toBeGreaterThan(0);
    for (const procedure of procedures) expect(procedure.documentType).toBe(DocumentType.Procedure);
  });

  it("policyDetail() finds the reader's detail by number and document type", async () => {
    const detail = await mockEdge.policyDetail(DocumentType.Policy, "POL-FINANCE-001");
    expect(detail?.title).toBe("Expense Claims");
    expect(detail?.id).toContain(MOCK_MARKER);
  });

  it("policyDetail() answers null for a number that doesn't exist", async () => {
    expect(await mockEdge.policyDetail(DocumentType.Policy, "POL-NO-SUCH-999")).toBeNull();
  });

  it("acknowledgePolicy() records the acknowledgement, visible on the next policyDetail() read", async () => {
    const before = await mockEdge.policyDetail(DocumentType.Policy, "POL-FINANCE-001");
    const ack = await mockEdge.acknowledgePolicy(before!.currentVersionId!);
    expect(ack.acknowledged).toBe(true);
    expect(ack.ackedAt).not.toBeNull();

    const after = await mockEdge.policyDetail(DocumentType.Policy, "POL-FINANCE-001");
    expect(after?.ack?.acknowledged).toBe(true);
  });

  it("acknowledgePolicy() rejects an unknown policy version id", async () => {
    await expect(mockEdge.acknowledgePolicy("no-such-version")).rejects.toMatchObject({
      name: "GatewayError",
    });
  });

  it("breakGlassReveal() requires a non-empty reason", async () => {
    await expect(mockEdge.breakGlassReveal("some-id", "  ")).rejects.toMatchObject({
      name: "GatewayError",
    });
  });

  it("breakGlassReveal() lifts the redaction for that policy's next policyDetail() read", async () => {
    const before = await mockEdge.policyDetail(DocumentType.Policy, "POL-ITSEC-004");
    expect(before?.contentObfuscated).toBe(true);

    const grant = await mockEdge.breakGlassReveal(before!.id, "incident investigation");
    expect(new Date(grant.grantedUntil).getTime()).toBeGreaterThan(Date.now());

    const after = await mockEdge.policyDetail(DocumentType.Policy, "POL-ITSEC-004");
    expect(after?.contentObfuscated).toBe(false);
  });
});

describe("mockEdge users directory", () => {
  it("users() excludes tombstoned accounts unless includeDeleted is set", async () => {
    const live = await mockEdge.users({});
    expect(live.users.some((u) => u.userId === mockId("user", 6))).toBe(false);

    const withDeleted = await mockEdge.users({ includeDeleted: true });
    const merged = withDeleted.users.find((u) => u.userId === mockId("user", 6));
    expect(merged?.mergedIntoUserId).toBe(mockId("user", 3));
  });

  it("users() filters by an email substring", async () => {
    const page = await mockEdge.users({ search: "hopper" });
    expect(page.users.map((u) => u.userId)).toEqual([mockId("user", 2)]);
  });

  it("disableUser() refuses the protected root", async () => {
    await expect(mockEdge.disableUser(mockId("user", 1))).rejects.toMatchObject({
      code: "ROOT_PROTECTED",
    });
  });

  it("enableUser() flips a disabled account on", async () => {
    const updated = await mockEdge.enableUser(mockId("user", 4));
    expect(updated.enabled).toBe(true);
  });

  it("updateUserProfile() edits another user's name and email", async () => {
    const updated = await mockEdge.updateUserProfile(
      mockId("user", 4),
      "Meg Hamilton",
      "meg@example.com",
    );
    expect(updated).toMatchObject({ email: "meg@example.com", name: "Meg Hamilton" });
  });

  it("grantRole() then revokeRole() round-trips a global role", async () => {
    const granted = await mockEdge.grantRole(mockId("user", 2), "site-admin");
    expect(granted.roles).toContain("site-admin");

    const revoked = await mockEdge.revokeRole(mockId("user", 2), "site-admin");
    expect(revoked.roles).not.toContain("site-admin");
  });

  it("listUserSessions() then revokeUserSessions() signs the user out everywhere", async () => {
    const before = await mockEdge.listUserSessions(mockId("user", 3));
    expect(before.some((s) => !s.revokedAt)).toBe(true);

    const revokedCount = await mockEdge.revokeUserSessions(mockId("user", 3), "test");
    expect(revokedCount).toBe(before.length);

    const after = await mockEdge.listUserSessions(mockId("user", 3));
    expect(after.every((s) => s.revokedAt)).toBe(true);
  });

  it("previewUserDeletion() reports the canned, blocking preview for a fixture with one", async () => {
    const preview = await mockEdge.previewUserDeletion(mockId("user", 3));
    expect(preview.blocksDelete).toBe(true);
    expect(preview.items.some((index) => index.blocksDelete)).toBe(true);
  });

  it("previewUserDeletion() falls back to a clean preview otherwise", async () => {
    const preview = await mockEdge.previewUserDeletion(mockId("user", 2));
    expect(preview).toMatchObject({ blocksDelete: false, items: [] });
  });

  it("deleteUser() refuses while the preview blocks", async () => {
    await expect(mockEdge.deleteUser(mockId("user", 3))).rejects.toMatchObject({
      code: "DELETE_BLOCKED",
    });
  });

  it("deleteUser() soft-deletes an unblocked user and reports revoked sessions", async () => {
    const result = await mockEdge.deleteUser(mockId("user", 2));
    expect(result).toEqual({ revokedSessions: 0, userId: mockId("user", 2) });

    const page = await mockEdge.users({ includeDeleted: true });
    expect(page.users.find((u) => u.userId === mockId("user", 2))?.deletedAt).toBeTruthy();
  });
});
