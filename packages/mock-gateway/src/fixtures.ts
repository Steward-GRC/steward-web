// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ComponentStatus, type Diagnostics, type Me } from "@steward-web/api-client";
import { permissionsForRoles } from "@steward-web/auth";

import { mockId } from "./marker";

const MOCK_VERSION = "mock";
const MOCK_COMMIT = "mock";

/** One signed-in persona for local and demo use: a site admin, so every screen is reachable. */
export const mockMe: Me = {
  email: "demo@example.com",
  firstName: "Demo",
  id: mockId("user", 1),
  lastName: "Admin",
  name: "Demo Admin",
  permissions: permissionsForRoles(["site-admin"]),
  roles: ["site-admin"],
  username: "demo-admin",
};

export const mockDiagnostics: Diagnostics = {
  actor: { actingAs: null, id: mockMe.id, roles: mockMe.roles, username: mockMe.username },
  appliance: null,
  gateway: {
    commit: MOCK_COMMIT,
    name: "gateway",
    status: ComponentStatus.Ok,
    version: MOCK_VERSION,
  },
  generatedAt: "2026-01-01T00:00:00Z",
  release: null,
  services: [],
  thirdParty: [],
  traceId: mockId("trace", 1),
};
