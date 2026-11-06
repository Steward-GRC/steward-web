// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime } from "@steward-web/i18n";
import {
  actionLabel,
  auditChainRange,
  displayLabel,
  KNOWN_AUDIT_ACTIONS,
  refusalOf,
} from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  EmptyState,
  Field,
  ListPage,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuTrigger,
  type PickerOption,
  ResponsiveTable,
  SearchPicker,
  Select,
} from "@steward-web/ui";
import { ChevronDown, X } from "lucide-react";
import { data, Form, Link, useSearchParams } from "react-router";

import type { Route } from "./+types/audit";

import { useSubjectSearch } from "../access/useSubjectSearch";
import { listAuditLog, verifyAuditChain } from "../audit/audit.server";
import {
  AUDIT_SUBJECT_TYPES,
  auditChips,
  auditFilterParameters,
  type AuditFilters,
  auditFiltersFrom,
} from "../audit/auditFilters";
import { auditBackPath, olderThan, resumeFrom } from "../audit/resume";
import { listGroups, orderedWithPaths } from "../categories/categories.server";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const filters = auditFiltersFrom(url.searchParams);
  const cursor = olderThan(url.searchParams);
  const [found, categories] = await Promise.all([
    listAuditLog(request, {
      actions: filters.actions,
      actorUserId: filters.actor?.id,
      groupId: filters.group?.id,
      subject: filters.subject?.id,
      subjectType: filters.subjectType,
    }),
    // A category's full path is a courtesy: without the right to list them the name stands.
    listGroups(request)
      .then((groups) => new Map(orderedWithPaths(groups).map((row) => [row.id, row.path])))
      .catch(() => new Map<string, string>()),
  ]);
  const records = resumeFrom(found, cursor).map((record) => ({
    ...record,
    groupPath: categories.get(record.groupId) ?? null,
  }));
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

const ANY = "__any__";

const asPick = (pick: AuditFilters["actor"]): null | PickerOption =>
  pick ? { id: pick.id, label: pick.label } : null;

const fmt = (iso: string): string => formatDateTime(iso);

