// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignalType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { formatDayMonth, useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import { cn, CopyId, EmptyState, Tabs, TabsContent, TabsList, TabsTrigger } from "@steward-web/ui";
import {
  ApprovalStepper,
  DecisionPanel,
  DiffView,
  DocumentType,
  PolicyDocument,
  PolicyReaderHistory,
} from "@steward-web/ui/domain";
import {
  getPolicyDetail,
  getVersionDiff,
  getVersionDocument,
  listPolicies,
} from "@steward-web/ui/domain/server";
import { Check, ChevronLeft } from "lucide-react";
import { type ReactNode, useState } from "react";
import { data, Link } from "react-router";

import type { Route } from "./+types/approvals.$number";

import {
  decideApproval,
  getWorkflowStatus,
  listPendingTasks,
  listUpcomingApprovals,
} from "../approvals/approvals.server";
import { stepperStagesOf } from "../approvals/stepperStages";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const identity = await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, procedures, pendingTasks, upcomingApprovals] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listPolicies(DocumentType.Procedure, cookie),
    listPendingTasks(request),
    listUpcomingApprovals(request).catch(() => []),
  ]);
  const found = [...policies, ...procedures].find((p) => p.number === params.number);

  // The version a live run acts on: the draft currently in review when there is one, else
  // the published version (a run that already resolved, kept here for a read-only stepper).
  // A draft the approver can't edit is hidden from their library, so the inbox links its task
  // by version id instead, and the task alone names it (#110).
  const byVersion = found
    ? undefined
    : pendingTasks.find((t) => t.policyVersionId === params.number);
  const policyVersionId = found
    ? (found.currentDraftVersionId ?? found.currentPublishedVersionId)
    : byVersion?.policyVersionId;
  if (!policyVersionId) return data({ match: null }, { status: 404 });

  const publishedId = found?.currentPublishedVersionId ?? null;
  const draftId = found ? (found.currentDraftVersionId ?? null) : policyVersionId;
  // Each part of the review reads on its own: one that fails leaves its tab saying so.
  const [workflow, diff, upcoming, detail] = await Promise.all([
    getWorkflowStatus(request, policyVersionId),
    publishedId && draftId && publishedId !== draftId
      ? getVersionDiff(publishedId, draftId, cookie).catch(() => [])
      : Promise.resolve(null),
    draftId ? getVersionDocument(draftId, cookie).catch(() => null) : Promise.resolve(null),
    found ? getPolicyDetail(found.documentType, found.number, cookie).catch(() => null) : null,
  ]);
  const task = pendingTasks.find((t) => t.policyVersionId === policyVersionId) ?? null;
  const coming = task
    ? undefined
    : upcomingApprovals.find((u) => u.policyVersionId === policyVersionId);

  const match: {
    category: string;
    documentType: DocumentType | null;
    number: string;
    subcategory: string;
    title: string;
    version: string;
  } = {
    category: found?.category ?? "",
    documentType: found?.documentType ?? null,
    number: found?.number ?? "",
    subcategory: found?.subcategory ?? "",
    title: found?.title ?? byVersion?.policyTitle ?? "",
    version: upcoming?.version ?? found?.version ?? "",
  };

  return data({
    match,
    meId: identity.id,
    policyVersionId,
    preview: coming ? { stageNumber: coming.stageIndex + 1 } : null,
    review: {
      diff,
      // With the library row, a missing published version means this is the first one; without
      // it (a draft the library hides from this approver), the published version isn't known.
      first: Boolean(found) && (!publishedId || publishedId === draftId),
      history: detail?.history ?? [],
      upcoming,
    },
    task,
    workflow,
  });
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent !== "approve" && intent !== "reject") {
    throw new Response("Bad Request", { status: 400 });
  }
  const policyVersionId = String(form.get("policyVersionId") ?? "");
  const runId = String(form.get("runId") ?? "");
  const taskId = String(form.get("taskId") ?? "");
  const comment = String(form.get("comment") ?? "");

  try {
    await decideApproval(request, {
      comment,
      policyVersionId,
      runId,
      signal: intent === "approve" ? SignalType.SignalTypeApprove : SignalType.SignalTypeReject,
      taskId,
    });
    return data({ decided: intent === "approve" ? ("approved" as const) : ("rejected" as const) });
  } catch (error) {
    return data({ error: refusalOf(error) }, { status: 400 });
  }
};

const IN_REVIEW = "IN_REVIEW";
const statusOf = (status: string) => status.replace(/^APPROVAL_STATUS_/, "");

/** U25o's notes in place of the decision panel: a left edge by weight, a title and a line. */
const Note = ({ body, title, tone }: { body: string; title: string; tone: "info" | "neutral" }) => (
  <div
    className={cn(
      "flex flex-col gap-0.5 rounded-lg bg-surface px-4 py-3.5 text-base",
      tone === "info"
        ? "shadow-[inset_3px_0_var(--info),inset_0_0_0_1px_var(--border)]"
        : "shadow-[inset_3px_0_var(--neutral),inset_0_0_0_1px_var(--border)]",
      "hc:border hc:border-border",
    )}
    role="note"
  >
    <b className="font-semibold">{title}</b>
    <span className="text-muted">{body}</span>
  </div>
);

const Unavailable = ({ children }: { children: ReactNode }) => (
  <p className="rounded-lg border border-border bg-surface px-5 py-4 text-base text-muted">
    {children}
  </p>
);

/**
 * The review page (U25, U25m, U25o): the way back, the category, the serif title with its
 * number, stage and due date; the stepper; then the changes against the published version,
 * the version under review and its history on tabs, then the decision panel at the bottom. Someone who
 * isn't deciding now gets a note instead: a preview of a later stage, not their run, or
 * nothing left to decide. Once they've decided, the panel gives way to a confirmation.
 */
