// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { AckTrigger } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import { Button, NotFound } from "@steward-web/ui";
import { categoriesPath } from "@steward-web/ui/domain";
import { data, Link } from "react-router";

import type { Route } from "./+types/access.$categoryId";

import {
  loadCategoryAccess,
  removeOwner,
  saveCategoryRules,
  setAckTrigger,
} from "../access/access.server";
import { CategoryAccess } from "../access/CategoryAccess";

const TRIGGERS = new Set<string>(Object.values(AckTrigger));

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const view = await loadCategoryAccess(request, params.categoryId);
  return data({ view }, { status: view ? 200 : 404 });
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  try {
    switch (intent) {
      case "ack-trigger": {
        const trigger = String(form.get("ackTriggers") ?? "");
        if (!TRIGGERS.has(trigger)) throw data("unknown trigger", { status: 400 });
        await setAckTrigger(request, params.categoryId, trigger as AckTrigger);
        return { intent, ok: true } as const;
      }
      case "remove-owner": {
        await removeOwner(request, params.categoryId, String(form.get("userId") ?? ""));
        return { intent, ok: true } as const;
      }
      case "save-rules": {
        const rules = await saveCategoryRules(
          request,
          params.categoryId,
          String(form.get("rules") ?? "[]"),
        );
        return { intent, ok: true, rules } as const;
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

/** Category access (A5) for the category the tree has selected. */
export default function CategoryAccessRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { view } = loaderData;
  if (!view) {
    return (
      <div className="flex w-full flex-col px-4 pt-[22px] pb-7 md:px-7">
        <NotFound
          action={
            <Button asChild variant="secondary">
              <Link to={categoriesPath()}>{t("access.notFound.action")}</Link>
            </Button>
          }
          description={t("access.notFound.description")}
          title={t("access.notFound.title")}
        />
      </div>
    );
  }
  // A new category starts a fresh draft, so nothing unsaved follows the person across.
  return <CategoryAccess key={view.categoryId} view={view} />;
}
