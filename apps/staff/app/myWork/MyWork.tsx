// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import { ReachError } from "@steward-web/ui";
import { Check, ChevronRight, CircleCheck, PencilLine, Stamp } from "lucide-react";
import { type ReactNode, useId } from "react";
import { Link } from "react-router";

import type { LibraryOverview, MyWorkData, WorkRow } from "./myWork.server";

// The Home and Library canvas's cards: the surface, a 1 px border, 10 px corners.
const card = "overflow-hidden rounded-[10px] border border-border bg-surface";
const cardHead =
  "border-b border-border-strong bg-sunken px-4 py-3 text-[15px] font-semibold text-ink";
const rowAction =
  "flex h-8 flex-none items-center rounded-md bg-primary px-3 text-sm font-semibold text-on-primary hover:bg-primary-hover hover:text-on-primary";

/** The page heading every My work variant starts with (U1, U1r). */
const Heading = ({ email }: { email: string }) => {
  const { t } = useTranslation("approvals");
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted">{t("myWork.eyebrow", { email })}</span>
      <h1 className="text-[30px] leading-[38px] font-semibold">{t("myWork.title")}</h1>
      <span className="text-[15px] text-muted">{t("myWork.subtitle")}</span>
    </div>
  );
};

/** One role card (U1): an icon, what it counts and a chevron, over the count; a link. */
const RoleCard = ({
  count,
  icon,
  label,
  to,
}: {
  count: number;
  icon: ReactNode;
  label: string;
  to: string;
}) => (
  <Link
    aria-label={`${label} ${count}`}
    className="flex flex-col gap-1.5 rounded-[10px] border border-border bg-surface px-[18px] py-4 text-ink shadow-1 hover:border-border-strong hover:text-ink"
    to={to}
  >
    <span className="flex items-center justify-between text-sm font-medium text-muted">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ChevronRight aria-hidden="true" className="size-[1.15em]" />
    </span>
    <span className="text-[30px] font-semibold">{count}</span>
  </Link>
);

/** A titled card that names itself for screen readers. */
const Card = ({
  children,
  className = "",
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) => {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={`${card} ${className}`}>
      <h2 className={cardHead} id={headingId}>
        {title}
      </h2>
      {children}
    </section>
  );
};

