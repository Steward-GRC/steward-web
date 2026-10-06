// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, PageHeader, Textarea } from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/workflows.new";

import { newStage } from "../workflows/stageOutline";
import { createWorkflowDef } from "../workflows/workflows.server";

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();

  if (!name) {
    return data({ ok: false, validationError: "Name is required." } as const, { status: 400 });
  }

  try {
    const created = await createWorkflowDef(request, name, description || null, [newStage([])]);
    return redirect(`/workflows/${created.id}`);
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

export default function NewWorkflow({ actionData }: Route.ComponentProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6 p-6">
      <PageHeader eyebrow="Structure" subtitle="Start a new approval chain." title="New workflow" />

      <Form className="flex flex-col gap-4" method="post">
        <Field label="Name">
          <Input name="name" required />
        </Field>
        <Field label="Description">
          <Textarea name="description" />
        </Field>

        {actionData && !actionData.ok && "validationError" in actionData ? (
          <Banner title="Couldn't create this workflow" tone="danger">
            {actionData.validationError}
          </Banner>
        ) : null}
        {actionData && !actionData.ok && "failure" in actionData ? (
          <Banner
            failure={actionData.failure}
            title="Couldn't create this workflow"
            tone="danger"
          />
        ) : null}

        <div className="flex items-center gap-2">
          <Button type="submit">Create workflow</Button>
          <Button asChild variant="secondary">
            <Link to="/workflows">Cancel</Link>
          </Button>
        </div>
      </Form>
    </div>
  );
}
