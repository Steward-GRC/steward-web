// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Reference, ReferenceInput } from "@steward-web/api-client";

import { ReferenceKind } from "@steward-web/api-client";
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
  RadioGroup,
  RadioItem,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { useState } from "react";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/references-library";

import {
  canCurate,
  isDeletable,
  type LibraryTab,
  visibleByTab,
} from "../libraries/libraries.logic";
import {
  createReference,
  deleteReference,
  listReferences,
  setReferenceArchived,
  updateReference,
} from "../libraries/libraries.server";

export const loader = async ({ request }: Route.LoaderArgs) => ({
  refs: await listReferences(request),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "archive": {
        const id = String(form.get("id") ?? "");
        const archived = form.get("archived") === "true";
        const saved = await setReferenceArchived(request, id, archived);
        return data({ intent, ok: true, saved } as const);
      }
      case "delete": {
        const id = String(form.get("id") ?? "");
        await deleteReference(request, id);
        return data({ intent, ok: true } as const);
      }
      case "save": {
        const id = String(form.get("id") ?? "");
        const kind = String(form.get("kind") ?? "") as ReferenceKind;
        const input: ReferenceInput = {
          body: kind === ReferenceKind.Text ? String(form.get("body") ?? "").trim() : undefined,
          clause:
            kind === ReferenceKind.Standard ? String(form.get("clause") ?? "").trim() : undefined,
          kind,
          label: String(form.get("label") ?? "").trim(),
          url:
            kind === ReferenceKind.Standard || kind === ReferenceKind.Link
              ? String(form.get("url") ?? "").trim()
              : undefined,
        };
        const saved = id
          ? await updateReference(request, id, input)
          : await createReference(request, input);
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

const KINDS = [ReferenceKind.Standard, ReferenceKind.Text, ReferenceKind.Link];

const KIND_LABEL: Record<ReferenceKind, string> = {
  [ReferenceKind.Link]: "Link",
  [ReferenceKind.Standard]: "Standard",
  [ReferenceKind.Text]: "Text",
};

const KIND_DESCRIPTION: Record<ReferenceKind, string> = {
  [ReferenceKind.Link]: "An external link to a document or resource.",
  [ReferenceKind.Standard]:
    "A governing standard or clause (e.g. RFC 2119) — a name plus an optional clause and link.",
  [ReferenceKind.Text]: "Free-standing reference text shown inline on the policy.",
};

const referenceDetail = (r: Reference): string => {
  if (r.kind === ReferenceKind.Text) return r.body ?? "";
  if (r.kind === ReferenceKind.Standard) return [r.clause, r.url].filter(Boolean).join(" · ");
  return r.url ?? "";
};

const emptyForm = { body: "", clause: "", kind: ReferenceKind.Standard, label: "", url: "" };

export default function ReferencesLibrary({ loaderData }: Route.ComponentProps) {
  const { refs } = loaderData;
  const identity = useIdentity();
  const canTemplateManage = useCan(PERMISSIONS.TemplateManage);
  const canComplianceManage = useCan(PERMISSIONS.ComplianceManage);
  const isAdmin = identity.isSiteAdmin || canTemplateManage || canComplianceManage;
  const canCurateRef = (r: Reference) =>
    canCurate({ isAdmin, userId: identity.id }, r.createdByUserId);

  const [tab, setTab] = useState<LibraryTab>("active");
  const rows = visibleByTab(refs, tab);

  const saveFetcher = useFetcher<typeof action>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<null | Reference>(null);
  const [kind, setKind] = useState<ReferenceKind>(ReferenceKind.Standard);
  const [appliedSave, setAppliedSave] = useState(saveFetcher.data);
  if (saveFetcher.data !== appliedSave) {
    setAppliedSave(saveFetcher.data);
    if (saveFetcher.data?.ok && saveFetcher.data.intent === "save") setDialogOpen(false);
  }

  const deleteFetcher = useFetcher<typeof action>();
  const [deleteTarget, setDeleteTarget] = useState<null | Reference>(null);
  const [appliedDelete, setAppliedDelete] = useState(deleteFetcher.data);
  if (deleteFetcher.data !== appliedDelete) {
    setAppliedDelete(deleteFetcher.data);
    if (deleteFetcher.data?.ok && deleteFetcher.data.intent === "delete") setDeleteTarget(null);
  }

  const openCreate = () => {
    setEditing(null);
    setKind(ReferenceKind.Standard);
    setDialogOpen(true);
  };
  const openEdit = (ref: Reference) => {
    setEditing(ref);
    setKind(ref.kind);
    setDialogOpen(true);
  };
  const form = editing
    ? {
        body: editing.body ?? "",
        clause: editing.clause ?? "",
        kind: editing.kind,
        label: editing.label,
        url: editing.url ?? "",
      }
    : emptyForm;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          isAdmin ? (
            <Button onClick={openCreate} size="sm">
              New reference
            </Button>
          ) : undefined
        }
        eyebrow="Structure"
        subtitle="Reusable standards, reference text and links attached by policy authors."
        title="References & standards"
      />

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
                  ? "Archived references appear here and can be restored."
                  : "Create a reusable standard, reference text or link that authors can attach to policies."
              }
              title={tab === "archived" ? "No archived references" : "No references yet"}
            />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Label</TH>
                  <TH>Kind</TH>
                  <TH>Text</TH>
                  <TH>Used by</TH>
                  <TH>Actions</TH>
                </tr>
              </THead>
              <tbody>
                {rows.map((ref) => {
                  const deletable = isDeletable(ref.usedByCount);
                  const curatable = canCurateRef(ref);
                  return (
                    <tr key={ref.id}>
                      <TD className="font-medium">{ref.label}</TD>
                      <TD>
                        <Badge tone="neutral">{KIND_LABEL[ref.kind]}</Badge>
                      </TD>
                      <TD className="max-w-md text-muted">
                        {ref.kind === ReferenceKind.Link && ref.url ? (
                          <a
                            className="inline-block max-w-xs truncate text-primary hover:underline"
                            href={ref.url}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            {ref.url}
                          </a>
                        ) : (
                          referenceDetail(ref) || "—"
                        )}
                      </TD>
                      <TD className="text-muted">
                        {ref.usedByCount} {ref.usedByCount === 1 ? "policy" : "policies"}
                      </TD>
                      <TD>
                        {curatable ? (
                          <div className="flex items-center justify-end gap-2">
                            {ref.archived ? (
                              <Badge tone="neutral">Archived</Badge>
                            ) : (
                              <Button onClick={() => openEdit(ref)} size="sm" variant="ghost">
                                Edit
                              </Button>
                            )}
                            <saveFetcher.Form method="post">
                              <input name="intent" type="hidden" value="archive" />
                              <input name="id" type="hidden" value={ref.id} />
                              <input name="archived" type="hidden" value={String(!ref.archived)} />
                              <Button size="sm" type="submit" variant="secondary">
                                {ref.archived ? "Restore" : "Archive"}
                              </Button>
                            </saveFetcher.Form>
                            <Button
                              disabled={!deletable}
                              onClick={() => setDeleteTarget(ref)}
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
        <DialogContent hasInput title={editing ? "Edit reference" : "New reference"}>
          <saveFetcher.Form className="flex flex-col gap-4" method="post">
            <input name="intent" type="hidden" value="save" />
            <input name="id" type="hidden" value={editing?.id ?? ""} />
            <Field label="Label">
              <Input defaultValue={form.label} name="label" required />
            </Field>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-ink">Kind</span>
              <RadioGroup
                name="kind"
                onValueChange={(v) => setKind(v as ReferenceKind)}
                value={kind}
              >
                {KINDS.map((k) => (
                  <RadioItem key={k} value={k}>
                    <div className="flex flex-col">
                      <span>{KIND_LABEL[k]}</span>
                      <span className="text-sm text-muted">{KIND_DESCRIPTION[k]}</span>
                    </div>
                  </RadioItem>
                ))}
              </RadioGroup>
            </div>

            {kind === ReferenceKind.Standard ? (
              <>
                <Field label="Clause">
                  <Input defaultValue={form.clause} name="clause" />
                </Field>
                <Field label="Link (optional)">
                  <Input defaultValue={form.url} name="url" />
                </Field>
              </>
            ) : null}
            {kind === ReferenceKind.Text ? (
              <Field label="Reference text">
                <Input defaultValue={form.body} name="body" />
              </Field>
            ) : null}
            {kind === ReferenceKind.Link ? (
              <Field label="Link">
                <Input defaultValue={form.url} name="url" />
              </Field>
            ) : null}

            {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
              <Banner
                failure={saveFetcher.data.error}
                title="Couldn't save this reference"
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
          description={`"${deleteTarget?.label}" will be permanently deleted. This can't be undone.`}
          title="Delete reference?"
        >
          <deleteFetcher.Form method="post">
            <input name="intent" type="hidden" value="delete" />
            <input name="id" type="hidden" value={deleteTarget?.id ?? ""} />
            {deleteFetcher.data &&
            !deleteFetcher.data.ok &&
            deleteFetcher.data.intent === "delete" ? (
              <Banner
                failure={deleteFetcher.data.error}
                title="Couldn't delete this reference"
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
