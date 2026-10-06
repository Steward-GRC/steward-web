// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
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
});
