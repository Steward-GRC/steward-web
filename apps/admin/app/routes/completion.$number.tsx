// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  Button,
  Card,
  CardBody,
  EmptyState,
  Field,
  PageHeader,
  Progress,
  Select,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { useState } from "react";
import { Link } from "react-router";

import type { Route } from "./+types/completion.$number";

import {
  getAckRoster,
  getCompletionReport,
  listAllPolicies,
} from "../completion/completion.server";
import { listGroups, orderedWithPaths } from "../groups/groups.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const groupId = url.searchParams.get("groupId") || undefined;

  const [policies, groups] = await Promise.all([listAllPolicies(request), listGroups(request)]);
  const policy = policies.find((p) => p.number === params.number);
  if (!policy) throw new Response("Not Found", { status: 404 });

  const versionId = policy.currentPublishedVersionId;
  if (!versionId) {
    return { categories: orderedWithPaths(groups), groupId, policy, report: null, roster: null };
  }
  const [report, roster] = await Promise.all([
    getCompletionReport(request, versionId, groupId),
    getAckRoster(request, versionId, groupId),
  ]);
  return { categories: orderedWithPaths(groups), groupId, policy, report, roster };
};

export default function PolicyCompletion({ loaderData }: Route.ComponentProps) {
  const { categories, groupId, policy, report, roster } = loaderData;
  const [tab, setTab] = useState<"acked" | "pending">("acked");

  const categoryOptions = [
    { label: "All groups", value: "" },
    ...categories.map((c) => ({ label: c.path, value: c.id })),
  ];

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <Button asChild className="w-fit px-0" variant="link">
        <Link to="/completion">← Back to overview</Link>
      </Button>

      <PageHeader
        eyebrow="Compliance"
        subtitle="Who has acknowledged this policy, who hasn't, and when."
        title={policy.title}
      />

      <div className="flex flex-wrap items-end gap-3">
        <form className="flex flex-wrap items-end gap-3" method="get">
          <Field label="Group">
            <Select defaultValue={groupId ?? ""} name="groupId" options={categoryOptions} />
          </Field>
          <Button type="submit" variant="secondary">
            Apply
          </Button>
        </form>
        {report && policy.currentPublishedVersionId ? (
          <Button asChild variant="secondary">
            <Link
              reloadDocument
              to={`/resources/acks-export?${new URLSearchParams({
                number: policy.number,
                policyVersionId: policy.currentPublishedVersionId,
              }).toString()}`}
            >
              Export CSV
            </Link>
          </Button>
        ) : null}
      </div>

      {!report || !roster ? (
        <EmptyState
          description="This policy has no published version, so there is no acknowledgement audience yet."
          title="Nothing to report"
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <Card>
              <CardBody className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tabular-nums text-ink">
                  {report.totalAudience}
                </span>
                <span className="text-sm text-muted">Audience</span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tabular-nums text-ink">
                  {report.totalAcked}
                </span>
                <span className="text-sm text-muted">Acknowledged</span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tabular-nums text-ink">
                  {report.completionPct}%
                </span>
                <span className="text-sm text-muted">Completion</span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tabular-nums text-ink">
                  {report.avgDaysToAck}d
                </span>
                <span className="text-sm text-muted">Avg days to ack</span>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex flex-col gap-1">
                <span className="text-2xl font-semibold tabular-nums text-ink">
                  {report.viewedNotAckedCount}
                </span>
                <span className="text-sm text-muted">Viewed, not acked</span>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="flex flex-col gap-2">
              <div className="flex justify-between text-sm text-muted">
                <span>Completion progress</span>
                <span>
                  {report.totalAcked} / {report.totalAudience}
                </span>
              </div>
              <Progress value={report.completionPct} />
            </CardBody>
          </Card>

          {report.overdue.length > 0 ? (
            <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/5 px-4 py-2.5 text-sm">
              <strong>{report.overdue.length}</strong>{" "}
              {report.overdue.length === 1 ? "user is" : "users are"} overdue for acknowledgement.
            </div>
          ) : null}

          <Tabs onValueChange={(v) => setTab(v as "acked" | "pending")} value={tab}>
            <TabsList>
              <TabsTrigger value="acked">Acknowledged ({roster.acked.length})</TabsTrigger>
              <TabsTrigger value="pending">Not yet ({roster.pending.length})</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              {(tab === "acked" ? roster.acked : roster.pending).length === 0 ? (
                <EmptyState
                  description={
                    tab === "acked"
                      ? "No one in this audience has acknowledged the policy yet."
                      : "Everyone in this audience has acknowledged the policy."
                  }
                  title={tab === "acked" ? "No acknowledgements yet" : "No pending users"}
                />
              ) : (
                <Table>
                  <THead>
                    <tr>
                      <TH>User</TH>
                      <TH>Email</TH>
                      {tab === "acked" ? <TH>Acknowledged</TH> : null}
                    </tr>
                  </THead>
                  <tbody>
                    {(tab === "acked" ? roster.acked : roster.pending).map((entry) => (
                      <tr key={entry.userId}>
                        <TD>{entry.userName ?? entry.email}</TD>
                        <TD className="text-muted">{entry.email}</TD>
                        {tab === "acked" ? (
                          <TD className="text-muted">
                            {entry.ackedAt ? new Date(entry.ackedAt).toLocaleDateString() : "—"}
                          </TD>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
