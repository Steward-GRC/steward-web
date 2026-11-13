// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowStageInput } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  type Failure,
  Field,
  Input,
  NotFound,
  Textarea,
} from "@steward-web/ui";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/workflows.$id";

import { listGroups } from "../categories/categories.server";
import { listPlatformGroups } from "../groups/platformGroups.server";
import { listUsers } from "../users/users.server";
import { getApproverCandidates, groupMembersOf } from "../workflows/approverCandidates.server";
import { type DeleteRefusal, deleteRefusalOf } from "../workflows/deleteRefusal";
import { StageEditor } from "../workflows/StageEditor";
import { stageInput } from "../workflows/stageInput";
import { newStage } from "../workflows/stageOutline";
import { notUsable } from "../workflows/workflowRules";
import {
  archiveWorkflowDef,
  createWorkflowDef,
  deleteWorkflowDef,
  getWorkCalendar,
  getWorkflowDef,
  updateWorkflowDef,
} from "../workflows/workflows.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const workflow = await getWorkflowDef(request, params.id);
  if (!workflow) return data({ workflow: null }, { status: 404 });
  const approverCandidates = await getApproverCandidates(request, workflow.id);
  const [users, groups, categories, calendar] = await Promise.all([
    // People and group names are a courtesy: without them the chips show ids.
    listUsers(request).catch(() => []),
    listPlatformGroups(request).catch(() => []),
    listGroups(request),
    getWorkCalendar(request),
  ]);
  return {
    approverCandidates,
    calendar,
    groupMembers: groupMembersOf(users),
    groupNames: Object.fromEntries(groups.map((g) => [g.id, g.name])),
    people: users
      .filter((u) => !u.deletedAt)
      .map((u) => ({ enabled: u.enabled, id: u.userId, name: u.name })),
    usedBy: categories.filter((c) => c.defaultWorkflowId === workflow.id).length,
    workflow,
  };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const workflow = await getWorkflowDef(request, params.id);
  if (!workflow) throw data("Not Found", { status: 404 });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  try {
    switch (intent) {
      case "archive": {
        // Archiving leaves every picker and keeps the history: what to do when a delete is
        // refused because runs or overrides used the workflow.
        await archiveWorkflowDef(request, workflow.id);
        return redirect(`/workflows?archived=${encodeURIComponent(workflow.name)}`);
      }
      case "delete": {
        // steward-gateway#62 and #236: a hard delete, refused while a category or any run uses it.
        await deleteWorkflowDef(request, workflow.id);
        return redirect(`/workflows?deleted=${encodeURIComponent(workflow.name)}`);
      }
      case "duplicate": {
        const copy = await createWorkflowDef(
          request,
          String(form.get("name") ?? workflow.name),
          workflow.description ?? null,
          workflow.stages.map((stage) => ({ ...stageInput(stage), id: undefined })),
        );
        return redirect(`/workflows/${copy.id}`);
      }
      case "save": {
        const name = String(form.get("name") ?? "").trim();
        if (!name) return data({ intent, invalid: true, ok: false } as const, { status: 400 });
        const description = String(form.get("description") ?? "").trim();
        const stages = JSON.parse(
          String(form.get("stagesJson") ?? "[]"),
        ) as readonly WorkflowStageInput[];
        await updateWorkflowDef(request, workflow.id, name, description || null, stages);
        return { intent, ok: true } as const;
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    if (intent === "delete") {
      const refusal = deleteRefusalOf(error);
      // Someone else removed it first: the editor has nothing left to show.
      if (refusal?.kind === "gone") return redirect("/workflows?gone=1");
      if (refusal) {
        return data({ failure: refusalOf(error), intent, ok: false, refusal } as const, {
          status: 409,
        });
      }
    }
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

const refusalFailure = (result: Result | undefined): Failure | undefined =>
  result && "failure" in result ? result.failure : undefined;

type Result =
  | { failure: Failure; intent: string; ok: false; refusal?: DeleteRefusal }
  | { intent: string; invalid: true; ok: false }
  | { intent: string; ok: true };

/**
 * The workflow editor (A9): the name with "Draft" until every stage has an approver, the
 * draft alert, the stage cards, then "+ Add stage", "Duplicate workflow" and "Delete workflow"
 * (off while a category uses it).
 */
export default function WorkflowEditor({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const save = useFetcher<Result>();
  const copy = useFetcher<Result>();
  const remove = useFetcher<Result>();
  const archive = useFetcher<Result>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refusalSeen, setRefusalSeen] = useState(false);
  const workflow = loaderData.workflow;
  const [stages, setStages] = useState<readonly WorkflowStageInput[]>(
    () => workflow?.stages.map((stage) => stageInput(stage)) ?? [],
  );
  const [name, setName] = useState(workflow?.name ?? "");

  if (!workflow) {
    return (
      <div className="flex w-full flex-col p-4 md:p-6">
        <NotFound
          action={
            <Button asChild variant="secondary">
              <Link to="/workflows">{t("workflows.editor.notFound.action")}</Link>
            </Button>
          }
          description={t("workflows.editor.notFound.description")}
          title={t("workflows.editor.notFound.title")}
        />
      </div>
    );
  }

  const { calendar, groupNames, people, usedBy } = loaderData;
  const draft = notUsable({ stages });
  const failure =
    [save, copy, remove, archive]
      .map((fetcher) =>
        fetcher.state === "idle" &&
        fetcher.data &&
        !fetcher.data.ok &&
        "failure" in fetcher.data &&
        !("refusal" in fetcher.data)
          ? fetcher.data.failure
          : undefined,
      )
      .find(Boolean) ?? undefined;
  const refusal =
    refusalSeen &&
    remove.state === "idle" &&
    remove.data &&
    !remove.data.ok &&
    "refusal" in remove.data
      ? remove.data.refusal
      : undefined;
  const invalid = save.state === "idle" && save.data && !save.data.ok && "invalid" in save.data;

  return (
    <save.Form className="flex w-full flex-col gap-3.5 p-4 md:p-6" method="post">
      <input name="intent" type="hidden" value="save" />
      <input name="stagesJson" type="hidden" value={JSON.stringify(stages)} />
      <header className="flex flex-wrap items-end gap-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted">{t("workflows.editor.eyebrow")}</p>
          <h1 className="text-[26px] leading-[1.3] font-semibold">{name || workflow.name}</h1>
          <p className="text-base text-muted">{t("workflows.editor.sequential")}</p>
        </div>
        {draft ? <Badge>{t("workflows.draft")}</Badge> : null}
      </header>

      {draft ? (
        <div className="flex gap-2.5 rounded-lg bg-warn-soft px-3.5 py-3 text-warn" role="status">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 flex-none" />
          <span>
            <b>{t("workflows.editor.notUsableTitle")}</b> · {t("workflows.editor.notUsable")}
          </span>
        </div>
      ) : null}

      <fieldset className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4">
        <legend className="sr-only">{t("workflows.editor.details")}</legend>
        <Field
          error={invalid ? t("workflows.editor.required") : undefined}
          label={t("workflows.editor.name")}
        >
          <Input name="name" onChange={(event) => setName(event.target.value)} value={name} />
        </Field>
        <Field label={t("workflows.editor.description")}>
          <Textarea defaultValue={workflow.description ?? ""} name="description" rows={1} />
        </Field>
      </fieldset>

      <StageEditor
        approverCandidates={loaderData.approverCandidates}
        calendar={calendar}
        groupMembers={loaderData.groupMembers}
        groupNames={groupNames}
        onChange={setStages}
        people={people}
        stages={stages}
      />

      {refusal?.kind === "categories" ? (
        <Banner
          failure={refusalFailure(remove.data)}
          title={t("workflows.editor.refused.categories", { count: refusal.count })}
          tone="warn"
        />
      ) : null}
      {refusal?.kind === "used" ? (
        <Banner
          actions={
            <Button
              busy={archive.state !== "idle"}
              onClick={() => void archive.submit({ intent: "archive" }, { method: "post" })}
              variant="secondary"
            >
              {t("workflows.editor.archive")}
            </Button>
          }
          failure={refusalFailure(remove.data)}
          title={t("workflows.editor.refused.used", { count: refusal.count })}
          tone="warn"
        />
      ) : null}

      {failure ? (
        <Banner failure={failure} title={t("workflows.editor.failed")} tone="danger" />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={() => setStages([...stages, newStage(stages)])} variant="secondary">
          {t("workflows.editor.addStage")}
        </Button>
        <Button
          className="ml-auto"
          onClick={() =>
            void copy.submit(
              {
                intent: "duplicate",
                name: t("workflows.editor.copyName", { name: workflow.name }),
              },
              { method: "post" },
            )
          }
          variant="secondary"
        >
          {t("workflows.editor.duplicate")}
        </Button>
        <Dialog
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (open) setRefusalSeen(false);
          }}
          open={deleteOpen}
        >
          <DialogTrigger asChild>
            <Button
              disabled={usedBy > 0}
              title={usedBy > 0 ? t("workflows.editor.inUse", { count: usedBy }) : undefined}
              variant="secondary"
            >
              {t("workflows.editor.delete")}
            </Button>
          </DialogTrigger>
          <DialogContent
            description={t("workflows.editor.deleteDescription")}
            title={t("workflows.editor.deleteTitle", { name: workflow.name })}
            tone="danger"
          >
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("workflows.editor.cancel")}</Button>
              </DialogClose>
              <Button
                busy={remove.state !== "idle"}
                onClick={() => {
                  setRefusalSeen(true);
                  setDeleteOpen(false);
                  void remove.submit({ intent: "delete" }, { method: "post" });
                }}
                variant="danger"
              >
                {t("workflows.editor.deleteConfirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <span className="flex items-center gap-2.5">
          {save.state === "idle" && save.data?.ok ? (
            <span className="font-semibold text-ok">{t("workflows.editor.saved")}</span>
          ) : null}
          <Button busy={save.state !== "idle"} type="submit">
            {t("workflows.editor.save")}
          </Button>
        </span>
      </div>
    </save.Form>
  );
}
