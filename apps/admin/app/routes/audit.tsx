// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime } from "@steward-web/i18n";
import { actionLabel, auditChainRange, displayLabel, refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  EmptyState,
  Field,
  Input,
  PageHeader,
  ResponsiveTable,
} from "@steward-web/ui";
import { data, Form, Link } from "react-router";

import type { Route } from "./+types/audit";

import { listAuditLog, verifyAuditChain } from "../audit/audit.server";
import { auditBackPath, olderThan, resumeFrom } from "../audit/resume";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const filters = {
    action: url.searchParams.get("action")?.trim() || undefined,
    actorUserId: url.searchParams.get("actor")?.trim() || undefined,
    groupId: url.searchParams.get("group")?.trim() || undefined,
    subject: url.searchParams.get("subject")?.trim() || undefined,
  };
  const cursor = olderThan(url.searchParams);
  const records = resumeFrom(await listAuditLog(request, filters), cursor);
  return { cursor, filters, records };
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

const fmt = (iso: string): string => formatDateTime(iso);

export default function AuditLog({ actionData, loaderData }: Route.ComponentProps) {
  const { cursor, filters, records } = loaderData;
  const range = auditChainRange(records);

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Assurance"
        subtitle="A tamper-evident record of every consequential action."
        title="Audit log"
      />

      {cursor.after || cursor.at ? (
        <Banner title="Showing older entries" tone="info">
          Entries after {cursor.at ? fmt(cursor.at) : "the last one you saw"}.{" "}
          <Link to={auditBackPath(filters)}>Show from the newest</Link>
        </Banner>
      ) : null}

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

      <ResponsiveTable
        columns={[
          {
            card: "meta",
            cell: (record) => fmt(record.occurredAt),
            className: "whitespace-nowrap text-sm text-muted",
            header: "When",
            key: "when",
            value: (record) => record.occurredAt,
          },
          {
            card: "title",
            cell: (record) => actionLabel(record.action),
            header: "Action",
            key: "action",
            value: (record) => actionLabel(record.action),
          },
          {
            card: "meta",
            cell: (record) => displayLabel(record.actorName, record.actorUserId),
            className: "text-muted",
            header: "Actor",
            key: "actor",
            value: (record) => displayLabel(record.actorName, record.actorUserId),
          },
          {
            card: "meta",
            cell: (record) => displayLabel(record.subjectLabel, record.subject),
            className: "text-muted",
            header: "Subject",
            key: "subject",
            value: (record) => displayLabel(record.subjectLabel, record.subject),
          },
          {
            card: "status",
            cell: (record) => (
              <Badge tone="neutral">{displayLabel(record.groupName, record.groupId)}</Badge>
            ),
            header: "Group",
            key: "group",
            value: (record) => displayLabel(record.groupName, record.groupId),
          },
        ]}
        empty={
          <EmptyState
            description="No audit records match these filters."
            title="No records found"
          />
        }
        label="Audit log"
        rowKey={(record) => record.id}
        rows={records}
        search={{
          label: "Search these records",
          placeholder: "Search these records",
          text: (record) =>
            [
              actionLabel(record.action),
              displayLabel(record.actorName, record.actorUserId),
              displayLabel(record.subjectLabel, record.subject),
              displayLabel(record.groupName, record.groupId),
            ].join(" "),
        }}
      />
    </div>
  );
}
