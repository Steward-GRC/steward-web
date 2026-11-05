// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, PolicyStatus } from "@steward-web/api-client";
import { formatDate, formatDateTime, formatTime, useTranslation } from "@steward-web/i18n";
import { ChevronDown, ChevronLeft, History, Printer, Sparkles, Star } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { Link, useFetcher } from "react-router";

import { Button } from "#ui/components/Button";
import { Switch } from "#ui/components/Controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#ui/components/Display";
import { Field } from "#ui/components/Field";
import { Textarea } from "#ui/components/Input";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Menu,
  MenuContent,
  MenuItem,
  MenuTrigger,
} from "#ui/components/Overlays";
import { Banner } from "#ui/feedback/Banner";
import { type Failure } from "#ui/feedback/failure";
import { EmptyState } from "#ui/feedback/States";
import { notify } from "#ui/feedback/Toast";
import { cn } from "#ui/lib/cn";

import { AckBanner } from "./AckBanner";
import { DocumentStatusPill } from "./DocumentStatusPill";
import { useFavorites } from "./favorites";
import { OutlineCard } from "./OutlineCard";
import { documentTypeBasePath } from "./policy";
import { outlineItems, PolicyDocument } from "./PolicyDocument";
import { PolicyReaderChanges, PolicyReaderHistory } from "./PolicyReaderHistory";
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
import { type ReaderNotice, ReaderNotices } from "./ReaderNotices";

