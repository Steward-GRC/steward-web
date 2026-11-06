// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0

export interface AuditFilters {
  /** Action codes; the log keeps a record whose action is any one of them. */
  actions: string[];
  actor?: AuditPick;
  group?: AuditPick;
  subject?: AuditPick;
  /** The kind of thing the entry is about, the part of its subject before the colon. */
  subjectType?: AuditSubjectType;
}

/** What a picked person, group or subject stands for in the address: the id, and a label for its chip. */
export interface AuditPick {
  id: string;
  label: string;
}

/** The fixed kinds a subject can be (#106). */
export const AUDIT_SUBJECT_TYPES = [
  "policy",
  "procedure",
  "category",
  "user",
  "group",
  "template",
] as const;
export type AuditSubjectType = (typeof AUDIT_SUBJECT_TYPES)[number];

const isSubjectType = (value: null | string): value is AuditSubjectType =>
  AUDIT_SUBJECT_TYPES.includes(value as AuditSubjectType);

const pick = (parameters: URLSearchParams, id: string, name: string): AuditPick | undefined => {
  const value = parameters.get(id)?.trim();
  return value ? { id: value, label: parameters.get(name)?.trim() || value } : undefined;
};

/** The filters an address carries, so a filtered view can be shared. */
export const auditFiltersFrom = (parameters: URLSearchParams): AuditFilters => {
  const type = parameters.get("type");
  return {
    actions: parameters.getAll("action").filter(Boolean),
    ...(pick(parameters, "actor", "actorName")
      ? { actor: pick(parameters, "actor", "actorName") }
      : {}),
    ...(pick(parameters, "group", "groupName")
      ? { group: pick(parameters, "group", "groupName") }
      : {}),
    ...(pick(parameters, "subject", "subjectName")
      ? { subject: pick(parameters, "subject", "subjectName") }
      : {}),
    ...(isSubjectType(type) ? { subjectType: type } : {}),
  };
};

/** The address that carries these filters (and nothing of the paging cursor). */
export const auditFilterParameters = (filters: AuditFilters): URLSearchParams => {
  const parameters = new URLSearchParams();
  if (filters.actor) {
    parameters.set("actor", filters.actor.id);
    parameters.set("actorName", filters.actor.label);
  }
  if (filters.group) {
    parameters.set("group", filters.group.id);
    parameters.set("groupName", filters.group.label);
  }
  if (filters.subject) {
    parameters.set("subject", filters.subject.id);
    parameters.set("subjectName", filters.subject.label);
  }
  if (filters.subjectType) parameters.set("type", filters.subjectType);
  for (const action of filters.actions) parameters.append("action", action);
  return parameters;
};

export interface AuditChip {
  key: string;
  label: string;
  /** The filters without this one. */
  without: (filters: AuditFilters) => AuditFilters;
}

const omit = <K extends keyof AuditFilters>(filters: AuditFilters, key: K): AuditFilters => {
  const { [key]: _removed, ...rest } = filters;
  return rest as AuditFilters;
};

interface ChipLabels {
  action: (code: string) => string;
  actor: string;
  group: string;
  subject: string;
  type: (type: string) => string;
}

const PLAIN_LABELS: ChipLabels = {
  action: (code) => code,
  actor: "Actor",
  group: "Group",
  subject: "Subject",
  type: (type) => type,
};

/** One removable chip per active filter, and one per action. `labels` words them. */
export const auditChips = (
  filters: AuditFilters,
  labels: ChipLabels = PLAIN_LABELS,
): AuditChip[] => [
  ...(filters.actor
    ? [
        {
          key: "actor",
          label: `${labels.actor}: ${filters.actor.label}`,
          without: (f: AuditFilters) => omit(f, "actor"),
        },
      ]
    : []),
  ...(filters.group
    ? [
        {
          key: "group",
          label: `${labels.group}: ${filters.group.label}`,
          without: (f: AuditFilters) => omit(f, "group"),
        },
      ]
    : []),
  ...(filters.subject
    ? [
        {
          key: "subject",
          label: `${labels.subject}: ${filters.subject.label}`,
          without: (f: AuditFilters) => omit(f, "subject"),
        },
      ]
    : []),
  ...(filters.subjectType
    ? [
        {
          key: "type",
          label: labels.type(filters.subjectType),
          without: (f: AuditFilters) => omit(f, "subjectType"),
        },
      ]
    : []),
  ...filters.actions.map((code) => ({
    key: `action:${code}`,
    label: labels.action(code),
    without: (f: AuditFilters) => ({ ...f, actions: f.actions.filter((a) => a !== code) }),
  })),
];

/**
 * The filters the audit service cannot apply yet (steward-gateway#83): several actions and the
 * subject type are applied here to the page the log returns, so the view is right even before
 * the service filters server-side.
 */
export const keepMatching = <T extends { action: string; subject: string }>(
  records: readonly T[],
  filters: Pick<AuditFilters, "actions" | "subjectType">,
): T[] =>
  records.filter(
    (record) =>
      (filters.actions.length === 0 || filters.actions.includes(record.action)) &&
      (!filters.subjectType || record.subject.startsWith(`${filters.subjectType}:`)),
  );
