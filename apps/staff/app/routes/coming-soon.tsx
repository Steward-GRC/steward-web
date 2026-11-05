// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { ComingSoonPage } from "@steward-web/shell";
import { data } from "react-router";

/**
 * The stand-in for a destination the shell shows (H1) but that isn't built yet: To acknowledge,
 * Ask, Templates, the audit log, the inbox and the rest in `COMING_SOON`. It answers 404, so a
 * planned page never passes for a real one, and its feature PR replaces the route.
 */
export const loader = () => data(null, { status: 404 });

export default function ComingSoon() {
  return <ComingSoonPage />;
}
