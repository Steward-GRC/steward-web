// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ReviewCadence } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Banner, Button, Field, Input, Select } from "@steward-web/ui";
import { categoriesPath, categoryPath } from "@steward-web/ui/domain";
import { useState } from "react";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/categories.new";

import {
  createGroup,
  isValidSlug,
  listGroups,
  listTemplates,
  listWorkflows,
  orderedWithPaths,
  updateGroupSettings,
} from "../categories/categories.server";
import { slugify } from "../categories/slug";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [groups, templates, workflows] = await Promise.all([
    listGroups(request),
    listTemplates(request),
    listWorkflows(request),
  ]);
  return {
    parentOptions: orderedWithPaths(groups),
    templates: templates.map(({ id, name }) => ({ id, name })),
    workflows: workflows.map(({ id, name }) => ({ id, name })),
  };
};

const NO_TEMPLATE = "__no_template__";
const NO_WORKFLOW = "__no_workflow__";
const CADENCES = ["NONE", "ANNUAL", "BIENNIAL", "ON_DATE"] as const;

const TOP_LEVEL = "__top_level__";

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const rawSlug = String(form.get("slug") ?? "").trim();
  const slug = rawSlug || slugify(name);
  const parentId = String(form.get("parentId") ?? TOP_LEVEL);

  if (!name) {
    return data({ ok: false, validationError: "Name is required." } as const, { status: 400 });
  }
  if (!isValidSlug(slug)) {
    return data(
      {
        ok: false,
        validationError:
          "Lowercase letters, numbers, and single hyphens only (no leading/trailing hyphen).",
      } as const,
      { status: 400 },
    );
  }

  try {
    const created = await createGroup(request, {
      name,
      parentId: parentId === TOP_LEVEL ? null : parentId,
      slug,
    });
    const template = String(form.get("defaultTemplateId") ?? NO_TEMPLATE);
    const workflow = String(form.get("defaultWorkflowId") ?? NO_WORKFLOW);
    const reviewCadence = String(form.get("reviewCadence") ?? "NONE") as ReviewCadence;
    // The defaults go on as a second step: creating a category takes only its name and place.
    if (template !== NO_TEMPLATE || workflow !== NO_WORKFLOW || reviewCadence !== "NONE") {
      await updateGroupSettings(request, created.id, {
        ackEveryone: created.ackEveryone,
        ackTriggers: created.ackTriggers,
        defaultTemplateId: template === NO_TEMPLATE ? null : template,
        defaultTemplateNone: template === NO_TEMPLATE,
        defaultWorkflowId: workflow === NO_WORKFLOW ? null : workflow,
        exclusionGroupIds: created.exclusionGroupIds ?? null,
        idpGroupIds: created.idpGroupIds ?? null,
        owners: created.owners,
        reviewCadence,
        reviewDate:
          reviewCadence === "ON_DATE" ? String(form.get("reviewDate") ?? "") || null : null,
      });
    }
    return redirect(categoryPath(created.id));
  } catch (error) {
    return data({ failure: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

/**
 * New category (A4): name, a slug filled in from it, the parent ("None (new top-level site)"),
 * and the same defaults as Details & Defaults.
 */
export default function NewCategory({ actionData, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { parentOptions, templates, workflows } = loaderData;
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [cadence, setCadence] = useState<string>("NONE");
  const shownSlug = slugTouched ? slug : slugify(name);

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{t("categories.add.title")}</h1>
        <p className="text-base text-muted">{t("categories.subtitle")}</p>
      </header>

      <Form
        aria-label={t("categories.add.title")}
        className="grid gap-3 rounded-[10px] border border-border bg-surface p-4 md:grid-cols-2"
        method="post"
      >
        <Field label={t("categories.name")}>
          <Input
            className="h-[38px]"
            name="name"
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </Field>
        <Field hint={t("categories.add.slugHint")} label={t("categories.slug")}>
          <Input
            className="h-[38px] font-mono text-sm"
            name="slug"
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            value={shownSlug}
          />
        </Field>
        <Field label={t("categories.add.parent")}>
          <Select
            className="h-[38px]"
            defaultValue={TOP_LEVEL}
            name="parentId"
            options={[
              { label: t("categories.add.noParent"), value: TOP_LEVEL },
              ...parentOptions.map((o) => ({ label: o.path, value: o.id })),
            ]}
          />
        </Field>
        <Field label={t("categories.reviewCadence")}>
          <Select
            className="h-[38px]"
            name="reviewCadence"
            onValueChange={setCadence}
            options={CADENCES.map((value) => ({ label: t(`categories.cadence.${value}`), value }))}
            value={cadence}
          />
        </Field>
        {cadence === "ON_DATE" ? (
          <Field className="md:col-start-2" label={t("categories.reviewDate")}>
            <Input className="h-[38px]" name="reviewDate" type="date" />
          </Field>
        ) : null}
        <Field label={t("categories.defaultTemplate")}>
          <Select
            className="h-[38px]"
            defaultValue={NO_TEMPLATE}
            name="defaultTemplateId"
            options={[
              { label: t("categories.noTemplate"), value: NO_TEMPLATE },
              ...templates.map((tpl) => ({ label: tpl.name, value: tpl.id })),
            ]}
          />
        </Field>
        <Field label={t("categories.defaultWorkflow")}>
          <Select
            className="h-[38px]"
            defaultValue={NO_WORKFLOW}
            name="defaultWorkflowId"
            options={[
              { label: t("categories.noWorkflow"), value: NO_WORKFLOW },
              ...workflows.map((w) => ({ label: w.name, value: w.id })),
            ]}
          />
        </Field>

        {actionData && !actionData.ok ? (
          <Banner
            className="md:col-span-2"
            failure={"failure" in actionData ? actionData.failure : undefined}
            title={t("categories.add.failed")}
            tone="danger"
          >
            {"validationError" in actionData ? t("categories.required") : null}
          </Banner>
        ) : null}

        <div className="flex items-center justify-end gap-2 md:col-span-2">
          <Button asChild variant="secondary">
            <Link to={categoriesPath()}>{t("categories.add.cancel")}</Link>
          </Button>
          <Button className="h-[38px] px-4 text-base" type="submit">
            {t("categories.add.submit")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
