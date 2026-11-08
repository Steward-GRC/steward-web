// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowDef, WorkflowStageInput } from "@steward-web/api-client";

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
import { StageEditor } from "../workflows/StageEditor";
import { newStage } from "../workflows/stageOutline";
import { notUsable } from "../workflows/workflowRules";
import {
  archiveWorkflowDef,
  createWorkflowDef,
  getWorkflowDef,
  listWorkflowVetoes,
  setWorkflowVetoEnabled,
  updateWorkflowDef,
} from "../workflows/workflows.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const workflow = await getWorkflowDef(request, params.id);
  if (!workflow) return data({ workflow: null }, { status: 404 });
  const [users, groups, categories, vetoes] = await Promise.all([
    // People and group names are a courtesy: without them the chips show ids.
    listUsers(request).catch(() => []),
    listPlatformGroups(request).catch(() => []),
    listGroups(request),
    listWorkflowVetoes(request),
  ]);
  const held = vetoes.find((entry) => entry.id === workflow.id);
  return {
    groupNames: Object.fromEntries(groups.map((g) => [g.id, g.name])),
    people: users
      .filter((u) => !u.deletedAt)
      .map((u) => ({ enabled: u.enabled, id: u.userId, name: u.name })),
    usedBy: categories.filter((c) => c.defaultWorkflowId === workflow.id).length,
    veto: {
      enabled: held?.vetoEnabled ?? false,
      stages: Object.fromEntries(
        (held?.stages ?? []).map((stage) => [
          stage.id,
          { vetoApproverIds: stage.vetoApproverIds, vetoGroupIds: stage.vetoGroupIds },
        ]),
      ),
    },
    workflow,
  };
};

type StageVeto = { vetoApproverIds: readonly string[]; vetoGroupIds: readonly string[] };

/** A stage as the gateway's input takes it; the veto lists are sent only when there are some. */
const stageInput = (
  stage: WorkflowDef["stages"][number],
  veto?: StageVeto,
): WorkflowStageInput => ({
  ...(veto && veto.vetoApproverIds.length > 0 ? { vetoApproverIds: veto.vetoApproverIds } : {}),
  ...(veto && veto.vetoGroupIds.length > 0 ? { vetoGroupIds: veto.vetoGroupIds } : {}),
  approvers: stage.approvers,
  approversByCategory: stage.approversByCategory.map(({ approverIds, categoryId }) => ({
    approverIds,
    categoryId,
  })),
  groupUnits: stage.groupUnits.map(({ groupId, internalQuorum, memberUserIds }) => ({
    groupId,
    internalQuorum,
    memberUserIds,
  })),
  id: stage.id,
  name: stage.name,
  pinnedLast: stage.pinnedLast,
  quorum: stage.quorum,
  rejectOnSlaBreach: stage.rejectOnSlaBreach,
  slaDays: stage.slaDays,
});

export const action = async ({ params, request }: Route.ActionArgs) => {
  const workflow = await getWorkflowDef(request, params.id);
  if (!workflow) throw data("Not Found", { status: 404 });
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  try {
    switch (intent) {
      case "delete": {
        // The gateway can only archive a workflow for now (steward-gateway#62): it leaves every
        // picker and keeps its history.
        await archiveWorkflowDef(request, workflow.id);
        return redirect("/workflows");
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
        const veto = form.get("vetoEnabled") === "on";
        const vetoes = await listWorkflowVetoes(request);
        const was = vetoes.find((entry) => entry.id === workflow.id)?.vetoEnabled ?? false;
        if (veto !== was) await setWorkflowVetoEnabled(request, workflow.id, veto);
        return { intent, ok: true } as const;
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

/** The stage with `id` toggled in one of its veto lists; an empty list is left off entirely. */
const withVeto = (
  stage: WorkflowStageInput,
  field: "vetoApproverIds" | "vetoGroupIds",
  id: string,
): WorkflowStageInput => {
  const current = stage[field] ?? [];
  const next = current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id];
  const { [field]: _dropped, ...rest } = stage;
  return next.length > 0 ? { ...rest, [field]: next } : rest;
};

type Result =
  | { failure: Failure; intent: string; ok: false }
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
  const workflow = loaderData.workflow;
  const veto = "veto" in loaderData ? loaderData.veto : undefined;
  const [stages, setStages] = useState<readonly WorkflowStageInput[]>(
    () => workflow?.stages.map((stage) => stageInput(stage, veto?.stages[stage.id])) ?? [],
  );
  const [vetoEnabled, setVetoEnabled] = useState(veto?.enabled ?? false);
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

  const { groupNames, people, usedBy } = loaderData;
  const draft = notUsable({ stages });
  const failure =
    [save, copy, remove]
      .map((fetcher) =>
        fetcher.state === "idle" && fetcher.data && !fetcher.data.ok && "failure" in fetcher.data
          ? fetcher.data.failure
          : undefined,
      )
      .find(Boolean) ?? undefined;
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

      <fieldset className="grid gap-3 rounded-[10px] border border-border bg-surface p-4 md:grid-cols-2">
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

      <fieldset className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4">
        <legend className="px-1 text-sm font-semibold">{t("workflows.editor.veto.title")}</legend>
        <label className="flex items-center gap-2 text-base">
          <input
            checked={vetoEnabled}
            name="vetoEnabled"
            onChange={(event) => setVetoEnabled(event.target.checked)}
            type="checkbox"
          />
          {t("workflows.editor.veto.allow")}
        </label>
        <p className="text-sm text-muted">{t("workflows.editor.veto.hint")}</p>
        {vetoEnabled
          ? stages.map((stage, index) => (
              <div className="flex flex-col gap-1" key={stage.id ?? index}>
                {stage.approvers.map((id) => {
                  const name = people.find((person) => person.id === id)?.name ?? id;
                  const marked = stage.vetoApproverIds?.includes(id) ?? false;
                  return (
                    <label className="flex items-center gap-2 text-sm" key={id}>
                      <input
                        checked={marked}
                        onChange={() =>
                          setStages(
                            stages.map((s, index_) =>
                              index_ === index ? withVeto(s, "vetoApproverIds", id) : s,
                            ),
                          )
                        }
                        type="checkbox"
                      />
                      {t("workflows.editor.veto.canVeto", { name, stage: stage.name })}
                    </label>
                  );
                })}
                {(stage.groupUnits ?? []).map((unit) => (
                  <label className="flex items-center gap-2 text-sm" key={unit.groupId}>
                    <input
                      checked={stage.vetoGroupIds?.includes(unit.groupId) ?? false}
                      onChange={() =>
                        setStages(
                          stages.map((s, index_) =>
                            index_ === index ? withVeto(s, "vetoGroupIds", unit.groupId) : s,
                          ),
                        )
                      }
                      type="checkbox"
                    />
                    {t("workflows.editor.veto.canVetoGroup", {
                      name: groupNames[unit.groupId] ?? unit.groupId,
                      stage: stage.name,
                    })}
                  </label>
                ))}
              </div>
            ))
          : null}
      </fieldset>

      <StageEditor groupNames={groupNames} onChange={setStages} people={people} stages={stages} />

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
        <Dialog>
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
                onClick={() => void remove.submit({ intent: "delete" }, { method: "post" })}
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
