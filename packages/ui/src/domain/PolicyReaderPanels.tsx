import { useTranslation } from "@steward-web/i18n";
import { type ReactNode, useId } from "react";
import { Link } from "react-router";

// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { Card } from "#ui/components/Display";
import { EmptyState } from "#ui/feedback/States";
import { cn } from "#ui/lib/cn";

import type {
  PolicyContact,
  PolicyDefinition,
  PolicyReference,
  RelatedItem,
} from "./policyReaderModel";

import { policyPath } from "./policy";
import { ReferenceKind } from "./policyReaderModel";

/** The panels' card (U13–U16): a 15/600 title over its items, or the empty line. */
const Panel = ({
  children,
  empty,
  title,
}: {
  children: ReactNode;
  empty?: string;
  title: string;
}) => {
  const titleId = useId();
  return (
    <Card aria-labelledby={titleId} className="flex flex-col gap-3 p-[18px] text-ink">
      <h2 className="text-[15px] font-semibold" id={titleId}>
        {title}
      </h2>
      {empty ? <EmptyState title={empty} /> : children}
    </Card>
  );
};

/** An item's outline in the panels: a 1px inset border, radius 8. */
const item = "rounded-lg shadow-[inset_0_0_0_1px_var(--border)] hc:border hc:border-border";

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
  return (
    <Panel
      empty={definitions.length === 0 ? t("reader.definitions.empty") : undefined}
      title={t("reader.definitions.title")}
    >
      <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
    </Panel>
  );
};

/** The related panel (U14): the other documents this one links to, title over number. */
export const RelatedPanel = ({ related }: { related: readonly RelatedItem[] }) => {
  const { t } = useTranslation("policy");
  return (
    <Panel
      empty={related.length === 0 ? t("reader.related.empty") : undefined}
      title={t("reader.related.title")}
    >
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {related.map((r) => (
          <li key={`${r.policyId}-${r.label ?? ""}`}>
            <Link
              className={cn(item, "flex flex-col gap-0.5 px-3 py-2.5 hover:bg-sunken")}
              to={policyPath({ number: r.number })}
            >
              {r.label ? <span className="text-xs text-muted">{r.label}</span> : null}
              <span className="text-sm font-semibold text-primary">{r.title}</span>
              <span className="font-mono text-xs text-muted">{r.number}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

/** Each reference kind's badge colours (U15). */
const KIND_TONE: Readonly<Record<ReferenceKind, string>> = {
  [ReferenceKind.Link]: "bg-neutral-soft text-neutral",
  [ReferenceKind.Standard]: "bg-info-soft text-info",
  [ReferenceKind.Text]: "bg-sunken text-muted",
};

/** The references panel (U15): grouped by kind, each with its kind badge, label and clause. */
export const ReferencesPanel = ({ references }: { references: readonly PolicyReference[] }) => {
  const { t } = useTranslation("policy");
  const order = [ReferenceKind.Standard, ReferenceKind.Text, ReferenceKind.Link];
  const sorted = order.flatMap((kind) => references.filter((r) => r.kind === kind));
  return (
    <Panel
      empty={references.length === 0 ? t("reader.references.empty") : undefined}
      title={t("reader.references.title")}
    >
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((reference) => (
          <li className={cn(item, "flex items-start gap-2 px-3 py-2.5")} key={reference.id}>
            <span
              className={cn(
                "flex-none rounded-[3px] px-1.5 py-0.5 text-[11px] font-semibold hc:outline hc:outline-1",
                KIND_TONE[reference.kind],
              )}
            >
              {t(`reader.references.kind.${reference.kind.toLowerCase()}`)}
            </span>
            <span className="flex flex-col gap-1 text-sm leading-[1.4]">
              <span>
                {reference.kind === ReferenceKind.Link && reference.url ? (
                  <a
                    className="text-primary underline hover:text-primary-hover"
                    href={reference.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {reference.label}
                  </a>
                ) : (
                  reference.label
                )}
                {reference.clause ? (
                  <>
                    {" · "}
                    <span className="font-mono text-xs">{reference.clause}</span>
                  </>
                ) : null}
              </span>
              {reference.body ? <span className="text-muted">{reference.body}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};

/** One contact block's card (U16): label, name, then its details as a list. */
const ContactCard = ({ contact }: { contact: PolicyContact }) => {
  const { t } = useTranslation("policy");
  const labelId = useId();
  const rows: [string, ReactNode][] = [];
  if (contact.role) rows.push([t("reader.contacts.role"), contact.role]);
  if (contact.department) rows.push([t("reader.contacts.department"), contact.department]);
  if (contact.email) {
    rows.push([
      t("reader.contacts.email"),
      <a className="text-primary hover:underline" href={`mailto:${contact.email}`} key="email">
        {contact.email}
      </a>,
    ]);
  }
  if (contact.phone) {
    rows.push([
      t("reader.contacts.phone"),
      <span className="font-mono" key="phone">
        {contact.phone}
      </span>,
    ]);
  }
  if (contact.hours) rows.push([t("reader.contacts.hours"), contact.hours]);
  if (contact.notes) rows.push([t("reader.contacts.notes"), contact.notes]);
  return (
    <div
      aria-labelledby={labelId}
      className={cn(item, "flex flex-col gap-1.5 p-3.5 text-sm")}
      role="group"
    >
      <span className="text-xs font-semibold text-muted" id={labelId}>
        {contact.label}
      </span>
      {contact.name ? <span className="text-base font-semibold">{contact.name}</span> : null}
      {rows.length > 0 ? (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
          {rows.map(([term, value]) => (
            <div className="contents" key={term}>
              <dt className="text-muted">{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
};

/** The contacts panel (U16): one card per attached contact block. */
export const ContactsPanel = ({ contacts }: { contacts: readonly PolicyContact[] }) => {
  const { t } = useTranslation("policy");
  return (
    <Panel
      empty={contacts.length === 0 ? t("reader.contacts.empty") : undefined}
      title={t("reader.contacts.title")}
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {contacts.map((contact) => (
          <ContactCard contact={contact} key={contact.id} />
        ))}
      </div>
    </Panel>
  );
};
