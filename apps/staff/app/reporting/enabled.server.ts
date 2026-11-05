// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { reportingEnabled } from "@steward-web/shell/server";

export { reportingEnabled } from "@steward-web/shell/server";

/** Ends a case route with not found, before any gateway call, while reporting is off. */
export const requireReporting = (): void => {
  if (!reportingEnabled()) throw new Response("Not Found", { status: 404 });
};
