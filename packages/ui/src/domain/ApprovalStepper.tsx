// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { formatDayMonth, formatList, useTranslation } from "@steward-web/i18n";
import { Check, ChevronDown, ChevronRight, CircleCheck, Clock, X } from "lucide-react";
import { type CSSProperties, Fragment, type ReactNode, useId, useState } from "react";

import type { ChangeType } from "#ui/components/Badges";

import { cn } from "#ui/lib/cn";
import { PHONE, useMediaQuery } from "#ui/lib/media";

export interface ApprovalStepperProps {
  /** Called with the stage index and the seat when someone picks Reassign (D14). */
  onReassign?: (stageIndex: number, approver: StepperApprover) => void;
  /** Horizontal for up to four stages and vertical beyond, unless forced. */
  orientation?: "auto" | "horizontal" | "vertical";
  /** The "Publish" end cap: "as v3.0.0 · Major". */
  publish?: { changeType?: ChangeType | null; version?: null | string };
  stages: readonly StepperStage[];
  /** The "Submitted" end cap: "Bob · 1 Oct". */
  submitted?: { at?: null | string; by?: null | string };
}

export interface StepperApprover {
  comment?: null | string;
  decidedAt?: null | string;
  /** The group whose seat this is; null or absent for an individual seat. */
  groupId?: null | string;
  isYou?: boolean;
  name: string;
  role?: null | string;
  state: StepperApproverState;
  /** The seat holds a veto: its single reject ends the version. */
  veto?: boolean;
}

export type StepperApproverState = "approved" | "pending" | "rejected";

/** An "approve as a group" unit's tally on a stage: "Finance team — majority: 2/3". */
export interface StepperGroup {
  approved: readonly string[];
  /** Matches the `groupId` of the group's seats. */
  id?: string;
  name: string;
  pending: readonly string[];
  quorum: "all" | "majority" | "one";
  required: number;
  roster: number;
  status: "pending" | "rejected" | "satisfied";
}

/** The stage's rule badge, shown only for quorum and all (a one-approver stage has none). */
export interface StepperRule {
  approvals: number;
  kind: "all" | "quorum";
  required: number;
}

export interface StepperStage {
  approvers: readonly StepperApprover[];
  /** When the stage is due (an ISO date); absent when the stage has no date yet. */
  dueAt?: null | string;
  groups?: readonly StepperGroup[];
  name: string;
  rule?: StepperRule;
  state: "current" | "done" | "rejected" | "upcoming";
}

/** Two letters for the avatar: "DA" for Dave, "EE" for Erin Example. */
const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts.at(-1)![0]!).toUpperCase();
};

const latest = (approvers: readonly StepperApprover[]) =>
  approvers
    .map((a) => a.decidedAt)
    .filter((at): at is string => Boolean(at))
    .toSorted()
    .at(-1);

const RuleBadge = ({ className, rule }: { className?: string; rule?: StepperRule }) => {
  const { t } = useTranslation("approvals");
  if (!rule) return null;
  return (
    <span
      className={cn(
        "rounded-sm bg-sunken px-[7px] py-0.5 font-mono text-2xs font-medium whitespace-nowrap text-ink",
        className,
      )}
    >
      {t(`stepper.rule.${rule.kind}`, { approvals: rule.approvals, required: rule.required })}
    </span>
  );
};

/** "Due 12 Oct", or nothing when the stage has no due date. */
const DueDate = ({ className, dueAt }: { className?: string; dueAt?: null | string }) => {
  const { t } = useTranslation("approvals");
  if (!dueAt) return null;
  return <span className={className}>{t("stepper.due", { date: formatDayMonth(dueAt) })}</span>;
};

