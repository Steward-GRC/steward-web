// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The staff feature areas (gates, library, reader, authoring, approvals, reporting, ethics)
 * each add their own `route()` call here as their own port PR lands. This PR adds the
 * approvals inbox and an approver's decision (the reassign-a-stranded-seat control is a
 * follow-up: see the approvals area's GitHub issue).
 */
export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("profile", "routes/profile.tsx"),
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
] satisfies RouteConfig;
