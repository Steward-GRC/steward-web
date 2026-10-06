// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The admin feature areas (users, groups, organisations, SSO, setup, audit)
 * each add their own `route()` call here as their own port PR lands; this PR carries the
 * frame (`root.tsx`), sign-in and the account menu's "Your profile" page (U32: name only —
 * security and preferences are their own follow-up PRs).
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
  route("users", "routes/users.tsx"),
  route("users/merge", "routes/users.merge.tsx"),
  route("users/:userId", "routes/users.$userId.tsx"),
  route("my-groups", "routes/my-groups.tsx"),
  route("magic-links", "routes/magic-links.tsx"),
  route("groups", "routes/groups.tsx"),
  route("groups/new", "routes/groups.new.tsx"),
  route("groups/:groupId", "routes/groups.$groupId.tsx"),
  route("organisations", "routes/organisations.tsx"),
  route("organisations/new", "routes/organisations.new.tsx"),
  route("organisations/:domain", "routes/organisations.$domain.tsx"),
  route("resources/idp-metadata", "routes/resources.idp-metadata.tsx"),
  route("resources/sso-test-link", "routes/resources.sso-test-link.tsx"),
  route("templates", "routes/templates.tsx"),
  route("templates/new", "routes/templates.new.tsx"),
  route("templates/:code", "routes/templates.$code.tsx"),
  route("setup", "routes/setup.tsx"),
  route("audit", "routes/audit.tsx"),
] satisfies RouteConfig;