export default function AuditLog({ actionData, loaderData }: Route.ComponentProps) {
  const { cursor, filters, records } = loaderData;
  const range = auditChainRange(records);
  const [parameters, setParameters] = useSearchParams();
  const searchActors = useSubjectSearch("user");
  const searchGroups = useSubjectSearch("category");
  const searchSubjects = useSubjectSearch("document");

  /** Writes new filters into the address (replacing the entry, and starting from the newest). */
  const apply = (next: AuditFilters) => {
    const written = auditFilterParameters(next);
    // The table's own search, sort and page keep what they were; the cursor does not.
    for (const [key, value] of parameters) {
      if (
        ![
          "action",
          "actor",
          "actorName",
          "after",
          "at",
          "group",
          "groupName",
          "subject",
          "subjectName",
          "type",
        ].includes(key)
      ) {
        written.set(key, value);
      }
    }
    setParameters(written, { replace: true });
  };
  const chips = auditChips(filters, {
    action: actionLabel,
    actor: "Actor",
    group: "Group",
    subject: "Subject",
    type: (type) => `Type: ${type}`,
  });
  const actionCodes = [
    ...new Set([
      ...KNOWN_AUDIT_ACTIONS,
      ...records.map((record) => record.action),
      ...filters.actions,
    ]),
  ].toSorted((a, b) => actionLabel(a).localeCompare(actionLabel(b)));

  return (
    <ListPage
      eyebrow="Assurance"
      filters={
        <>
          <Field className="w-56" label="Actor">
            <SearchPicker
              label="Actor"
              onChange={(pick) =>
                apply({ ...filters, actor: pick ? { id: pick.id, label: pick.label } : undefined })
              }
              placeholder="Search people"
              search={searchActors}
              value={asPick(filters.actor)}
            />
          </Field>
          <Field className="w-56" label="Group">
            <SearchPicker
              label="Group"
              onChange={(pick) =>
                apply({ ...filters, group: pick ? { id: pick.id, label: pick.label } : undefined })
              }
              placeholder="Search categories"
              search={searchGroups}
              value={asPick(filters.group)}
            />
          </Field>
          <Field className="w-56" label="Subject">
            <SearchPicker
              label="Subject"
              onChange={(pick) =>
                apply({
                  ...filters,
                  subject: pick ? { id: pick.id, label: pick.label } : undefined,
                })
              }
              placeholder="Policy or procedure"
              search={searchSubjects}
              value={asPick(filters.subject)}
            />
          </Field>
          <Field className="w-40" label="Subject type">
            <Select
              aria-label="Subject type"
              onValueChange={(value) =>
                apply({
                  ...filters,
                  subjectType: value === ANY ? undefined : (value as AuditFilters["subjectType"]),
                })
              }
              options={[
                { label: "Any type", value: ANY },
                ...AUDIT_SUBJECT_TYPES.map((type) => ({
                  label: type.charAt(0).toUpperCase() + type.slice(1),
                  value: type,
                })),
              ]}
              value={filters.subjectType ?? ANY}
            />
          </Field>
          <Menu>
            <MenuTrigger asChild>
              <Button className="h-9" variant="secondary">
                Actions
                {filters.actions.length > 0 ? ` (${String(filters.actions.length)})` : ""}
                <ChevronDown aria-hidden="true" className="size-4" />
              </Button>
            </MenuTrigger>
            <MenuContent align="start" className="max-h-80 overflow-y-auto">
              {actionCodes.map((code) => (
                <MenuCheckboxItem
                  checked={filters.actions.includes(code)}
                  key={code}
                  onCheckedChange={(on) =>
                    apply({
                      ...filters,
                      actions: on
                        ? [...filters.actions, code]
                        : filters.actions.filter((entry) => entry !== code),
                    })
                  }
                >
                  {actionLabel(code)}
                </MenuCheckboxItem>
              ))}
            </MenuContent>
          </Menu>
        </>
      }
      subtitle="A tamper-evident record of every consequential action."
      title="Audit log"
    >
      {chips.length > 0 ? (
        <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li
              className="flex h-7 items-center gap-1.5 rounded-full bg-sunken pr-1 pl-3 text-sm"
              key={chip.key}
            >
              {chip.label}
              <button
                aria-label={`Remove filter ${chip.label}`}
                className="flex size-5 items-center justify-center rounded-full text-muted hover:text-ink"
                onClick={() => apply(chip.without(filters))}
                type="button"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
          <li>
            <Button onClick={() => apply({ actions: [] })} size="sm" variant="ghost">
              Clear all filters
            </Button>
          </li>
        </ul>
      ) : null}

      {cursor.after || cursor.at ? (
        <Banner title="Showing older entries" tone="info">
          Entries after {cursor.at ? fmt(cursor.at) : "the last one you saw"}.{" "}
          <Link to={auditBackPath(filters)}>Show from the newest</Link>
        </Banner>
      ) : null}

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
              <Badge tone="neutral">
                {record.groupPath ?? displayLabel(record.groupName, record.groupId)}
              </Badge>
            ),
            header: "Group",
            key: "group",
            value: (record) => record.groupPath ?? displayLabel(record.groupName, record.groupId),
          },
        ]}
        empty={
          <EmptyState
            description="No audit records match these filters."
            title="No records found"
          />
        }
        label="Audit log"
        rowActions={(record) => [
          {
            label: "Only this actor",
            onSelect: () =>
              apply({
                ...filters,
                actor: {
                  id: record.actorUserId,
                  label: displayLabel(record.actorName, record.actorUserId),
                },
              }),
          },
          {
            label: "Only this subject",
            onSelect: () =>
              apply({
                ...filters,
                subject: {
                  id: record.subject,
                  label: displayLabel(record.subjectLabel, record.subject),
                },
              }),
          },
          {
            label: "Only this group",
            onSelect: () =>
              apply({
                ...filters,
                group: {
                  id: record.groupId,
                  label: record.groupPath ?? displayLabel(record.groupName, record.groupId),
                },
              }),
          },
        ]}
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
              record.groupPath ?? displayLabel(record.groupName, record.groupId),
            ].join(" "),
        }}
        striped
      />
    </ListPage>
  );
}
