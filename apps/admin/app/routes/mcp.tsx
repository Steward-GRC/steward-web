// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { mcpEnabled } from "@steward-web/shell/server";
import { EmptyState, PageHeader } from "@steward-web/ui";

import type { Route } from "./+types/mcp";

/** The reserved MCP page (#113): there until the MCP server is built, and only behind its flag. */
export const loader = async ({ request }: Route.LoaderArgs) => {
  if (!mcpEnabled()) throw new Response("Not Found", { status: 404 });
  await requirePermissionFromRequest(request, PERMISSIONS.SettingsManage, "/");
  return null;
};

export default function Mcp() {
  const { t } = useTranslation("admin");
  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <PageHeader
        eyebrow={t("settings.title")}
        subtitle={t("mcp.subtitle")}
        title={t("mcp.title")}
      />
      <EmptyState description={t("mcp.reservedDescription")} title={t("mcp.reserved")} />
      <p className="max-w-prose text-base text-muted">{t("mcp.tokens")}</p>
    </div>
  );
}