interface ActionResult {
  error?: Failure;
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

/** The break-glass dialog (D2): a required reason, then submits `breakGlassReveal` through the route's action. */
const BreakGlassDialog = ({ policyId }: { policyId: string }) => {
  const { t } = useTranslation(["policy", "common"]);
  const fetcher = useFetcher<ActionResult>();
  const [open, setOpen] = useState(false);
  const busy = fetcher.state !== "idle";

  // See the matching comment in AcknowledgeDialog: closes on the render that first sees
  // a successful submission, rather than in a later effect.
  const [seenData, setSeenData] = useState(fetcher.data);
  if (fetcher.data !== seenData) {
    setSeenData(fetcher.data);
    if (fetcher.data?.ok) setOpen(false);
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="secondary">{t("reader.redacted.breakGlass")}</Button>
      </DialogTrigger>
      <DialogContent
        busy={busy}
        description={t("reader.dialogs.breakGlass.description")}
        hasInput
        title={t("reader.dialogs.breakGlass.title")}
        tone="danger"
      >
        <fetcher.Form method="post">
          <input name="intent" type="hidden" value="breakGlass" />
          <input name="policyId" type="hidden" value={policyId} />
          <DialogBody>
            {fetcher.data?.error ? (
              <Banner
                failure={fetcher.data.error}
                title={t("reader.dialogs.breakGlass.title")}
                tone="danger"
              />
            ) : null}
            <Field label={t("reader.dialogs.breakGlass.reasonLabel")}>
              <Textarea className="min-h-20" name="reason" required />
            </Field>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={busy} type="button" variant="secondary">
                {t("actions.cancel", { ns: "common" })}
              </Button>
            </DialogClose>
            <Button busy={busy} type="submit" variant="danger">
              {t("reader.dialogs.breakGlass.confirm")}
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

/** The draft and revision notices (U10) this detail calls for, in their fixed order. */
const noticesFor = (
  detail: PolicyDetail,
  t: (key: string, values?: Record<string, unknown>) => string,
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
    notices.push({
      body: t("reader.notices.draftRevision.body", {
        revision: revision.version,
        version: detail.version,
      }),
      id: "draftRevision",
      title: t("reader.notices.draftRevision.title"),
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

/** A view-strip tab with its count in mono (U7). */
const TabLabel = ({ count, label }: { count?: number; label: string }) => (
  <>
    {label}
    {count === undefined ? null : (
      <>
        {" "}
        <span className="font-mono text-xs">{count}</span>
      </>
    )}
  </>
);

const tab =
  "-mb-px rounded-none border-0 bg-transparent px-3 py-2.5 text-base font-medium text-muted shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-[inset_0_-2px_var(--primary)]";

export interface PolicyReaderProps {
  detail: PolicyDetail;
  /** The signed-in person's name, for D1's record box. */
  viewerName?: string;
}

/**
 * The policy/procedure reader (U7, U8, U10, U12-U18, D1, D2): the back link and the serif
 * header with star and Actions, the acknowledgement banner, the six-up detail strip, the
 * notices, the view strip (each tab only when it has something, with its count) and the AI
 * summary toggle, the document in the reading style beside the "On this page" outline, and the
 * history at the foot. It reads at full width (decision 2-layout-and-navigation.s9).
 */
export const PolicyReader = ({ detail, viewerName }: PolicyReaderProps) => {
  const { t } = useTranslation("policy");
  const favorites = useFavorites();
  const [view, setView] = useState("view");
  const [summaryOn, setSummaryOn] = useState(false);
  const [highlighted, setHighlighted] = useState<string>();
  const [outlineCollapsed, setOutlineCollapsed] = useState(false);
  const ackState = ackBannerState(detail.ack);
  const redaction = redactionState(detail);
  const notices = noticesFor(detail, t);
  const procedure = detail.documentType === DocumentType.Procedure;
  const starred = favorites.isFavorite(detail.number);
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

  return (
    // The pending acknowledgement is pinned to the bottom on a phone; keep the page clear of it.
    <div
      className={cn(
        "flex flex-col gap-[18px] px-4 pt-[22px] pb-10 text-base text-ink sm:px-9",
        ackState === "pending" && "max-md:pb-48",
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
          <span className="text-xs font-medium tracking-[.04em] text-muted">
            {detail.subcategory ? `${detail.category} · ${detail.subcategory}` : detail.category}
          </span>
          <h1 className="font-serif text-[26px] leading-8 font-semibold sm:text-[34px] sm:leading-[42px]">
            {detail.title}
          </h1>
          <span className="font-mono text-[13px] text-muted">
            {t("reader.versionLine", { number: detail.number, version: detail.version })}
          </span>
        </div>
        <button
          aria-label={t("reader.star.label")}
          aria-pressed={starred}
          className="flex size-[38px] flex-none items-center justify-center rounded-md border border-border-strong bg-surface text-[17px] hover:bg-sunken"
          onClick={() => favorites.toggle(detail.number)}
          type="button"
        >
          <Star
            aria-hidden="true"
            className={cn("size-[1.15em]", starred && "fill-accent text-accent")}
          />
        </button>
        <Menu>
          <MenuTrigger asChild>
            <button
              className="flex h-[38px] flex-none items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3.5 font-semibold hover:bg-sunken"
              type="button"
            >
              {t("reader.actions.menu")}
              <ChevronDown aria-hidden="true" className="size-4" />
            </button>
          </MenuTrigger>
          <MenuContent align="end">
            <MenuItem onSelect={() => globalThis.print()}>
              <Printer aria-hidden="true" className="size-4" />
              {t("reader.actions.print")}
            </MenuItem>
            <MenuItem
              onSelect={() =>
                document.querySelector("#history")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <History aria-hidden="true" className="size-4" />
              {t("reader.actions.history")}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>

      {ackState === "pending" && detail.currentVersionId ? (
        <AckBanner
          action={<AcknowledgeDialog detail={detail} viewerName={viewerName} />}
          state="pending"
        />
      ) : null}
      {ackState === "done" ? <AckBanner ackedAt={detail.ack?.ackedAt} state="done" /> : null}

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

      {redaction === "visible" ? (
        <Tabs onValueChange={setView} value={view}>
          <div className="flex flex-wrap items-center gap-1 border-b border-border-strong">
            <TabsList className="h-auto gap-1 rounded-none bg-transparent p-0">
              <TabsTrigger className={tab} value="view">
                {t("reader.tabs.view")}
              </TabsTrigger>
              {(["definitions", "related", "references", "contacts"] as const).map((key) =>
                counts[key] > 0 ? (
                  <TabsTrigger className={tab} key={key} value={key}>
                    <TabLabel count={counts[key]} label={t(`reader.tabs.${key}`)} />
                  </TabsTrigger>
                ) : null,
              )}
              {detail.priorVersion ? (
                <TabsTrigger className={tab} value="changes">
                  {t("reader.tabs.changes")}
                </TabsTrigger>
              ) : null}
            </TabsList>
            {detail.summary ? (
              <label className="ml-auto flex items-center gap-2 py-2 text-sm font-medium text-muted">
                <Sparkles aria-hidden="true" className="size-4" />
                {t("reader.summary.toggle")}
                <Switch checked={summaryOn} onCheckedChange={setSummaryOn} />
              </label>
            ) : null}
          </div>
          <TabsContent className="mt-[18px]" value="view">
            <div className="flex flex-col gap-4">
              {summaryOn && detail.summary ? (
                <section className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface px-5 py-4">
                  <span className="flex items-center gap-2.5 text-[15px] font-semibold">
                    <Sparkles aria-hidden="true" className="size-4 text-primary" />
                    {t("reader.summary.title")}
                  </span>
                  <p className="text-[15px] leading-[1.6] whitespace-pre-line">
                    {detail.summary.text}
                  </p>
                  <span className="text-xs text-muted">{t("reader.summary.disclaimer")}</span>
                </section>
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
                          <a href="#history">
                            <History aria-hidden="true" className="size-4" />
                            {t("reader.actions.history")}
                          </a>
                          <button
                            className="flex items-center gap-2 text-primary"
                            onClick={() => globalThis.print()}
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
            <PolicyReaderChanges priorVersion={detail.priorVersion} />
          </TabsContent>
        </Tabs>
      ) : (
        <Banner
          actions={
            redaction === "redacted-reveal" ? <BreakGlassDialog policyId={detail.id} /> : null
          }
          title={t("reader.redacted.title")}
          tone="warn"
        >
          {t("reader.redacted.body")}
          {redaction === "redacted-no-permission" ? ` ${t("reader.redacted.noPermission")}` : ""}
        </Banner>
      )}

      <div id="history">
        <PolicyReaderHistory history={detail.history} />
      </div>
    </div>
  );
};
