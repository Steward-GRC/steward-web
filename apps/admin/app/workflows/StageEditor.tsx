// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The workflow editor's stage cards (A9). Presentational: the route owns the save, through a
// hidden field that mirrors `onChange`'s latest stage list.
import type { GroupUnitInput, WorkCalendar, WorkflowStageInput } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { Card, type ChipItem, ChipPicker, cn, Field, Select } from "@steward-web/ui";
import { GripVertical, X } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";

import { calendarSummary } from "../settings/workCalendar";
import { moveDown, moveUp } from "./stageOutline";
import { approverPool, pruneVetoes } from "./stageVeto";

export interface StageEditorProps {
  /** The site work calendar the due box counts on; null when it could not be read. */
  calendar?: null | WorkCalendar;
  /** Platform group names, for group approvers. */
  groupNames: Record<string, string>;
  onChange: (stages: readonly WorkflowStageInput[]) => void;
  people: readonly StagePerson[];
  stages: readonly WorkflowStageInput[];
}

export interface StagePerson {
  enabled: boolean;
  id: string;
  name: string;
}

const QUORUMS = ["one", "majority", "all"] as const;

/** How many of a group's members its internal quorum needs. */
const needed = (unit: GroupUnitInput) => {
  const total = unit.memberUserIds.length;
  if (unit.internalQuorum === "all") return total;
  if (unit.internalQuorum === "majority") return Math.floor(total / 2) + 1;
  return Math.min(1, total);
};

/** A stage card's identity for notes about it: its id, or its place while it has none. */
const keyOf = (stage: WorkflowStageInput, index: number) => stage.id ?? `new-${index}`;

const CHIP = "flex h-7 items-center gap-1.5 rounded-full px-2.5";

/** One stage card: grip, number and name, Always last, the quorum, approvers and due date. */
const StageCard = ({
  calendar,
  groupNames,
  index,
  onDragStart,
  onDrop,
  onMove,
  onRemove,
  onUpdate,
  people,
  stage,
  vetoNote,
}: {
  calendar: null | undefined | WorkCalendar;
  groupNames: Record<string, string>;
  index: number;
  onDragStart: () => void;
  onDrop: () => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<WorkflowStageInput>) => void;
  people: readonly StagePerson[];
  stage: WorkflowStageInput;
  /** Who was just dropped from the veto people because they left the approver pool. */
  vetoNote?: readonly string[];
}) => {
  const { t } = useTranslation("admin");
  const number = index + 1;
  const dueId = useId();
  const hintId = useId();
  const dueHelpId = useId();
  const quorum = QUORUMS.find((entry) => entry === stage.quorum);
  const explain = quorum
    ? t(`workflows.editor.explain.${quorum}`)
    : t("workflows.editor.explain.count", { count: Number(stage.quorum) || 0 });
  const calendarNote = (site: WorkCalendar) => {
    const { days, holidays } = calendarSummary(site, (day) =>
      t(`settings.workCalendar.short.${day}`),
    );
    return t("workflows.editor.dueCalendar", {
      days,
      holidays:
        holidays === 0
          ? t("workflows.editor.dueNoHolidays")
          : t("workflows.editor.dueHolidays", { count: holidays }),
      timezone: site.timezone,
    });
  };
  const person = (id: string) => people.find((entry) => entry.id === id);
  const named = (id: string) => person(id)?.name ?? id;
  // Only people currently in this stage's approver pool, as users, can be offered as veto people.
  const vetoItem = (id: string): ChipItem => ({ id, kind: "user", label: named(id) });
  const vetoChosen = (stage.vetoUserIds ?? []).map((id) => vetoItem(id));
  const vetoOffers = approverPool(stage)
    .filter((id) => person(id)?.enabled !== false)
    .map((id) => vetoItem(id));

  const onGripKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      onMove(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      onMove(1);
    }
  };

  return (
    <Card
      aria-label={t("workflows.editor.stageGroup", { number })}

      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      role="group"
    >
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border px-3.5 py-2.5">
        <span className="sr-only" id={hintId}>
          {t("workflows.editor.moveHint")}
        </span>
        <button
          aria-describedby={hintId}
          aria-label={t("workflows.editor.move", { number })}
          className="flex cursor-grab text-muted hover:text-ink"
          draggable
          onDragStart={onDragStart}
          onKeyDown={onGripKey}
          type="button"
        >
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <b className="flex min-w-0 items-center">
          <span aria-hidden="true">{t("workflows.editor.stage", { number })}</span>
          <input
            aria-label={t("workflows.editor.stageName", { number })}
            className="min-w-0 rounded-sm bg-transparent font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
            onChange={(event) => onUpdate({ name: event.target.value })}
            value={stage.name}
          />
        </b>
        {stage.pinnedLast ? (
          <span className="text-xs text-muted">{t("workflows.editor.alwaysLast")}</span>
        ) : null}
        <div
          aria-label={t("workflows.editor.quorum", { number })}
          className="ml-auto flex rounded-md bg-sunken p-0.5 text-xs"
          role="radiogroup"
        >
          {QUORUMS.map((entry) => (
            <label
              className={cn(
                "cursor-pointer rounded-[4px] px-2.5 py-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--focus)]",
                stage.quorum === entry && "bg-surface font-bold",
              )}
              key={entry}
            >
              <input
                checked={stage.quorum === entry}
                className="sr-only"
                name={`quorum-${index}`}
                onChange={() => onUpdate({ quorum: entry })}
                type="radio"
                value={entry}
              />
              {t(`workflows.editor.quorums.${entry}`)}
            </label>
          ))}
        </div>
        <button
          aria-label={t("workflows.editor.removeStage", { number })}
          className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-sunken hover:text-ink"
          onClick={onRemove}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-2 px-3.5 py-3 text-sm">
        <ul
          aria-label={t("workflows.editor.approvers", { number })}
          className="flex flex-wrap items-center gap-1.5"
        >
          {stage.approvers.map((id) => {
            const who = person(id);
            const name = who?.name ?? id;
            const disabled = who !== undefined && !who.enabled;
            return (
              <li className={cn(CHIP, disabled ? "bg-warn-soft text-warn" : "bg-sunken")} key={id}>
                {disabled ? t("workflows.editor.disabled", { name }) : name}
                <button
                  aria-label={t("workflows.editor.removeApprover", { name, number })}
                  className="flex rounded-full opacity-70 hover:opacity-100"
                  onClick={() =>
                    onUpdate({ approvers: stage.approvers.filter((entry) => entry !== id) })
                  }
                  type="button"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </li>
            );
          })}
          {(stage.groupUnits ?? []).map((unit) => (
            <li className={cn(CHIP, "bg-sunken")} key={unit.groupId}>
              {t("workflows.editor.group", {
                name: groupNames[unit.groupId] ?? unit.groupId,
                need: needed(unit),
                total: unit.memberUserIds.length,
              })}
            </li>
          ))}
          <li>
            <Select
              aria-label={t("workflows.editor.addApprover")}
              className="h-7 w-auto rounded-full border-0 px-2.5 text-sm font-semibold text-primary shadow-[inset_0_0_0_1px_var(--border-strong)]"
              onValueChange={(id) => onUpdate({ approvers: [...stage.approvers, id] })}
              options={people
                .filter((entry) => entry.enabled && !stage.approvers.includes(entry.id))
                .map((entry) => ({ label: entry.name, value: entry.id }))}
              placeholder={t("workflows.editor.addApprover")}
              value=""
            />
          </li>
        </ul>
        <span className="text-muted">{explain}</span>
        <Field hint={t("workflows.editor.veto.hint")} label={t("workflows.editor.veto.label")}>
          <ChipPicker
            items={vetoOffers}
            label={t("workflows.editor.veto.label")}
            onChange={(next) => onUpdate({ vetoUserIds: next.map((item) => item.id) })}
            placeholder={t("workflows.editor.veto.placeholder")}
            value={vetoChosen}
          />
        </Field>
        {vetoNote && vetoNote.length > 0 ? (
          <p className="text-sm text-warn" role="status">
            {t("workflows.editor.veto.dropped", {
              count: vetoNote.length,
              names: vetoNote.map((id) => named(id)).join(", "),
            })}
          </p>
        ) : null}
        <span className="flex flex-wrap items-center gap-2">
          <label className="text-muted" htmlFor={dueId}>
            {t("workflows.editor.due")}
          </label>
          <input
            aria-describedby={dueHelpId}
            aria-label={t("workflows.editor.dueLabel", { number })}
            className="h-[30px] w-16 rounded-md border border-control bg-surface px-2.5"
            id={dueId}
            inputMode="numeric"
            min={1}
            onChange={(event) =>
              onUpdate({ slaDays: event.target.value ? Number(event.target.value) : null })
            }
            placeholder="—"
            type="number"
            value={stage.slaDays ?? ""}
          />
          <span className="text-muted">
            {t("workflows.editor.workingDays", { count: stage.slaDays ?? 0 })}
          </span>
        </span>
        <span className="basis-full text-xs text-muted" id={dueHelpId}>
          {t("workflows.editor.dueHelp")}
          {calendar ? ` ${calendarNote(calendar)}` : ""}
        </span>
      </div>
    </Card>
  );
};

