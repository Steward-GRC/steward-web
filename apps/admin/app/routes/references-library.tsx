// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Reference, ReferenceInput } from "@steward-web/api-client";

import { ReferenceKind } from "@steward-web/api-client";
import { PERMISSIONS, useCan, useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  type BadgeTone,
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
  RadioGroup,
  RadioItem,
  ResponsiveTable,
  TabsContent,
} from "@steward-web/ui";
import { useId, useState } from "react";
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
import { DeleteButton, LibraryPage, LibraryTabs, UsedBy } from "../libraries/LibraryParts";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

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

/** Each kind's badge: a standard in the info tint, text neutral, a link in plum. */
const KIND_TONE: Record<ReferenceKind, BadgeTone> = {
  [ReferenceKind.Link]: "primary",
  [ReferenceKind.Standard]: "info",
  [ReferenceKind.Text]: "neutral",
};

const referenceDetail = (r: Reference): string => {
  if (r.kind === ReferenceKind.Text) return r.body ?? "";
  if (r.kind === ReferenceKind.Standard) return [r.clause, r.url].filter(Boolean).join(" · ");
  return r.url ?? "";
};

const emptyForm = { body: "", clause: "", kind: ReferenceKind.Standard, label: "", url: "" };

export default function ReferencesLibrary({ loaderData }: Route.ComponentProps) {
  const { refs } = loaderData;
  const { t } = useTranslation("admin");
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

  const [archiveTarget, setArchiveTarget] = useState<null | Reference>(null);
  const kindId = useId();

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
    <LibraryPage
      newLabel={t("libraries.references.new")}
      onNew={isAdmin ? openCreate : undefined}
      subtitle={t("libraries.references.subtitle")}
      title={t("libraries.references.title")}
    >
      <LibraryTabs onTab={setTab} tab={tab}>
        <TabsContent value={tab}>
          <ResponsiveTable
            columns={[
              {
                card: "title",
                cell: (ref) => ref.label,
                className: "font-medium",
                header: t("libraries.references.columns.label"),
                key: "label",
                value: (ref) => ref.label,
              },
              {
                card: "status",
                cell: (ref) => (
                  <Badge tone={KIND_TONE[ref.kind]}>
                    {t(`libraries.references.kinds.${ref.kind}`)}
                  </Badge>
                ),
                header: t("libraries.references.columns.kind"),
                key: "kind",
                value: (ref) => ref.kind,
              },
              {
                card: "meta",
                cell: (ref) =>
                  ref.kind === ReferenceKind.Link && ref.url ? (
                    <a
                      className="inline-block max-w-xs truncate text-primary hover:underline"
                      href={ref.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {ref.url}
                    </a>
                  ) : (
                    referenceDetail(ref) || t("libraries.none")
                  ),
                className: "max-w-md text-muted",
                header: t("libraries.references.columns.text"),
                key: "text",
              },
              {
                card: "meta",
                cell: (ref) => <UsedBy count={ref.usedByCount} />,
                className: "text-muted",
                header: t("libraries.references.columns.usedBy"),
                key: "usedBy",
                value: (ref) => ref.usedByCount,
              },
              {
                card: "action",
                cell: (ref) =>
                  canCurateRef(ref) ? (
                    <div className="flex items-center justify-end gap-2">
                      {ref.archived ? (
                        <Badge tone="neutral">{t("libraries.actions.archived")}</Badge>
                      ) : (
                        <Button onClick={() => openEdit(ref)} size="sm" variant="ghost">
                          {t("libraries.actions.edit")}
                        </Button>
                      )}
                      {ref.archived ? (
                        <saveFetcher.Form method="post">
                          <input name="intent" type="hidden" value="archive" />
                          <input name="id" type="hidden" value={ref.id} />
                          <input name="archived" type="hidden" value="false" />
                          <Button size="sm" type="submit" variant="secondary">
                            {t("libraries.actions.restore")}
                          </Button>
                        </saveFetcher.Form>
                      ) : (
                        <Button onClick={() => setArchiveTarget(ref)} size="sm" variant="secondary">
                          {t("libraries.actions.archive")}
                        </Button>
                      )}
                      <DeleteButton
                        inUse={!isDeletable(ref.usedByCount)}
                        onDelete={() => setDeleteTarget(ref)}
                      />
                    </div>
                  ) : null,
                header: <span className="sr-only">{t("libraries.actions.label")}</span>,
                key: "actions",
              },
            ]}
            empty={
              <EmptyState
                description={t(`libraries.references.empty.${tab}Description`)}
                title={t(`libraries.references.empty.${tab}`)}
              />
            }
            framed
            label={t("libraries.references.title")}
            rowActions={(ref) =>
              isAdmin && !ref.archived
                ? [{ label: t("libraries.actions.edit"), onSelect: () => openEdit(ref) }]
                : []
            }
            rowKey={(ref) => ref.id}
            rows={rows}
            search={{
              label: t("libraries.references.search"),
              placeholder: t("libraries.references.search"),
              text: (ref) => `${ref.label} ${ref.url ?? ""} ${referenceDetail(ref)}`,
            }}
          />
        </TabsContent>
      </LibraryTabs>

      <Dialog
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        open={archiveTarget !== null}
      >
        <DialogContent
          description={t("libraries.references.archive.description")}
          title={t("libraries.references.archive.title")}
        >
          <saveFetcher.Form method="post" onSubmit={() => setArchiveTarget(null)}>
            <input name="intent" type="hidden" value="archive" />
            <input name="id" type="hidden" value={archiveTarget?.id ?? ""} />
            <input name="archived" type="hidden" value="true" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("libraries.cancel")}</Button>
              </DialogClose>
              <Button type="submit">{t("libraries.references.archive.cta")}</Button>
            </DialogFooter>
          </saveFetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent
          hasInput
          title={
            editing
              ? t("libraries.references.dialog.editTitle")
              : t("libraries.references.dialog.newTitle")
          }
        >
          <saveFetcher.Form method="post">
            <input name="intent" type="hidden" value="save" />
            <input name="id" type="hidden" value={editing?.id ?? ""} />
            <DialogBody>
              <Field label={t("libraries.references.dialog.label")}>
                <Input defaultValue={form.label} name="label" required />
              </Field>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink" id={kindId}>
                  {t("libraries.references.dialog.kind")}
                </span>
                <RadioGroup
                  aria-labelledby={kindId}
                  name="kind"
                  onValueChange={(v) => setKind(v as ReferenceKind)}
                  value={kind}
                >
                  {KINDS.map((k) => (
                    <RadioItem key={k} value={k}>
                      <div className="flex flex-col">
                        <span>{t(`libraries.references.kinds.${k}`)}</span>
                        <span className="text-sm text-muted">
                          {t(`libraries.references.kindDescriptions.${k}`)}
                        </span>
                      </div>
                    </RadioItem>
                  ))}
                </RadioGroup>
              </div>

              {kind === ReferenceKind.Standard ? (
                <>
                  <Field label={t("libraries.references.dialog.clause")}>
                    <Input className="font-mono" defaultValue={form.clause} name="clause" />
                  </Field>
                  <Field label={t("libraries.references.dialog.linkOptional")}>
                    <Input defaultValue={form.url} name="url" />
                  </Field>
                </>
              ) : null}
              {kind === ReferenceKind.Text ? (
                <Field label={t("libraries.references.dialog.body")}>
                  <Input defaultValue={form.body} name="body" />
                </Field>
              ) : null}
              {kind === ReferenceKind.Link ? (
                <Field label={t("libraries.references.dialog.link")}>
                  <Input defaultValue={form.url} name="url" />
                </Field>
              ) : null}

              {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
                <Banner
                  failure={saveFetcher.data.error}
                  title={t("libraries.references.dialog.failed")}
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
                  ? t("libraries.references.dialog.save")
                  : t("libraries.references.dialog.create")}
              </Button>
            </DialogFooter>
          </saveFetcher.Form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !open && setDeleteTarget(null)} open={deleteTarget !== null}>
        <DialogContent
          description={t("libraries.references.delete.description", {
            label: deleteTarget?.label,
          })}
          title={t("libraries.references.delete.title")}
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
                  title={t("libraries.references.delete.failed")}
                  tone="danger"
                />
              </DialogBody>
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("libraries.cancel")}</Button>
              </DialogClose>
              <Button busy={deleteFetcher.state !== "idle"} type="submit" variant="danger">
                {t("libraries.references.delete.cta")}
              </Button>
            </DialogFooter>
          </deleteFetcher.Form>
        </DialogContent>
      </Dialog>
    </LibraryPage>
  );
}
