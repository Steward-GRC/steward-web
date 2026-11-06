// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/acknowledge";

import { ToAcknowledge } from "../myWork/MyWork";
import { toAcknowledgeData } from "../myWork/myWork.server";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

/** To acknowledge (U2): the published policies the person must confirm they have read. */
export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  return toAcknowledgeData(request);
};

export default function AcknowledgeRoute({ loaderData }: Route.ComponentProps) {
  return <ToAcknowledge obligations={loaderData.obligations} />;
}
