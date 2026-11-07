import { DocumentType, PolicyStatus, Sensitivity } from "@steward-web/api-client";
import { formatDate, formatDateTime, formatTime, useTranslation } from "@steward-web/i18n";
import { ChevronLeft, Eye, EyeOff, History, Pencil, Printer, Sparkles } from "lucide-react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { Link, useFetcher, useLocation, useRevalidator, useSubmit } from "react-router";

import { useRegisterCommandActions } from "#ui/commands/CommandActions";
// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SensitivityBadge } from "#ui/components/Badges";
import { Button } from "#ui/components/Button";
import { Switch } from "#ui/components/Controls";
import { CopyId } from "#ui/components/CopyId";
import { FavoriteStar } from "#ui/components/FavoriteStar";
import { Field } from "#ui/components/Field";
import { HeaderActions } from "#ui/components/HeaderActions";
import { Textarea } from "#ui/components/Input";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  MenuItem,
} from "#ui/components/Overlays";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#ui/components/Tabs";
import { Banner } from "#ui/feedback/Banner";
import { type Failure } from "#ui/feedback/failure";
import { EmptyState } from "#ui/feedback/States";
import { notify } from "#ui/feedback/Toast";
import { cn } from "#ui/lib/cn";
import { scrollBehavior } from "#ui/lib/motion";

import { AckBanner } from "./AckBanner";
import { AiSummaryCard } from "./AiSummaryCard";
import { CompareVersions } from "./CompareVersions";
import { DocumentStatusPill } from "./DocumentStatusPill";
import { readingMinutes, wordsInBlocks } from "./documentWords";
import { useFavorites } from "./favorites";
import { OutlineCard } from "./OutlineCard";
import { documentTypeBasePath, documentTypeCopy, hasWorkingDraft } from "./policy";
import { bodyShape, outlineItems, PolicyDocument, RedactedDocument } from "./PolicyDocument";
import { PolicyPrint } from "./PolicyPrint";
import { PolicyReaderHistory } from "./PolicyReaderHistory";
import {
  ackBannerState,
  type PolicyAppendix,
  type PolicyDefinition,
  type PolicyDetail,
  redactionState,
} from "./policyReaderModel";
import {
  ContactsPanel,
  DefinitionsPanel,
  ReferencesPanel,
  RelatedPanel,
} from "./PolicyReaderPanels";
import { PrintDialog } from "./PrintDialog";
import { type ReaderNotice, ReaderNotices } from "./ReaderNotices";
import { RecordBreadcrumb } from "./RecordBreadcrumb";

interface ActionResult {
  error?: Failure;
  /** When a break-glass grant ends (ISO 8601), on a successful reveal. */
  grantedUntil?: string;
  ok?: boolean;
}

/** The acknowledge dialog (D1), the moment of record: the policy, then who, which version and
 *  when, under a plum top edge. Focus starts on Acknowledge; Escape closes it, an outside click
 *  doesn't. On success it closes and says when it was recorded. */
