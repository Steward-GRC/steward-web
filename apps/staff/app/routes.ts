// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The staff feature areas (gates, library, reader, authoring, approvals, reporting, ethics)
 * each add their own `route()` call here as their own port PR lands. This PR adds authoring
 * (U11 and its wizards): the "My drafts" list, the new-policy form and the editor, plus the
 * AI drafting/review resource routes it polls. Real-time collaborative editing is a
 * follow-up port PR.
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
  route("resources/ai-health", "routes/resources.ai-health.tsx"),
  route("resources/ai-jobs/:jobId", "routes/resources.ai-jobs.$jobId.tsx"),
] satisfies RouteConfig;
