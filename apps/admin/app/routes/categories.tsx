// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Button, EmptyState, ListPage, ResponsiveTable } from "@steward-web/ui";
import { categoryPath, newCategoryPath } from "@steward-web/ui/domain";
import { Link } from "react-router";

import type { Route } from "./+types/categories";

import { listGroups, orderedWithPaths } from "../categories/categories.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  return {
    rows: orderedWithPaths(groups).map(({ id, path }) => ({
      children: groups.filter((g) => g.parentId === id).length,
      id,
      owners: groups.find((g) => g.id === id)?.owners.length ?? 0,
      path,
    })),
  };
};

/** The category list (A3, #90): the common list page, a header, a search and the table. */
export default function Directory({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { rows } = loaderData;
  return (
    <ListPage
      actions={
        <>
          <Button asChild variant="secondary">
            <Link to="/platform-groups">{t("categories.none.platformGroups")}</Link>
          </Button>
          <Button asChild>
            <Link to={newCategoryPath()}>{t("categories.none.new")}</Link>
          </Button>
        </>
      }
      subtitle={t("categories.subtitle")}
      title={t("categories.none.list")}
    >
      <ResponsiveTable
        columns={[
          {
            card: "title",
            cell: (row) => <Link to={categoryPath(row.id)}>{row.path}</Link>,
            className: "font-medium",
            header: t("categories.columns.category"),
            key: "category",
            value: (row) => row.path,
          },
          {
            card: "meta",
            cell: (row) => row.children,
            header: t("categories.columns.children"),
            key: "children",
            value: (row) => row.children,
          },
          {
            card: "meta",
            cell: (row) => row.owners,
            header: t("categories.columns.owners"),
            key: "owners",
            value: (row) => row.owners,
          },
        ]}
        empty={
          <EmptyState
            action={
              <Button asChild>
                <Link to={newCategoryPath()}>{t("categories.none.new")}</Link>
              </Button>
            }
            description={t("categories.none.description")}
            title={t("categories.none.title")}
          />
        }
        label={t("categories.none.list")}
        rowHref={(row) => categoryPath(row.id)}
        rowKey={(row) => row.id}
        rows={rows}
        search={{
          label: t("categories.search"),
          placeholder: t("categories.search"),
          text: (row) => row.path,
        }}
      />
    </ListPage>
  );
}
