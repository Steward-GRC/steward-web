// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { DocumentType, PolicyLibrary } from "@steward-web/ui/domain";
import { listCategories, listPolicies } from "@steward-web/ui/domain/server";
import { data } from "react-router";

import type { Route } from "./+types/policies";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, categories] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listCategories(cookie),
  ]);
  return data({ categories, policies });
};

export default function PoliciesRoute({ loaderData }: Route.ComponentProps) {
  return (
    <PolicyLibrary
      categories={loaderData.categories}
      documentType={DocumentType.Policy}
      policies={loaderData.policies}
    />
  );
}
