// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, ReviewCadence } from "@steward-web/api-client";
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

  it("groupChildren() lists the fixture's root and its direct children", async () => {
    const roots = await mockEdge.groupChildren(null);
    const root = roots.find((g) => g.name === "Meridian Holdings");
    expect(root).toBeDefined();
    const children = await mockEdge.groupChildren(root!.id);
    expect(children.map((g) => g.name)).toEqual(["IT Security"]);
  });

  it("createGroup() refuses a duplicate slug under the same parent", async () => {
    await expect(
      mockEdge.createGroup({
        name: "Meridian Holdings",
        parentId: null,
        slug: "meridian-holdings",
      }),
    ).rejects.toMatchObject({ code: "ALREADY_EXISTS" });
  });

  it("createGroup(), renameGroup() and deleteGroup() manage an isolated new tree", async () => {
    const root = await mockEdge.createGroup({ name: "Acme", parentId: null, slug: "acme" });
    const child = await mockEdge.createGroup({ name: "Ops", parentId: root.id, slug: "ops" });
    const rootChildren = await mockEdge.groupChildren(root.id);
    expect(rootChildren.map((g) => g.id)).toEqual([child.id]);

    const renamed = await mockEdge.renameGroup(child.id, "Operations", "operations");
    expect(renamed).toMatchObject({ name: "Operations", slug: "operations" });

    await mockEdge.deleteGroup(root.id);
    expect(await mockEdge.groupChildren(root.id)).toEqual([]);
    const roots = await mockEdge.groupChildren(null);
    expect(roots.map((g) => g.id)).not.toContain(root.id);
  });

  it("moveGroup() refuses moving a group under its own descendant", async () => {
    const root = await mockEdge.createGroup({
      name: "Cycle root",
      parentId: null,
      slug: "cycle-root",
    });
    const child = await mockEdge.createGroup({
      name: "Cycle child",
      parentId: root.id,
      slug: "cycle-child",
    });
    await expect(mockEdge.moveGroup(root.id, child.id)).rejects.toMatchObject({
      code: "INVALID_ARGUMENT",
    });
  });

  it("moveGroup() refuses a move that would exceed the max depth", async () => {
    const root = await mockEdge.createGroup({
      name: "Depth root",
      parentId: null,
      slug: "depth-root",
    });
    const level2 = await mockEdge.createGroup({
      name: "Depth 2",
      parentId: root.id,
      slug: "depth-2",
    });
    const level3 = await mockEdge.createGroup({
      name: "Depth 3",
      parentId: level2.id,
      slug: "depth-3",
    });
    const level4 = await mockEdge.createGroup({
      name: "Depth 4",
      parentId: level3.id,
      slug: "depth-4",
    });
    const other = await mockEdge.createGroup({ name: "Other", parentId: null, slug: "other" });
    await expect(mockEdge.moveGroup(other.id, level4.id)).rejects.toMatchObject({
      code: "FAILED_PRECONDITION",
    });
  });

  it("moveGroup() re-parents a group to the top level", async () => {
    const root = await mockEdge.createGroup({
      name: "Move root",
      parentId: null,
      slug: "move-root",
    });
    const child = await mockEdge.createGroup({
      name: "Move child",
      parentId: root.id,
      slug: "move-child",
    });
    const moved = await mockEdge.moveGroup(child.id, null);
    expect(moved.parentId).toBeNull();
  });

  it("updateGroupSettings() persists defaults and governance", async () => {
    const group = await mockEdge.createGroup({
      name: "Settings",
      parentId: null,
      slug: "settings",
    });
    const updated = await mockEdge.updateGroupSettings({
      defaultTemplateNone: true,
      id: group.id,
      owners: [mockId("user", 2)],
      reviewCadence: ReviewCadence.Annual,
    });
    expect(updated).toMatchObject({
      defaultTemplateId: null,
      defaultTemplateNone: true,
      owners: [mockId("user", 2)],
      reviewCadence: ReviewCadence.Annual,
    });
  });

  it("templates() and workflows() answer the fixture lists", async () => {
    const templates = await mockEdge.templates();
    const workflows = await mockEdge.workflows();
    expect(templates.length).toBeGreaterThan(0);
    expect(workflows.length).toBeGreaterThan(0);
  });
});

