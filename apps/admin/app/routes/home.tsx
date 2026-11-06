// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { formatRelativeTime, useTranslation } from "@steward-web/i18n";
import { actionLabel, displayLabel } from "@steward-web/shell";
import { AckSnapshot, EmptyState, PageHeader, StatCard } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { listPolicies } from "@steward-web/ui/domain/server";
import { useId } from "react";

import type { Route } from "./+types/home";

import { listAuditLog } from "../audit/audit.server";
import { acknowledgementSnapshot } from "../completion/completion.server";
import { listGroups } from "../groups/groups.server";
import { listTemplates } from "../templates/templates.server";

const RECENT_ACTIVITY_LIMIT = 6;

/**
 * The admin Overview (A1): five stat cards that link to what they count, then Recent activity
 * beside the Acknowledgement snapshot (decision 4-components.s9). Every read a caller might
 * lack the permission for degrades to empty rather than redirecting: this IS "/", so a
 * `group.manage`/`audit.read` redirect back here would loop.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, procedures, templates, groups, activity, ackSnapshot] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listPolicies(DocumentType.Procedure, cookie),
    listTemplates(request).catch(() => []),
    listGroups(request).catch(() => []),
    listAuditLog(request).catch(() => []),
    acknowledgementSnapshot(request).catch(() => null),
  ]);
  const documents = [...policies, ...procedures];
  return {
    ackSnapshot,
    activity: activity.slice(0, RECENT_ACTIVITY_LIMIT),
    groupCount: groups.length,
    inProgressCount: documents.filter((d) => d.status === "DRAFT" || d.status === "IN_REVIEW")
      .length,
    policyCount: documents.length,
    publishedCount: documents.filter((d) => d.status === "PUBLISHED").length,
    templateCount: templates.length,
  };
};

export default function Overview({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const activityId = useId();
  const {
    ackSnapshot,
    activity,
    groupCount,
    inProgressCount,
    policyCount,
    publishedCount,
    templateCount,
  } = loaderData;

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <PageHeader subtitle={t("overview.subtitle")} title={t("overview.title")} />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label={t("overview.cards.policies")} to="/policies" value={policyCount} />
        <StatCard
          label={t("overview.cards.published")}
          to="/policies?status=published"
          value={publishedCount}
        />
        <StatCard
          label={t("overview.cards.inProgress")}
          to="/policies?status=in-progress"
          value={inProgressCount}
        />
        <StatCard label={t("overview.cards.groups")} to="/groups" value={groupCount} />
        <StatCard label={t("overview.cards.templates")} to="/templates" value={templateCount} />
      </div>

      <div className="grid items-start gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <section
          aria-labelledby={activityId}
          className="overflow-hidden rounded-lg border border-border bg-surface text-ink"
        >
          <h2
            className="border-b border-border-strong bg-sunken px-3.5 py-2.5 text-base font-semibold"
            id={activityId}
          >
            {t("overview.activity.title")}
          </h2>
          {activity.length === 0 ? (
            <EmptyState
              description={t("overview.activity.emptyDescription")}
              title={t("overview.activity.emptyTitle")}
            />
          ) : (
            <ul>
              {activity.map((record) => (
                <li
                  className="flex gap-2.5 border-b border-border px-3.5 py-[9px] text-sm last:border-b-0"
                  key={record.id}
                >
                  <span className="flex-1">
                    <b className="font-semibold">
                      {displayLabel(record.actorName, record.actorUserId)}
                    </b>{" "}
                    {actionLabel(record.action)} ·{" "}
                    {displayLabel(record.subjectLabel, record.subject)}
                  </span>
                  <span className="text-muted">{formatRelativeTime(record.occurredAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        {ackSnapshot ? (
          <AckSnapshot acknowledged={ackSnapshot.acknowledged} audience={ackSnapshot.audience} />
        ) : null}
      </div>
    </div>
  );
}
