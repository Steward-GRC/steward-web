import { useTranslation } from "@steward-web/i18n";
import {
  Archive,
  Check,
  CheckCircle2,
  Clock,
  type LucideIcon,
  Pencil,
  ShieldAlert,
  Undo2,
  X,
  XCircle,
} from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";

import { cn } from "#ui/lib/cn";

const pill =
  "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold [&_svg]:size-3.5";

export type BadgeTone = "danger" | "info" | "neutral" | "ok" | "primary" | "warn";

const tones: Record<BadgeTone, string> = {
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-neutral-soft text-neutral",
  ok: "bg-ok-soft text-ok",
  primary: "bg-primary-soft text-on-primary-soft",
  warn: "bg-warn-soft text-warn",
};

export const Badge = ({
  className,
  tone = "neutral",
  ...props
}: { tone?: BadgeTone } & ComponentProps<"span">) => (
  <span className={cn(pill, tones[tone], "hc:outline hc:outline-1", className)} {...props} />
);

/**
 * The one document status vocabulary: Draft, In review, Approved, Published and Retired.
 * Rejected, Superseded and Withdrawn are history events; they get a pill in history only.
 */
export type DocumentStatus =
  | "approved"
  | "draft"
  | "in-review"
  | "published"
  | "rejected"
  | "retired"
  | "superseded"
  | "withdrawn";

const statusIcons: Record<DocumentStatus, LucideIcon> = {
  approved: Check,
  draft: Pencil,
  "in-review": Clock,
  published: CheckCircle2,
  rejected: XCircle,
  retired: Archive,
  superseded: Archive,
  withdrawn: Undo2,
};

/** A status pill: an icon plus a word, never colour alone. */
export const StatusPill = ({
  className,
  status,
}: {
  className?: string;
  status: DocumentStatus;
}) => {
  const { t } = useTranslation("policy");
  const Icon = statusIcons[status];
  return (
    <span
      className={cn(pill, "hc:outline hc:outline-1", className)}
      data-status={status}
      style={{ background: `var(--status-${status}-soft)`, color: `var(--status-${status})` }}
    >
      <Icon aria-hidden="true" />
      {t(`status.${status}`)}
    </span>
  );
};

/** The workflow's status values, mapped onto the one vocabulary. Scheduled reads as Approved. */
export const documentStatusOf = (approvalStatus: string): DocumentStatus => {
  switch (approvalStatus.replace(/^APPROVAL_STATUS_/, "")) {
    case "APPROVED":
    case "SCHEDULED": {
      return "approved";
    }
    case "ARCHIVED": {
      return "retired";
    }
    case "IN_REVIEW": {
      return "in-review";
    }
    case "PUBLISHED": {
      return "published";
    }
    case "REJECTED": {
      return "rejected";
    }
    case "SUPERSEDED": {
      return "superseded";
    }
    case "WITHDRAWN": {
      return "withdrawn";
    }
    default: {
      return "draft";
    }
  }
};

export type ChangeType = "fix" | "major" | "minor";

/** The semantic version's change type beside its number: Major, Minor or Fix. */
export const VersionBadge = ({ change, version }: { change?: ChangeType; version: string }) => {
  const { t } = useTranslation("policy");
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-sm text-ink">{version}</span>
      {change ? (
        <Badge tone={change === "major" ? "warn" : change === "minor" ? "info" : "neutral"}>
          {t(`change.${change}`)}
        </Badge>
      ) : null}
    </span>
  );
};

export const SensitivityBadge = ({ sensitive }: { sensitive: boolean }) => {
  const { t } = useTranslation("policy");
  if (!sensitive) return null;
  return (
    <span
      className={cn(pill, "hc:outline hc:outline-1")}
      style={{
        background: "var(--sensitivity-sensitive-soft)",
        color: "var(--sensitivity-sensitive)",
      }}
    >
      <ShieldAlert aria-hidden="true" />
      {t("sensitivity.sensitive")}
    </span>
  );
};

export type ApproverState = "approved" | "pending" | "rejected";

const approverIcons: Record<ApproverState, LucideIcon> = {
  approved: Check,
  pending: Clock,
  rejected: X,
};

export const ApproverPill = ({ state }: { state: ApproverState }) => {
  const { t } = useTranslation("approvals");
  const Icon = approverIcons[state];
  return (
    <span
      className={cn(pill, "hc:outline hc:outline-1")}
      style={{ background: `var(--approver-${state}-soft)`, color: `var(--approver-${state})` }}
    >
      <Icon aria-hidden="true" />
      {t(`approver.${state}`)}
    </span>
  );
};

export type FindingSeverity = "blocker" | "note" | "warning";

export const FindingBadge = ({ severity }: { severity: FindingSeverity }) => {
  const { t } = useTranslation("ai");
  return (
    <span
      className={cn(pill, "hc:outline hc:outline-1")}
      style={{ background: `var(--finding-${severity}-soft)`, color: `var(--finding-${severity})` }}
    >
      {t(`finding.${severity}`)}
    </span>
  );
};

/** A label-and-value pair, as in a details list. */
export const Detail = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <div className="grid gap-0.5">
    <dt className="text-xs font-medium text-muted">{label}</dt>
    <dd className="text-base text-ink">{value}</dd>
  </div>
);
