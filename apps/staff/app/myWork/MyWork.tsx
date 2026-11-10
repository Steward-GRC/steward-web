// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDate, useTranslation } from "@steward-web/i18n";
import {
  Card,
  EmptyState,
  ReachError,
  StatCard,
  Tally,
  UpdatedJustNow,
  useLiveList,
} from "@steward-web/ui";
import { Check, CircleCheck, PencilLine, Stamp } from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router";

import type { LibraryOverview, MyWorkData, WorkRow } from "./myWork.server";

import { AcknowledgeList } from "./AcknowledgeList";

// The Home and Library canvas's cards: the surface, a 1 px border, 10 px corners.
/** How many rows each home list shows before it links to its full list page. */
const HOME_LIST_CAP = 5;
/** The boxes share the row equally (bug log 61): thirds, or halves when access hides one. They
 *  stack below the md breakpoint. Full class names so Tailwind finds them. */
const listColumns: Record<number, string> = { 2: "md:grid-cols-2", 3: "md:grid-cols-3" };
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

/** U1's library overview: five counts, then a plum bar per category. */
const Library = ({ library }: { library: LibraryOverview }) => {
  const { t } = useTranslation("approvals");
  const most = Math.max(1, ...library.byCategory.map((c) => c.count));
  const tiles: [string, number][] = [
    [t("myWork.library.policies"), library.policies],
    [t("myWork.library.published"), library.published],
    [t("myWork.library.drafts"), library.drafts],
    [t("myWork.library.inReview"), library.inReview],
    [t("myWork.library.sensitive"), library.sensitive],
  ];
  return (
    <Card title={t("myWork.library.title")}>
      <div className="grid grid-cols-2 sm:grid-cols-5">
        {tiles.map(([label, value]) => (
          <div
            className="flex flex-col gap-1 border-r border-border px-4 py-3.5 last:border-r-0"
            data-testid={`library-${label}`}
            key={label}
          >
            <span className="text-xs font-medium text-muted">{label}</span>
            <Tally className="self-start" size="lg">
              {value}
            </Tally>
          </div>
        ))}
      </div>
      {library.byCategory.length > 0 ? (
        <div className="flex flex-col gap-2 border-t border-border px-[18px] py-3.5">
          <span className="text-sm font-semibold">{t("myWork.library.byCategory")}</span>
          {library.byCategory.map((category) => (
            <div
              className="grid grid-cols-[100px_1fr_30px] items-center gap-2.5 text-sm"
              data-testid={`library-category-${category.name}`}
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
                  className="block h-full rounded-[4px] bg-accent"
                  style={{ width: `${(category.count / most) * 100}%` }}
                />
              </span>
              <Tally className="justify-self-end">{category.count}</Tally>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
};

const percentOf = ({ done, required }: { done: number; required: number }) =>
  required > 0 ? Math.round((done / required) * 100) : 0;

/** U1's compliance card: the banded header, then the percentage, a bar and the summary line. */
const Compliance = ({ ack }: { ack: { done: number; required: number } }) => {
  const { t } = useTranslation("approvals");
  const percent = percentOf(ack);
  return (
    <Card title={t("myWork.compliance.title")}>
      <div className="flex flex-col gap-2.5 px-[18px] py-4">
        {ack.required > 0 ? (
          <>
            <Tally className="self-start" size="lg">
              {t("myWork.compliance.percent", { percent })}
            </Tally>
            <div
              aria-label={t("myWork.compliance.title")}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={percent}
              className="h-2.5 overflow-hidden rounded-full bg-sunken shadow-[inset_0_0_0_1px_var(--border)]"
              role="progressbar"
            >
              <div
                className="h-full rounded-full bg-accent"
                data-testid="progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="leading-[1.45] text-muted">
              {t("myWork.compliance.summary", { ...ack, waiting: ack.required - ack.done })}
            </span>
          </>
        ) : (
          <span className="leading-[1.45] text-muted">{t("myWork.compliance.empty")}</span>
        )}
      </div>
    </Card>
  );
};

/** One row of a U1 list: the title over its mono line, and its action. */
const ListRow = ({
  action,
  flash = false,
  meta,
  primary,
  row,
}: {
  action: string;
  /** The live-update flash (6-states.s5), when this row changed since the page last loaded. */
  flash?: boolean;
  meta: string;
  primary: boolean;
  row: WorkRow;
}) => (
  <li
    className={`flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-b-0 ${flash ? "stw-updated" : ""}`}
  >
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

/**
 * One of U1's lists. A row that's new or changed since the page last loaded flashes soft plum
 * once, and the card's band says "Updated just now" (6-states.s5).
 */
const List = ({
  children,
  empty,
  rows,
  title,
  to,
}: {
  children: (row: WorkRow, flash: boolean) => ReactNode;
  empty: string;
  rows: WorkRow[];
  title: string;
  /** The full list page, linked when more rows exist than the home shows. */
  to: string;
}) => {
  const { t } = useTranslation("approvals");
  const live = useLiveList(rows.map((row) => [row.href, JSON.stringify(row)] as const));
  return (
    <Card aside={<UpdatedJustNow at={live.updatedAt} className="font-normal" />} title={title}>
      {rows.length > 0 ? (
        <ul>{rows.slice(0, HOME_LIST_CAP).map((row) => children(row, live.flashing(row.href)))}</ul>
      ) : (
        <p className="px-4 py-3 text-muted">{empty}</p>
      )}
      {rows.length > HOME_LIST_CAP ? (
        <Link
          className="block border-t border-border px-4 py-3 font-semibold text-primary hover:text-primary-hover"
          to={to}
        >
          {t("myWork.viewAll", { count: rows.length })}
        </Link>
      ) : null}
    </Card>
  );
};

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
          background: `conic-gradient(var(--accent) 0 ${percent}%, var(--sunken) ${percent}% 100%)`,
        }}
      >
        <div className="flex size-[104px] flex-col items-center justify-center rounded-full bg-surface">
          <Tally size="lg">{t("myWork.compliance.percent", { percent })}</Tally>
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
  const listCount = [drafts, approvals, obligations].filter(Boolean).length;

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
      <div
        className={`grid grid-cols-1 gap-3.5 ${listColumns[listCount] ?? ""}`}
        data-testid="home-cards"
      >
        {drafts ? (
          <StatCard
            icon={<PencilLine aria-hidden="true" className="size-[1.15em]" />}
            label={t("myWork.cards.drafts")}
            size="lg"
            to="/drafts"
            value={drafts.length}
          />
        ) : null}
        {approvals ? (
          <StatCard
            icon={<Stamp aria-hidden="true" className="size-[1.15em]" />}
            label={t("myWork.cards.approvals")}
            size="lg"
            to="/approvals"
            value={approvals.length}
          />
        ) : null}
        {obligations ? (
          <StatCard
            icon={<CircleCheck aria-hidden="true" className="size-[1.15em]" />}
            label={t("myWork.cards.toAcknowledge")}
            size="lg"
            to="/acknowledge"
            value={obligations.length}
          />
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {library ? <Library library={library} /> : <div />}
        {ack ? <Compliance ack={ack} /> : null}
      </div>
      <div
        className={`grid grid-cols-1 gap-4 ${listColumns[listCount] ?? ""}`}
        data-testid="home-lists"
      >
        {drafts ? (
          <List
            empty={t("myWork.drafts.empty")}
            rows={drafts}
            title={t("myWork.drafts.title")}
            to="/drafts"
          >
            {(row, flash) => (
              <ListRow
                action={t("myWork.drafts.action")}
                flash={flash}
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
            to="/approvals"
          >
            {(row, flash) => (
              <ListRow
                action={t("myWork.approvals.action")}
                flash={flash}
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
            to="/acknowledge"
          >
            {(row, flash) => (
              <ListRow
                action={t("myWork.acknowledge.action")}
                flash={flash}
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
  return (
    <div className="flex flex-col gap-4 px-4 py-6 text-base text-ink sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-semibold">{t("toAcknowledge.title")}</h1>
        <span className="text-muted">{t("toAcknowledge.subtitle")}</span>
      </div>
      {obligations === null ? (
        <ReachError action={t("toAcknowledge.loadAction")} />
      ) : obligations.length > 0 ? (
        <Card title={t("toAcknowledge.list", { count: obligations.length })}>
          <AcknowledgeList
            label={t("toAcknowledge.list", { count: obligations.length })}
            rows={obligations}
          />
        </Card>
      ) : (
        <EmptyState
          description={t("toAcknowledge.empty.body")}
          framed
          icon={<Check className="size-6 text-ok" />}
          title={t("toAcknowledge.empty.title")}
        />
      )}
    </div>
  );
};