/** One approver: initials, name, role, state with date, and the comment in the reading face. */
const ApproverRow = ({
  approver,
  heavy,
  onReassign,
}: {
  approver: StepperApprover;
  /** Pending names read one weight heavier on the stage being decided. */
  heavy?: boolean;
  onReassign?: () => void;
}) => {
  const { t } = useTranslation("approvals");
  const roleLine = approver.role
    ? t(approver.isYou ? "stepper.roleYou" : "stepper.role", { role: approver.role })
    : approver.isYou
      ? t("stepper.you")
      : null;
  return (
    <div className={cn("flex gap-2.5", approver.comment ? "items-start" : "items-center")}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[30px] shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          approver.isYou
            ? "bg-primary-soft text-on-primary-soft shadow-[0_0_0_2px_var(--primary)]"
            : "bg-sunken text-ink",
        )}
      >
        {initialsOf(approver.name)}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5 text-sm">
        <span>
          <b className={heavy ? "font-bold" : "font-semibold"}>{approver.name}</b>
          {roleLine ? <span className="text-muted"> {roleLine}</span> : null}
          {approver.veto ? (
            <span className="ml-1.5 rounded-sm bg-danger-soft px-1.5 py-px text-xs font-semibold text-danger">
              {t("stepper.veto")}
            </span>
          ) : null}
        </span>
        {approver.state === "approved" ? (
          <span className="flex items-center gap-[5px] text-ok">
            <Check aria-hidden="true" className="size-3.5" />
            {t("stepper.approvedOn", { date: formatDayMonth(approver.decidedAt) })}
          </span>
        ) : approver.state === "rejected" ? (
          <span className="flex items-center gap-[5px] text-danger">
            <X aria-hidden="true" className="size-3.5" />
            {t("stepper.rejectedOn", { date: formatDayMonth(approver.decidedAt) })}
          </span>
        ) : (
          <span className="flex items-center gap-[5px] font-semibold text-info">
            <Clock aria-hidden="true" className="size-3.5" />
            {t("stepper.pending")}
          </span>
        )}
        {approver.comment ? (
          <span className="font-serif text-base text-muted italic">“{approver.comment}”</span>
        ) : null}
      </div>
      {onReassign ? (
        <button
          aria-label={t("stepper.reassignName", { name: approver.name })}
          className="ml-auto text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
          onClick={onReassign}
          type="button"
        >
          {t("stepper.reassign")}
        </button>
      ) : null}
    </div>
  );
};

const StageDot = ({
  index,
  size,
  state,
}: {
  index: number;
  size: "lg" | "sm";
  state: StepperStage["state"];
}) => (
  <span
    aria-hidden="true"
    className={cn(
      "flex shrink-0 items-center justify-center rounded-full font-semibold",
      size === "lg" ? "size-[22px] text-2xs" : "size-6 text-2xs",
      state === "done" && "bg-ok-soft text-ok",
      state === "rejected" && "bg-danger-soft text-danger",
      state === "current" && "bg-info-soft text-info",
      state === "current" && size === "sm" && "shadow-[inset_0_0_0_1.5px_var(--info)]",
      state === "upcoming" && "text-muted shadow-[inset_0_0_0_1.5px_var(--border-strong)]",
    )}
  >
    {state === "done" ? (
      <Check className="size-3" />
    ) : state === "rejected" ? (
      <X className="size-3" />
    ) : (
      index + 1
    )}
  </span>
);

const GroupUnit = ({ group }: { group: StepperGroup }) => {
  const { t } = useTranslation("approvals");
  const approvals = group.approved.length;
  const tone =
    group.status === "satisfied" ? "ok" : group.status === "rejected" ? "danger" : "info";
  return (
    <div className="flex flex-col gap-2 rounded-[8px] bg-surface p-3 text-sm shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex items-center gap-2">
        <b className="font-semibold">{group.name}</b>
        <span className="text-muted">
          {t("stepper.group.rule", {
            quorum: t(`stepper.group.quorum.${group.quorum}`),
            required: group.required,
            roster: group.roster,
          })}
        </span>
        <span
          className={cn(
            "ml-auto text-xs font-semibold",
            tone === "ok" ? "text-ok" : tone === "danger" ? "text-danger" : "text-info",
          )}
        >
          {t(`stepper.group.status.${group.status}`)}
        </span>
      </div>
      <div
        aria-label={group.name}
        aria-valuemax={group.roster}
        aria-valuemin={0}
        aria-valuenow={approvals}
        className="h-1.5 overflow-hidden rounded-[3px] bg-sunken"
        role="progressbar"
      >
        <div
          className={cn(
            "h-full",
            tone === "ok" ? "bg-ok" : tone === "danger" ? "bg-danger" : "bg-info",
          )}
          style={{ width: `${group.roster > 0 ? (approvals / group.roster) * 100 : 0}%` }}
        />
      </div>
      <span className="text-muted">
        {group.approved.length > 0 ? (
          <>
            {t("stepper.group.approved", { names: formatList(group.approved, { type: "unit" }) })}
            {group.pending.length > 0 ? " · " : null}
          </>
        ) : null}
        {group.pending.length > 0 ? (
          <b className="font-bold text-ink">
            {t("stepper.group.pending", { names: formatList(group.pending, { type: "unit" }) })}
          </b>
        ) : null}
      </span>
    </div>
  );
};

