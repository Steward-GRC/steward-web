// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The staff feature areas (gates, library, reader, authoring, approvals, reporting) each add
 * their own `route()` call here as their own port PR lands. This PR adds reporting (the
 * privacy-officer case queue and case detail, backed by the new compliance reporting service)
 * and the global library search page. Approvals landed in a separate, parallel port PR.
 * Ethics is a v0.2.0 feature area; it has no routes here yet.
 */
export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("profile", "routes/profile.tsx"),
  route("search", "routes/search.tsx"),
  route("policies", "routes/policies.tsx"),
  route("policies/:number", "routes/policy.tsx"),
  route("procedures", "routes/procedures.tsx"),
  route("procedures/:number", "routes/procedure.tsx"),
  route("drafts", "routes/drafts.tsx"),
  route("drafts/new", "routes/drafts.new.tsx"),
  route("drafts/:policyId", "routes/drafts.$policyId.tsx"),
  route("approvals", "routes/approvals.tsx"),
  route("approvals/:number", "routes/approvals.$number.tsx"),
  route("resources/ai-health", "routes/resources.ai-health.tsx"),
  route("resources/ai-jobs/:jobId", "routes/resources.ai-jobs.$jobId.tsx"),
  route("reporting/cases", "routes/reporting.cases.tsx"),
  route("reporting/cases/:caseId", "routes/reporting.cases.$caseId.tsx"),
] satisfies RouteConfig;
