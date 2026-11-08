// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { type BuildVersion, buildVersion } from "@steward-web/shell/server";

/**
 * Which build this is (its commit, and the mock's when the gateway is the mock), public and never
 * cached, so a person or a script can compare what runs with main (steward-web#217).
 */
export const loader = async (): Promise<Response> => {
  const info: BuildVersion = await buildVersion("admin");
  return Response.json(info, { headers: { "cache-control": "no-store" } });
};
