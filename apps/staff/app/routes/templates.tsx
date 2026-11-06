// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Templates for authors (Authoring U22): the structures a policy can be drafted against, with
// how many sections each has and its current version. Admins manage them in the console.
import { PERMISSIONS } from "@steward-web/auth";
import { requireRoleFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { EmptyState, ResponsiveTable } from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/templates";

import { getLatestTemplateVersion, listAuthorableTemplates } from "../authoring/authoring.server";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireRoleFromRequest(request, PERMISSIONS.PolicyAuthor, "author");
  const authorable = await listAuthorableTemplates(request);
  const templates = authorable.filter((t) => !t.retiredAt);
  const versions = await Promise.all(
    templates.map((template) => getLatestTemplateVersion(request, template.id).catch(() => null)),
  );
  return {
    templates: templates.map((template, index) => ({
      id: template.id,
      name: template.name,
      sections: versions[index]?.sections.length ?? 0,
      versionNo: versions[index]?.versionNo ?? null,
    })),
  };
};

export default function Templates({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("authoring");
  const { templates } = loaderData;
  return (
    <div className="flex flex-col gap-3 px-4 pt-6 pb-8 text-ink sm:px-8">
      <h1 className="text-2xl font-semibold">{t("templates.title")}</h1>
      <p className="leading-[1.5] text-muted">{t("templates.description")}</p>
      {templates.length === 0 ? (
        <EmptyState description={t("templates.empty.body")} title={t("templates.empty.title")} />
      ) : (
        <ResponsiveTable
          columns={[
            {
              card: "title",
              cell: (template) => (
                <Link
                  className="font-semibold text-primary hover:underline"
                  to={`/templates/${template.id}`}
                >
                  {template.name}
                </Link>
              ),
              header: t("templates.headers.name"),
              key: "name",
              value: (template) => template.name,
            },
            {
              card: "meta",
              cell: (template) => template.sections,
              header: t("templates.headers.sections"),
              key: "sections",
              value: (template) => template.sections,
            },
            {
              card: "meta",
              cell: (template) => (template.versionNo === null ? "" : `v${template.versionNo}`),
              className: "font-mono",
              header: t("templates.headers.version"),
              key: "version",
              value: (template) => template.versionNo ?? 0,
            },
          ]}
          empty={null}
          framed
          label={t("templates.title")}
          rowKey={(template) => template.id}
          rows={templates}
        />
      )}
    </div>
  );
}
