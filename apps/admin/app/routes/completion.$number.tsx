// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AckRosterEntry } from "@steward-web/api-client";

import { formatDate, formatNumber, formatPercent, useTranslation } from "@steward-web/i18n";
import {
  Button,
  cn,
  EmptyState,
  ResponsiveTable,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@steward-web/ui";
import { Clock, Download } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/completion.$number";

import {
  getAckActivity,
  getAckRoster,
  getCompletionReport,
  listAllPolicies,
} from "../completion/completion.server";
import { ACTIVITY_DAYS, ActivityBars, CompletionDonut } from "../completion/CompletionCharts";
import { StatTiles } from "../completion/StatTiles";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const asked = Number(new URL(request.url).searchParams.get("days"));
  const days = ACTIVITY_DAYS.find((option) => option === asked) ?? ACTIVITY_DAYS[0];

  const policies = await listAllPolicies(request);
  const found = policies.find((p) => p.number === params.number);
  if (!found) throw new Response("Not Found", { status: 404 });
  const policy = {
    currentPublishedVersionId: found.currentPublishedVersionId ?? null,
    number: found.number,
    title: found.title,
    version: found.version,
  };

  const versionId = found.currentPublishedVersionId;
  if (!versionId) return { activity: null, days, policy, report: null, roster: null };
  const [report, roster, activity] = await Promise.all([
    getCompletionReport(request, versionId),
    getAckRoster(request, versionId),
    getAckActivity(request, versionId, days),
  ]);
  return { activity, days, policy, report, roster };
};

// The roster's rows (A14): 10 × 14 px padding, 13 px type, the columns 1fr, 1fr and 140 px.
const CELL = "px-3.5 py-2.5 align-middle text-[13px]";

/**
 * Completion for one policy (A14): the policy's serif title under "Completion", its number and
 * version in mono, Export CSV; five stat cards; the "Acknowledged vs not yet" donut beside
 * "Activity over time"; how many people are overdue; then the roster's two tabs.
 */
