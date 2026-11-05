// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// Templates for authors (Authoring U22): the structures a policy can be drafted against, with
// how many sections each has and its current version. Admins manage them in the console.
import { PERMISSIONS } from "@steward-web/auth";
import { requirePermissionFromRequest } from "@steward-web/auth/server";
import { useTranslation } from "@steward-web/i18n";
import { EmptyState } from "@steward-web/ui";
import { Link } from "react-router";

import type { Route } from "./+types/templates";

import { getLatestTemplateVersion, listAuthorableTemplates } from "../authoring/authoring.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requirePermissionFromRequest(request, PERMISSIONS.PolicyAuthor);
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
        <div className="overflow-x-auto rounded-[10px] border border-border bg-surface">
          <table className="w-full">
            <thead className="border-b border-border-strong bg-sunken text-left text-xs font-semibold text-muted">
              <tr>
                <th className="px-3.5 py-2">{t("templates.headers.name")}</th>
                <th className="w-20 px-3.5 py-2">{t("templates.headers.sections")}</th>
                <th className="w-[90px] px-3.5 py-2">{t("templates.headers.version")}</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr className="border-b border-border last:border-b-0" key={template.id}>
                  <td className="px-3.5 py-[11px]">
                    <Link
                      className="font-semibold text-primary hover:underline"
                      to={`/templates/${template.id}`}
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-3.5 py-[11px]">{template.sections}</td>
                  <td className="px-3.5 py-[11px] font-mono">
                    {template.versionNo === null ? "" : `v${template.versionNo}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
