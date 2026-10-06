// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType } from "@steward-web/api-client";
import { describe, expect, it } from "vitest";

import { mockEdge } from "./edge.server";
import { MOCK_MARKER } from "./marker";

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
});
