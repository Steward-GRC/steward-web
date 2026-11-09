// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, Textarea } from "@steward-web/ui";
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
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

/** New workflow (A9's start): a name and description, then the editor with one stage. */
export default function NewWorkflow({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <p className="text-xs font-medium text-muted">{t("workflows.editor.eyebrow")}</p>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{t("workflows.add.title")}</h1>
        <p className="text-base text-muted">{t("workflows.editor.sequential")}</p>
      </header>

      <Form
        aria-label={t("workflows.add.title")}
        className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4"
        method="post"
      >
        <Field label={t("workflows.editor.name")}>
          <Input name="name" required />
        </Field>
        <Field label={t("workflows.editor.description")}>
          <Textarea name="description" rows={1} />
        </Field>
        {actionData && !actionData.ok ? (
          <Banner
            failure={"failure" in actionData ? actionData.failure : undefined}
            title={t("workflows.add.failed")}
            tone="danger"
          >
            {"validationError" in actionData ? t("workflows.editor.required") : null}
          </Banner>
        ) : null}
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="secondary">
            <Link to="/workflows">{t("workflows.add.cancel")}</Link>
          </Button>
          <Button type="submit">{t("workflows.add.submit")}</Button>
        </div>
      </Form>
    </div>
  );
}
