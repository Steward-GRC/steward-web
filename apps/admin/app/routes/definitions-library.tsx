// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DefinitionEntry, DefinitionEntryInput } from "@steward-web/api-client";

import { PERMISSIONS, useCan, useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  EmptyState,
  Field,
  Input,
  ResponsiveTable,
  Select,
  TabsContent,
  Textarea,
} from "@steward-web/ui";
import { useState } from "react";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/definitions-library";

import { listGroups, orderedWithPaths } from "../categories/categories.server";
import {
  canCurate,
  isDeletable,
  type LibraryTab,
  visibleByTab,
} from "../libraries/libraries.logic";
import {
  createDefinition,
  deleteDefinition,
  listDefinitions,
  setDefinitionArchived,
  updateDefinition,
} from "../libraries/libraries.server";
import { DeleteButton, LibraryPage, LibraryTabs, UsedBy } from "../libraries/LibraryParts";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const [defs, groups] = await Promise.all([listDefinitions(request), listGroups(request)]);
  return { categories: orderedWithPaths(groups), defs };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "archive": {
        const id = String(form.get("id") ?? "");
        const archived = form.get("archived") === "true";
        const saved = await setDefinitionArchived(request, id, archived);
        return data({ intent, ok: true, saved } as const);
      }
      case "delete": {
        const id = String(form.get("id") ?? "");
        await deleteDefinition(request, id);
        return data({ intent, ok: true } as const);
      }
      case "save": {
        const id = String(form.get("id") ?? "");
        const input: DefinitionEntryInput = {
          categoryId: String(form.get("categoryId") ?? "").trim(),
          definition: String(form.get("definition") ?? "").trim(),
          term: String(form.get("term") ?? "").trim(),
        };
        const saved = id
          ? await updateDefinition(request, id, input)
          : await createDefinition(request, input);
        return data({ intent, ok: true, saved } as const);
      }
      default: {
        throw data("unrecognized intent", { status: 400 });
      }
    }
  } catch (error) {
    return data({ error: refusalOf(error), intent: String(intent), ok: false } as const, {
      status: 400,
    });
  }
};

const emptyForm = { categoryId: "", definition: "", term: "" };

