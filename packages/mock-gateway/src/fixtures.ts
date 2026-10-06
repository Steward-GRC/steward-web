// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  type Category,
  ComponentStatus,
  type Diagnostics,
  DocumentType,
  type Me,
  type Policy,
  PolicyStatus,
  Sensitivity,
} from "@steward-web/api-client";
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

/** The library's category tree: a few generic business categories, each with subcategories. */
export const mockCategories: Category[] = [
  {
    id: mockId("category", 1),
    name: "Finance",
    slug: "finance",
    subcategories: ["Reimbursement"],
  },
  {
    id: mockId("category", 2),
    name: "Human Resources",
    slug: "human-resources",
    subcategories: ["Workplace", "Ethics"],
  },
  {
    id: mockId("category", 3),
    name: "IT Security",
    slug: "it-security",
    subcategories: ["Usage", "Data Governance", "Operations"],
  },
  {
    id: mockId("category", 4),
    name: "Procurement",
    slug: "procurement",
    subcategories: ["Due Diligence"],
  },
];

/** The library catalog: policies and procedures across every category, status and sensitivity. */
export const mockPolicies: Policy[] = [
  {
    category: "Finance",
    documentType: DocumentType.Policy,
    id: mockId("policy", 1),
    number: "POL-FINANCE-001",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Published,
    subcategory: "Reimbursement",
    title: "Expense Claims",
    updated: "2026-08-12T00:00:00Z",
    version: "2.0.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Policy,
    id: mockId("policy", 2),
    number: "POL-ITSEC-004",
    sensitivity: Sensitivity.Sensitive,
    status: PolicyStatus.Draft,
    subcategory: "Usage",
    title: "Acceptable Use",
    updated: "2026-09-02T00:00:00Z",
    version: "1.0.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Policy,
    id: mockId("policy", 3),
    number: "POL-ITSEC-011",
    sensitivity: Sensitivity.Sensitive,
    status: PolicyStatus.InReview,
    subcategory: "Data Governance",
    title: "Data Classification",
    updated: "2026-09-20T00:00:00Z",
    version: "3.1.0",
  },
  {
    category: "Human Resources",
    documentType: DocumentType.Policy,
    id: mockId("policy", 4),
    number: "POL-HR-002",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Superseded,
    subcategory: "Workplace",
    title: "Remote Work",
    updated: "2026-05-01T00:00:00Z",
    version: "1.0.0",
  },
  {
    category: "Procurement",
    documentType: DocumentType.Policy,
    id: mockId("policy", 5),
    number: "POL-PROC-007",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Withdrawn,
    subcategory: "Due Diligence",
    title: "Vendor Onboarding",
    updated: "2026-03-18T00:00:00Z",
    version: "1.1.0",
  },
  {
    category: "IT Security",
    documentType: DocumentType.Procedure,
    id: mockId("policy", 6),
    number: "PRC-ITSEC-002",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Published,
    subcategory: "Operations",
    title: "Incident Response Runbook",
    updated: "2026-09-28T00:00:00Z",
    version: "4.0.0",
  },
  {
    category: "Human Resources",
    documentType: DocumentType.Procedure,
    id: mockId("policy", 7),
    number: "PRC-HR-003",
    sensitivity: Sensitivity.Standard,
    status: PolicyStatus.Rejected,
    subcategory: "Ethics",
    title: "Gift Disclosure",
    updated: "2026-07-09T00:00:00Z",
    version: "1.0.0",
  },
];
