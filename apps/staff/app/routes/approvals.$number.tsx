// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignalType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { parseDocument } from "@steward-web/editor-steward";
import { formatDayMonth, useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import {
  cn,
  CopyId,
  EmptyState,
  FlowView,
  notify,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@steward-web/ui";
import {
  DecisionPanel,
  DiffView,
  DocumentType,
  PolicyAppendices,
  PolicyDocument,
  PolicyReaderHistory,
  RecordBreadcrumb,
} from "@steward-web/ui/domain";
import {
  getPolicyDetail,
  getVersionDiff,
  getVersionDocument,
  listPolicies,
} from "@steward-web/ui/domain/server";
import { Check, ChevronLeft } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { data, Link, useFetcher } from "react-router";

import type { Route } from "./+types/approvals.$number";

import { flowStepsOf, submittedFrom } from "../approvals/approvalFlow";
import {
  decideApproval,
  getRunVetoes,
  getWorkflowStatus,
  listPendingTasks,
  listUpcomingApprovals,
} from "../approvals/approvals.server";
import { stepperStagesOf } from "../approvals/stepperStages";
import { ReviewerDocument } from "../authoring/DraftDocumentEditor";
import { listChangesSinceReview, listReviewThreads } from "../review/reviewThreads.server";
import { useReviewComments } from "../review/useReviewComments";

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
  // Each part of the review reads on its own: one that fails leaves its tab saying so. A
  // comparison that fails is not an empty one (bug log 208): the service refuses a draft saved
  // without its template version, and the tab has to say it could not compare.
  let diffFailed = false;
  const [workflow, vetoes, diff, upcoming, detail, threads, sinceReview] = await Promise.all([
    getWorkflowStatus(request, policyVersionId),
    getRunVetoes(request, policyVersionId),
    publishedId && draftId && publishedId !== draftId
      ? getVersionDiff(publishedId, draftId, cookie).catch(() => {
          diffFailed = true;
          return null;
        })
      : Promise.resolve(null),
    draftId ? getVersionDocument(draftId, cookie).catch(() => null) : Promise.resolve(null),
    found ? getPolicyDetail(found.documentType, found.number, cookie).catch(() => null) : null,
    draftId ? listReviewThreads(request, draftId) : Promise.resolve([]),
    // what changed since this approver last reviewed it; none for anyone without a seat
    draftId ? listChangesSinceReview(request, draftId) : Promise.resolve([]),
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
      diffFailed,
      // With the library row, a missing published version means this is the first one; without
      // it (a draft the library hides from this approver), the published version isn't known.
      first: Boolean(found) && (!publishedId || publishedId === draftId),
      history: detail?.history ?? [],
      sinceReview,
      upcoming,
    },
    task,
    threads,
    vetoes,
    workflow,
  });
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requireIdentityFromRequest(request);
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent !== "approve" && intent !== "reject" && intent !== "request-changes") {
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
      signal:
        intent === "approve"
          ? SignalType.SignalTypeApprove
          : intent === "reject"
            ? SignalType.SignalTypeReject
            : SignalType.SignalTypeRequestChanges,
      taskId,
    });
    // sending comments is not a decision: the seat stays open and the page stays as it is
    if (intent === "request-changes") return data({ sent: true as const });
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
  const sent = Boolean(actionData && "sent" in actionData);
  // sending comments is not a decision, so the panel stays; say it went
  useEffect(() => {
    if (sent) notify.success(t("review.decision.sent"));
  }, [sent, t]);
  const refusalMessage = useRefusalMessage(refusal ?? {});
  // A tab with nothing to show isn't offered: no changes when there is nothing to compare
  // against (a first version, or a published version that isn't known), and no history for a
  // first version or one without entries yet.
  const early = "review" in loaderData ? loaderData.review : null;
  const hasChanges = early !== null && (early.diff !== null || early.diffFailed);
  const hasHistory = early !== null && !early.first && early.history.length > 0;
  // what changed since this approver last reviewed it comes first when there is any
  const hasSince = early !== null && early.sinceReview.some((s) => s.changeType !== "unchanged");
  const [chosen, setView] = useState(hasSince ? "since" : hasChanges ? "changes" : "upcoming");
  // Mark as reviewed clears the changes since, and with them their tab: show another, not nothing
  const view = chosen === "since" && !hasSince ? (hasChanges ? "changes" : "upcoming") : chosen;
  const reviewedFetcher = useFetcher();
  // Inline comments on the version under review: whoever holds a seat on it comments and
  // replies; the drafter sees the same threads in the editor.
  const comments = useReviewComments({
    canAdd: "task" in loaderData && Boolean(loaderData.task),
    meId: "meId" in loaderData ? loaderData.meId : "",
    policyVersionId: "policyVersionId" in loaderData ? loaderData.policyVersionId : "",
    side: "REVIEWER",
    threads: "threads" in loaderData ? loaderData.threads : [],
  });

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

  const { match, meId, policyVersionId, preview, review, task, vetoes, workflow } = loaderData;
  const inReview = statusOf(workflow.status) === IN_REVIEW;
  const current = workflow.stageNames[workflow.currentStageIdx] ?? "";
  const submitted = submittedFrom(review.history);
  const deciding = Boolean(task) && inReview && !decided;
  // The version as the editor, for the commenting view; the plain reader when it can't open.
  const commentable =
    task && review.upcoming ? parseDocument(review.upcoming.contentJson) : undefined;
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
        {comments.threads.length > 0 ? (
          <p className="text-sm text-muted">
            {t("review.comments.withDecision", { count: comments.threads.length })}
          </p>
        ) : null}
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
        {match.number ? (
          <RecordBreadcrumb
            page={t("review.crumb")}
            published={!review.first}
            record={{ ...match, documentType: match.documentType ?? DocumentType.Policy }}
          />
        ) : null}
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

      <FlowView
        end={{
          id: "publish",
          state: statusOf(workflow.status) === "PUBLISHED" ? "done" : "upcoming",
          title: t("flow.publish"),
        }}
        label={t("flow.label")}
        start={{
          id: "submitted",
          state: "done",
          title: t("flow.submitted"),
          when: submitted.at ? formatDayMonth(submitted.at) : null,
          who: submitted.by,
        }}
        stateLabels={{
          current: t("flow.state.current"),
          done: t("flow.state.done"),
          rejected: t("flow.state.rejected"),
          upcoming: t("flow.state.upcoming"),
        }}
        steps={flowStepsOf(stepperStagesOf(workflow, meId, vetoes), {
          dueText: task?.dueAt ? t("flow.due", { date: formatDayMonth(task.dueAt) }) : null,
          voteLabel: (approved, needed) => t("flow.vote", { approved, needed }),
          youLabel: t("flow.you"),
        })}
      />

      <div className="grid items-start gap-6">
        <Tabs onValueChange={setView} value={view}>
          <TabsList stretch>
            {hasSince ? <TabsTrigger value="since">{t("review.tabs.since")}</TabsTrigger> : null}
            <TabsTrigger empty={!hasChanges} value="changes">
              {t("review.tabs.changes")}
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              {review.first ? t("review.tabs.proposed") : t("review.tabs.upcoming")}
            </TabsTrigger>
            <TabsTrigger empty={!hasHistory} value="history">
              {t("review.tabs.history")}
            </TabsTrigger>
          </TabsList>
          {hasSince ? (
            <TabsContent className="mt-3.5" value="since">
              <div className="flex flex-col gap-3">
                <DiffView
                  sections={review.sinceReview.filter((s) => s.changeType !== "unchanged")}
                />
                <button
                  className="self-start rounded-md border border-border px-3 py-1.5 text-base font-medium text-primary hover:bg-sunken"
                  onClick={() =>
                    reviewedFetcher.submit(
                      { intent: "reviewed", policyVersionId },
                      { action: "/resources/review-threads", method: "post" },
                    )
                  }
                  type="button"
                >
                  {t("review.tabs.markReviewed")}
                </button>
              </div>
            </TabsContent>
          ) : null}
          {review.diff === null ? null : (
            <TabsContent className="mt-3.5" value="changes">
              <DiffView sections={review.diff} />
            </TabsContent>
          )}
          {review.diffFailed ? (
            <TabsContent className="mt-3.5" value="changes">
              <Unavailable>{t("review.changes.unavailable")}</Unavailable>
            </TabsContent>
          ) : null}
          <TabsContent className="mt-3.5" value="upcoming">
            {review.upcoming && commentable ? (
              <>
                <ReviewerDocument initialDocument={commentable} review={comments} />
                <PolicyAppendices
                  appendices={review.upcoming.appendices}
                  appendixLabel={appendixLabel}
                  definitions={[]}
                />
              </>
            ) : review.upcoming ? (
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
