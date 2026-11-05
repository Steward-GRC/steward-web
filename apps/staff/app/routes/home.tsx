// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useLiveRevalidation } from "@steward-web/shell";

import type { Route } from "./+types/home";

import { MyWork } from "../myWork/MyWork";
import { myWorkData } from "../myWork/myWork.server";

/** My work (U1), the staff home: everything waiting on the person, as far as their roles go. */
export const loader = async ({ request }: Route.LoaderArgs) =>
  myWorkData(request, await requireIdentityFromRequest(request));

/** How often an open My work checks for changes; it also checks when the window regains focus. */
const LIVE_EVERY_MS = 60_000;

export default function Home({ loaderData }: Route.ComponentProps) {
  useLiveRevalidation(LIVE_EVERY_MS);
  return <MyWork data={loaderData} />;
}
