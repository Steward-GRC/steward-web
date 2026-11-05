// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS } from "@steward-web/auth";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { EmptyState } from "@steward-web/ui";
import { redirect } from "react-router";

import type { Route } from "./+types/access";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const identity = await requireIdentityFromRequest(request);
  if (
    !identity.permissions.has(PERMISSIONS.GroupManage) &&
    !identity.permissions.has(PERMISSIONS.TemplateManage)
  ) {
    throw redirect("/");
  }
  return null;
};

/** Access (A5) before a category is picked: the tree in the panel chooses one. */
export default function AccessIndex() {
  const { t } = useTranslation("admin");
  return (
    <div className="flex w-full flex-col gap-4 px-4 pt-[22px] pb-7 md:px-7">
      <h1 className="text-[28px] leading-[1.25] font-semibold">{t("access.title")}</h1>
      <EmptyState
        description={t("access.noSelection.description")}
        title={t("access.noSelection.title")}
      />
    </div>
  );
}
