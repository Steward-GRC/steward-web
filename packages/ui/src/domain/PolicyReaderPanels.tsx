// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";

import { Card, CardBody } from "#ui/components/Display";
import { EmptyState } from "#ui/feedback/States";

import type {
  PolicyContact,
  PolicyDefinition,
  PolicyReference,
  RelatedPolicy,
} from "./policyReaderModel";

import { policyPath } from "./policy";
import { ReferenceKind } from "./policyReaderModel";

/**
 * The definitions panel (U13): this policy's attached glossary entries, read-only. A term
 * opened from the body is highlighted in soft plum for two seconds.
 */
export const DefinitionsPanel = ({
  definitions,
  highlighted,
}: {
  definitions: readonly PolicyDefinition[];
  /** The definition a term link just opened. */
  highlighted?: string;
}) => {
  const { t } = useTranslation("policy");
  if (definitions.length === 0) {
    return <EmptyState title={t("reader.definitions.empty")} />;
  }
  return (
    <dl className="grid gap-3">
      {definitions.map((definition) => {
        const on = definition.id === highlighted;
        return (
          <div
            className={
              on
                ? "flex flex-col gap-1 rounded-lg bg-primary-soft p-3 shadow-[inset_0_0_0_1.5px_var(--primary)]"
                : "flex flex-col gap-1 rounded-lg p-3 shadow-[inset_0_0_0_1px_var(--border)]"
            }
            data-highlighted={on ? "true" : undefined}
            data-testid={`definition-${definition.id}`}
            id={`def-${definition.id}`}
            key={definition.id}
          >
            <dt className="font-serif text-[15px] font-semibold text-ink">{definition.term}</dt>
            <dd className="text-base leading-normal text-ink">{definition.definition}</dd>
          </div>
        );
      })}
    </dl>
  );
};

/** The related panel (U14): structured links to other policies, read-only. */
export const RelatedPanel = ({ related }: { related: readonly RelatedPolicy[] }) => {
  const { t } = useTranslation("policy");
  if (related.length === 0) {
    return <EmptyState title={t("reader.related.empty")} />;
  }
  return (
    <ul className="grid gap-2">
      {related.map((r) => (
        <li key={r.policyId}>
          <a
            className="font-medium text-ink hover:underline"
            href={policyPath({ number: r.number })}
          >
            {r.number} · {r.title}
          </a>
        </li>
      ))}
    </ul>
  );
};

/** The references panel (U15): references/standards attached to this policy, grouped by kind. */
export const ReferencesPanel = ({ references }: { references: readonly PolicyReference[] }) => {
  const { t } = useTranslation("policy");
  if (references.length === 0) {
    return <EmptyState title={t("reader.references.empty")} />;
  }
  return (
    <ul className="grid gap-3">
      {references.map((reference) => (
        <li className="grid gap-0.5" key={reference.id}>
          <span className="text-xs font-semibold tracking-[.04em] text-muted uppercase">
            {t(`reader.references.kind.${reference.kind.toLowerCase()}`)}
            {reference.clause ? ` · ${reference.clause}` : ""}
          </span>
          {reference.kind === ReferenceKind.Link && reference.url ? (
            <a className="font-medium text-ink hover:underline" href={reference.url}>
              {reference.label}
            </a>
          ) : (
            <span className="font-medium text-ink">{reference.label}</span>
          )}
          {reference.body ? <p className="text-base text-muted">{reference.body}</p> : null}
        </li>
      ))}
    </ul>
  );
};

/** The contacts panel (U16): reusable contact blocks attached to this policy, read-only. */
export const ContactsPanel = ({ contacts }: { contacts: readonly PolicyContact[] }) => {
  const { t } = useTranslation("policy");
  if (contacts.length === 0) {
    return <EmptyState title={t("reader.contacts.empty")} />;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {contacts.map((contact) => (
        <Card key={contact.id}>
          <CardBody className="grid gap-1">
            <p className="font-semibold text-ink">{contact.label}</p>
            {contact.name ? <p className="text-base text-ink">{contact.name}</p> : null}
            {contact.role ? <p className="text-sm text-muted">{contact.role}</p> : null}
            {contact.department ? <p className="text-sm text-muted">{contact.department}</p> : null}
            {contact.email ? (
              <a className="text-sm text-ink hover:underline" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
            ) : null}
            {contact.phone ? <p className="text-sm text-muted">{contact.phone}</p> : null}
            {contact.hours ? <p className="text-sm text-muted">{contact.hours}</p> : null}
            {contact.notes ? <p className="text-sm text-muted">{contact.notes}</p> : null}
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