/** The collapsed line: "Approved by Dave · 28 Sep" or "Pending: Carol, Grace". */
const StageLine = ({ stage }: { stage: StepperStage }) => {
  const { t } = useTranslation("approvals");
  if (stage.state === "done" || stage.state === "rejected") {
    const state = stage.state === "done" ? "approved" : "rejected";
    const who = stage.approvers.filter((a) => a.state === state);
    // a rejection by a seat that holds a veto ended the stage on its own
    const vetoed = stage.state === "rejected" && who.some((a) => a.veto);
    return (
      <>
        {t(stage.state === "done" ? "stepper.approvedBy" : "stepper.rejectedBy", {
          date: formatDayMonth(latest(who)),
          names: formatList(
            who.map((a) => a.name),
            { type: "unit" },
          ),
        })}
        {vetoed ? ` ${t("stepper.byVeto")}` : null}
      </>
    );
  }
  const pending = stage.approvers.filter((a) => a.state === "pending").map((a) => a.name);
  if (pending.length === 0) return null;
  return (
    <>
      {t("stepper.pendingLabel")}{" "}
      <b className="font-bold text-ink">{formatList(pending, { type: "unit" })}</b>
    </>
  );
};

const VerticalStage = ({
  index,
  onReassign,
  stage,
  total,
}: {
  index: number;
  onReassign?: ApprovalStepperProps["onReassign"];
  stage: StepperStage;
  total: number;
}) => {
  const { t } = useTranslation("approvals");
  const [open, setOpen] = useState(stage.state === "current");
  const nameId = useId();
  const panelId = useId();
  const Chevron = open ? ChevronDown : ChevronRight;
  return (
    <li
      aria-current={stage.state === "current" ? "step" : undefined}
      aria-labelledby={nameId}
      className="grid grid-cols-[28px_1fr] gap-3"
    >
      <div className="flex flex-col items-center">
        <StageDot index={index} size="sm" state={stage.state} />
        <span aria-hidden="true" className="min-h-3.5 w-0.5 flex-1 bg-border-strong" />
      </div>
      <div className="flex min-w-0 flex-col gap-1.5 pt-0.5 pb-3.5">
        <button
          aria-controls={panelId}
          aria-expanded={open}
          aria-labelledby={nameId}
          className="flex w-full items-center gap-2 rounded-sm text-left text-base"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          <b className="font-semibold" id={nameId}>
            {stage.name}
          </b>
          <span className="text-muted">{t("stepper.stageOf", { n: index + 1, total })}</span>
          {stage.rule ? (
            <span aria-hidden="true" className="-mx-1 text-muted">
              ·
            </span>
          ) : null}
          <RuleBadge className="py-px pr-1.5 pl-1.5" rule={stage.rule} />
          <Chevron aria-hidden="true" className="ml-auto size-4 shrink-0 text-muted" />
        </button>
        <span className="text-sm text-muted">
          <StageLine stage={stage} />
        </span>
        <DueDate className="text-sm text-muted" dueAt={stage.dueAt} />
        {open ? (
          <div className="mt-1 flex flex-col gap-2" id={panelId}>
            {stage.groups && stage.groups.length > 0 ? (
              stage.groups.map((group) => <GroupUnit group={group} key={group.name} />)
            ) : (
              <div className="flex flex-col gap-2.5 rounded-[8px] bg-surface p-3 shadow-[inset_0_0_0_1px_var(--border)]">
                {stage.approvers.map((approver, seat) => (
                  <ApproverRow
                    approver={approver}
                    heavy={stage.state === "current"}
                    key={`${approver.name}-${seat}`}
                    onReassign={
                      onReassign &&
                      stage.state === "current" &&
                      approver.state === "pending" &&
                      !approver.isYou
                        ? () => onReassign(index, approver)
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </li>
  );
};

const EndCap = ({
  children,
  className,
  icon,
  label,
}: {
  children?: ReactNode;
  className?: string;
  icon: ReactNode;
  label: string;
}) => (
  <li
    aria-label={label}
    className={cn("flex flex-col items-center justify-center gap-1.5 p-3.5 text-center", className)}
  >
    {icon}
    <span className="text-sm font-semibold">{label}</span>
    {children ? <span className="text-xs text-muted">{children}</span> : null}
  </li>
);

/**
 * The approval stepper (U25, U25v): a "Submitted" end cap, one card per stage listing its
 * approvers, and a "Publish" end cap. Horizontal for up to four stages; beyond that it's
 * vertical, each stage collapsed to "{stage} · stage N of M · {rule} / Pending: {names}" and
 * the current one open, with any group units. On a phone it always takes the vertical form
 * (U25m).
 */
export const ApprovalStepper = ({
  onReassign,
  orientation = "auto",
  publish,
  stages,
  submitted,
}: ApprovalStepperProps) => {
  const { t } = useTranslation(["approvals", "policy"]);
  // A phone always takes the vertical form (U25m); wider, it's vertical beyond four stages.
  const phone = useMediaQuery(PHONE);
  const vertical =
    orientation === "vertical" || (orientation === "auto" && (stages.length > 4 || phone));
  const publishLine = publish?.version
    ? publish.changeType
      ? t("stepper.publishAsChange", {
          change: t(`change.${publish.changeType}`, { ns: "policy" }),
          version: publish.version,
        })
      : t("stepper.publishAs", { version: publish.version })
    : null;

  if (vertical) {
    return (
      <ol
        aria-label={t("stepper.label")}
        className="flex flex-col text-ink"
        data-orientation="vertical"
      >
        {stages.map((stage, index) => (
          <VerticalStage
            index={index}
            key={`${stage.name}-${index}`}
            onReassign={onReassign}
            stage={stage}
            total={stages.length}
          />
        ))}
        <li aria-label={t("stepper.publish")} className="grid grid-cols-[28px_1fr] gap-3">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full text-muted shadow-[inset_0_0_0_1.5px_var(--border-strong)]"
          >
            <CircleCheck className="size-3" />
          </span>
          <span className="pt-0.5 text-base font-semibold">
            {t("stepper.publish")}
            {publishLine ? <span className="font-normal text-muted"> · {publishLine}</span> : null}
          </span>
        </li>
      </ol>
    );
  }

  return (
    <ol
      aria-label={t("stepper.label")}
      className="grid grid-cols-1 items-stretch text-ink md:grid-cols-[140px_repeat(var(--stages),minmax(0,1fr))_140px]"
      data-orientation="horizontal"
      style={{ "--stages": stages.length } as CSSProperties}
    >
      <EndCap
        className="rounded-t-lg border border-border bg-surface md:rounded-l-lg md:rounded-tr-none"
        icon={
          <span
            aria-hidden="true"
            className="flex size-[30px] items-center justify-center rounded-full bg-ok-soft text-ok"
          >
            <Check className="size-4" />
          </span>
        }
        label={t("stepper.submitted")}
      >
        {submitted?.by
          ? t("stepper.submittedBy", { date: formatDayMonth(submitted.at), name: submitted.by })
          : null}
      </EndCap>
      {stages.map((stage, index) => (
        <HorizontalStage
          index={index}
          key={`${stage.name}-${index}`}
          onReassign={onReassign}
          stage={stage}
        />
      ))}
      <EndCap
        className="rounded-b-lg border border-t-0 border-dashed border-border-strong bg-sunken md:rounded-r-lg md:rounded-bl-none md:border-t md:border-l-0"
        icon={
          <span
            aria-hidden="true"
            className="flex size-[30px] items-center justify-center rounded-full text-muted shadow-[inset_0_0_0_2px_var(--border-strong)]"
          >
            <CircleCheck className="size-4" />
          </span>
        }
        label={t("stepper.publish")}
      >
        {publishLine}
      </EndCap>
    </ol>
  );
};

const HorizontalStage = ({
  index,
  onReassign,
  stage,
}: {
  index: number;
  onReassign?: ApprovalStepperProps["onReassign"];
  stage: StepperStage;
}) => {
  const { t } = useTranslation("approvals");
  const nameId = useId();
  return (
    <li
      aria-current={stage.state === "current" ? "step" : undefined}
      aria-labelledby={nameId}
      className={cn(
        "flex flex-col gap-2.5 border border-t-0 border-border bg-surface px-4 py-3.5 md:border-t md:border-l-0",
        stage.state === "current" && "shadow-[inset_0_3px_var(--info)]",
      )}
    >
      <div className="flex items-center gap-2">
        <StageDot index={index} size="lg" state={stage.state} />
        <span className="text-base font-semibold" id={nameId}>
          {stage.name}
        </span>
        {stage.state === "done" || stage.state === "rejected" ? (
          <span
            className={cn(
              "ml-auto text-xs font-semibold",
              stage.state === "done" ? "text-ok" : "text-danger",
            )}
          >
            {t(`stepper.stageState.${stage.state}`)}
          </span>
        ) : (
          <RuleBadge className="ml-auto" rule={stage.rule} />
        )}
      </div>
      <DueDate className="-mt-1 text-xs text-muted" dueAt={stage.dueAt} />
      {stage.approvers.map((approver, seat) => (
        <Fragment key={`${approver.name}-${seat}`}>
          <ApproverRow
            approver={approver}
            heavy={stage.state === "current"}
            onReassign={
              onReassign &&
              stage.state === "current" &&
              approver.state === "pending" &&
              !approver.isYou
                ? () => onReassign(index, approver)
                : undefined
            }
          />
        </Fragment>
      ))}
      {stage.groups?.map((group) => (
        <GroupUnit group={group} key={group.name} />
      ))}
    </li>
  );
};
