// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { ContactBlock, ContactBlockInput } from "@steward-web/api-client";

import { PERMISSIONS, useCan, useIdentity } from "@steward-web/auth";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  EmptyState,
  Field,
  Input,
  PageHeader,
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

import type { Route } from "./+types/contact-library";

import { type LibraryTab, visibleByTab } from "../libraries/libraries.logic";
import {
  createContactBlock,
  listContactBlocks,
  setContactBlockArchived,
  updateContactBlock,
} from "../libraries/libraries.server";

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
  const identity = useIdentity();
  const canTemplateManage = useCan(PERMISSIONS.TemplateManage);
  const canComplianceManage = useCan(PERMISSIONS.ComplianceManage);
  const canManage = identity.isSiteAdmin || canTemplateManage || canComplianceManage;

  const [tab, setTab] = useState<LibraryTab>("active");
  const rows = visibleByTab(blocks, tab);

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
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        actions={
          canManage ? (
            <Button onClick={openCreate} size="sm">
              New contact block
            </Button>
          ) : undefined
        }
        eyebrow="Structure"
        subtitle="Reusable contact blocks referenced by policies."
        title="Contact library"
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
                  ? "Archived blocks appear here and can be restored."
                  : "Create a reusable contact block that authors can attach to policies."
              }
              title={tab === "archived" ? "No archived blocks" : "No contact blocks yet"}
            />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Label</TH>
                  <TH>Name / role</TH>
                  <TH>Department</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Used by</TH>
                  {canManage ? <TH>Actions</TH> : null}
                </tr>
              </THead>
              <tbody>
                {rows.map((block) => {
                  const who = [block.name, block.role].filter(Boolean).join(" — ");
                  return (
                    <tr key={block.id}>
                      <TD className="font-medium">{block.label}</TD>
                      <TD className="text-muted">{who || "—"}</TD>
                      <TD className="text-muted">{block.department ?? "—"}</TD>
                      <TD className="text-muted">{block.email ?? "—"}</TD>
                      <TD className="text-muted">{block.phone ?? "—"}</TD>
                      <TD className="text-muted">
                        {block.usedByCount} {block.usedByCount === 1 ? "policy" : "policies"}
                      </TD>
                      {canManage ? (
                        <TD>
                          <div className="flex items-center justify-end gap-2">
                            {block.archived ? (
                              <Badge tone="neutral">Archived</Badge>
                            ) : (
                              <Button onClick={() => openEdit(block)} size="sm" variant="ghost">
                                Edit
                              </Button>
                            )}
                            <saveFetcher.Form method="post">
                              <input name="intent" type="hidden" value="archive" />
                              <input name="id" type="hidden" value={block.id} />
                              <input
                                name="archived"
                                type="hidden"
                                value={String(!block.archived)}
                              />
                              <Button size="sm" type="submit" variant="secondary">
                                {block.archived ? "Restore" : "Archive"}
                              </Button>
                            </saveFetcher.Form>
                          </div>
                        </TD>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent hasInput title={editing ? "Edit contact block" : "New contact block"}>
          <saveFetcher.Form className="flex flex-col gap-3" method="post">
            <input name="intent" type="hidden" value="save" />
            <input name="id" type="hidden" value={editing?.id ?? ""} />
            <Field label="Label">
              <Input defaultValue={form.label} name="label" required />
            </Field>
            <div className="flex gap-3">
              <Field className="flex-1" label="Email">
                <Input defaultValue={form.email} name="email" type="email" />
              </Field>
              <Field className="flex-1" label="Phone">
                <Input defaultValue={form.phone} name="phone" />
              </Field>
            </div>
            <p className="text-sm text-muted">At least one of email or phone is required.</p>
            <div className="flex gap-3">
              <Field className="flex-1" label="Name / role heading">
                <Input defaultValue={form.name} name="name" />
              </Field>
              <Field className="flex-1" label="Role">
                <Input defaultValue={form.role} name="role" />
              </Field>
            </div>
            <div className="flex gap-3">
              <Field className="flex-1" label="Department">
                <Input defaultValue={form.department} name="department" />
              </Field>
              <Field className="flex-1" label="Hours">
                <Input defaultValue={form.hours} name="hours" />
              </Field>
            </div>
            <Field label="Notes">
              <Input defaultValue={form.notes} name="notes" />
            </Field>

            {saveFetcher.data && !saveFetcher.data.ok && saveFetcher.data.intent === "save" ? (
              <Banner
                failure={saveFetcher.data.error}
                title="Couldn't save this block"
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
    </div>
  );
}
