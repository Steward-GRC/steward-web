// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button } from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/templates.new";

import { listGroups } from "../categories/categories.server";
import { NewTemplateFields, NO_CATEGORY } from "../templates/NewTemplateForm";
import { createTemplate } from "../templates/templates.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  // A template's category maps to a top-level taxonomy group: a fixed choice, not free text.
  return { categories: groups.filter((g) => !g.parentId) };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const ownerCategoryId = String(form.get("ownerCategoryId") ?? NO_CATEGORY);

  if (!name) {
    return data({ ok: false, validationError: "Name is required." } as const, { status: 400 });
  }

  try {
    const created = await createTemplate(
      request,
      name,
      ownerCategoryId === NO_CATEGORY ? null : ownerCategoryId,
    );
    return redirect(`/templates/${created.code}`);
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

/** New template (D25) as a page, for a direct link; the list opens the same fields in a dialog. */
export default function NewTemplate({ actionData, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { categories } = loaderData;
  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <p className="text-xs font-medium text-muted">{t("templates.detail.eyebrow")}</p>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{t("templates.add.title")}</h1>
        <p className="text-base text-muted">{t("templates.add.description")}</p>
      </header>
      <Form
        className="grid gap-3 rounded-[10px] border border-border bg-surface p-4 md:grid-cols-2"
        method="post"
      >
        <NewTemplateFields categories={categories} />
        {actionData && !actionData.ok ? (
          <Banner
            className="md:col-span-2"
            failure={"failure" in actionData ? actionData.failure : undefined}
            title={t("templates.add.failed")}
            tone="danger"
          >
            {"validationError" in actionData ? t("templates.add.required") : null}
          </Banner>
        ) : null}
        <div className="flex items-center justify-end gap-2 md:col-span-2">
          <Button asChild variant="secondary">
            <Link to="/templates">{t("templates.add.cancel")}</Link>
          </Button>
          <Button type="submit">{t("templates.add.submit")}</Button>
        </div>
      </Form>
    </div>
  );
}
