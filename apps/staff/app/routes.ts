// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";
import { COMING_SOON_PATHS } from "@steward-web/shell/coming-soon";

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
  route("sign-out", "routes/sign-out.tsx"),
  // SSO (#54): the gateway's routes on this app's origin, and the return paths it sends to.
  route("auth/sso/*", "routes/resources.sso.tsx"),
  route("home", "routes/resources.gateway-home.tsx"),
  route("login", "routes/resources.gateway-login.tsx"),
  route("not-set-up", "routes/not-set-up.tsx"),
  route("welcome", "routes/welcome.tsx"),
  route("resources/status", "routes/resources.status.tsx"),
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
  // The shell's designed destinations that aren't built yet (H1): each answers "Coming soon"
  // until its feature PR replaces the route.
  ...COMING_SOON_PATHS.map((path) =>
    route(path.slice(1), "routes/coming-soon.tsx", { id: `coming-soon${path}` }),
  ),
] satisfies RouteConfig;