describe("mockEdge organisations directory", () => {
  it("organizations() lists the fixture connections", async () => {
    const orgs = await mockEdge.organizations();
    expect(orgs.some((o) => o.domain === "partner.example.net")).toBe(true);
  });

  it("addOrganization() refuses a domain that's already registered", async () => {
    await expect(
      mockEdge.addOrganization({
        domain: "partner.example.net",
        orgName: "Partner Example",
        protocol: "saml",
      }),
    ).rejects.toMatchObject({ code: "ALREADY_EXISTS" });
  });

  it("addOrganization() registers a new connection, unverified and untested", async () => {
    const created = await mockEdge.addOrganization({
      domain: "acme.example.org",
      orgName: "Acme",
      protocol: "oidc",
    });
    expect(created).toMatchObject({
      domain: "acme.example.org",
      enabled: false,
      protocol: "oidc",
      testPassed: false,
      verified: false,
    });
  });

  it("startDomainVerification() mints a stable token; rotate revokes the prior verified proof", async () => {
    const first = await mockEdge.startDomainVerification("partner.example.net");
    const second = await mockEdge.startDomainVerification("partner.example.net");
    expect(second.token).toBe(first.token);

    const rotated = await mockEdge.startDomainVerification("partner.example.net", true);
    expect(rotated.token).not.toBe(first.token);
    const orgs = await mockEdge.organizations();
    expect(orgs.find((o) => o.domain === "partner.example.net")?.verified).toBe(false);
  });

  it("verifyDomain() flips the verified gate", async () => {
    const verified = await mockEdge.verifyDomain("partner.example.net");
    expect(verified.verified).toBe(true);
  });

  it("activateOrganization() refuses while either gate is unmet", async () => {
    await expect(mockEdge.activateOrganization("partner.example.net")).rejects.toMatchObject({
      code: "FAILED_PRECONDITION",
    });
  });

  it("disableOrganization() turns a connection off without clearing its gates", async () => {
    const disabled = await mockEdge.disableOrganization("partner.example.net");
    expect(disabled).toMatchObject({ enabled: false, verified: true });
  });

  it("updateIdPConnection() flips only the toggle that's passed", async () => {
    const updated = await mockEdge.updateIdPConnection("partner.example.net", {
      allowLocal: true,
    });
    expect(updated).toMatchObject({ allowLocal: true, jitEnabled: true });
  });

  it("changeOrgProtocol() resets both gates and disables the connection", async () => {
    const changed = await mockEdge.changeOrgProtocol("partner.example.net", "oidc");
    expect(changed).toMatchObject({
      enabled: false,
      protocol: "oidc",
      testPassed: false,
      verified: false,
    });
  });

  it("groupMappings(), addGroupMapping() and deleteGroupMapping() manage a connection's mappings", async () => {
    const before = await mockEdge.groupMappings(mockId("connection", 1));
    expect(before.length).toBeGreaterThan(0);

    const added = await mockEdge.addGroupMapping(
      mockId("connection", 1),
      "it-security",
      mockId("group", 2),
    );
    const afterAdd = await mockEdge.groupMappings(mockId("connection", 1));
    expect(afterAdd.map((m) => m.id)).toContain(added.id);

    await mockEdge.deleteGroupMapping(added.id);
    const afterDelete = await mockEdge.groupMappings(mockId("connection", 1));
    expect(afterDelete.map((m) => m.id)).not.toContain(added.id);
  });

  it("deleteOrganization() removes the connection", async () => {
    await mockEdge.deleteOrganization("partner.example.net");
    const orgs = await mockEdge.organizations();
    expect(orgs.some((o) => o.domain === "partner.example.net")).toBe(false);
  });

  it("spCertificate() answers the active certificate; forceRotateSpCertificate() supersedes it", async () => {
    const before = await mockEdge.spCertificate();
    expect(before.active).toBe(true);

    const rotated = await mockEdge.forceRotateSpCertificate();
    expect(rotated.serial).not.toBe(before.serial);
    const after = await mockEdge.spCertificate();
    expect(after.serial).toBe(rotated.serial);
  });
});
