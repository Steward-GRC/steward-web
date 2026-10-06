// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  AssistOperation,
  BreachDecision,
  CaseOutcome,
  CaseStatus,
  DocumentType,
  InformationKind,
  MessageAuthor,
  NoticeRecipient,
  NoticeStatus,
  ReviewCadence,
  RiskMitigation,
  RiskRecipient,
  RiskViewed,
  Sensitivity,
} from "@steward-web/api-client";
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

  describe("authoring", () => {
    it("createPolicy() scaffolds an empty working draft from the chosen template", async () => {
      const [group] = await mockEdge.authorableGroups();
      const [template] = await mockEdge.authorableTemplates(null);
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        templateId: template!.id,
        title: "New Draft Policy",
      });
      expect(created.currentDraftVersionId).not.toBeNull();
      expect(created.currentPublishedVersionId).toBeNull();

      const draft = await mockEdge.draftVersion(created.id);
      const sections = JSON.parse(draft!.contentJson) as { sectionKey: string }[];
      expect(sections.length).toBeGreaterThan(0);
    });

    it("saveDraft() persists edits, visible on the next draftVersion() read", async () => {
      const [group] = await mockEdge.authorableGroups();
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        title: "Freeform Draft",
      });
      const content = JSON.stringify([{ sectionKey: "body", text: "hello", title: "Body" }]);
      await mockEdge.saveDraft(created.id, content, null);

      const draft = await mockEdge.draftVersion(created.id);
      expect(draft?.contentJson).toBe(content);
    });

    it("publishDraft() refuses when a required template section is still empty", async () => {
      const [group] = await mockEdge.authorableGroups();
      const [template] = await mockEdge.authorableTemplates(null);
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        templateId: template!.id,
        title: "Incomplete Draft",
      });
      await expect(mockEdge.publishDraft(created.id)).rejects.toMatchObject({
        name: "GatewayError",
      });
    });

    it("publishDraft() cuts a published version once every required section is filled", async () => {
      const [group] = await mockEdge.authorableGroups();
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        title: "Complete Freeform Draft",
      });
      await mockEdge.saveDraft(
        created.id,
        JSON.stringify([{ sectionKey: "body", text: "content", title: "Body" }]),
        null,
      );
      const published = await mockEdge.publishDraft(created.id);
      expect(published.status).toBe("PUBLISHED");

      const policy = await mockEdge.policy(created.id);
      expect(policy?.currentDraftVersionId).toBeNull();
      expect(policy?.currentPublishedVersionId).toBe(published.id);
    });

    it("discardDraft() drops the working draft without erroring on a policy with none", async () => {
      const [group] = await mockEdge.authorableGroups();
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        title: "Discard Me",
      });
      expect(await mockEdge.discardDraft(created.id)).toBe(true);
      expect(await mockEdge.draftVersion(created.id)).toBeNull();
      expect(await mockEdge.discardDraft(created.id)).toBe(true);
    });

    it("myDraftPolicies() lists only the calling user's policies with a working draft", async () => {
      const [group] = await mockEdge.authorableGroups();
      await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        title: "Mine, in progress",
      });
      const drafts = await mockEdge.myDraftPolicies();
      expect(drafts.length).toBeGreaterThan(0);
      for (const draft of drafts) expect(draft.currentDraftVersionId).not.toBeNull();
    });

    it("appendix CRUD: add, update, reorder and delete, re-lettering as it goes", async () => {
      const [group] = await mockEdge.authorableGroups();
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        title: "Appendix Fixture",
      });
      const versionId = created.currentDraftVersionId!;

      const first = await mockEdge.addAppendix(versionId, "First", "{}");
      const second = await mockEdge.addAppendix(versionId, "Second", "{}");
      expect(first.letter).toBe("A");
      expect(second.letter).toBe("B");

      const updated = await mockEdge.updateAppendix(first.id, "First (edited)", "{}");
      expect(updated.title).toBe("First (edited)");

      const reordered = await mockEdge.reorderAppendices(versionId, [second.id, first.id]);
      expect(reordered.map((a) => a.id)).toEqual([second.id, first.id]);
      expect(reordered[0]!.letter).toBe("A");
      expect(reordered[1]!.letter).toBe("B");

      expect(await mockEdge.deleteAppendix(first.id)).toBe(true);
      const draft = await mockEdge.draftVersion(created.id);
      expect(draft?.appendices).toHaveLength(1);
      expect(draft?.appendices[0]!.letter).toBe("A");
    });
  });

  describe("AI assist and jobs", () => {
    it("authoringAssist() answers a suggestion for the requested section", async () => {
      const result = await mockEdge.authoringAssist({
        editableContent: "draft text",
        operation: AssistOperation.AssistOperationExpand,
        policyId: mockId("policy", 1),
        sectionKey: "purpose",
      });
      expect(result.suggestion.length).toBeGreaterThan(0);
    });

    it("aiHealth() answers available while the module is on", async () => {
      expect(await mockEdge.aiHealth()).toMatchObject({ available: true });
    });

    it("submitDraftGeneration() and aiJob() progress from pending to succeeded over a few polls", async () => {
      const { jobId } = await mockEdge.submitDraftGeneration({
        brief: "a brief for a new policy",
        sections: [{ key: "purpose", order: 0, title: "Purpose" }],
      });

      const first = await mockEdge.aiJob(jobId);
      expect(first.phase).toBe("AI_JOB_PHASE_RUNNING");

      const second = await mockEdge.aiJob(jobId);
      expect(second.phase).toBe("AI_JOB_PHASE_SUCCEEDED");
      expect(second.resultRef).toBe(jobId);

      const content = await mockEdge.aiJobResultContent(second.resultRef!);
      const parsed = JSON.parse(content.resultJson) as { sections: unknown[] };
      expect(parsed.sections.length).toBeGreaterThan(0);
    });

    it("submitPolicyReview() flags an empty section as a high-severity finding", async () => {
      const { jobId } = await mockEdge.submitPolicyReview({
        policyId: mockId("policy", 1),
        sections: [{ content: "", key: "scope", title: "Scope" }],
      });
      await mockEdge.aiJob(jobId);
      const status = await mockEdge.aiJob(jobId);
      const content = await mockEdge.aiJobResultContent(status.resultRef!);
      const parsed = JSON.parse(content.resultJson) as {
        findings: { severity: string }[];
      };
      expect(parsed.findings[0]!.severity).toBe("warning");
    });

    it("aiJob() rejects an unknown job id", async () => {
      await expect(mockEdge.aiJob("no-such-job")).rejects.toMatchObject({ name: "GatewayError" });
    });
  });

  describe("collaboration", () => {
    it("issueCollabToken() answers a same-origin wsUrl and a future expiry for an editable draft", async () => {
      const [group] = await mockEdge.authorableGroups();
      const created = await mockEdge.createPolicy({
        homeGroupId: group!.id,
        sensitivity: Sensitivity.Standard,
        title: "Collab Fixture",
      });
      const draftId = created.currentDraftVersionId!;
      const payload = await mockEdge.issueCollabToken({ draftId, policyId: created.id });
      // Matches steward-collab's own wsUrl shape (WsPathPrefix + the draft id), so the
      // provider's url-resolution code is exercised the same way in mock mode as live.
      expect(payload.wsUrl).toBe(`/collab/ws/${draftId}`);
      expect(payload.token.length).toBeGreaterThan(0);
      expect(new Date(payload.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it("issueCollabToken() rejects a policy the caller can't edit", async () => {
      await expect(
        mockEdge.issueCollabToken({ draftId: "no-such-draft", policyId: "no-such-policy" }),
      ).rejects.toMatchObject({ name: "GatewayError" });
    });
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

describe("mockEdge audit log", () => {
  it("auditLog() answers the fixture records, newest first", async () => {
    const page = await mockEdge.auditLog({});
    expect(page.records.length).toBeGreaterThan(0);
    const occurredAts = page.records.map((r) => r.occurredAt);
    expect(occurredAts).toEqual([...occurredAts].toSorted().toReversed());
  });

  it("auditLog() filters by tier, groupId, actorUserId and a subject substring", async () => {
    const activity = await mockEdge.auditLog({ tier: "activity" });
    expect(activity.records.every((r) => r.tier === "activity")).toBe(true);

    const byGroup = await mockEdge.auditLog({ groupId: mockId("group", 2) });
    expect(byGroup.records.every((r) => r.groupId === mockId("group", 2))).toBe(true);

    const byActor = await mockEdge.auditLog({ actorUserId: mockId("user", 3) });
    expect(byActor.records.every((r) => r.actorUserId === mockId("user", 3))).toBe(true);

    const bySubject = await mockEdge.auditLog({ subject: "user:" });
    expect(bySubject.records.every((r) => r.subject.startsWith("user:"))).toBe(true);
  });

  it("auditLog() caps the page at pageSize", async () => {
    const page = await mockEdge.auditLog({ pageSize: 2 });
    expect(page.records).toHaveLength(2);
  });

  it("verifyAuditChain() reports a valid chain across the whole fixture range", async () => {
    const all = await mockEdge.auditLog({});
    const ids = all.records.map((r) => r.id);
    const result = await mockEdge.verifyAuditChain(ids.at(-1)!, ids[0]!);
    expect(result).toMatchObject({ errors: [], valid: true });
    expect(result.recordsChecked).toBe(all.records.length);
  });

  it("verifyAuditChain() rejects an unknown record id", async () => {
    await expect(mockEdge.verifyAuditChain("1", "no-such-id")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  describe("reporting", () => {
    const caseId1 = mockId("case", 1);
    const caseId3 = mockId("case", 3);

    it("reportCase() rejects an unknown case id", async () => {
      await expect(mockEdge.reportCase("no-such-case")).rejects.toMatchObject({
        code: "NOT_FOUND",
      });
    });

    it("reportCases() filters by status and by assignee", async () => {
      const closedOnly = await mockEdge.reportCases([CaseStatus.Closed]);
      expect(closedOnly.cases).toHaveLength(0);

      const mine = await mockEdge.reportCases(undefined, mockId("user", 1));
      expect(mine.cases.every((c) => c.assigneeUserId === mockId("user", 1))).toBe(true);
      expect(mine.cases.length).toBeGreaterThan(0);
    });

    it("reportCases() counts every status, including zero-count ones", async () => {
      const queue = await mockEdge.reportCases();
      const statuses = queue.counts.map((c) => c.status);
      expect(new Set(statuses).size).toBe(Object.values(CaseStatus).length);
    });

    it("addCaseNote() appends a note visible on the next reportCase() read", async () => {
      await mockEdge.addCaseNote(caseId1, "Reached out to Finance for more detail.");
      const reportCase = await mockEdge.reportCase(caseId1);
      expect(reportCase.notes.at(-1)?.body).toBe("Reached out to Finance for more detail.");
    });

    it("postCaseMessage() appends a reporter-visible thread entry", async () => {
      await mockEdge.postCaseMessage(caseId1, "Thank you, we are looking into this.");
      const reportCase = await mockEdge.reportCase(caseId1);
      expect(reportCase.thread.at(-1)).toMatchObject({
        author: MessageAuthor.Officer,
        body: "Thank you, we are looking into this.",
      });
    });

    it("assignCase() sets and clears (null) the assignee", async () => {
      const assigned = await mockEdge.assignCase(caseId1, mockId("user", 1));
      expect(assigned.assigneeUserId).toBe(mockId("user", 1));

      const cleared = await mockEdge.assignCase(caseId1, null);
      expect(cleared.assigneeUserId).toBeNull();
    });

    it("setCaseStatus() moves the case to the requested status", async () => {
      const updated = await mockEdge.setCaseStatus(caseId1, CaseStatus.NeedsReporterReply);
      expect(updated.status).toBe(CaseStatus.NeedsReporterReply);
    });

    it("setCaseStatus() refuses CLOSED; closing goes through closeCase", async () => {
      await expect(mockEdge.setCaseStatus(caseId1, CaseStatus.Closed)).rejects.toMatchObject({
        code: "INVALID_ARGUMENT",
      });
    });

    it("setCaseDiscoveryDate() sets the date every notification deadline counts from", async () => {
      const updated = await mockEdge.setCaseDiscoveryDate(caseId1, "2026-04-02");
      expect(updated.discoveredOn).toBe("2026-04-02");
    });

    it("recordRiskAssessment() moves a REPORTABLE decision to NOTIFICATION_DUE", async () => {
      const assessment = await mockEdge.recordRiskAssessment(
        caseId1,
        {
          information: [InformationKind.Contact],
          mitigation: RiskMitigation.NotAtAll,
          recipient: RiskRecipient.UnknownPeople,
          viewed: RiskViewed.Yes,
        },
        BreachDecision.Reportable,
        "Shared drive was open to the whole organisation.",
      );
      expect(assessment.decision).toBe(BreachDecision.Reportable);

      const reportCase = await mockEdge.reportCase(caseId1);
      expect(reportCase.status).toBe(CaseStatus.NotificationDue);
    });

    it("recordRiskAssessment() moves a NOT_REPORTABLE decision back to IN_REVIEW", async () => {
      await mockEdge.recordRiskAssessment(
        caseId1,
        {
          information: [InformationKind.Contact],
          mitigation: RiskMitigation.Fully,
          recipient: RiskRecipient.StaffOnly,
          viewed: RiskViewed.No,
        },
        BreachDecision.NotReportable,
        "Caught and fixed before anyone outside the team saw it.",
      );
      const reportCase = await mockEdge.reportCase(caseId1);
      expect(reportCase.status).toBe(CaseStatus.InReview);
    });

    it("addCaseNotice() sets the due date from the case's discovery date", async () => {
      await mockEdge.setCaseDiscoveryDate(caseId1, "2026-04-02");
      const notice = await mockEdge.addCaseNotice(caseId1, NoticeRecipient.Regulator);
      expect(notice.dueOn).toBe("2026-06-01");
      expect(notice.status).toBe(NoticeStatus.NotSent);
    });

    it("updateCaseNotice() rejects an unknown notice id", async () => {
      await expect(
        mockEdge.updateCaseNotice(caseId3, "no-such-notice", NoticeStatus.Sent, "2026-05-01"),
      ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("updateCaseNotice() requires sentOn with SENT", async () => {
      const reportCase = await mockEdge.reportCase(caseId3);
      const noticeId = reportCase.notices[0]!.id;
      await expect(
        mockEdge.updateCaseNotice(caseId3, noticeId, NoticeStatus.Sent),
      ).rejects.toMatchObject({ code: "INVALID_ARGUMENT" });
    });

    it("updateCaseNotice() records sentOn when sending", async () => {
      const reportCase = await mockEdge.reportCase(caseId3);
      const noticeId = reportCase.notices[0]!.id;
      const updated = await mockEdge.updateCaseNotice(
        caseId3,
        noticeId,
        NoticeStatus.Sent,
        "2026-05-01",
      );
      expect(updated).toMatchObject({ sentOn: "2026-05-01", status: NoticeStatus.Sent });
    });

    it("closeCase() records the outcome and refuses a second close", async () => {
      const closed = await mockEdge.closeCase(caseId1, CaseOutcome.Substantiated, [
        { description: "Restricted the shared drive to the Finance group.", policyId: null },
      ]);
      expect(closed.status).toBe(CaseStatus.Closed);
      expect(closed.outcome).toBe(CaseOutcome.Substantiated);
      expect(closed.closedAt).not.toBeNull();

      await expect(
        mockEdge.closeCase(caseId1, CaseOutcome.Substantiated, []),
      ).rejects.toMatchObject({ code: "FAILED_PRECONDITION" });
    });
  });
});
