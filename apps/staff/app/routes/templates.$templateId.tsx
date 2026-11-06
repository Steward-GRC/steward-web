// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// One template for authors (Authoring U23): its sections in order, nested ones indented, each
// required or optional, and Use this template, which opens New policy with it chosen.
import { PERMISSIONS } from "@steward-web/auth";
import { requireRoleFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { Button, cn } from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/templates.$templateId";

import { getLatestTemplateVersion, listAuthorableTemplates } from "../authoring/authoring.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  await requireRoleFromRequest(request, PERMISSIONS.PolicyAuthor, "author");
  const authorable = await listAuthorableTemplates(request);
  const template = authorable.find(
    (candidate) => candidate.id === params.templateId && !candidate.retiredAt,
  );
  if (!template) throw new Response("Not Found", { status: 404 });
  const version = await getLatestTemplateVersion(request, template.id);
  return {
    sections: [...(version?.sections ?? [])]
      .toSorted((a, b) => a.order - b.order)
      .map((section) => ({
        key: section.key,
        level: section.level,
        required: section.required,
        title: section.title,
      })),
    template: { id: template.id, name: template.name },
  };
};

export default function TemplateDetail({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const { sections, template } = loaderData;
  return (
    <div className="flex flex-col gap-3 px-4 pt-6 pb-8 text-ink sm:px-8">
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-1 flex-col">
          <h1 className="text-2xl font-semibold">{template.name}</h1>
          <p className="text-muted">{t("templates.detail.description")}</p>
        </div>
        <Button asChild className="h-[38px] px-3.5">
          <Link to={`/drafts/new?template=${template.id}`}>{t("templates.detail.use")}</Link>
        </Button>
      </div>
      {sections.length === 0 ? (
        <p className="text-sm text-muted">{t("templates.detail.noSections")}</p>
      ) : (
        <ol
          aria-label={t("templates.detail.sections")}
          className="rounded-[10px] border border-border bg-surface px-3.5 py-1.5 font-serif text-base"
        >
          {sections.map((section) => (
            <li
              className={cn(
                "flex justify-between border-b border-border py-2 last:border-b-0",
                !section.required && "text-muted",
              )}
              data-level={section.level}
              key={section.key}
              style={{ paddingLeft: section.level > 1 ? (section.level - 1) * 18 : 0 }}
            >
              {section.title}
              <span className="font-sans text-[11px] font-semibold text-muted">
                {t(section.required ? "templates.detail.required" : "templates.detail.optional")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
