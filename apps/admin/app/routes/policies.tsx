// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
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

/** The admin catalog (A10): the staff library's table (U3), headed "Catalog". */
export default function PoliciesRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  return (
    <PolicyLibrary
      categories={loaderData.categories}
      documentType={DocumentType.Policy}
      policies={loaderData.policies}
      subtitle={t("catalog.subtitle")}
      title={t("catalog.title")}
    />
  );
}
