// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { CategoryDocumentTypes, MovePolicyItem } from "@steward-web/api-client";

import { acceptsDocumentType, documentTypesOf, refusalKey } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Banner,
  Button,
  Checkbox,
  Field,
  ListPage,
  ResponsiveTable,
  Select,
} from "@steward-web/ui";
import { categoryPath } from "@steward-web/ui/domain";
import { useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";

import type { Route } from "./+types/categories.$categoryId.move";

import { listGroups, orderedWithPaths } from "../categories/categories.server";
import { documentsIn, moveDocuments, previewMove } from "../categories/moveDocuments.server";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const groups = await listGroups(request);
  const group = groups.find((g) => g.id === params.categoryId);
  if (!group) throw data("category not found", { status: 404 });
  const documents = await documentsIn(request, group.id);
  // Coming from a narrowing that is waiting on room, the documents it would strand start ticked.
  const next = new URL(request.url).searchParams.get("next") as CategoryDocumentTypes | null;
  const preselected = next
    ? documents.filter((d) => !acceptsDocumentType(next, d.documentType)).map((d) => d.id)
    : [];
  return {
    category: {
      id: group.id,
      name: group.name,
      path:
        orderedWithPaths(groups)
          .find((row) => row.id === group.id)
          ?.path.split(" › ") ?? [],
    },
    documents: documents.map(({ documentType, id, number, title }) => ({
      documentType,
      id,
      number,
      title,
    })),
    preselected,
    targets: orderedWithPaths(groups).filter((row) => row.id !== group.id),
  };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  const policyIds = form.getAll("policyId").map(String);
  const homeCategoryId = String(form.get("homeCategoryId") ?? "");
  if (policyIds.length === 0 || !homeCategoryId) {
    return data({ intent, invalid: true, ok: false } as const, { status: 400 });
  }
  try {
    if (intent === "preview") {
      return {
        intent,
        items: await previewMove(request, policyIds, homeCategoryId),
        ok: true,
      } as const;
    }
    if (intent === "move") {
      const moved = await moveDocuments(request, policyIds, homeCategoryId);
      return redirect(`${categoryPath(params.categoryId)}?moved=${String(moved.length)}`);
    }
    throw data("unrecognized intent", { status: 400 });
  } catch (error) {
    if (error instanceof Response) throw error;
    return data({ failure: refusalOf(error), intent, ok: false } as const, { status: 400 });
  }
};

type Result =
  | { failure: ReturnType<typeof refusalOf>; intent: string; ok: false }
  | { intent: string; invalid: true; ok: false }
  | { intent: string; items: readonly MovePolicyItem[]; ok: true };

/**
 * Move documents out of a category (#87): the step a narrowing waits on. Pick the documents,
 * pick a category that holds every one of them, preview the new numbers, then confirm. The
 * service moves them together or not at all and writes the audit entries.
 */
