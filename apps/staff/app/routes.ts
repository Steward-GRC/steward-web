// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The staff feature areas (gates, library, reader, authoring, approvals, reporting, ethics)
 * each add their own `route()` call here as their own port PR lands; this PR adds the
 * reader (U7-U10, U12-U19, D1, D2) `policies/:number` and `procedures/:number` link to from
 * the library's catalog. Authoring (the editor, U11, and its wizards) is still its own
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
] satisfies RouteConfig;