export default function DefinitionsLibrary({ loaderData }: Route.ComponentProps) {
  const { categories, defs } = loaderData;
  const { t } = useTranslation("admin");
  const identity = useIdentity();
  const canTemplateManage = useCan(PERMISSIONS.TemplateManage);
  const canComplianceManage = useCan(PERMISSIONS.ComplianceManage);
  const isAdmin = identity.isSiteAdmin || canTemplateManage || canComplianceManage;
  const canCurateEntry = (entry: DefinitionEntry) =>
    canCurate({ isAdmin, userId: identity.id }, entry.createdByUserId);

  const categoryOptions = categories.map((c) => ({ label: c.path, value: c.id }));
  const [category, setCategory] = useState(categories[0]?.id ?? "");
  const [tab, setTab] = useState<LibraryTab>("active");
  const scoped = defs.filter((entry) => entry.categoryId === category);
  const rows = visibleByTab(scoped, tab);

  const saveFetcher = useFetcher<typeof action>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DefinitionEntry | null>(null);
  const [appliedSave, setAppliedSave] = useState(saveFetcher.data);
  if (saveFetcher.data !== appliedSave) {
    setAppliedSave(saveFetcher.data);
    if (saveFetcher.data?.ok && saveFetcher.data.intent === "save") setDialogOpen(false);
  }

  const deleteFetcher = useFetcher<typeof action>();
  const [deleteTarget, setDeleteTarget] = useState<DefinitionEntry | null>(null);
  const [appliedDelete, setAppliedDelete] = useState(deleteFetcher.data);
  if (deleteFetcher.data !== appliedDelete) {
    setAppliedDelete(deleteFetcher.data);
    if (deleteFetcher.data?.ok && deleteFetcher.data.intent === "delete") setDeleteTarget(null);
  }

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (entry: DefinitionEntry) => {
    setEditing(entry);
    setDialogOpen(true);
  };
  const form = editing
    ? { categoryId: editing.categoryId, definition: editing.definition, term: editing.term }
    : { ...emptyForm, categoryId: category };

  return (
    <LibraryPage
      newLabel={t("libraries.definitions.new")}
      onNew={isAdmin && category ? openCreate : undefined}
      subtitle={t("libraries.definitions.subtitle")}
      title={t("libraries.definitions.title")}
    >
      <Field className="w-72" label={t("libraries.definitions.category")}>
        <Select
          onValueChange={setCategory}
          options={categoryOptions}
          placeholder={t("libraries.definitions.chooseCategory")}
          value={category}
        />
      </Field>

      <LibraryTabs onTab={setTab} tab={tab}>
        <TabsContent value={tab}>
          <ResponsiveTable
            columns={[
              {
                card: "title",
                cell: (entry) => entry.term,
                className: "font-medium",
                header: t("libraries.definitions.columns.term"),
                key: "term",
                value: (entry) => entry.term,
              },
              {
                card: "meta",
                cell: (entry) => (
                  <span className="line-clamp-2" title={entry.definition}>
                    {entry.definition}
                  </span>
                ),
                className: "max-w-lg text-muted",
                header: t("libraries.definitions.columns.definition"),
                key: "definition",
                value: (entry) => entry.definition,
              },
              {
                card: "meta",
                cell: (entry) => <UsedBy count={entry.usedByCount} />,
                className: "text-muted",
                header: t("libraries.definitions.columns.usedBy"),
                key: "usedBy",
                value: (entry) => entry.usedByCount,
              },
              {
                card: "action",
                cell: (entry) =>
                  canCurateEntry(entry) ? (
                    <div className="flex items-center justify-end gap-2">
                      {entry.archived ? (
                        <Badge tone="neutral">{t("libraries.actions.archived")}</Badge>
                      ) : (
                        <Button onClick={() => openEdit(entry)} size="sm" variant="ghost">
                          {t("libraries.actions.edit")}
                        </Button>
                      )}
                      <saveFetcher.Form method="post">
                        <input name="intent" type="hidden" value="archive" />
                        <input name="id" type="hidden" value={entry.id} />
                        <input name="archived" type="hidden" value={String(!entry.archived)} />
                        <Button size="sm" type="submit" variant="secondary">
                          {entry.archived
                            ? t("libraries.actions.restore")
                            : t("libraries.actions.archive")}
                        </Button>
                      </saveFetcher.Form>
                      <DeleteButton
                        inUse={!isDeletable(entry.usedByCount)}
                        onDelete={() => setDeleteTarget(entry)}
                      />
                    </div>
                  ) : null,
                header: <span className="sr-only">{t("libraries.actions.label")}</span>,
                key: "actions",
              },
            ]}
            empty={
              <EmptyState
                description={t(`libraries.definitions.empty.${tab}Description`)}
                title={t(`libraries.definitions.empty.${tab}`)}
              />
            }
            framed
            label={t("libraries.definitions.title")}
            rowActions={(entry) =>
              isAdmin && !entry.archived
                ? [{ label: t("libraries.actions.edit"), onSelect: () => openEdit(entry) }]
                : []
            }
            rowKey={(entry) => entry.id}
            rows={rows}
            search={{
              label: t("libraries.definitions.search"),
              placeholder: t("libraries.definitions.search"),
              text: (entry) => `${entry.term} ${entry.definition}`,
            }}
          />
        </TabsContent>
      </LibraryTabs>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent
          hasInput
          title={
            editing
              ? t("libraries.definitions.dialog.editTitle")
              : t("libraries.definitions.dialog.newTitle")
          }
        >
          <saveFetcher.Form method="post">
            <input name="intent" type="hidden" value="save" />
            <input name="id" type="hidden" value={editing?.id ?? ""} />
            <DialogBody>
              <Field label={t("libraries.definitions.dialog.category")}>
                <Select
                  defaultValue={form.categoryId}
                  name="categoryId"
                  options={categoryOptions}
                  placeholder={t("libraries.definitions.chooseCategory")}
                />
              </Field>
              <Field label={t("libraries.definitions.dialog.term")}>
                <Input defaultValue={form.term} name="term" required />
              </Field>
              <Field label={t("libraries.definitions.dialog.definition")}>
                <Textarea defaultValue={form.definition} name="definition" required />
              </Field>

              {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
                <Banner
                  failure={saveFetcher.data.error}
                  title={
                    // the title is the definition's key in the library (bug log 227)
                    saveFetcher.data.error.code === "ALREADY_EXISTS"
                      ? t("libraries.definitions.dialog.duplicate")
                      : t("libraries.definitions.dialog.failed")
                  }
                  tone="danger"
                />
              ) : null}
            </DialogBody>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)} type="button" variant="secondary">
                {t("libraries.cancel")}
              </Button>
              <Button busy={saveFetcher.state !== "idle"} type="submit">
                {editing
                  ? t("libraries.definitions.dialog.save")
                  : t("libraries.definitions.dialog.create")}
              </Button>
            </DialogFooter>
          </saveFetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !open && setDeleteTarget(null)} open={deleteTarget !== null}>
        <DialogContent
          description={t("libraries.definitions.delete.description", {
            term: deleteTarget?.term,
          })}
          title={t("libraries.definitions.delete.title")}
          tone="danger"
        >
          <deleteFetcher.Form method="post">
            <input name="intent" type="hidden" value="delete" />
            <input name="id" type="hidden" value={deleteTarget?.id ?? ""} />
            {deleteFetcher.data &&
            !deleteFetcher.data.ok &&
            deleteFetcher.data.intent === "delete" ? (
              <DialogBody>
                <Banner
                  failure={deleteFetcher.data.error}
                  title={t("libraries.definitions.delete.failed")}
                  tone="danger"
                />
              </DialogBody>
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("libraries.cancel")}</Button>
              </DialogClose>
              <Button busy={deleteFetcher.state !== "idle"} type="submit" variant="danger">
                {t("libraries.definitions.delete.cta")}
              </Button>
            </DialogFooter>
          </deleteFetcher.Form>
        </DialogContent>
      </Dialog>
    </LibraryPage>
  );
}
