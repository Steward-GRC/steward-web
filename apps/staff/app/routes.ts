// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { index, route, type RouteConfig } from "@react-router/dev/routes";

/**
 * The staff feature areas (gates, library, reader, authoring, approvals, reporting, ethics)
 * each add their own `route()` call here as their own port PR lands; this PR carries only
 * the frame (`root.tsx`) and sign-in.
 */
export default [
  index("routes/home.tsx"),
  route("sign-in", "routes/sign-in.tsx"),
] satisfies RouteConfig;