export default function ApprovalReviewRoute({ actionData, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation(["approvals", "policy"]);
  const refusal = actionData && "error" in actionData ? actionData.error : undefined;
  const decided = actionData && "decided" in actionData ? actionData.decided : undefined;
  const refusalMessage = useRefusalMessage(refusal ?? {});
  // A tab with nothing to show isn't offered: no changes when there is nothing to compare
  // against (a first version, or a published version that isn't known), and no history for a
  // first version or one without entries yet.
  const early = "review" in loaderData ? loaderData.review : null;
  const hasChanges = early !== null && early.diff !== null;
  const hasHistory = early !== null && !early.first && early.history.length > 0;
  const [view, setView] = useState(hasChanges ? "changes" : "upcoming");

  if (!loaderData.match) {
    return (
      <div className="grid gap-6 p-6">
        <EmptyState
          description={t("review.notFound.description")}
          title={t("review.notFound.title")}
        />
        <Link className="text-sm text-primary hover:underline" to="/approvals">
          {t("review.back")}
        </Link>
      </div>
    );
  }

  const { match, meId, policyVersionId, preview, review, task, workflow } = loaderData;
  const inReview = statusOf(workflow.status) === IN_REVIEW;
  const current = workflow.stageNames[workflow.currentStageIdx] ?? "";
  const eyebrow = [match.category, match.subcategory].filter(Boolean).join(" · ");
  const deciding = Boolean(task) && inReview && !decided;
  const appendixLabel = (appendix: { letter: string; title: string }) =>
    t("policy:reader.appendices.heading", { letter: appendix.letter, title: appendix.title });

  let aside: ReactNode = null;
  if (decided) {
    aside = (
      <div
        className="flex items-center gap-2.5 rounded-lg bg-ok-soft px-4 py-3.5 text-base text-ok"
        role="status"
      >
        <Check aria-hidden="true" className="size-4 flex-none" />
        <span>
          <b>{t(`review.decided.${decided}.title`)}</b> {t(`review.decided.${decided}.body`)}
        </span>
      </div>
    );
  } else if (deciding && task) {
    aside = (
      <DecisionPanel className="md:static" error={refusal ? refusalMessage : undefined}>
        <input name="policyVersionId" type="hidden" value={policyVersionId} />
        <input name="runId" type="hidden" value={task.runId} />
        <input name="taskId" type="hidden" value={task.taskId} />
      </DecisionPanel>
    );
  } else if (!inReview) {
    aside = (
      <Note
        body={t("review.states.done.body")}
        title={t("review.states.done.title")}
        tone="neutral"
      />
    );
  } else if (preview) {
    aside = (
      <Note
        body={t("review.states.preview.body", { stage: current })}
        title={t("review.states.preview.title", { n: preview.stageNumber })}
        tone="info"
      />
    );
  } else {
    aside = (
      <Note
        body={t("review.states.outOfScope.body")}
        title={t("review.states.outOfScope.title")}
        tone="neutral"
      />
    );
  }

  return (
    // On a phone the decision panel is pinned to the bottom (U25m); keep the page clear of it.
    <div
      className={cn(
        "flex flex-col gap-[18px] px-4 pt-[26px] pb-9 text-ink md:px-9",
        deciding && "max-md:pb-80",
      )}
    >
      <Link
        className="flex items-center gap-1.5 self-start text-[13px] font-medium text-primary hover:text-primary-hover"
        to="/approvals"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {t("inbox.title")}
      </Link>

      <div className="flex flex-col gap-1">
        {eyebrow ? <span className="text-xs font-medium text-muted">{eyebrow}</span> : null}
        <h1 className="font-serif text-[24px] leading-[30px] font-semibold md:text-[32px] md:leading-[40px]">
          {match.title || t("inbox.untitled")}
        </h1>
        <span className="flex flex-wrap items-center gap-2.5">
          {match.number ? (
            <CopyId id={match.number}>
              {match.version ? `${match.number} · v${match.version}` : match.number}
            </CopyId>
          ) : null}
          {task?.dueAt ? (
            <span className="text-[13px] text-muted">
              {t("review.due", { date: formatDayMonth(task.dueAt), stage: current })}
            </span>
          ) : null}
        </span>
      </div>

      <ApprovalStepper stages={stepperStagesOf(workflow, meId)} />

      <div className="grid items-start gap-6">
        <Tabs onValueChange={setView} value={view}>
          <TabsList stretch>
            <TabsTrigger empty={!hasChanges} value="changes">
              {t("review.tabs.changes")}
            </TabsTrigger>
            <TabsTrigger value="upcoming">{t("review.tabs.upcoming")}</TabsTrigger>
            <TabsTrigger empty={!hasHistory} value="history">
              {t("review.tabs.history")}
            </TabsTrigger>
          </TabsList>
          {review.diff === null ? null : (
            <TabsContent className="mt-3.5" value="changes">
              <DiffView sections={review.diff} />
            </TabsContent>
          )}
          <TabsContent className="mt-3.5" value="upcoming">
            {review.upcoming ? (
              <PolicyDocument
                appendices={review.upcoming.appendices}
                appendixLabel={appendixLabel}
                blocks={review.upcoming.blocks}
                definitions={[]}
              />
            ) : (
              <Unavailable>{t("review.upcoming.unavailable")}</Unavailable>
            )}
          </TabsContent>
          <TabsContent className="mt-3.5" value="history">
            <PolicyReaderHistory history={review.history} />
          </TabsContent>
        </Tabs>
        {aside}
      </div>
    </div>
  );
}
