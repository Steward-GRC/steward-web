// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ContactBlock, ContactBlockInput } from "@steward-web/api-client";

import { PERMISSIONS, useCan, useIdentity } from "@steward-web/auth";
import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  EmptyState,
  Field,
  Input,
  ResponsiveTable,
  TabsContent,
} from "@steward-web/ui";
import { useState } from "react";
import { data, useFetcher } from "react-router";

import type { Route } from "./+types/contact-library";

import { type LibraryTab, visibleByTab } from "../libraries/libraries.logic";
import {
  createContactBlock,
  listContactBlocks,
  setContactBlockArchived,
  updateContactBlock,
} from "../libraries/libraries.server";
import { LibraryPage, LibraryTabs, UsedBy } from "../libraries/LibraryParts";

/** The table's own search, sort and page changes don't load the page again. */
export { shouldRevalidateTable as shouldRevalidate } from "@steward-web/ui";

export const loader = async ({ request }: Route.LoaderArgs) => ({
  blocks: await listContactBlocks(request),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const intent = form.get("intent");

  try {
    switch (intent) {
      case "archive": {
        const id = String(form.get("id") ?? "");
        const archived = form.get("archived") === "true";
        const saved = await setContactBlockArchived(request, id, archived);
        return data({ intent, ok: true, saved } as const);
      }
      case "save": {
        const id = String(form.get("id") ?? "");
        const input: ContactBlockInput = {
          department: String(form.get("department") ?? "").trim() || undefined,
          email: String(form.get("email") ?? "").trim() || undefined,
          hours: String(form.get("hours") ?? "").trim() || undefined,
          label: String(form.get("label") ?? "").trim(),
          name: String(form.get("name") ?? "").trim() || undefined,
          notes: String(form.get("notes") ?? "").trim() || undefined,
          phone: String(form.get("phone") ?? "").trim() || undefined,
          role: String(form.get("role") ?? "").trim() || undefined,
        };
        const saved = id
          ? await updateContactBlock(request, id, input)
          : await createContactBlock(request, input);
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

const emptyForm = {
  department: "",
  email: "",
  hours: "",
  label: "",
  name: "",
  notes: "",
  phone: "",
  role: "",
};

export default function ContactLibrary({ loaderData }: Route.ComponentProps) {
  const { blocks } = loaderData;
  const { t } = useTranslation("admin");
  const identity = useIdentity();
  const canTemplateManage = useCan(PERMISSIONS.TemplateManage);
  const canComplianceManage = useCan(PERMISSIONS.ComplianceManage);
  const canManage = identity.isSiteAdmin || canTemplateManage || canComplianceManage;

  const [tab, setTab] = useState<LibraryTab>("active");
  const rows = visibleByTab(blocks, tab);
  const none = t("libraries.none");

  const saveFetcher = useFetcher<typeof action>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContactBlock | null>(null);
  const [appliedSave, setAppliedSave] = useState(saveFetcher.data);
  if (saveFetcher.data !== appliedSave) {
    setAppliedSave(saveFetcher.data);
    if (saveFetcher.data?.ok && saveFetcher.data.intent === "save") setDialogOpen(false);
  }

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (block: ContactBlock) => {
    setEditing(block);
    setDialogOpen(true);
  };
  const form = editing
    ? {
        department: editing.department ?? "",
        email: editing.email ?? "",
        hours: editing.hours ?? "",
        label: editing.label,
        name: editing.name ?? "",
        notes: editing.notes ?? "",
        phone: editing.phone ?? "",
        role: editing.role ?? "",
      }
    : emptyForm;

  return (
    <LibraryPage
      newLabel={t("libraries.contacts.new")}
      onNew={canManage ? openCreate : undefined}
      subtitle={t("libraries.contacts.subtitle")}
      title={t("libraries.contacts.title")}
    >
      <LibraryTabs onTab={setTab} tab={tab}>
        <TabsContent value={tab}>
          <ResponsiveTable
            columns={[
              {
                card: "title",
                cell: (block) => block.label,
                className: "font-medium",
                header: t("libraries.contacts.columns.label"),
                key: "label",
                value: (block) => block.label,
              },
              {
                card: "meta",
                cell: (block) => [block.name, block.role].filter(Boolean).join(" · ") || none,
                className: "text-muted",
                header: t("libraries.contacts.columns.who"),
                key: "who",
                value: (block) => [block.name, block.role].filter(Boolean).join(" "),
              },
              {
                card: "meta",
                cell: (block) => block.department ?? none,
                className: "text-muted",
                header: t("libraries.contacts.columns.department"),
                key: "department",
                value: (block) => block.department ?? "",
              },
              {
                card: "meta",
                cell: (block) => block.email ?? none,
                className: "text-muted",
                header: t("libraries.contacts.columns.email"),
                key: "email",
                value: (block) => block.email ?? "",
              },
              {
                card: "meta",
                cell: (block) => block.phone ?? none,
                className: "text-muted",
                header: t("libraries.contacts.columns.phone"),
                key: "phone",
                value: (block) => block.phone ?? "",
              },
              {
                card: "meta",
                cell: (block) => <UsedBy count={block.usedByCount} />,
                className: "text-muted",
                header: t("libraries.contacts.columns.usedBy"),
                key: "usedBy",
                value: (block) => block.usedByCount,
              },
              ...(canManage
                ? [
                    {
                      card: "action" as const,
                      cell: (block: ContactBlock) => (
                        <div className="flex items-center justify-end gap-2">
                          {block.archived ? (
                            <Badge tone="neutral">{t("libraries.actions.archived")}</Badge>
                          ) : (
                            <Button onClick={() => openEdit(block)} size="sm" variant="ghost">
                              {t("libraries.actions.edit")}
                            </Button>
                          )}
                          <saveFetcher.Form method="post">
                            <input name="intent" type="hidden" value="archive" />
                            <input name="id" type="hidden" value={block.id} />
                            <input name="archived" type="hidden" value={String(!block.archived)} />
                            <Button size="sm" type="submit" variant="secondary">
                              {block.archived
                                ? t("libraries.actions.restore")
                                : t("libraries.actions.archive")}
                            </Button>
                          </saveFetcher.Form>
                        </div>
                      ),
                      header: <span className="sr-only">{t("libraries.actions.label")}</span>,
                      key: "actions",
                    },
                  ]
                : []),
            ]}
            empty={
              <EmptyState
                description={t(`libraries.contacts.empty.${tab}Description`)}
                title={t(`libraries.contacts.empty.${tab}`)}
              />
            }
            framed
            label={t("libraries.contacts.title")}
            rowActions={(block) =>
              canManage && !block.archived
                ? [{ label: t("libraries.actions.edit"), onSelect: () => openEdit(block) }]
                : []
            }
            rowKey={(block) => block.id}
            rows={rows}
            search={{
              label: t("libraries.contacts.search"),
              placeholder: t("libraries.contacts.search"),
              text: (block) =>
                [block.label, block.name, block.role, block.department, block.email, block.phone]
                  .filter(Boolean)
                  .join(" "),
            }}
          />
        </TabsContent>
      </LibraryTabs>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent
          description={editing ? t("libraries.contacts.dialog.editDescription") : undefined}
          hasInput
          title={
            editing
              ? t("libraries.contacts.dialog.editTitle")
              : t("libraries.contacts.dialog.newTitle")
          }
        >
          <saveFetcher.Form method="post">
            <input name="intent" type="hidden" value="save" />
            <input name="id" type="hidden" value={editing?.id ?? ""} />
            <DialogBody>
              <Field label={t("libraries.contacts.dialog.label")}>
                <Input defaultValue={form.label} name="label" required />
              </Field>
              <div className="flex gap-3">
                <Field className="flex-1" label={t("libraries.contacts.dialog.email")}>
                  <Input defaultValue={form.email} name="email" type="email" />
                </Field>
                <Field className="flex-1" label={t("libraries.contacts.dialog.phone")}>
                  <Input defaultValue={form.phone} name="phone" />
                </Field>
              </div>
              <p className="text-sm text-muted">{t("libraries.contacts.dialog.emailOrPhone")}</p>
              <div className="flex gap-3">
                <Field className="flex-1" label={t("libraries.contacts.dialog.name")}>
                  <Input defaultValue={form.name} name="name" />
                </Field>
                <Field className="flex-1" label={t("libraries.contacts.dialog.role")}>
                  <Input defaultValue={form.role} name="role" />
                </Field>
              </div>
              <div className="flex gap-3">
                <Field className="flex-1" label={t("libraries.contacts.dialog.department")}>
                  <Input defaultValue={form.department} name="department" />
                </Field>
                <Field className="flex-1" label={t("libraries.contacts.dialog.hours")}>
                  <Input defaultValue={form.hours} name="hours" />
                </Field>
              </div>
              <Field label={t("libraries.contacts.dialog.notes")}>
                <Input defaultValue={form.notes} name="notes" />
              </Field>

              {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
                <Banner
                  failure={saveFetcher.data.error}
                  title={t("libraries.contacts.dialog.failed")}
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
                  ? t("libraries.contacts.dialog.save")
                  : t("libraries.contacts.dialog.create")}
              </Button>
            </DialogFooter>
          </saveFetcher.Form>
        </DialogContent>
      </Dialog>
    </LibraryPage>
  );
}
