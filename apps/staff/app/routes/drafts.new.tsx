// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { DocumentType, Sensitivity } from "@steward-web/api-client";
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf, useRefusalMessage } from "@steward-web/shell";
import { Banner, Button, Field, Input, Select } from "@steward-web/ui";
import { useEffect, useState } from "react";
import { data, useFetcher, useNavigate } from "react-router";

import type { Route } from "./+types/drafts.new";

import {
  createPolicy,
  listAuthorableGroups,
  listAuthorableTemplates,
  orderedGroupPaths,
} from "../authoring/authoring.server";
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
  return { groupPaths: orderedGroupPaths(groups), templates };
};

export const action = async ({ request }: Route.ActionArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const groupId = String(form.get("groupId") ?? "");
  const sensitivity = String(form.get("sensitivity") ?? Sensitivity.Standard) as Sensitivity;
  const documentType = String(form.get("documentType") ?? DocumentType.Policy) as DocumentType;
  const templateId = String(form.get("templateId") ?? NO_TEMPLATE);

  if (!title || !groupId) {
    return data({ ok: false, validationError: "A title and a group are required." } as const, {
      status: 400,
    });
  }

  try {
    const policy = await createPolicy(request, {
      documentType,
      homeGroupId: groupId,
      sensitivity,
      templateId: templateId === NO_TEMPLATE ? null : templateId,
      title,
    });
    return data({ ok: true, policyId: policy.id } as const);
  } catch (error) {
    return data({ error: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

export default function NewDraft({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const fetcher = useFetcher<typeof action>();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<NewPolicyDraft>(
    () => readLocalDraft() ?? emptyNewPolicyDraft(),
  );

  useResumableDraft(draft, { isEmpty: !newPolicyDraftHasContent(draft) });

  useEffect(() => {
    if (fetcher.data?.ok) {
      clearLocalDraft();
      navigate(`/drafts/${fetcher.data.policyId}`);
    }
  }, [fetcher.data, navigate]);

  const set = <K extends keyof NewPolicyDraft>(key: K, value: NewPolicyDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const failure = fetcher.data && !fetcher.data.ok ? fetcher.data : null;
  const refusalMessage = useRefusalMessage(failure && "error" in failure ? failure.error : {});

  return (
    <div className="grid max-w-lg gap-6 p-6">
      <div className="grid gap-1">
        <h1 className="text-xl font-semibold text-ink">{t("new.title")}</h1>
        <p className="text-sm text-muted">{t("new.subtitle")}</p>
      </div>

      {failure ? (
        <Banner
          title={"validationError" in failure ? failure.validationError : refusalMessage}
          tone="danger"
        />
      ) : null}

      <fetcher.Form className="grid gap-4" method="post">
        <Field label={t("new.fields.title")}>
          <Input
            name="title"
            onChange={(event) => set("title", event.target.value)}
            required
            value={draft.title}
          />
        </Field>

        <Field label={t("new.fields.group")}>
          <Select
            name="groupId"
            onValueChange={(value) => set("groupId", value)}
            options={loaderData.groupPaths.map((g) => ({ label: g.path, value: g.id }))}
            required
            value={draft.groupId}
          />
        </Field>

        <Field label={t("new.fields.documentType")}>
          <Select
            name="documentType"
            onValueChange={(value) => set("documentType", value)}
            options={[
              { label: "Policy", value: DocumentType.Policy },
              { label: "Procedure", value: DocumentType.Procedure },
            ]}
            value={draft.documentType}
          />
        </Field>

        <Field label={t("new.fields.sensitivity")}>
          <Select
            name="sensitivity"
            onValueChange={(value) => set("sensitivity", value)}
            options={[
              { label: "Standard", value: Sensitivity.Standard },
              { label: "Sensitive", value: Sensitivity.Sensitive },
            ]}
            value={draft.sensitivity}
          />
        </Field>

        <Field label={t("new.fields.template")}>
          <Select
            name="templateId"
            onValueChange={(value) => set("templateId", value)}
            options={[
              { label: t("new.fields.templateNone"), value: NO_TEMPLATE },
              ...loaderData.templates.map((template) => ({
                label: template.name,
                value: template.id,
              })),
            ]}
            value={draft.templateId || NO_TEMPLATE}
          />
        </Field>

        <Button disabled={fetcher.state !== "idle"} type="submit">
          {t("new.create")}
        </Button>
      </fetcher.Form>
    </div>
  );
}
