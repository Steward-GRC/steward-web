// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import {
  Badge,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  EmptyState,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types/templates";

import { listGroups } from "../groups/groups.server";
import { NewTemplateFields } from "../templates/NewTemplateForm";
import { listTemplates, listTemplateVersions } from "../templates/templates.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [templates, groups] = await Promise.all([
    listTemplates(request),
    // The owning category name is a courtesy label, not a gate.
    listGroups(request).catch(() => []),
  ]);
  const rows = await Promise.all(
    templates.map(async (template) => {
      const versions = await listTemplateVersions(request, template.id);
      const latest = versions[0];
      return {
        categoryName: groups.find((g) => g.id === template.ownerCategoryId)?.name ?? null,
        latest: latest ? { status: latest.status, versionNo: latest.versionNo } : null,
        template,
        versionCount: versions.length,
      };
    }),
  );
  return {
    categories: groups.filter((g) => !g.parentId).map(({ id, name }) => ({ id, name })),
    rows,
  };
};

/** Templates (A6): ID, Name, Category, Versions and Latest, with "+ New template" (D25). */
export default function Templates({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { categories, rows } = loaderData;
  const create = useFetcher();

  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <header className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] leading-[1.3] font-semibold">{t("templates.title")}</h1>
          <p className="text-base text-muted">{t("templates.subtitle")}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>{t("templates.new")}</Button>
          </DialogTrigger>
          <DialogContent
            description={t("templates.add.description")}
            hasInput
            title={t("templates.add.title")}
          >
            <create.Form action="/templates/new" method="post">
              <DialogBody>
                <NewTemplateFields categories={categories} />
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("templates.add.cancel")}</Button>
                </DialogClose>
                <Button busy={create.state !== "idle"} type="submit">
                  {t("templates.add.submit")}
                </Button>
              </DialogFooter>
            </create.Form>
          </DialogContent>
        </Dialog>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          description={t("templates.empty.description")}
          title={t("templates.empty.title")}
        />
      ) : (
        <Table>
          <THead>
            <tr>
              <TH>{t("templates.columns.id")}</TH>
              <TH>{t("templates.columns.name")}</TH>
              <TH>{t("templates.columns.category")}</TH>
              <TH>{t("templates.columns.versions")}</TH>
              <TH>{t("templates.columns.latest")}</TH>
            </tr>
          </THead>
          <tbody>
            {rows.map(({ categoryName, latest, template, versionCount }) => (
              <tr key={template.id}>
                <TD className="font-mono text-sm text-muted">{template.code}</TD>
                <TD>
                  <Link
                    className="font-medium text-primary hover:underline"
                    to={`/templates/${template.code}`}
                  >
                    {template.name}
                  </Link>
                  {template.retiredAt ? (
                    <Badge className="ml-2" tone="neutral">
                      {t("templates.retired")}
                    </Badge>
                  ) : null}
                </TD>
                <TD>{categoryName ?? <span className="text-muted">{t("templates.none")}</span>}</TD>
                <TD>{versionCount}</TD>
                <TD>
                  {latest ? (
                    <span className="font-mono text-sm">
                      {t("templates.latest", {
                        status: t(`templates.status.${latest.status}`, {
                          defaultValue: latest.status,
                        }),
                        version: latest.versionNo,
                      })}
                    </span>
                  ) : (
                    <span className="text-muted">{t("templates.none")}</span>
                  )}
                </TD>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
