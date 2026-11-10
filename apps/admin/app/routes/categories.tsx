// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Button, EmptyState, ListPage } from "@steward-web/ui";
import { newCategoryPath } from "@steward-web/ui/domain";
import { data, Link } from "react-router";

import type { Route } from "./+types/categories";

import { listGroups, moveGroup } from "../categories/categories.server";
import { CategoryTree } from "../categories/CategoryTree";
import { checkMove, TOP_LEVEL } from "../categories/tree";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  return {
    rows: groups.map(({ id, name, owners, parentId }) => ({
      id,
      name,
      owners: owners.length,
      parentId: parentId ?? null,
    })),
  };
};

/**
 * Moves a category, with everything under it, to a new parent (or the top level): the tree's
 * drag and its Move dialog. The depth limit is checked here as well as by the gateway.
 */
export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const id = String(form.get("groupId") ?? "");
  const parent = String(form.get("parentId") ?? "");
  const parentId = parent === "" || parent === TOP_LEVEL ? null : parent;
  if (form.get("intent") !== "move" || !id) {
    return data({ id, ok: false } as const, { status: 400 });
  }
  try {
    const verdict = checkMove(await listGroups(request), id, parentId);
    if (verdict !== "ok") return data({ id, ok: false, verdict } as const, { status: 400 });
    await moveGroup(request, id, parentId);
    return data({ id, ok: true, parentId } as const);
  } catch (error) {
    return data({ failure: refusalOf(error), id, ok: false } as const, { status: 400 });
  }
};

/** The category tree (A3): nodes open their sub-categories and the category, and move. */
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
      {rows.length === 0 ? (
        <EmptyState
          action={
            <Button asChild>
              <Link to={newCategoryPath()}>{t("categories.none.new")}</Link>
            </Button>
          }
          description={t("categories.none.description")}
          title={t("categories.none.title")}
        />
      ) : (
        <CategoryTree rows={rows} />
      )}
    </ListPage>
  );
}
