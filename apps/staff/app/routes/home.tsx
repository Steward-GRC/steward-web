// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";

import type { Route } from "./+types/home";

import { MyWork } from "../myWork/MyWork";
import { myWorkData } from "../myWork/myWork.server";

/** My work (U1), the staff home: everything waiting on the person, as far as their roles go. */
export const loader = async ({ request }: Route.LoaderArgs) =>
  myWorkData(request, await requireIdentityFromRequest(request));

export default function Home({ loaderData }: Route.ComponentProps) {
  return <MyWork data={loaderData} />;
}