/**
 * The stage cards (A9): drag a card, or use the arrow keys on its grip, to reorder; each stage
 * has its quorum (One, Quorum or All, with a line explaining it), its approvers as chips (a
 * disabled one asks to be replaced, a group shows "As a group · 2 of 3") and its due date.
 */
export const StageEditor = ({
  calendar,
  groupNames,
  onChange,
  people,
  stages,
}: StageEditorProps) => {
  const [dragging, setDragging] = useState<null | number>(null);
  // Veto people dropped from a stage because they left its approver pool, by stage, until the
  // next change to that stage's veto people.
  const [dropped, setDropped] = useState<Record<string, readonly string[]>>({});
  const update = (index: number, patch: Partial<WorkflowStageInput>) => {
    const current = stages[index];
    if (!current) return;
    // A veto person must stay one of the stage's approvers: when the pool changes, prune them.
    const next = pruneVetoes({ ...current, ...patch });
    const key = keyOf(current, index);
    if (patch.vetoUserIds) setDropped(({ [key]: _gone, ...rest }) => rest);
    else if (next.dropped.length > 0) setDropped((now) => ({ ...now, [key]: next.dropped }));
    onChange(stages.map((stage, at) => (at === index ? next.stage : stage)));
  };
  const move = (index: number, delta: -1 | 1) =>
    onChange(delta === -1 ? moveUp(stages, index) : moveDown(stages, index));
  const drop = (to: number) => {
    if (dragging === null || dragging === to) return;
    const next = [...stages];
    const [moving] = next.splice(dragging, 1);
    next.splice(to, 0, moving!);
    setDragging(null);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3.5">
      {stages.map((stage, index) => (
        <StageCard
          calendar={calendar}
          groupNames={groupNames}
          index={index}
          key={stage.id ?? `new-${index}`}
          onDragStart={() => setDragging(index)}
          onDrop={() => drop(index)}
          onMove={(delta) => move(index, delta)}
          onRemove={() => onChange(stages.filter((_, at) => at !== index))}
          onUpdate={(patch) => update(index, patch)}
          people={people}
          stage={stage}
          vetoNote={dropped[keyOf(stage, index)]}
        />
      ))}
    </div>
  );
};
