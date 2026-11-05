// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { SignalType } from "@steward-web/api-client";
import { requireIdentityFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import { EmptyState, PageHeader } from "@steward-web/ui";
import {
  ApprovalStepper,
  DecisionPanel,
  DocumentType,
  documentTypeBasePath,
} from "@steward-web/ui/domain";
import { listPolicies } from "@steward-web/ui/domain/server";
import { data, Link, redirect } from "react-router";

import type { Route } from "./+types/approvals.$number";

import { decideApproval, getWorkflowStatus, listPendingTasks } from "../approvals/approvals.server";
import { stepperStagesOf } from "../approvals/stepperStages";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const identity = await requireIdentityFromRequest(request);
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

  return data({ match, meId: identity.id, policyVersionId, task, workflow });
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

export default function ApprovalReviewRoute({ actionData, loaderData }: Route.ComponentProps) {
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

  const { match, meId, policyVersionId, task, workflow } = loaderData;

  return (
    // On a phone the decision panel is pinned to the bottom (U25m); keep the page clear of it.
    <div className={task ? "grid gap-6 p-6 max-md:pb-80" : "grid gap-6 p-6"}>
      <PageHeader eyebrow={match.number} subtitle={match.category} title={match.title} />

      <ApprovalStepper stages={stepperStagesOf(workflow, meId)} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {match.documentType && match.number ? (
            <Link
              className="text-sm text-primary hover:underline"
              to={`${documentTypeBasePath(match.documentType)}/${encodeURIComponent(match.number)}`}
            >
              {t("review.viewFull")}
            </Link>
          ) : null}
        </div>
        {task ? (
          <DecisionPanel error={actionData?.error ? refusalMessage : undefined}>
            <input name="policyVersionId" type="hidden" value={policyVersionId} />
            <input name="runId" type="hidden" value={task.runId} />
            <input name="taskId" type="hidden" value={task.taskId} />
          </DecisionPanel>
        ) : null}
      </div>
    </div>
  );
}
