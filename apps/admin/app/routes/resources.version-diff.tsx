// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The compare pickers' data (U19): the reader's Changes view loads the diff between the two
// versions picked from here.
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { refusalOf } from "@steward-web/shell";
import { getVersionDiff } from "@steward-web/ui/domain/server";

import type { Route } from "./+types/resources.version-diff";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const search = new URL(request.url).searchParams;
  const from = search.get("from") ?? "";
  const to = search.get("to") ?? "";
  if (!from || !to) return { diff: [] };
  const cookie = request.headers.get("cookie") ?? undefined;
  // A failed read comes back as a failure, never thrown: a fetcher's thrown error would
  // replace the whole reader with the error boundary.
  try {
    return { diff: await getVersionDiff(from, to, cookie) };
  } catch (error) {
    return { diff: [], failure: refusalOf(error) };
  }
};
