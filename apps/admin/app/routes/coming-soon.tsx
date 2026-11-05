// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ComingSoonPage } from "@steward-web/shell";
import { data } from "react-router";

/**
 * The stand-in for a destination the shell shows (H2) but that isn't built yet: Access,
 * Compliance case settings and the account menu's entries in `ADMIN_COMING_SOON`. It answers 404, so a
 * planned page never passes for a real one, and its feature PR replaces the route.
 */
export const loader = () => data(null, { status: 404 });

export default function ComingSoon() {
  return <ComingSoonPage />;
}
