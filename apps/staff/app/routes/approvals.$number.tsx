// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignalType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import {
  ApproverPill,
  type ApproverState,
  Button,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Textarea,
} from "@steward-web/ui";
import { DocumentType, documentTypeBasePath } from "@steward-web/ui/domain";
import { listPolicies } from "@steward-web/ui/domain/server";
import { data, Link, redirect } from "react-router";

import type { Route } from "./+types/approvals.$number";

import { decideApproval, getWorkflowStatus, listPendingTasks } from "../approvals/approvals.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireIdentityFromRequest(request);
  const cookie = request.headers.get("cookie") ?? undefined;
  const [policies, procedures, pendingTasks] = await Promise.all([
    listPolicies(DocumentType.Policy, cookie),
    listPolicies(DocumentType.Procedure, cookie),
    listPendingTasks(request),
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
  const match: {
    category: string;
    documentType: DocumentType | null;
    number: string;
    title: string;
  } = found
    ? {
        category: found.category,
        documentType: found.documentType,
        number: found.number,
        title: found.title,
      }
    : { category: "", documentType: null, number: "", title: byVersion?.policyTitle ?? "" };

  const workflow = await getWorkflowStatus(request, policyVersionId);
  const task = pendingTasks.find((t) => t.policyVersionId === policyVersionId) ?? null;

  return data({ match, policyVersionId, task, workflow });
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
    return redirect("/approvals");
  } catch (error) {
    return data({ error: refusalOf(error) }, { status: 400 });
  }
};

export default function ApprovalReviewRoute({
  actionData,
  loaderData,
  params,
}: Route.ComponentProps) {
  const { t } = useTranslation("approvals");
  const refusalMessage = useRefusalMessage(actionData?.error ?? {});

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

  const { match, policyVersionId, task, workflow } = loaderData;
  const stageIndex = workflow.currentStageIdx;
  const assignees = workflow.stageAssignees[stageIndex] ?? [];

  return (
    <div className="grid gap-6 p-6">
      <PageHeader eyebrow={match.number} subtitle={match.category} title={match.title} />

      <Card>
        <CardBody className="grid gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t("review.stepper.title")}
          </h2>
          <ol className="grid gap-3">
            {workflow.stageNames.map((name, index) => (
              <li className="grid gap-2" key={`${params.number}-stage-${index}`}>
                <p className={index === stageIndex ? "font-semibold text-ink" : "text-muted"}>
                  {name}
                </p>
                {index === stageIndex ? (
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee) => (
                      <ApproverPill key={assignee.userId} state={assignee.state as ApproverState} />
                    ))}
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      {task ? (
        <Card>
          <CardBody>
            <form className="grid gap-4" method="post">
              <input name="policyVersionId" type="hidden" value={policyVersionId} />
              <input name="runId" type="hidden" value={task.runId} />
              <input name="taskId" type="hidden" value={task.taskId} />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
                {t("review.decision.title")}
              </h2>
              <Textarea
                aria-label={t("review.decision.comment")}
                name="comment"
                placeholder={t("review.decision.comment")}
                required
                rows={3}
              />
              {actionData?.error ? <p className="text-sm text-danger">{refusalMessage}</p> : null}
              <div className="flex gap-2">
                <Button name="intent" type="submit" value="approve">
                  {t("review.decision.approve")}
                </Button>
                <Button name="intent" type="submit" value="reject" variant="danger">
                  {t("review.decision.reject")}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {match.documentType && match.number ? (
        <Link
          className="text-sm text-primary hover:underline"
          to={`${documentTypeBasePath(match.documentType)}/${encodeURIComponent(match.number)}`}
        >
          {t("review.viewFull")}
        </Link>
      ) : null}
    </div>
  );
}
