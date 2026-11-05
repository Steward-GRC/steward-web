// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import {
  RaciGrant,
  type RaciRule,
  type RaciRuleInput,
  RaciSubjectKind,
} from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { ChevronDown, ChevronUp, Lock, X } from "lucide-react";
import { useId } from "react";

import { type AccessAction, ACTIONS, type DraftRule } from "./accessModel";

// The frame's grid (A5): #, the move arrows, the subject, then four 96 px action columns. A
// phone stacks each rule's cells under its subject instead (7-responsive-and-accessibility.s3).
const ROW =
  "grid grid-cols-[44px_40px_minmax(0,1fr)] items-center border-b border-border md:grid-cols-[44px_40px_minmax(0,1fr)_repeat(4,80px)] xl:grid-cols-[44px_40px_minmax(0,1fr)_repeat(4,96px)]";

const GLYPH: Record<RaciGrant, string> = {
  [RaciGrant.Allow]: "✓",
  [RaciGrant.Blank]: "·",
  [RaciGrant.Deny]: "✗",
};

// A cell is a word and an icon, so it never relies on colour: 80 × 30 px, tinted with its
// grant's access token and ringed in the same colour; a blank cell is a muted dot in a border.
const CELL: Record<RaciGrant, string> = {
  [RaciGrant.Allow]:
    "bg-[var(--access-allow-soft)] text-[var(--access-allow)] shadow-[inset_0_0_0_1px_var(--access-allow)]",
  [RaciGrant.Blank]: "bg-transparent text-muted shadow-[inset_0_0_0_1px_var(--border)]",
  [RaciGrant.Deny]:
    "bg-[var(--access-deny-soft)] text-[var(--access-deny)] shadow-[inset_0_0_0_1px_var(--access-deny)]",
};

const INHERITED_CELL: Record<RaciGrant, string> = {
  [RaciGrant.Allow]: "text-[var(--access-allow)]",
  [RaciGrant.Blank]: "text-muted",
  [RaciGrant.Deny]: "text-[var(--access-deny)]",
};

/** A cell's word: "✓ Allow", "✗ Deny", or just the dot for blank. Laptops show the icon only. */
const CellFace = ({ grant }: { grant: RaciGrant }) => {
  const { t } = useTranslation("admin");
  return (
    <span aria-hidden="true">
      {GLYPH[grant]}
      {grant === RaciGrant.Blank ? null : (
        <span className="md:max-xl:hidden"> {t(`access.rules.grants.${grant}`)}</span>
      )}
    </span>
  );
};

export interface RuleTableProps {
  /** Rules are being edited: cells cycle, rows move and can be removed. */
  editing: boolean;
  /** Rows the editor can't touch: the ancestors' rules, nearest ancestor first. */
  inherited: { from: string; rules: readonly RaciRule[] }[];
  /** Display names for user ids. */
  names: Record<string, string>;
  onCycle: (key: string, action: AccessAction) => void;
  onMove: (key: string, delta: -1 | 1) => void;
  onRemove: (key: string) => void;
  rules: readonly DraftRule[];
  /** The table's label: the "Rules" heading's id. */
  titleId: string;
}

/**
 * The access rule table (A5): the category's own rules top-down, "first match per action
 * wins", each with tri-state cells, then its ancestors' rules below, sunken and locked with
 * the ancestor they come from. A row the person moved keeps a plum edge until it's saved.
 */
