// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";

import type { Route } from "./+types/resources.access-simulate";

import { simulateAccess } from "../access/access.server";

/**
 * The A5 simulator's verdicts, as a GET the page's fetcher loads whenever the person or the
 * unsaved rules change. A refusal comes back as data, so the simulator says it couldn't run
 * instead of the whole page falling to its error boundary.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const query = new URL(request.url).searchParams;
  try {
    const decision = await simulateAccess(
      request,
      query.get("category") ?? "",
      query.get("user") ?? "",
      query.get("rules"),
    );
    return { decision };
  } catch (error) {
    if (error instanceof Response) throw error;
    return { failure: refusalOf(error) };
  }
};
