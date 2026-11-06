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
  ListPage,
  ResponsiveTable,
} from "@steward-web/ui";
import { Link, useFetcher } from "react-router";

import type { Route } from "./+types/templates";

import { listGroups } from "../categories/categories.server";
import { NewTemplateFields } from "../templates/NewTemplateForm";
import { listTemplates, listTemplateVersions } from "../templates/templates.server";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

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
    <ListPage
      actions={
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
      }
      subtitle={t("templates.subtitle")}
      title={t("templates.title")}
    >
      <ResponsiveTable
        columns={[
          {
            card: "meta",
            cell: ({ template }) => template.code,
            className: "font-mono text-sm text-muted",
            header: t("templates.columns.id"),
            key: "id",
            value: ({ template }) => template.code,
          },
          {
            card: "title",
            cell: ({ template }) => (
              <>
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
              </>
            ),
            header: t("templates.columns.name"),
            key: "name",
            value: ({ template }) => template.name,
          },
          {
            card: "meta",
            cell: ({ categoryName }) =>
              categoryName ?? <span className="text-muted">{t("templates.none")}</span>,
            header: t("templates.columns.category"),
            key: "category",
            value: ({ categoryName }) => categoryName ?? "",
          },
          {
            // The card's Latest line already names the newest version.
            card: "hidden",
            cell: ({ versionCount }) => versionCount,
            header: t("templates.columns.versions"),
            key: "versions",
            value: ({ versionCount }) => versionCount,
          },
          {
            card: "meta",
            cell: ({ latest }) =>
              latest ? (
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
              ),
            header: t("templates.columns.latest"),
            key: "latest",
            value: ({ latest }) => latest?.versionNo ?? 0,
          },
        ]}
        empty={
          <EmptyState
            description={t("templates.empty.description")}
            title={t("templates.empty.title")}
          />
        }
        label={t("templates.title")}
        rowHref={({ template }) => `/templates/${template.code}`}
        rowKey={({ template }) => template.id}
        rows={rows}
        search={{
          label: t("templates.search"),
          placeholder: t("templates.search"),
          text: ({ categoryName, template }) =>
            `${template.code} ${template.name} ${categoryName ?? ""}`,
        }}
      />
    </ListPage>
  );
}
