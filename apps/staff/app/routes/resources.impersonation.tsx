// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// "Stop" on the acting-as banner (H9): ends the impersonation through the gateway, then goes
// back to the admin console, where it was started.
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import edge from "@steward-web/edge.server";
import { shellConfigFromEnvironment } from "@steward-web/shell/server";
import { redirect } from "react-router";

import type { Route } from "./+types/resources.impersonation";

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const form = await request.formData();
  if (form.get("intent") !== "stop") throw new Response("Bad Request", { status: 400 });
  await edge.stopImpersonation(request.headers.get("cookie") ?? undefined);
  return redirect(shellConfigFromEnvironment().adminUrl);
};