export default function PolicyCompletion({ loaderData }: Route.ComponentProps) {
  const { activity, days, policy, report, roster } = loaderData;
  const { t } = useTranslation("admin");
  const [, setParameters] = useSearchParams();
  const [tab, setTab] = useState<"acked" | "pending">("pending");

  const overdueIds = new Set(report?.overdue.map((entry) => entry.userId));
  // The people who are overdue lead the "Not yet" tab.
  const pending = roster
    ? roster.pending.toSorted(
        (a, b) => Number(overdueIds.has(b.userId)) - Number(overdueIds.has(a.userId)),
      )
    : [];
  const entries: readonly AckRosterEntry[] = tab === "acked" ? (roster?.acked ?? []) : pending;

  const status = (entry: AckRosterEntry) => {
    if (tab === "acked") {
      return t("completion.detail.roster.ackedOn", { date: formatDate(entry.ackedAt) });
    }
    return overdueIds.has(entry.userId)
      ? t("completion.detail.roster.overdue")
      : t("completion.detail.roster.pending");
  };

  return (
    <div className="flex w-full flex-col gap-3.5 p-6">
      <header className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-1 flex-col">
          <Link
            className="self-start text-xs font-medium text-muted hover:text-ink"
            to="/completion"
          >
            {t("completion.title")}
          </Link>
          <h1 className="font-serif text-[26px] leading-tight font-semibold">{policy.title}</h1>
          <span className="font-mono text-[13px] text-muted">
            {t("completion.detail.versionLine", {
              number: policy.number,
              version: policy.version,
            })}
          </span>
        </div>
        {report && policy.currentPublishedVersionId ? (
          <Button asChild className="h-9 px-3" variant="secondary">
            <Link
              reloadDocument
              to={`/resources/acks-export?${new URLSearchParams({
                number: policy.number,
                policyVersionId: policy.currentPublishedVersionId,
              }).toString()}`}
            >
              <Download aria-hidden="true" className="size-4" />
              {t("completion.detail.export")}
            </Link>
          </Button>
        ) : null}
      </header>

      {!report || !roster ? (
        <EmptyState
          description={t("completion.detail.unpublished")}
          title={t("completion.detail.unpublishedTitle")}
        />
      ) : (
        <>
          <StatTiles
            className="grid-cols-2 sm:grid-cols-5"
            label={t("completion.stats.label")}
            tiles={[
              { label: t("completion.stats.audience"), value: formatNumber(report.totalAudience) },
              { label: t("completion.stats.acknowledged"), value: formatNumber(report.totalAcked) },
              {
                label: t("completion.stats.completion"),
                value: formatPercent(report.completionPct / 100),
              },
              {
                label: t("completion.stats.avgDays"),
                value: formatNumber(report.avgDaysToAck, { maximumFractionDigits: 1 }),
              },
              {
                label: t("completion.stats.viewedNotAcked"),
                value: formatNumber(report.viewedNotAckedCount),
              },
            ]}
          />

          <div className="grid gap-3.5 md:grid-cols-[240px_1fr]">
            <CompletionDonut
              acked={report.totalAcked}
              audience={report.totalAudience}
              completionPct={report.completionPct}
            />
            <ActivityBars
              activity={activity}
              days={days}
              onDaysChange={(next) =>
                setParameters(
                  (current) => {
                    const updated = new URLSearchParams(current);
                    updated.set("days", String(next));
                    return updated;
                  },
                  { preventScrollReset: true, replace: true },
                )
              }
            />
          </div>

          {report.overdue.length > 0 ? (
            <p className="flex items-center gap-2 rounded-lg bg-danger-soft px-3.5 py-2.5 text-danger">
              <Clock aria-hidden="true" className="size-4" />
              <b>{t("completion.detail.overdue", { count: report.overdue.length })}</b>
            </p>
          ) : null}

          <section
            aria-label={t("completion.detail.roster.label")}
            className="overflow-hidden rounded-[10px] border border-border bg-surface"
          >
            <Tabs onValueChange={(value) => setTab(value as "acked" | "pending")} value={tab}>
              <TabsList stretch>
                {(["acked", "pending"] as const).map((key) => (
                  <TabsTrigger
                    count={roster[key === "acked" ? "acked" : "pending"].length}
                    key={key}
                    value={key}
                  >
                    {t(
                      key === "acked"
                        ? "completion.detail.roster.tabAcknowledged"
                        : "completion.detail.roster.tabNotYet",
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
              {/* On a phone the roster's cards sit inside the panel, so they get its padding. */}
              <TabsContent className="pt-0 max-md:p-3" value={tab}>
                <ResponsiveTable
                  columns={[
                    {
                      card: "title",
                      cell: (entry) => (
                        <b className="font-semibold">{entry.userName ?? entry.email}</b>
                      ),
                      className: CELL,
                      header: t("completion.detail.roster.columns.name"),
                      key: "name",
                    },
                    {
                      card: "meta",
                      cell: (entry) => entry.email,
                      className: cn(CELL, "text-muted"),
                      header: t("completion.detail.roster.columns.email"),
                      key: "email",
                    },
                    {
                      card: "status",
                      cell: (entry) => (
                        <span
                          className={cn(
                            tab === "pending" && overdueIds.has(entry.userId) && "text-danger",
                          )}
                        >
                          {status(entry)}
                        </span>
                      ),
                      className: cn(CELL, "w-[140px]"),
                      header: t("completion.detail.roster.columns.status"),
                      key: "status",
                    },
                  ]}
                  empty={
                    <p className="px-3.5 py-2.5 text-[13px] text-muted">
                      {tab === "acked"
                        ? t("completion.detail.roster.emptyAcknowledged")
                        : t("completion.detail.roster.emptyNotYet")}
                    </p>
                  }
                  hideHeader
                  label={
                    tab === "acked"
                      ? t("completion.detail.roster.acknowledged", { count: roster.acked.length })
                      : t("completion.detail.roster.notYet", { count: roster.pending.length })
                  }
                  rowClassName={() => "[&:last-child>td]:border-b-0"}
                  rowKey={(entry) => entry.userId}
                  rows={entries}
                  search={{
                    label: t("completion.detail.roster.search"),
                    placeholder: t("completion.detail.roster.search"),
                    text: (entry) => `${entry.userName ?? ""} ${entry.email}`,
                  }}
                />
              </TabsContent>
            </Tabs>
          </section>
        </>
      )}
    </div>
  );
}
