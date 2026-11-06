// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { Button, EmptyState } from "@steward-web/ui";
import { categoryPath, newCategoryPath } from "@steward-web/ui/domain";
import { Link } from "react-router";

import type { Route } from "./+types/categories";

import { listGroups, orderedWithPaths } from "../categories/categories.server";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  return { rows: orderedWithPaths(groups) };
};

/**
 * The category directory before a category is picked (A3): "No category selected / Select a
 * category from the sidebar." Below 1280 px, where the panel and its tree are hidden, the
 * categories are listed here instead.
 */
export default function Directory({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { rows } = loaderData;
  return (
    <div className="flex w-full flex-col gap-3.5 p-4 md:p-6">
      <EmptyState
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to={newCategoryPath()}>{t("categories.none.new")}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/platform-groups">{t("categories.none.platformGroups")}</Link>
            </Button>
          </div>
        }
        description={t("categories.none.description")}
        title={t("categories.none.title")}
      />
      <ul
        aria-label={t("categories.none.list")}
        className="flex flex-col overflow-hidden rounded-[10px] border border-border bg-surface xl:hidden"
      >
        {rows.map((row) => (
          <li className="border-b border-border last:border-b-0" key={row.id}>
            <Link
              className="block px-4 py-2.5 text-ink hover:bg-sunken hover:text-ink"
              to={categoryPath(row.id)}
            >
              {row.path}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
