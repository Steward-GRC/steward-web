// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Route } from "./+types/resources.subject-search";

import { searchSubjects, type SubjectKind } from "../access/subjectSearch.server";

/** The add-rule typeahead (#88): `?kind=user|group&q=…`, a few matches, matched on the server. */
export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const asked = url.searchParams.get("kind");
  const kind: SubjectKind = ["category", "document", "group"].includes(asked ?? "")
    ? (asked as SubjectKind)
    : "user";
  return Response.json({
    options: await searchSubjects(request, kind, url.searchParams.get("q") ?? ""),
  });
};
