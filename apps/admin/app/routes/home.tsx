// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { Badge, Card, CardBody, EmptyState, PageHeader } from "@steward-web/ui";
import { DocumentType } from "@steward-web/ui/domain";
import { listCategories, listPolicies } from "@steward-web/ui/domain/server";
import { Link } from "react-router";

import type { Route } from "./+types/home";

import { listAuditLog } from "../audit/audit.server";
import { actionLabel, displayLabel } from "../audit/auditFormat";
import { listGroups } from "../groups/groups.server";
import { listTemplates } from "../templates/templates.server";

const RECENT_ACTIVITY_LIMIT = 8;

/**
 * The admin dashboard: headline counts across the structure (groups, templates) and the
 * catalog (policies, procedures), plus recent activity off the audit log. Every read a
 * caller might lack the permission for degrades to empty rather than redirecting — this IS
 * "/", so a `group.manage`/`audit.read` redirect back here would loop.
 *
 * Compliance/completion stats aren't here yet: they land with the completion area.
 */
export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, procedures, categories, templates, groups, activity] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listPolicies(DocumentType.Procedure, cookie),
    listCategories(cookie).catch(() => []),
    listTemplates(request).catch(() => []),
    listGroups(request).catch(() => []),
    listAuditLog(request).catch(() => []),
  ]);
  return {
    activity: activity.slice(0, RECENT_ACTIVITY_LIMIT),
    categoryCount: categories.length,
    groupCount: groups.length,
    policyCount: policies.length,
    procedureCount: procedures.length,
    templateCount: templates.length,
  };
};

const fmt = (iso: string): string =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });

const StatTile = ({ label, to, value }: { label: string; to: string; value: number }) => (
  <Link to={to}>
    <Card className="transition-shadow hover:shadow-[var(--shadow-2)]">
      <CardBody className="flex flex-col gap-1">
        <span className="text-2xl font-semibold text-ink">{value}</span>
        <span className="text-sm text-muted">{label}</span>
      </CardBody>
    </Card>
  </Link>
);

export default function Overview({ loaderData }: Route.ComponentProps) {
  const { activity, categoryCount, groupCount, policyCount, procedureCount, templateCount } =
    loaderData;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader eyebrow="Structure" subtitle="The org at a glance." title="Overview" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Policies" to="/policies" value={policyCount} />
        <StatTile label="Procedures" to="/procedures" value={procedureCount} />
        <StatTile label="Categories" to="/policies" value={categoryCount} />
        <StatTile label="Templates" to="/templates" value={templateCount} />
        <StatTile label="Groups" to="/groups" value={groupCount} />
      </div>

      <Card>
        <CardBody className="flex flex-col gap-0 p-0">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <h2 className="text-md font-semibold text-ink">Recent activity</h2>
            <Badge tone="neutral">{activity.length}</Badge>
            <Link className="ml-auto text-sm text-primary hover:underline" to="/audit">
              View audit log
            </Link>
          </div>
          {activity.length === 0 ? (
            <div className="p-5">
              <EmptyState
                description="Nothing recorded yet, or you don't have audit.read."
                title="No recent activity"
              />
            </div>
          ) : (
            <ul>
              {activity.map((record) => (
                <li
                  className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3 text-sm last:border-b-0"
                  key={record.id}
                >
                  <span className="font-medium text-ink">{actionLabel(record.action)}</span>
                  <span className="text-muted">
                    {displayLabel(record.subjectLabel, record.subject)}
                  </span>
                  <span className="ml-auto text-xs text-muted">
                    {displayLabel(record.actorName, record.actorUserId)} · {fmt(record.occurredAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