const AcknowledgeDialog = ({
  detail,
  viewerName,
}: {
  detail: PolicyDetail;
  viewerName?: string;
}) => {
  const { t } = useTranslation(["policy", "common"]);
  const fetcher = useFetcher<ActionResult>();
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(() => new Date());
  const confirm = useRef<HTMLButtonElement>(null);
  const busy = fetcher.state !== "idle";

  // This dialog exists only while the person can acknowledge (the banner is pending and the
  // document readable), so its action is on the command bar exactly then (bug log 26).
  useRegisterCommandActions([
    {
      id: "acknowledge",
      label: t("reader.ack.acknowledge"),
      run: () => {
        setAt(new Date());
        setOpen(true);
      },
      shortcut: "acknowledge",
    },
  ]);

  // Closes the dialog once the acknowledge submission succeeds. Adjusted during render
  // (not in an effect) by tracking the fetcher data this render has already seen, so a
  // successful submission closes the dialog on the very render that learns about it.
  const [seenData, setSeenData] = useState(fetcher.data);
  if (fetcher.data !== seenData) {
    setSeenData(fetcher.data);
    if (fetcher.data?.ok) {
      setOpen(false);
      notify.success(t("reader.dialogs.acknowledge.done", { time: formatTime(new Date()) }));
    }
  }

  return (
    <Dialog
      onOpenChange={(next) => {
        if (next) setAt(new Date());
        setOpen(next);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button className="h-10 px-[18px] text-base" variant="primary">
          {t("reader.ack.acknowledge")}
        </Button>
      </DialogTrigger>
      <DialogContent
        busy={busy}
        description={t("reader.dialogs.acknowledge.description", {
          number: detail.number,
          title: detail.title,
        })}
        hasInput
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          confirm.current?.focus();
        }}
        title={t("reader.dialogs.acknowledge.title")}
        tone="primary"
      >
        <DialogBody>
          <ul
            aria-label={t("reader.dialogs.acknowledge.record.label")}
            className="grid grid-cols-[90px_1fr] gap-1.5 rounded-lg bg-sunken px-4 py-3.5 text-sm"
          >
            {viewerName ? (
              <li className="contents">
                <span className="text-muted">{t("reader.dialogs.acknowledge.record.name")}</span>
                <span className="font-semibold">{viewerName}</span>
              </li>
            ) : null}
            <li className="contents">
              <span className="text-muted">{t("reader.dialogs.acknowledge.record.version")}</span>
              <span className="font-mono">
                {t("reader.versionValue", { version: detail.version })}
              </span>
            </li>
            <li className="contents">
              <span className="text-muted">{t("reader.dialogs.acknowledge.record.time")}</span>
              <span className="font-mono">{formatDateTime(at)}</span>
            </li>
          </ul>
          {fetcher.data?.error ? (
            <Banner
              className="mt-3"
              failure={fetcher.data.error}
              title={t("reader.dialogs.acknowledge.title")}
              tone="danger"
            />
          ) : null}
        </DialogBody>
        <fetcher.Form method="post">
          <input name="intent" type="hidden" value="acknowledge" />
          <input name="policyVersionId" type="hidden" value={detail.currentVersionId ?? ""} />
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={busy} type="button" variant="secondary">
                {t("actions.cancel", { ns: "common" })}
              </Button>
            </DialogClose>
            <Button busy={busy} ref={confirm} type="submit">
              {t("reader.dialogs.acknowledge.confirm")}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

/** The fetcher key the break-glass dialog submits on, so the reader can still read the grant
 *  after the dialog unmounts with the redaction it sat in. */
const BREAK_GLASS = "break-glass";

/** The break-glass dialog (D2): names the policy, asks why, and only then lets the person
 *  reveal it through the route's `breakGlass` action. An outside click doesn't close it. */
const BreakGlassDialog = ({ detail }: { detail: PolicyDetail }) => {
  const { t } = useTranslation(["policy", "common"]);
  const fetcher = useFetcher<ActionResult>({ key: BREAK_GLASS });
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const busy = fetcher.state !== "idle";

  return (
    <Dialog
      onOpenChange={(next) => {
        if (next) setReason("");
        setOpen(next);
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button
          className="h-9 border-0 bg-transparent px-3.5 text-[13px] text-danger shadow-[inset_0_0_0_1.5px_var(--danger)] hover:bg-danger-soft hc:border-[1.5px] hc:border-danger"
          variant="secondary"
        >
          {t("reader.redacted.breakGlass")}
        </Button>
      </DialogTrigger>
      <DialogContent
        busy={busy}
        description={t("reader.dialogs.breakGlass.description", {
          number: detail.number,
          title: detail.title,
        })}
        hasInput
        title={t("reader.dialogs.breakGlass.title")}
        tone="danger"
      >
        <fetcher.Form method="post">
          <input name="intent" type="hidden" value="breakGlass" />
          <input name="policyId" type="hidden" value={detail.id} />
          <DialogBody>
            {fetcher.data?.error ? (
              <Banner
                className="mb-3"
                failure={fetcher.data.error}
                title={t("reader.dialogs.breakGlass.title")}
                tone="danger"
              />
            ) : null}
            <Field label={t("reader.dialogs.breakGlass.reasonLabel")}>
              <Textarea
                className="min-h-20"
                name="reason"
                onChange={(event) => setReason(event.target.value)}
                required
                value={reason}
              />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={busy} type="button" variant="secondary">
                {t("actions.cancel", { ns: "common" })}
              </Button>
            </DialogClose>
            <Button busy={busy} disabled={reason.trim() === ""} type="submit" variant="danger">
              {t("reader.dialogs.breakGlass.confirm")}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

/** The redaction notice (U9): why the body is hidden, then either the break-glass action or
 *  who to ask. */
const RedactionNotice = ({ canReveal, detail }: { canReveal: boolean; detail: PolicyDetail }) => {
  const { t } = useTranslation("policy");
  return (
    <div
      className="flex items-start gap-3.5 rounded-[10px] bg-surface px-[18px] py-4 shadow-[inset_0_0_0_1px_var(--border-strong)] hc:border hc:border-border-strong"
      role="alert"
    >
      <EyeOff
        aria-hidden="true"
        className="size-5 flex-none"
        style={{ color: "var(--sensitivity-sensitive)" }}
      />
      <div className="flex flex-1 flex-col gap-1.5">
        <span className="text-[15px] font-semibold">{t("reader.redacted.title")}</span>
        <span className="text-sm leading-[1.5] text-muted">{t("reader.redacted.body")} </span>
        <span className="text-sm leading-[1.5]">
          {canReveal ? t("reader.redacted.canReveal") : t("reader.redacted.noPermission")}
        </span>
        {canReveal ? (
          <div className="mt-1">
            <BreakGlassDialog detail={detail} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** "29:59": the minutes and seconds left on a grant. */
const countdown = (milliseconds: number) => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
};

/** The revealed bar (U9r): until when the person may read the content, that it's on record,
 *  the time left, and Hide now. When the time runs out it reloads, so the redaction returns. */
const RevealedBar = ({ onHide, until }: { onHide: () => void; until: string }) => {
  const { t } = useTranslation("policy");
  const revalidator = useRevalidator();
  const label = useId();
  const end = new Date(until).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const left = end - now;
  useEffect(() => {
    if (left <= 0) void revalidator.revalidate();
    // Only the moment the grant runs out matters, not every tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left <= 0]);
  if (left <= 0) return null;
  return (
    <div
      aria-labelledby={label}
      className="flex flex-wrap items-center gap-3 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger"
      role="status"
    >
      <Eye aria-hidden="true" className="size-[18px] flex-none" />
      <span className="flex-1">
        <strong className="font-semibold" id={label}>
          {t("reader.revealed.until", { time: formatTime(until) })}
        </strong>{" "}
        {t("reader.revealed.recorded")}
      </span>
      <span aria-hidden="true" className="font-mono text-[13px] font-medium">
        {countdown(left)}
      </span>
      <button
        className="font-semibold text-danger underline underline-offset-2"
        onClick={onHide}
        type="button"
      >
        {t("reader.revealed.hide")}
      </button>
    </div>
  );
};

/** The draft and revision notices (U10) this detail calls for, in their fixed order. */
const noticesFor = (
  detail: PolicyDetail,
  t: (key: string, values?: Record<string, unknown>) => string,
  continueDraft?: () => void,
): ReaderNotice[] => {
  const notices: ReaderNotice[] = [];
  const revision = detail.revision;
  if (revision?.status === PolicyStatus.InReview) {
    notices.push({
      body: t("reader.notices.inReviewRevision.body", {
        revision: revision.version,
        version: detail.version,
      }),
      id: "inReviewRevision",
      title: t("reader.notices.inReviewRevision.title"),
      tone: "info",
    });
  } else if (revision?.status === PolicyStatus.Draft) {
    // Someone who can edit gets the way back into the one shared draft (#75).
    notices.push({
      ...(continueDraft
        ? {
            action: (
              <button
                className="font-semibold hover:underline"
                onClick={continueDraft}
                type="button"
              >
                {t("reader.notices.draftRevision.continue")}
              </button>
            ),
          }
        : {}),
      body: t("reader.notices.draftRevision.body", {
        revision: revision.version,
        version: detail.version,
      }),
      id: "draftRevision",
      title: continueDraft
        ? t("reader.notices.draftRevision.savedTitle", {
            noun: documentTypeCopy(detail.documentType).noun,
          })
        : t("reader.notices.draftRevision.title"),
      tone: "neutral",
    });
  }
  if (detail.status === PolicyStatus.InReview) {
    notices.push({
      body: t("reader.notices.inReview.body"),
      id: "inReview",
      title: t("reader.notices.inReview.title"),
      tone: "info",
    });
  }
  if (detail.status === PolicyStatus.Superseded) {
    notices.push({
      body: "",
      id: "superseded",
      title: t("reader.notices.superseded.title"),
      tone: "neutral",
    });
  }
  if (detail.status === PolicyStatus.Withdrawn) {
    notices.push({
      body: "",
      id: "withdrawn",
      title: t("reader.notices.withdrawn.title"),
      tone: "neutral",
    });
  }
  if (detail.status === PolicyStatus.Rejected || revision?.status === PolicyStatus.Rejected) {
    notices.push({
      body: t("reader.notices.changesRequested.body"),
      id: "changesRequested",
      title: t("reader.notices.changesRequested.title"),
      tone: "warn",
    });
  }
  return notices;
};

/** One cell of the six-up detail strip (U7). */
const DetailCell = ({ children, label }: { children: ReactNode; label: string }) => (
  <li className="flex flex-col gap-1 border-border px-4 py-3 sm:border-r sm:last:border-r-0">
    <span className="text-xs font-medium text-muted">{label}</span>
    <span className="text-base font-medium">{children}</span>
  </li>
);

/** The history's anchor, named so no section key (a slug of a heading) can take it. */
const HISTORY_ID = "reader-history";

export interface PolicyReaderProps {
  /** The admin console's governance items (A11), in their own Admin actions button next to
   *  Actions (#103). The staff reader leaves it out. */
  adminActions?: ReactNode;
  detail: PolicyDetail;
  /** Where the staff app posts `intent=edit` to start (or reopen) the working draft and open
   *  the editor. Given only when the viewer can edit; without it there is no Edit. */
  editAction?: string;
  /** Told when a sensitive record is sent to print, so the app can record the export. */
  onPrint?: (options: { includeHistory: boolean }) => void;
  /** The organisation's name, for the printed page's running header (R1). */
  organisation?: null | string;
  /** The signed-in person's name, for D1's record box and the printed footer. */
  viewerName?: string;
}

/**
 * While the browser prints, the moment it started; null otherwise. The print layout (R1) is
 * drawn only then, synchronously in `beforeprint`, so the page itself never carries a second
 * copy of the document. It covers the Print / Export actions and the browser's own print.
 */
const usePrinting = (): Date | null => {
  const [printedAt, setPrintedAt] = useState<Date | null>(null);
  useEffect(() => {
    const before = () => flushSync(() => setPrintedAt(new Date()));
    const after = () => setPrintedAt(null);
    globalThis.addEventListener("beforeprint", before);
    globalThis.addEventListener("afterprint", after);
    return () => {
      globalThis.removeEventListener("beforeprint", before);
      globalThis.removeEventListener("afterprint", after);
    };
  }, []);
  return printedAt;
};

/**
 * The policy/procedure reader (U7, U8, U10, U12-U18, D1, D2): the back link and the serif
 * header with star and Actions, the acknowledgement banner, the six-up detail strip, the
 * notices, the view strip (each tab only when it has something, with its count) and the AI
 * summary toggle, the document in the reading style beside the "On this page" outline, and the
 * history at the foot. It reads at full width (decision 2-layout-and-navigation.s9).
 */
export const PolicyReader = ({
  detail,
  editAction,
  adminActions,
  onPrint,
  organisation,
  viewerName,
}: PolicyReaderProps) => {
  const { t } = useTranslation("policy");
  const printedAt = usePrinting();
  const [printOpen, setPrintOpen] = useState(false);
  const [includeHistory, setIncludeHistory] = useState(false);
  const askToPrint = () => setPrintOpen(true);
  const printNow = (options: { includeHistory: boolean }) => {
    flushSync(() => {
      setIncludeHistory(options.includeHistory);
      setPrintOpen(false);
    });
    if (detail.sensitivity === Sensitivity.Sensitive) onPrint?.(options);
    // After the dialog has left the page, so the printout is only the document.
    setTimeout(() => globalThis.print(), 0);
  };
  const favorites = useFavorites();
  const [view, setView] = useState("view");
  const [summaryOn, setSummaryOn] = useState(false);
  const [highlighted, setHighlighted] = useState<string>();
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const ackState = ackBannerState(detail.ack);
  const redaction = redactionState(detail);
  // The grant the break-glass dialog won, while it lasts; the gateway can't yet say after a
  // reload when a grant ends (steward-gateway#58), so the bar shows only after a reveal here.
  const grant = useFetcher<ActionResult>({ key: BREAK_GLASS }).data?.grantedUntil;
  const [hiddenGrant, setHiddenGrant] = useState<string>();
  useEffect(() => {
    if (grant) notify.info(t("reader.revealed.toast"));
  }, [grant, t]);
  const revealed = redaction === "visible" && grant !== undefined && hiddenGrant !== grant;
  const reading = redaction === "visible" && (grant === undefined || hiddenGrant !== grant);
  const procedure = detail.documentType === DocumentType.Procedure;
  const starred = favorites.isFavorite(detail.number);
  // An administrator's switch removes every AI control; any other outage says so where the
  // AI would answer (BRIEF P3).
  const health = detail["ai"];
  const aiOff = health?.reason === "disabled_by_admin";
  const aiDown = health ? !health.available : false;
  // The summary is written at publish, so every published document offers it (U7).
  const offerSummary =
    !aiOff && detail.status === PolicyStatus.Published && Boolean(detail.currentVersionId);
  const { hash } = useLocation();
  // A citation links to "#<sectionKey>"; the page is drawn by then, so bring that section in.
  useEffect(() => {
    if (!hash) return;
    // An attribute match, not "#id": a section key can start with a digit ("1").
    const id = decodeURIComponent(hash.slice(1)).replaceAll(/["\\]/g, String.raw`\$&`);
    document.querySelector(`[id="${CSS.escape(id)}"]`)?.scrollIntoView();
  }, [hash]);
  const showHistory = () =>
    document.querySelector(`#${HISTORY_ID}`)?.scrollIntoView({ behavior: scrollBehavior() });
  const submit = useSubmit();
  const editLabel = hasWorkingDraft(detail)
    ? t("reader.actions.continueDraft")
    : t("reader.actions.edit");
  const edit = () => {
    if (editAction) void submit({ intent: "edit" }, { action: editAction, method: "post" });
  };
  const notices = noticesFor(detail, t, editAction ? edit : undefined);
  useRegisterCommandActions([
    { allowed: Boolean(editAction), id: "edit", label: editLabel, run: edit },
    { id: "print", label: t("reader.actions.print"), run: askToPrint },
    { id: "history", label: t("reader.actions.history"), run: showHistory, shortcut: "history" },
  ]);
  const appendixLabel = (appendix: PolicyAppendix) =>
    t("reader.appendices.heading", { letter: appendix.letter, title: appendix.title });

  const openTerm = (definition: PolicyDefinition) => {
    setView("definitions");
    setHighlighted(definition.id);
  };
  useEffect(() => {
    if (!highlighted) return;
    const timer = setTimeout(() => setHighlighted(undefined), 2000);
    return () => clearTimeout(timer);
  }, [highlighted]);

  const counts = {
    contacts: detail.contacts.length,
    definitions: detail.definitions.length,
    references: detail.references.length,
    related: detail.related.length,
  };
  const hasBody = detail.body.length > 0 || detail.appendices.length > 0;
  // the words and reading time of the body (bug log 172), as the editor shows them while writing
  const bodyWords = wordsInBlocks(detail.body);
  const readLength =
    bodyWords > 0 && !detail.bodyUnreadable
      ? { minutes: readingMinutes(bodyWords), words: bodyWords }
      : null;
  const shape = bodyShape(detail.body);
  const redactedLabel = t("reader.redacted.label", {
    parts: [
      t("reader.redacted.sections", { count: shape.sections }),
      ...(shape.tables > 0 ? [t("reader.redacted.tables", { count: shape.tables })] : []),
    ].join(", "),
  });

  return (
    // The pending acknowledgement is pinned to the bottom on a phone; keep the page clear of it.
    <div
      className={cn(
        "flex flex-col gap-[18px] px-4 pt-[22px] pb-10 text-base text-ink sm:px-9",
        redaction === "visible" && ackState === "pending" && "max-md:pb-48",
      )}
    >
      <Link
        className="flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:text-primary-hover"
        to={documentTypeBasePath(detail.documentType)}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {procedure ? t("reader.back.procedures") : t("reader.back.policies")}
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <RecordBreadcrumb record={detail} />
          <h1 className="font-serif text-[26px] leading-8 font-semibold sm:text-[34px] sm:leading-[42px]">
            {detail.title}
          </h1>
          <span className="flex flex-wrap items-center gap-2.5">
            <CopyId id={detail.number}>
              {t("reader.versionLine", { number: detail.number, version: detail.version })}
            </CopyId>
            {detail.sensitivity === Sensitivity.Sensitive ? <SensitivityBadge sensitive /> : null}
            {readLength ? (
              <span className="flex gap-2 text-sm text-muted">
                <span>{t("reader.wordCount", { count: readLength.words })}</span>
                <span aria-hidden="true">·</span>
                <span>{t("reader.readMinutes", { count: readLength.minutes })}</span>
              </span>
            ) : null}
          </span>
        </div>
        <button
          aria-label={t("reader.star.label")}
          aria-pressed={starred}
          className="flex size-[38px] flex-none items-center justify-center rounded-md border border-border-strong bg-surface text-[17px] hover:bg-sunken"
          onClick={() => favorites.toggle(detail.number)}
          type="button"
        >
          <FavoriteStar className="size-[1.15em]" starred={starred} />
        </button>
        <HeaderActions
          actions={
            <>
              {editAction ? (
                <MenuItem onSelect={edit}>
                  <Pencil aria-hidden="true" className="size-4" />
                  {editLabel}
                </MenuItem>
              ) : null}
              <MenuItem onSelect={askToPrint}>
                <Printer aria-hidden="true" className="size-4" />
                {t("reader.actions.print")}
              </MenuItem>
              <MenuItem onSelect={showHistory}>
                <History aria-hidden="true" className="size-4" />
                {t("reader.actions.history")}
              </MenuItem>
            </>
          }
          actionsLabel={t("reader.actions.menu")}
          adminActions={adminActions}
          adminLabel={t("reader.actions.adminMenu")}
        />
      </div>

      {/* Nobody can acknowledge what they can't read (U9). */}
      {redaction === "visible" && ackState === "pending" && detail.currentVersionId ? (
        <AckBanner
          action={<AcknowledgeDialog detail={detail} viewerName={viewerName} />}
          state="pending"
        />
      ) : null}
      {redaction === "visible" && ackState === "done" ? (
        <AckBanner ackedAt={detail.ack?.ackedAt} state="done" />
      ) : null}

      <ul
        aria-label={t("reader.metadata.label")}
        className="grid grid-cols-2 rounded-[10px] border border-border bg-surface shadow-1 sm:grid-cols-3 lg:grid-cols-6"
      >
        <DetailCell label={t("reader.metadata.status")}>
          <DocumentStatusPill status={detail.status} />
        </DetailCell>
        <DetailCell label={t("reader.metadata.sensitivity")}>
          {t(`sensitivity.${detail.sensitivity.toLowerCase()}`)}
        </DetailCell>
        <DetailCell label={t("reader.metadata.owner")}>
          {detail.ownerName ?? t("reader.metadata.none")}
        </DetailCell>
        <DetailCell label={t("reader.metadata.version")}>
          <span className="font-mono">{t("reader.versionValue", { version: detail.version })}</span>
        </DetailCell>
        <DetailCell label={t("reader.metadata.published")}>
          {formatDate(detail.published, { fallback: t("reader.metadata.none") })}
        </DetailCell>
        <DetailCell label={t("reader.metadata.updated")}>
          {formatDate(detail.updated, { fallback: t("reader.metadata.none") })}
        </DetailCell>
      </ul>

      <ReaderNotices notices={notices} />

      {revealed ? <RevealedBar onHide={() => setHiddenGrant(grant)} until={grant!} /> : null}

      {reading ? (
        <Tabs onValueChange={setView} value={view}>
          <div className="flex flex-wrap items-center gap-1 border-b border-border-strong">
            <TabsList className="border-b-0">
              <TabsTrigger value="view">{t("reader.tabs.view")}</TabsTrigger>
              {(["definitions", "related", "references", "contacts"] as const).map((key) => (
                <TabsTrigger count={counts[key]} empty={counts[key] === 0} key={key} value={key}>
                  {t(`reader.tabs.${key}`)}
                </TabsTrigger>
              ))}
              <TabsTrigger empty={!detail.priorVersion} value="changes">
                {t("reader.tabs.changes")}
              </TabsTrigger>
            </TabsList>
            {offerSummary ? (
              <label className="ml-auto flex items-center gap-2 py-2 text-[13px] font-medium text-muted">
                <Sparkles aria-hidden="true" className="size-4" />
                {t("reader.summary.toggle")}
                <Switch checked={summaryOn} onCheckedChange={setSummaryOn} />
              </label>
            ) : null}
          </div>
          <TabsContent className="mt-[18px]" value="view">
            <div className="flex flex-col gap-4">
              {offerSummary && summaryOn ? (
                <AiSummaryCard
                  badge={
                    detail.summary
                      ? t("reader.summary.generated", {
                          date: formatDate(detail.summary.generatedAt),
                        })
                      : undefined
                  }
                  text={detail.summary?.text}
                  title={t("reader.summary.title")}
                >
                  {aiDown ? t("reader.summary.unavailable") : t("reader.summary.empty")}
                </AiSummaryCard>
              ) : null}
              <div
                className={cn(
                  "grid items-start gap-8",
                  hasBody &&
                    (outlineCollapsed
                      ? "lg:grid-cols-[minmax(0,1fr)_44px]"
                      : "lg:grid-cols-[minmax(0,1fr)_264px]"),
                )}
              >
                {detail.bodyUnreadable ? (
                  <div className="flex flex-col gap-1 rounded-lg bg-danger-soft p-3.5 text-danger">
                    <span className="text-base font-semibold">
                      {t("reader.body.unreadable.title")}
                    </span>
                    <span className="text-sm leading-[1.45]">
                      {t("reader.body.unreadable.body")}
                    </span>
                  </div>
                ) : hasBody ? (
                  <PolicyDocument
                    appendices={detail.appendices}
                    appendixLabel={appendixLabel}
                    blocks={detail.body}
                    definitions={detail.definitions}
                    onTerm={openTerm}
                  />
                ) : (
                  <EmptyState title={t("reader.body.empty")} />
                )}
                {hasBody && !detail.bodyUnreadable ? (
                  <div className="max-lg:order-first">
                    <OutlineCard
                      footer={
                        <>
                          <a href={`#${HISTORY_ID}`}>
                            <History aria-hidden="true" className="size-4" />
                            {t("reader.actions.history")}
                          </a>
                          <button
                            className="flex items-center gap-2 text-primary"
                            onClick={askToPrint}
                            type="button"
                          >
                            <Printer aria-hidden="true" className="size-4" />
                            {t("reader.actions.print")}
                          </button>
                        </>
                      }
                      items={outlineItems(detail.body, detail.appendices, appendixLabel)}
                      onCollapsedChange={setOutlineCollapsed}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </TabsContent>
          <TabsContent className="mt-[18px]" value="definitions">
            <DefinitionsPanel definitions={detail.definitions} highlighted={highlighted} />
          </TabsContent>
          <TabsContent className="mt-[18px]" value="related">
            <RelatedPanel related={detail.related} />
          </TabsContent>
          <TabsContent className="mt-[18px]" value="references">
            <ReferencesPanel references={detail.references} />
          </TabsContent>
          <TabsContent className="mt-[18px]" value="contacts">
            <ContactsPanel contacts={detail.contacts} />
          </TabsContent>
          <TabsContent className="mt-[18px]" value="changes">
            {detail.priorVersion ? (
              <CompareVersions
                aiDown={aiDown && !aiOff}
                documentType={detail.documentType}
                initial={detail.priorVersion}
                versions={detail.versions ?? []}
              />
            ) : null}
          </TabsContent>
        </Tabs>
      ) : (
        <>
          {redaction === "visible" ? null : (
            <RedactionNotice canReveal={redaction === "redacted-reveal"} detail={detail} />
          )}
          {hasBody ? (
            <RedactedDocument
              appendices={detail.appendices}
              blocks={detail.body}
              label={redactedLabel}
            />
          ) : null}
        </>
      )}

      <div id={HISTORY_ID}>
        <PolicyReaderHistory history={detail.history} />
      </div>
      <PrintDialog
        onOpenChange={setPrintOpen}
        onPrint={printNow}
        open={printOpen}
        viewerName={viewerName}
      />
      {printedAt
        ? createPortal(
            <PolicyPrint
              detail={detail}
              includeHistory={includeHistory}
              organisation={organisation}
              printedAt={printedAt}
              viewerName={viewerName}
            />,
            document.body,
          )
        : null}
    </div>
  );
};
