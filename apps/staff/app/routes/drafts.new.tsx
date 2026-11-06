// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, Sensitivity } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import { Banner, Button, cn, EmptyState } from "@steward-web/ui";
import { type ReactNode, useEffect, useId, useState } from "react";
import { data, Link, useFetcher, useNavigate, useSearchParams } from "react-router";

import type { Route } from "./+types/drafts.new";

import {
  createPolicy,
  listAuthorableGroups,
  listAuthorableTemplates,
} from "../authoring/authoring.server";
import { categoryChoices } from "../authoring/categoryChoices";
import {
  clearLocalDraft,
  emptyNewPolicyDraft,
  type NewPolicyDraft,
  newPolicyDraftHasContent,
  readLocalDraft,
} from "../authoring/localDraft";
import { useResumableDraft } from "../authoring/useResumableDraft";

const NO_TEMPLATE = "__no_template__";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const [groups, templates] = await Promise.all([
    listAuthorableGroups(request),
    listAuthorableTemplates(request),
  ]);
  return { categories: categoryChoices(groups), templates };
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const categoryId = String(form.get("categoryId") ?? "");
  const sensitivity = String(form.get("sensitivity") ?? Sensitivity.Standard) as Sensitivity;
  const documentType = String(form.get("documentType") ?? DocumentType.Policy) as DocumentType;
  const templateId = String(form.get("templateId") ?? NO_TEMPLATE);

  if (!title || !categoryId) {
    return data({ ok: false, validationError: "required" } as const, { status: 400 });
  }

  try {
    const policy = await createPolicy(request, {
      documentType,
      homeGroupId: categoryId,
      sensitivity,
      templateId: templateId === NO_TEMPLATE ? null : templateId,
      title,
    });
    return data({ ok: true, policyId: policy.id } as const);
  } catch (error) {
    return data({ error: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

const control =
  "h-10 w-full rounded-md border border-control bg-surface px-2.5 text-base text-ink focus-visible:border-primary disabled:cursor-not-allowed disabled:bg-sunken disabled:opacity-70";

/** A labelled control in the frame's style: 500 13 px label, 5 px gap, 40 px control. */
const Labelled = ({ children, id, label }: { children: ReactNode; id: string; label: string }) => (
  <div className="flex flex-col gap-[5px]">
    <label className="text-sm font-medium" htmlFor={id}>
      {label}
    </label>
    {children}
  </div>
);

/**
 * New policy or New procedure (U20): the type as radio cards with their hints, the title, the
 * category and subcategory, the template and the sensitivity, then Cancel and Create. It opens
 * on the type the command bar asked for (`?type=PROCEDURE`) and the template Use this template
 * chose (`?template=`), and keeps an unsent form in this browser so it can be resumed.
 */
export default function NewDraft({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [parameters] = useSearchParams();
  const asked = parameters.get("type");
  // "Use this template" (U23) opens the form with that template chosen.
  const askedTemplate = parameters.get("template");
  const [draft, setDraft] = useState<NewPolicyDraft>(() => {
    const saved = readLocalDraft<NewPolicyDraft>() ?? emptyNewPolicyDraft();
    const typed =
      asked === DocumentType.Procedure || asked === DocumentType.Policy
        ? { ...saved, documentType: asked }
        : saved;
    return askedTemplate && loaderData.templates.some((template) => template.id === askedTemplate)
      ? { ...typed, templateId: askedTemplate }
      : typed;
  });
  const ids = { category: useId(), subcategory: useId(), template: useId(), title: useId() };

  useResumableDraft(draft, { isEmpty: !newPolicyDraftHasContent(draft) });

  useEffect(() => {
    if (fetcher.data?.ok) {
      clearLocalDraft();
      void navigate(`/drafts/${fetcher.data.policyId}`);
    }
  }, [fetcher.data, navigate]);

  const set = <K extends keyof NewPolicyDraft>(key: K, value: NewPolicyDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const failure = fetcher.data && !fetcher.data.ok ? fetcher.data : null;
  const refusalMessage = useRefusalMessage(failure && "error" in failure ? failure.error : {});
  const procedure = draft.documentType === DocumentType.Procedure;
  const noun = procedure ? "procedure" : "policy";
  const category = loaderData.categories.find((c) => c.id === draft.groupId);
  const subcategories = category?.subcategories ?? [];
  const homeId =
    draft.subcategoryId && subcategories.some((s) => s.id === draft.subcategoryId)
      ? draft.subcategoryId
      : draft.groupId;

  return (
    <div className="flex w-full flex-col gap-3.5 p-6 text-base text-ink" data-testid="new-draft-page">
      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] leading-tight font-semibold">{t(`new.title.${noun}`)}</h1>
        <p className="text-muted">{t(`new.subtitle.${noun}`)}</p>
      </div>

      {loaderData.categories.length === 0 ? (
        <EmptyState description={t("new.noCategories.body")} title={t("new.noCategories.title")} />
      ) : (
        <fetcher.Form className="flex flex-col gap-3.5" method="post">
          {failure ? (
            <Banner
              title={"validationError" in failure ? t("new.required") : refusalMessage}
              tone="danger"
            />
          ) : null}
          <input name="categoryId" type="hidden" value={homeId} />
          <div className="flex flex-col gap-3.5 rounded-lg border border-border bg-surface p-[18px]">
            <div
              aria-label={t("new.fields.documentType")}
              className="grid gap-2.5 sm:grid-cols-2"
              role="radiogroup"
            >
              {[DocumentType.Policy, DocumentType.Procedure].map((type) => {
                const kind = type === DocumentType.Procedure ? "procedure" : "policy";
                const chosen = draft.documentType === type;
                return (
                  <label
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 rounded-[8px] p-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                      chosen
                        ? "bg-primary-soft text-on-primary-soft shadow-[inset_0_0_0_2px_var(--primary)]"
                        : "shadow-[inset_0_0_0_1px_var(--border-strong)]",
                    )}
                    key={type}
                  >
                    <input
                      checked={chosen}
                      className="sr-only"
                      name="documentType"
                      onChange={() => set("documentType", type)}
                      type="radio"
                      value={type}
                    />
                    <b className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-2.5 rounded-full border-[1.5px] border-current",
                          chosen && "bg-current",
                        )}
                      />
                      {t(`new.types.${kind}.label`)}
                    </b>
                    <span className={cn("text-sm", !chosen && "text-muted")}>
                      {t(`new.types.${kind}.hint`)}
                    </span>
                  </label>
                );
              })}
            </div>
            <Labelled id={ids.title} label={t("new.fields.title")}>
              <input
                className={control}
                id={ids.title}
                name="title"
                onChange={(event) => set("title", event.target.value)}
                required
                value={draft.title}
              />
            </Labelled>
            <div className="grid gap-3 sm:grid-cols-2">
              <Labelled id={ids.category} label={t("new.fields.category")}>
                <select
                  className={control}
                  id={ids.category}
                  onChange={(event) =>
                    setDraft((d) => ({ ...d, groupId: event.target.value, subcategoryId: "" }))
                  }
                  required
                  value={draft.groupId}
                >
                  <option disabled value="">
                    {t("new.fields.choose")}
                  </option>
                  {loaderData.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Labelled>
              <Labelled id={ids.subcategory} label={t("new.fields.subcategory")}>
                <select
                  className={control}
                  disabled={subcategories.length === 0}
                  id={ids.subcategory}
                  onChange={(event) => set("subcategoryId", event.target.value)}
                  value={draft.subcategoryId ?? ""}
                >
                  <option value="">{t("new.fields.noSubcategory")}</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Labelled>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Labelled id={ids.template} label={t("new.fields.template")}>
                <select
                  className={control}
                  id={ids.template}
                  name="templateId"
                  onChange={(event) => set("templateId", event.target.value)}
                  value={draft.templateId || NO_TEMPLATE}
                >
                  <option value={NO_TEMPLATE}>{t("new.fields.templateNone")}</option>
                  {loaderData.templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </Labelled>
              <div className="flex flex-col gap-[5px]">
                <span className="text-sm font-medium" id={`${ids.template}-sensitivity`}>
                  {t("new.fields.sensitivity")}
                </span>
                <div
                  aria-labelledby={`${ids.template}-sensitivity`}
                  className="flex h-10 rounded-md bg-sunken p-[3px]"
                  role="radiogroup"
                >
                  {[Sensitivity.Standard, Sensitivity.Sensitive].map((value) => (
                    <label
                      className={cn(
                        "flex flex-1 cursor-pointer items-center justify-center rounded-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                        draft.sensitivity === value && "bg-surface font-semibold",
                      )}
                      key={value}
                    >
                      <input
                        checked={draft.sensitivity === value}
                        className="sr-only"
                        name="sensitivity"
                        onChange={() => set("sensitivity", value)}
                        type="radio"
                        value={value}
                      />
                      {t(
                        `new.sensitivity.${value === Sensitivity.Sensitive ? "sensitive" : "standard"}`,
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button asChild className="h-10 px-4" variant="secondary">
              <Link to={procedure ? "/procedures" : "/policies"}>{t("new.cancel")}</Link>
            </Button>
            <Button className="h-10 px-[18px]" disabled={fetcher.state !== "idle"} type="submit">
              {t(`new.create.${noun}`)}
            </Button>
          </div>
        </fetcher.Form>
      )}
    </div>
  );
}
