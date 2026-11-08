// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";
import { ADMIN_COMING_SOON_PATHS } from "@steward-web/shell/admin-coming-soon";

/**
 * The admin feature areas (users, groups, organisations, SSO, setup, audit)
 * each add their own `route()` call here as their own port PR lands; this PR carries the
 * frame (`root.tsx`), sign-in and the account menu's "Your profile" page (U32: name only —
 * security and preferences are their own follow-up PRs).
 */
export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
  route("sign-out", "routes/sign-out.tsx"),
  // SSO (#54): the gateway's routes on this app's origin, and the return paths it sends to.
  route("auth/sso/*", "routes/resources.sso.tsx"),
  route("home", "routes/resources.gateway-home.tsx"),
  route("login", "routes/resources.gateway-login.tsx"),
  route("resources/status", "routes/resources.status.tsx"),
  route("resources/version", "routes/resources.version.tsx"),
  route("resources/session", "routes/resources.session.tsx"),
  route("resources/live-access", "routes/resources.live-access.tsx"),
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
  route("completion", "routes/completion.tsx"),
  route("completion/:number", "routes/completion.$number.tsx"),
  route("categories", "routes/categories.tsx"),
  route("categories/new", "routes/categories.new.tsx"),
  route("categories/:categoryId", "routes/categories.$categoryId.tsx"),
  route("categories/:categoryId/move", "routes/categories.$categoryId.move.tsx"),
  route("platform-groups", "routes/platform-groups.tsx"),
  route("contact-library", "routes/contact-library.tsx"),
  route("references-library", "routes/references-library.tsx"),
  route("definitions-library", "routes/definitions-library.tsx"),
  route("organisations", "routes/organisations.tsx"),
  route("organisations/new", "routes/organisations.new.tsx"),
  route("organisations/:domain", "routes/organisations.$domain.tsx"),
  route("resources/idp-metadata", "routes/resources.idp-metadata.tsx"),
  route("resources/sso-test-link", "routes/resources.sso-test-link.tsx"),
  route("resources/acks-export", "routes/resources.acks-export.tsx"),
  route("resources/command-palette", "routes/resources.command-palette.tsx"),
  route("resources/version-diff", "routes/resources.version-diff.tsx"),
  route("templates", "routes/templates.tsx"),
  route("templates/new", "routes/templates.new.tsx"),
  route("templates/:code", "routes/templates.$code.tsx"),
  route("workflows", "routes/workflows.tsx"),
  route("workflows/new", "routes/workflows.new.tsx"),
  route("workflows/:id", "routes/workflows.$id.tsx"),
  route("settings", "routes/settings.tsx"),
  route("mcp", "routes/mcp.tsx"),
  route("setup", "routes/setup.tsx"),
  route("access", "routes/access.tsx"),
  route("access/:categoryId", "routes/access.$categoryId.tsx"),
  route("resources/access-simulate", "routes/resources.access-simulate.tsx"),
  route("resources/sections", "routes/resources.sections.tsx"),
  route("resources/user-search", "routes/resources.user-search.tsx"),
  route("resources/subject-search", "routes/resources.subject-search.tsx"),
  route("audit", "routes/audit.tsx"),
  route("shortcuts", "routes/shortcuts.tsx"),
  // The shell's designed destinations that aren't built yet (H2, H14): each answers "Coming
  // soon" until its feature PR replaces the route.
  ...ADMIN_COMING_SOON_PATHS.map((path) =>
    route(path.slice(1), "routes/coming-soon.tsx", { id: `coming-soon${path}` }),
  ),
] satisfies RouteConfig;