export default function MoveDocuments({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation("admin");
  const { category, documents, preselected, targets } = loaderData;
  const fetcher = useFetcher<Result>();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(preselected));
  const [target, setTarget] = useState("");

  const picked = documents.filter((d) => selected.has(d.id));
  const wholeAnswer = fetcher.state === "idle" ? fetcher.data : undefined;
  const preview = wholeAnswer?.ok && "items" in wholeAnswer ? wholeAnswer.items : null;
  const failure =
    wholeAnswer && !wholeAnswer.ok && "failure" in wholeAnswer ? wholeAnswer.failure : undefined;

  const holdsAll = (types: CategoryDocumentTypes | undefined) =>
    picked.every((d) =>
      acceptsDocumentType(documentTypesOf({ documentTypes: types }), d.documentType),
    );
  const why = (types: CategoryDocumentTypes | undefined) =>
    t(`governance.move.holds.${refusalKey(documentTypesOf({ documentTypes: types }))}`);
  const options = targets.map((row) => ({
    disabled: picked.length > 0 && !holdsAll(row.documentTypes),
    label:
      picked.length > 0 && !holdsAll(row.documentTypes)
        ? t("categories.move.refused", { path: row.path, why: why(row.documentTypes) })
        : row.path,
    value: row.id,
  }));

  const toggle = (id: string) =>
    setSelected((now) => {
      const next = new Set(now);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const every = documents.length > 0 && picked.length === documents.length;
  const blocked = preview?.some((item) => item.refusal) ?? false;
  const ready = picked.length > 0 && target !== "";

  const fields = (intent: string) => (
    <>
      <input name="intent" type="hidden" value={intent} />
      <input name="homeCategoryId" type="hidden" value={target} />
      {picked.map((d) => (
        <input key={d.id} name="policyId" type="hidden" value={d.id} />
      ))}
    </>
  );

  return (
    <ListPage
      actions={
        <Button asChild variant="secondary">
          <Link to={categoryPath(category.id)}>
            {t("categories.move.back", { name: category.name })}
          </Link>
        </Button>
      }
      subtitle={t("categories.move.subtitle")}
      title={t("categories.move.title", { name: category.name })}
    >
      <ResponsiveTable
        columns={[
          {
            card: "action",
            cell: (document) => (
              <Checkbox
                aria-label={t("categories.move.select", { title: document.title })}
                checked={selected.has(document.id)}
                onCheckedChange={() => toggle(document.id)}
              />
            ),
            header: (
              <Checkbox
                aria-label={t("categories.move.selectAll")}
                checked={every}
                onCheckedChange={() =>
                  setSelected(every ? new Set() : new Set(documents.map((d) => d.id)))
                }
              />
            ),
            key: "select",
          },
          {
            card: "meta",
            cell: (document) => document.number,
            className: "font-mono text-sm",
            header: t("categories.move.columns.number"),
            key: "number",
            value: (document) => document.number,
          },
          {
            card: "title",
            cell: (document) => document.title,
            header: t("categories.move.columns.title"),
            key: "title",
            value: (document) => document.title,
          },
          {
            card: "status",
            cell: (document) => t(`categories.move.types.${document.documentType}`),
            header: t("categories.move.columns.type"),
            key: "type",
            value: (document) => document.documentType,
          },
        ]}
        empty={
          <p className="text-base text-muted">
            {t("categories.move.empty", { name: category.name })}
          </p>
        }
        label={t("categories.move.tableLabel", { name: category.name })}
        rowKey={(document) => document.id}
        rows={documents}
      />

      {documents.length > 0 ? (
        <fetcher.Form className="flex flex-wrap items-end gap-3" method="post">
          {fields("preview")}
          <Field className="w-80 max-w-full" label={t("categories.move.target")}>
            <Select
              onValueChange={setTarget}
              options={options}
              placeholder={t("categories.move.targetPlaceholder")}
              value={target}
            />
          </Field>
          <Button
            busy={fetcher.state !== "idle"}
            disabled={!ready}
            type="submit"
            variant="secondary"
          >
            {t("categories.move.preview")}
          </Button>
        </fetcher.Form>
      ) : null}

      {failure ? (
        <Banner failure={failure} title={t("categories.move.failed")} tone="danger" />
      ) : null}

      {preview ? (
        <>
          <ResponsiveTable
            columns={[
              {
                card: "title",
                cell: (item) => item.title,
                header: t("categories.move.columns.title"),
                key: "title",
              },
              {
                card: "meta",
                cell: (item) => item.number,
                className: "font-mono text-sm",
                header: t("categories.move.columns.number"),
                key: "number",
              },
              {
                card: "meta",
                cell: (item) => item.newNumber ?? "",
                className: "font-mono text-sm",
                header: t("categories.move.columns.newNumber"),
                key: "newNumber",
              },
              {
                card: "status",
                cell: (item) => item.refusal ?? t("categories.move.ok"),
                className: "text-sm",
                header: t("categories.move.columns.result"),
                key: "result",
              },
            ]}
            empty={null}
            label={t("categories.move.previewLabel")}
            rowKey={(item) => item.policyId}
            rows={preview}
          />
          <fetcher.Form className="flex justify-end" method="post">
            {fields("move")}
            <Button
              busy={fetcher.state !== "idle"}
              disabled={blocked || preview.length === 0}
              type="submit"
            >
              {t("categories.move.confirm", { count: preview.length })}
            </Button>
          </fetcher.Form>
        </>
      ) : null}
    </ListPage>
  );
}
