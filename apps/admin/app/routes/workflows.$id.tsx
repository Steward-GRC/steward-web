// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { WorkflowStageInput } from "@steward-web/api-client";

import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@steward-web/ui";
import { useState } from "react";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/workflows.$id";

import { listUsers } from "../users/users.server";
import { StageEditor } from "../workflows/StageEditor";
import { notUsable } from "../workflows/workflowRules";
import {
  archiveWorkflowDef,
  getWorkflowDef,
  updateWorkflowDef,
} from "../workflows/workflows.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const workflow = await getWorkflowDef(request, params.id);
  // The approver picker is a courtesy, not a gate: a caller who can manage workflows but not
  // users still gets the page, just with an empty approver list.
  const users = await listUsers(request).catch(() => []);
  const userOptions = users.map((u) => ({ label: u.name, userId: u.userId }));
  return { userOptions, workflow };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const workflow = await getWorkflowDef(request, params.id);
  if (!workflow) throw new Response("Not Found", { status: 404 });
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "archive": {
        await archiveWorkflowDef(request, workflow.id);
        return redirect("/workflows");
      }
      case "save": {
        const name = String(form.get("name") ?? "").trim();
        if (!name) {
          return data({ intent, ok: false, validationError: "A name is required." } as const, {
            status: 400,
          });
        }
        const description = String(form.get("description") ?? "").trim();
        const stages = JSON.parse(
          String(form.get("stagesJson") ?? "[]"),
        ) as readonly WorkflowStageInput[];
        await updateWorkflowDef(request, workflow.id, name, description || null, stages);
        return data({ intent, ok: true } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ failure: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

export default function WorkflowDetail({ actionData, loaderData }: Route.ComponentProps) {
  const { userOptions, workflow } = loaderData;
  const [stages, setStages] = useState<readonly WorkflowStageInput[]>(workflow?.stages ?? []);
  const [archiveOpen, setArchiveOpen] = useState(false);

  if (!workflow) {
    return (
      <div className="flex w-full flex-col gap-6 p-6">
        <EmptyState
          action={
            <Button asChild>
              <Link to="/workflows">Back to workflows</Link>
            </Button>
          }
          description="No workflow matches that id."
          title="Workflow not found"
        />
      </div>
    );
  }

  const errorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "failure" in actionData
      ? actionData.failure
      : undefined;
  const validationErrorFor = (intent: string) =>
    actionData && !actionData.ok && actionData.intent === intent && "validationError" in actionData
      ? actionData.validationError
      : undefined;
  const savedIntent = actionData?.ok ? actionData.intent : undefined;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <Button asChild className="self-start px-0" size="sm" variant="link">
        <Link to="/workflows">← Back to workflows</Link>
      </Button>

      <PageHeader
        actions={
          <Button onClick={() => setArchiveOpen(true)} size="sm" variant="danger">
            Archive
          </Button>
        }
        eyebrow="Structure"
        subtitle={
          notUsable(workflow) ? (
            <Badge tone="warn">Incomplete — give every stage an approver</Badge>
          ) : (
            <Badge tone="ok">Usable</Badge>
          )
        }
        title={workflow.name}
      />

      <Dialog onOpenChange={setArchiveOpen} open={archiveOpen}>
        <DialogContent
          description="Groups using it as their default keep that reference; archiving only hides it from new selection."
          title={`Archive ${workflow.name}?`}
        >
          <Form method="post">
            <input name="intent" type="hidden" value="archive" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit" variant="danger">
                Archive workflow
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      </Dialog>
      {errorFor("archive") ? (
        <Banner
          failure={errorFor("archive")}
          title="Couldn't archive this workflow"
          tone="danger"
        />
      ) : null}

      <Form className="flex flex-col gap-4" method="post">
        <input name="intent" type="hidden" value="save" />
        <input name="stagesJson" type="hidden" value={JSON.stringify(stages)} />

        <Field label="Name">
          <Input defaultValue={workflow.name} name="name" required />
        </Field>
        <Field label="Description">
          <Textarea defaultValue={workflow.description ?? ""} name="description" />
        </Field>

        <StageEditor
          initialStages={workflow.stages}
          onChange={setStages}
          userOptions={userOptions}
        />

        {validationErrorFor("save") ? (
          <Banner title="Couldn't save this workflow" tone="danger">
            {validationErrorFor("save")}
          </Banner>
        ) : null}
        {errorFor("save") ? (
          <Banner failure={errorFor("save")} title="Couldn't save this workflow" tone="danger" />
        ) : null}

        <div className="flex items-center gap-3">
          <Button className="self-start" type="submit">
            Save
          </Button>
          {savedIntent === "save" ? <span className="text-sm text-ok">Saved.</span> : null}
        </div>
      </Form>
    </div>
  );
}
