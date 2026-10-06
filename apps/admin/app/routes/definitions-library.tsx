// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DefinitionEntry, DefinitionEntryInput } from "@steward-web/api-client";

import { PERMISSIONS, useCan, useIdentity } from "@steward-web/auth";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TD,
  Textarea,
  TH,
  THead,
} from "@steward-web/ui";
import { useState } from "react";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/definitions-library";

import { listGroups, orderedWithPaths } from "../groups/groups.server";
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
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          isAdmin ? (
            <Button disabled={!category} onClick={openCreate} size="sm">
              New definition
            </Button>
          ) : undefined
        }
        eyebrow="Structure"
        subtitle="Reusable, category-scoped glossary terms attached by policy authors."
        title="Definitions"
      />

      <Field label="Category">
        <Select
          onValueChange={setCategory}
          options={categoryOptions}
          placeholder="Select a category…"
          value={category}
        />
      </Field>

      <Tabs onValueChange={(v) => setTab(v as LibraryTab)} value={tab}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {rows.length === 0 ? (
            <EmptyState
              description={
                tab === "archived"
                  ? "Archived definitions appear here and can be restored."
                  : "Create a reusable glossary term that authors can attach to policies in this category."
              }
              title={tab === "archived" ? "No archived definitions" : "No definitions yet"}
            />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Term</TH>
                  <TH>Definition</TH>
                  <TH>Used by</TH>
                  <TH>Actions</TH>
                </tr>
              </THead>
              <tbody>
                {rows.map((entry) => {
                  const deletable = isDeletable(entry.usedByCount);
                  const curatable = canCurateEntry(entry);
                  return (
                    <tr key={entry.id}>
                      <TD className="font-medium">{entry.term}</TD>
                      <TD className="max-w-lg text-muted" title={entry.definition}>
                        <span className="line-clamp-2">{entry.definition}</span>
                      </TD>
                      <TD className="text-muted">
                        {entry.usedByCount} {entry.usedByCount === 1 ? "policy" : "policies"}
                      </TD>
                      <TD>
                        {curatable ? (
                          <div className="flex items-center justify-end gap-2">
                            {entry.archived ? (
                              <Badge tone="neutral">Archived</Badge>
                            ) : (
                              <Button onClick={() => openEdit(entry)} size="sm" variant="ghost">
                                Edit
                              </Button>
                            )}
                            <saveFetcher.Form method="post">
                              <input name="intent" type="hidden" value="archive" />
                              <input name="id" type="hidden" value={entry.id} />
                              <input
                                name="archived"
                                type="hidden"
                                value={String(!entry.archived)}
                              />
                              <Button size="sm" type="submit" variant="secondary">
                                {entry.archived ? "Restore" : "Archive"}
                              </Button>
                            </saveFetcher.Form>
                            <Button
                              disabled={!deletable}
                              onClick={() => setDeleteTarget(entry)}
                              size="sm"
                              title={
                                deletable ? undefined : "In use — archive instead of deleting."
                              }
                              variant="ghost"
                            >
                              Delete
                            </Button>
                          </div>
                        ) : null}
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent hasInput title={editing ? "Edit definition" : "New definition"}>
          <saveFetcher.Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save" />
            <input name="id" type="hidden" value={editing?.id ?? ""} />
            <Field label="Category">
              <Select
                defaultValue={form.categoryId}
                name="categoryId"
                options={categoryOptions}
                placeholder="Select a category…"
              />
            </Field>
            <Field label="Term">
              <Input defaultValue={form.term} name="term" placeholder="e.g. RTO" required />
            </Field>
            <Field label="Definition">
              <Textarea
                defaultValue={form.definition}
                name="definition"
                placeholder="What the term means"
                required
              />
            </Field>

            {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
              <Banner
                failure={saveFetcher.data.error}
                title="Couldn't save this definition"
                tone="danger"
              />
            ) : null}

            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)} type="button" variant="secondary">
                Cancel
              </Button>
              <Button disabled={saveFetcher.state !== "idle"} type="submit">
                {saveFetcher.state === "idle" ? (editing ? "Save changes" : "Create") : "Saving…"}
              </Button>
            </DialogFooter>
          </saveFetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !open && setDeleteTarget(null)} open={deleteTarget !== null}>
        <DialogContent
          description={`"${deleteTarget?.term}" will be permanently deleted. This can't be undone.`}
          title="Delete definition?"
        >
          <deleteFetcher.Form method="post">
            <input name="intent" type="hidden" value="delete" />
            <input name="id" type="hidden" value={deleteTarget?.id ?? ""} />
            {deleteFetcher.data &&
            !deleteFetcher.data.ok &&
            deleteFetcher.data.intent === "delete" ? (
              <Banner
                failure={deleteFetcher.data.error}
                title="Couldn't delete this definition"
                tone="danger"
              />
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button disabled={deleteFetcher.state !== "idle"} type="submit" variant="danger">
                Delete
              </Button>
            </DialogFooter>
          </deleteFetcher.Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