export const RuleTable = ({
  editing,
  inherited,
  names,
  onCycle,
  onMove,
  onRemove,
  rules,
  titleId,
}: RuleTableProps) => {
  const { t } = useTranslation("admin");
  const legendId = useId();
  const subjectOf = (rule: RaciRuleInput) =>
    rule.subjectKind === RaciSubjectKind.Everyone
      ? t("access.rules.everyone")
      : rule.subjectKind === RaciSubjectKind.User
        ? (names[rule.subjectRef] ?? rule.subjectRef)
        : rule.subjectRef;

  const subjectCell = (
    rule: RaciRuleInput,
    note: string | undefined,
    remove?: { label: string; onClick: () => void },
  ) => (
    <span className="flex min-w-0 items-center gap-2 px-3 py-2" role="cell">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="flex-none rounded-[3px] bg-sunken px-1.5 py-0.5 text-[10px] leading-[14px] font-semibold text-muted">
            {t(`access.rules.kinds.${rule.subjectKind}`)}
          </span>
          <b className="truncate font-semibold">{subjectOf(rule)}</b>
        </span>
        {note ? <span className="text-xs text-muted">{note}</span> : null}
      </span>
      {remove ? (
        <button
          aria-label={remove.label}
          className="flex size-6 flex-none items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-ink"
          onClick={remove.onClick}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </span>
  );

  return (
    <>
      <div aria-describedby={legendId} aria-labelledby={titleId} role="table">
        <div className={cn(ROW, "hidden text-xs font-semibold text-muted md:grid")} role="row">
          <span className="px-3 py-2.5" role="columnheader">
            {t("access.rules.number")}
          </span>
          <span role="columnheader" />
          <span className="px-3 py-2.5" role="columnheader">
            {t("access.rules.subject")}
          </span>
          {ACTIONS.map((action) => (
            <span className="truncate px-3 py-2.5" key={action} role="columnheader">
              {t(`access.rules.actions.${action}`)}{" "}
              <span className="font-mono text-2xs font-normal">
                {t(`access.rules.letters.${action}`)}
              </span>
            </span>
          ))}
        </div>

        {rules.length === 0 ? (
          <div className="border-b border-border px-4 py-3 text-base text-muted" role="row">
            <span role="cell">{t("access.rules.empty")}</span>
          </div>
        ) : null}

        {rules.map((rule, index) => {
          const number = index + 1;
          const subject = subjectOf(rule);
          return (
            <div
              className={cn(
                ROW,
                rule.moved && "bg-primary-soft shadow-[inset_3px_0_0_var(--primary)]",
              )}
              key={rule.key}
              role="row"
            >
              <span className="px-3 py-2.5 font-mono" role="cell">
                {number}
              </span>
              <span className="flex flex-col text-muted" role="cell">
                <button
                  aria-label={t("access.rules.moveUp", { number })}
                  className="flex h-4 w-6 items-center justify-center rounded-sm hover:text-ink disabled:opacity-40"
                  disabled={!editing || index === 0}
                  onClick={() => onMove(rule.key, -1)}
                  type="button"
                >
                  <ChevronUp aria-hidden="true" className="size-4" />
                </button>
                <button
                  aria-label={t("access.rules.moveDown", { number })}
                  className="flex h-4 w-6 items-center justify-center rounded-sm hover:text-ink disabled:opacity-40"
                  disabled={!editing || index === rules.length - 1}
                  onClick={() => onMove(rule.key, 1)}
                  type="button"
                >
                  <ChevronDown aria-hidden="true" className="size-4" />
                </button>
              </span>
              {subjectCell(
                rule,
                rule.moved ? t(`access.rules.moved.${rule.moved}`) : undefined,
                editing
                  ? {
                      label: t("access.rules.remove", { number }),
                      onClick: () => onRemove(rule.key),
                    }
                  : undefined,
              )}
              <span className="col-span-3 grid grid-cols-2 gap-x-2 px-2 pb-2 sm:grid-cols-4 md:contents">
                {ACTIONS.map((action) => {
                  const grant = rule[action];
                  const label = t(`access.rules.actions.${action}`);
                  return (
                    <span className="flex flex-col gap-1 py-1.5 md:px-2" key={action} role="cell">
                      <span
                        aria-hidden="true"
                        className="text-2xs font-semibold text-muted md:hidden"
                      >
                        {label}
                      </span>
                      <button
                        aria-label={t("access.rules.cell", {
                          action: label,
                          grant: t(`access.rules.grants.${grant}`),
                          subject,
                        })}
                        className={cn(
                          "flex h-[30px] w-full items-center justify-center rounded-md text-sm font-bold whitespace-nowrap disabled:cursor-default md:w-16 xl:w-20",
                          CELL[grant],
                        )}
                        disabled={!editing}
                        onClick={() => onCycle(rule.key, action)}
                        type="button"
                      >
                        <CellFace grant={grant} />
                      </button>
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}

        {inherited.flatMap(({ from, rules: passedDown }) =>
          passedDown.map((rule, index) => (
            <div className={cn(ROW, "bg-sunken text-muted")} key={`${from}-${index}`} role="row">
              <span className="flex px-3 py-2.5" role="cell">
                <Lock aria-label={t("access.rules.inherited")} className="size-4" role="img" />
              </span>
              <span role="cell" />
              {subjectCell(rule, t("access.rules.from", { from }))}
              <span className="col-span-3 grid grid-cols-2 gap-x-2 px-2 pb-2 sm:grid-cols-4 md:contents">
                {ACTIONS.map((action) => {
                  const grant = rule[action];
                  const label = t(`access.rules.actions.${action}`);
                  return (
                    <span className="flex flex-col gap-1 py-1.5 md:px-2" key={action} role="cell">
                      <span aria-hidden="true" className="text-2xs font-semibold md:hidden">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "flex h-[30px] w-full items-center justify-center rounded-md text-sm font-bold whitespace-nowrap md:w-16 xl:w-20",
                          INHERITED_CELL[grant],
                        )}
                      >
                        <CellFace grant={grant} />
                        <span className="sr-only">
                          {`${label}: ${t(`access.rules.grants.${grant}`)}`}
                        </span>
                      </span>
                    </span>
                  );
                })}
              </span>
            </div>
          )),
        )}
      </div>

      <div className="flex flex-wrap gap-[18px] px-4 py-2.5 text-xs text-muted">
        <span>{t("access.rules.footer")}</span>
        <span
          aria-label={t("access.rules.legend.label")}
          className="ml-auto flex flex-wrap items-center gap-3"
          id={legendId}
          role="note"
        >
          <span>
            <b aria-hidden="true" className="text-[var(--access-allow)]">
              ✓
            </b>{" "}
            {t("access.rules.legend.allow")}
          </span>
          <span>
            <b aria-hidden="true" className="text-[var(--access-deny)]">
              ✗
            </b>{" "}
            {t("access.rules.legend.deny")}
          </span>
          <span>
            <span aria-hidden="true">·</span> {t("access.rules.legend.blank")}
          </span>
          <span className="flex items-center gap-[3px]">
            <Lock aria-hidden="true" className="size-3.5" />
            {t("access.rules.legend.inherited")}
          </span>
          <span>{t("access.rules.legend.cycle")}</span>
        </span>
      </div>
    </>
  );
};
