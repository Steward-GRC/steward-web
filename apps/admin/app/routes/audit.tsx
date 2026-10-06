// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { data, Form } from "react-router";

import type { Route } from "./+types/audit";

import { listAuditLog, verifyAuditChain } from "../audit/audit.server";
import { actionLabel, auditChainRange, displayLabel } from "../audit/auditFormat";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const filters = {
    action: url.searchParams.get("action")?.trim() || undefined,
    actorUserId: url.searchParams.get("actor")?.trim() || undefined,
    groupId: url.searchParams.get("group")?.trim() || undefined,
    subject: url.searchParams.get("subject")?.trim() || undefined,
  };
  const records = await listAuditLog(request, filters);
  return { filters, records };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const fromRecordId = String(form.get("fromRecordId") ?? "");
  const toRecordId = String(form.get("toRecordId") ?? "");
  try {
    const result = await verifyAuditChain(request, fromRecordId, toRecordId);
    return data({ ok: true, result } as const);
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

const fmt = (iso: string): string =>
  new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function AuditLog({ actionData, loaderData }: Route.ComponentProps) {
  const { filters, records } = loaderData;
  const range = auditChainRange(records);

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Compliance"
        subtitle="A tamper-evident record of every consequential action."
        title="Audit log"
      />

      <Form className="flex flex-wrap items-end gap-4" method="get">
        <Field label="Action">
          <Input defaultValue={filters.action} name="action" placeholder="e.g. policy.published" />
        </Field>
        <Field label="Actor">
          <Input defaultValue={filters.actorUserId} name="actor" placeholder="user id" />
        </Field>
        <Field label="Subject">
          <Input defaultValue={filters.subject} name="subject" placeholder="e.g. POL-0012" />
        </Field>
        <Field label="Group">
          <Input defaultValue={filters.groupId} name="group" placeholder="group id" />
        </Field>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </Form>

      {range ? (
        <Form className="flex items-center gap-3" method="post">
          <input name="fromRecordId" type="hidden" value={range.fromRecordId} />
          <input name="toRecordId" type="hidden" value={range.toRecordId} />
          <Button type="submit" variant="secondary">
            Verify integrity
          </Button>
          {actionData?.ok ? (
            <Banner
              title={actionData.result.valid ? "Chain verified" : "Chain broken"}
              tone={actionData.result.valid ? "ok" : "danger"}
            >
              {actionData.result.recordsChecked} records checked
              {actionData.result.errors.length > 0
                ? ` — ${actionData.result.errors.join("; ")}`
                : ""}
            </Banner>
          ) : null}
          {actionData && !actionData.ok ? (
            <Banner failure={actionData.failure} title="Couldn't verify the chain" tone="danger" />
          ) : null}
        </Form>
      ) : null}

      {records.length === 0 ? (
        <EmptyState description="No audit records match these filters." title="No records found" />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>When</TH>
              <TH>Action</TH>
              <TH>Actor</TH>
              <TH>Subject</TH>
              <TH>Group</TH>
            </tr>
          </THead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <TD className="whitespace-nowrap text-sm text-muted">{fmt(record.occurredAt)}</TD>
                <TD>{actionLabel(record.action)}</TD>
                <TD className="text-muted">{displayLabel(record.actorName, record.actorUserId)}</TD>
                <TD className="text-muted">{displayLabel(record.subjectLabel, record.subject)}</TD>
                <TD>
                  <Badge tone="neutral">{displayLabel(record.groupName, record.groupId)}</Badge>
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
