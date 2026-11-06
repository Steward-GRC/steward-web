// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Badge, Button, EmptyState, ListPage, ResponsiveTable } from "@steward-web/ui";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router";

import type { Route } from "./+types/workflows";

import { listGroups } from "../categories/categories.server";
import { listUsers } from "../users/users.server";
import { hasDisabledApprover, notUsable } from "../workflows/workflowRules";
import { listWorkflowDefs } from "../workflows/workflows.server";

interface WorkflowRow {
  categories: string[];
  disabledApprover: boolean;
  id: string;
  name: string;
  stages: number;
  usable: boolean;
  version: number;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [workflows, categories, users] = await Promise.all([
    listWorkflowDefs(request),
    listGroups(request),
    listUsers(request).catch(() => []),
  ]);
  const disabled = new Set(users.filter((u) => !u.enabled).map((u) => u.userId));
  const rows: WorkflowRow[] = workflows.map((workflow) => ({
    categories: categories.filter((c) => c.defaultWorkflowId === workflow.id).map((c) => c.name),
    disabledApprover: hasDisabledApprover(workflow, disabled),
    id: workflow.id,
    name: workflow.name,
    stages: workflow.stages.length,
    usable: !notUsable(workflow),
    version: workflow.version,
  }));
  return { rows };
};

/** Workflows (A8, #90): approval workflows in the common list page, as a table. */
export default function Workflows({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { rows } = loaderData;
  const names = (row: WorkflowRow) =>
    row.categories.length > 0 ? row.categories.join(", ") : t("workflows.notInUse");
  return (
    <ListPage
      actions={
        <Button asChild>
          <Link to="/workflows/new">{t("workflows.new")}</Link>
        </Button>
      }
      subtitle={t("workflows.subtitle")}
      title={t("workflows.title")}
    >
      <ResponsiveTable
        columns={[
          {
            card: "title",
            cell: (row) => <Link to={`/workflows/${row.id}`}>{row.name}</Link>,
            className: "font-medium",
            header: t("workflows.columns.name"),
            key: "name",
            value: (row) => row.name,
          },
          {
            card: "meta",
            cell: names,
            className: "text-muted",
            header: t("workflows.columns.appliesTo"),
            key: "appliesTo",
            value: names,
          },
          {
            card: "meta",
            cell: (row) => row.stages,
            header: t("workflows.columns.stages"),
            key: "stages",
            value: (row) => row.stages,
          },
          {
            card: "meta",
            cell: (row) => `v${row.version}`,
            className: "font-mono",
            header: t("workflows.columns.version"),
            key: "version",
            value: (row) => row.version,
          },
          {
            card: "status",
            cell: (row) => (
              <span className="flex flex-wrap items-center gap-2">
                {row.usable ? null : <Badge>{t("workflows.draft")}</Badge>}
                {row.disabledApprover ? (
                  <span className="flex items-center gap-1.5 text-sm text-warn">
                    <AlertTriangle aria-hidden="true" className="size-4" />
                    {t("workflows.disabledApprover")}
                  </span>
                ) : null}
                {row.usable && !row.disabledApprover ? t("workflows.status.active") : null}
              </span>
            ),
            header: t("workflows.columns.status"),
            key: "status",
            value: (row) => (row.usable ? t("workflows.status.active") : t("workflows.draft")),
          },
        ]}
        empty={
          <EmptyState
            description={t("workflows.empty.description")}
            title={t("workflows.empty.title")}
          />
        }
        label={t("workflows.title")}
        rowHref={(row) => `/workflows/${row.id}`}
        rowKey={(row) => row.id}
        rows={rows}
        search={{
          label: t("workflows.search"),
          placeholder: t("workflows.search"),
          text: (row) => `${row.name} ${row.categories.join(" ")}`,
        }}
      />
    </ListPage>
  );
}
