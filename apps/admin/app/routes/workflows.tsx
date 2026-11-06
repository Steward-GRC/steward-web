// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowDef } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Badge, Button, EmptyState } from "@steward-web/ui";
import { AlertTriangle } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/workflows";

import { listGroups } from "../categories/categories.server";
import { listUsers } from "../users/users.server";
import { hasDisabledApprover, notUsable } from "../workflows/workflowRules";
import { listWorkflowDefs } from "../workflows/workflows.server";

interface WorkflowCard {
  disabledApprover: boolean;
  id: string;
  name: string;
  stages: WorkflowDef["stages"];
  usedBy: number;
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [workflows, categories, users] = await Promise.all([
    listWorkflowDefs(request),
    listGroups(request),
    listUsers(request).catch(() => []),
  ]);
  const disabled = new Set(users.filter((u) => !u.enabled).map((u) => u.userId));
  const siteOf = (categoryId: string) => {
    let at = categories.find((c) => c.id === categoryId);
    while (at?.parentId) {
      const parentId = at.parentId;
      at = categories.find((c) => c.id === parentId);
    }
    return at?.name ?? null;
  };
  const bySite = new Map<null | string, WorkflowCard[]>();
  for (const workflow of workflows) {
    const using = categories.filter((c) => c.defaultWorkflowId === workflow.id);
    // A workflow sits under the site of the first category that uses it.
    const site = using[0] ? siteOf(using[0].id) : null;
    const card: WorkflowCard = {
      disabledApprover: hasDisabledApprover(workflow, disabled),
      id: workflow.id,
      name: workflow.name,
      stages: workflow.stages,
      usedBy: using.length,
    };
    bySite.set(site, [...(bySite.get(site) ?? []), card]);
  }
  const sites = [...bySite.entries()]
    .map(([name, cards]) => ({ name, workflows: cards }))
    // Sites by name, then the workflows no category uses yet.
    .toSorted((a, b) =>
      a.name === null ? 1 : b.name === null ? -1 : a.name.localeCompare(b.name),
    );
  return { sites };
};

/** One site's workflows as cards. */
const Site = ({ name, workflows }: { name: null | string; workflows: readonly WorkflowCard[] }) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-muted" id={titleId}>
        {name ?? t("workflows.notInUse")}
      </h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {workflows.map((workflow) => (
          <Link
            className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-surface p-4 text-ink hover:border-border-strong hover:text-ink"
            key={workflow.id}
            to={`/workflows/${workflow.id}`}
          >
            <span className="flex items-center gap-2">
              <b className="min-w-0 flex-1 truncate">{workflow.name}</b>
              {notUsable(workflow) ? <Badge>{t("workflows.draft")}</Badge> : null}
            </span>
            {workflow.disabledApprover ? (
              <span className="flex items-center gap-1.5 text-sm text-warn">
                <AlertTriangle aria-hidden="true" className="size-4" />
                {t("workflows.disabledApprover")}
              </span>
            ) : null}
            <span className="text-sm text-muted">
              {t("workflows.summary", {
                stages: t("workflows.stages", { count: workflow.stages.length }),
                usedBy: t("workflows.usedBy", { count: workflow.usedBy }),
              })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

/** Workflows (A8): approval workflows as cards grouped by the site whose categories use them. */
export default function Workflows({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { sites } = loaderData;
  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] leading-[1.3] font-semibold">{t("workflows.title")}</h1>
          <p className="text-base text-muted">{t("workflows.subtitle")}</p>
        </div>
        <Button asChild>
          <Link to="/workflows/new">{t("workflows.new")}</Link>
        </Button>
      </header>
      {sites.length === 0 ? (
        <EmptyState
          description={t("workflows.empty.description")}
          title={t("workflows.empty.title")}
        />
      ) : (
        sites.map((site) => (
          <Site key={site.name ?? "unused"} name={site.name} workflows={site.workflows} />
        ))
      )}
    </div>
  );
}