/** U1's library overview: five counts, then a plum bar per category. */
const Library = ({ library }: { library: LibraryOverview }) => {
  const { t } = useTranslation("approvals");
  const most = Math.max(1, ...library.byCategory.map((c) => c.count));
  const tiles: [string, number, string?][] = [
    [t("myWork.library.policies"), library.policies],
    [t("myWork.library.published"), library.published],
    [t("myWork.library.drafts"), library.drafts],
    [t("myWork.library.inReview"), library.inReview],
    [t("myWork.library.sensitive"), library.sensitive, t("myWork.library.sensitiveNote")],
  ];
  return (
    <Card title={t("myWork.library.title")}>
      <div className="grid grid-cols-2 sm:grid-cols-5">
        {tiles.map(([label, value, note]) => (
          <div
            className="flex flex-col gap-1 border-r border-border px-4 py-3.5 last:border-r-0"
            data-testid={`library-${label}`}
            key={label}
          >
            <span className="text-xs font-medium text-muted">{label}</span>
            <span className="text-[22px] font-semibold">{value}</span>
            {note ? <span className="text-[11px] text-muted">{note}</span> : null}
          </div>
        ))}
      </div>
      {library.byCategory.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-border px-[18px] py-3.5">
          <span className="text-sm font-semibold">{t("myWork.library.byCategory")}</span>
          {library.byCategory.map((category) => (
            <div
              className="grid grid-cols-[100px_1fr_30px] items-center gap-2.5 text-sm"
              key={category.name}
            >
              <span className="truncate">{category.name}</span>
              <span
                aria-label={category.name}
                aria-valuemax={most}
                aria-valuemin={0}
                aria-valuenow={category.count}
                className="h-2 overflow-hidden rounded-[4px] bg-sunken"
                role="meter"
              >
                <span
                  className="block h-full rounded-[4px] bg-primary"
                  style={{ width: `${(category.count / most) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono text-muted">{category.count}</span>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
};

const percentOf = ({ done, required }: { done: number; required: number }) =>
  required > 0 ? Math.round((done / required) * 100) : 0;

/** U1's compliance card: the percentage, a bar and the summary line. */
const Compliance = ({ ack }: { ack: { done: number; required: number } }) => {
  const { t } = useTranslation("approvals");
  const headingId = useId();
  const percent = percentOf(ack);
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-2.5 rounded-[10px] border border-border bg-surface px-[18px] py-4"
    >
      <h2 className="text-[15px] font-semibold" id={headingId}>
        {t("myWork.compliance.title")}
      </h2>
      {ack.required > 0 ? (
        <>
          <span className="text-[34px] font-semibold">
            {t("myWork.compliance.percent", { percent })}
          </span>
          <div
            aria-labelledby={headingId}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={percent}
            className="h-2.5 overflow-hidden rounded-full bg-sunken shadow-[inset_0_0_0_1px_var(--border)]"
            role="progressbar"
          >
            <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
          </div>
          <span className="leading-[1.45] text-muted">
            {t("myWork.compliance.summary", { ...ack, waiting: ack.required - ack.done })}
          </span>
        </>
      ) : (
        <span className="leading-[1.45] text-muted">{t("myWork.compliance.empty")}</span>
      )}
    </section>
  );
};

/** One row of a U1 list: the title over its mono line, and its action. */
const ListRow = ({
  action,
  meta,
  primary,
  row,
}: {
  action: string;
  meta: string;
  primary: boolean;
  row: WorkRow;
}) => (
  <li className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0">
    <span className="flex min-w-0 flex-col">
      <b className="truncate font-semibold">{row.title}</b>
      <span className="font-mono text-xs text-muted">{meta}</span>
    </span>
    <Link
      className={
        primary ? rowAction : "flex-none font-semibold text-primary hover:text-primary-hover"
      }
      to={row.href}
    >
      {action}
    </Link>
  </li>
);

const List = ({
  children,
  empty,
  rows,
  title,
}: {
  children: (row: WorkRow) => ReactNode;
  empty: string;
  rows: WorkRow[];
  title: string;
}) => (
  <Card title={title}>
    {rows.length > 0 ? (
      <ul>{rows.map((row) => children(row))}</ul>
    ) : (
      <p className="px-4 py-3 text-muted">{empty}</p>
    )}
  </Card>
);

/** U1r: a reader's page is the ring, the next action and nothing for roles they don't have. */
const ReaderCompliance = ({
  ack,
  next,
}: {
  ack: { done: number; required: number };
  next?: WorkRow;
}) => {
  const { t } = useTranslation("approvals");
  const percent = percentOf(ack);
  return (
    <section className="grid items-center gap-6 rounded-xl border border-border bg-surface px-6 py-[22px] sm:grid-cols-[150px_1fr]">
      <div
        aria-label={t("myWork.compliance.ringLabel", { percent })}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={percent}
        className="flex size-[140px] items-center justify-center rounded-full"
        role="progressbar"
        style={{
          background: `conic-gradient(var(--primary) 0 ${percent}%, var(--sunken) ${percent}% 100%)`,
        }}
      >
        <div className="flex size-[104px] flex-col items-center justify-center rounded-full bg-surface">
          <b className="text-[28px] font-semibold">{t("myWork.compliance.percent", { percent })}</b>
          <span className="text-[11px] text-muted">{t("myWork.compliance.acknowledged")}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-[17px] font-semibold">{t("myWork.compliance.title")}</h2>
        <span className="leading-normal text-muted">
          {ack.required > 0
            ? t("myWork.compliance.summary", { ...ack, waiting: ack.required - ack.done })
            : t("myWork.compliance.empty")}
        </span>
        {next ? (
          <Link
            className="flex h-10 items-center self-start rounded-md bg-primary px-4 font-semibold text-on-primary hover:bg-primary-hover hover:text-on-primary"
            to={next.href}
          >
            {t("myWork.compliance.next", { title: next.title })}
          </Link>
        ) : null}
      </div>
    </section>
  );
};

/**
 * My work (U1), the staff home: everything waiting on the person, across their roles. An
 * author and approver gets the role cards, the library overview, their compliance and three
 * lists; a reader gets the compliance ring and the next thing to read (U1r), which is their
 * whole page, not an empty one.
 */
export const MyWork = ({ data }: { data: MyWorkData }) => {
  const { t } = useTranslation("approvals");
  const { ack, approvals, drafts, library, obligations } = data;
  const reader = drafts === null && approvals === null;

  if (reader) {
    return (
      <div className="flex flex-col gap-[18px] px-4 py-7 text-base text-ink sm:px-8">
        <Heading email={data.email} />
        {ack ? <ReaderCompliance ack={ack} next={obligations?.[0]} /> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[22px] px-4 py-7 text-base text-ink sm:px-8">
      <Heading email={data.email} />
      <div className="grid gap-3.5 sm:grid-cols-3">
        {drafts ? (
          <RoleCard
            count={drafts.length}
            icon={<PencilLine aria-hidden="true" className="size-[1.15em]" />}
            label={t("myWork.cards.drafts")}
            to="/drafts"
          />
        ) : null}
        {approvals ? (
          <RoleCard
            count={approvals.length}
            icon={<Stamp aria-hidden="true" className="size-[1.15em]" />}
            label={t("myWork.cards.approvals")}
            to="/approvals"
          />
        ) : null}
        {obligations ? (
          <RoleCard
            count={obligations.length}
            icon={<CircleCheck aria-hidden="true" className="size-[1.15em]" />}
            label={t("myWork.cards.toAcknowledge")}
            to="/acknowledge"
          />
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {library ? <Library library={library} /> : <div />}
        {ack ? <Compliance ack={ack} /> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {drafts ? (
          <List empty={t("myWork.drafts.empty")} rows={drafts} title={t("myWork.drafts.title")}>
            {(row) => (
              <ListRow
                action={t("myWork.drafts.action")}
                key={row.href}
                meta={t("myWork.drafts.meta", { version: row.version })}
                primary={false}
                row={row}
              />
            )}
          </List>
        ) : null}
        {approvals ? (
          <List
            empty={t("myWork.approvals.empty")}
            rows={approvals}
            title={t("myWork.approvals.title")}
          >
            {(row) => (
              <ListRow
                action={t("myWork.approvals.action")}
                key={row.href}
                meta={
                  row.dueAt
                    ? t("myWork.approvals.due", {
                        date: formatDate(row.dueAt),
                        version: row.version,
                      })
                    : t("myWork.approvals.noDue", { version: row.version })
                }
                primary
                row={row}
              />
            )}
          </List>
        ) : null}
        {obligations ? (
          <List
            empty={t("myWork.acknowledge.empty")}
            rows={obligations}
            title={t("myWork.acknowledge.title")}
          >
            {(row) => (
              <ListRow
                action={t("myWork.acknowledge.action")}
                key={row.href}
                meta={t("myWork.approvals.noDue", { version: row.version })}
                primary
                row={row}
              />
            )}
          </List>
        ) : null}
      </div>
    </div>
  );
};

/**
 * To acknowledge (U2): the published policies the person must confirm they have read, each
 * with Read & acknowledge, or "You're all caught up".
 */
export const ToAcknowledge = ({ obligations }: { obligations: null | WorkRow[] }) => {
  const { t } = useTranslation("approvals");
  const listId = useId();
  return (
    <div className="flex flex-col gap-4 px-4 py-6 text-base text-ink sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-semibold">{t("toAcknowledge.title")}</h1>
        <span className="text-muted">{t("toAcknowledge.subtitle")}</span>
      </div>
      {obligations === null ? (
        <ReachError action={t("toAcknowledge.loadAction")} />
      ) : obligations.length > 0 ? (
        <section aria-labelledby={listId} className={card}>
          <h2 className={cardHead} id={listId}>
            {t("toAcknowledge.list", { count: obligations.length })}
          </h2>
          <ul>
            {obligations.map((row) => (
              <li
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
                key={row.href}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <b className="font-semibold">{row.title}</b>
                  <span className="font-mono text-xs text-muted">
                    {t("toAcknowledge.meta", { number: row.number, version: row.version })}
                  </span>
                </span>
                <Link className={`${rowAction} h-[34px]`} to={row.href}>
                  {t("toAcknowledge.action")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[10px] border border-border bg-surface p-[30px] text-center">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-ok-soft text-xl text-ok"
          >
            <Check className="size-[1.15em]" />
          </span>
          <b className="text-md font-semibold">{t("toAcknowledge.empty.title")}</b>
          <span className="text-muted">{t("toAcknowledge.empty.body")}</span>
        </div>
      )}
    </div>
  );
};
