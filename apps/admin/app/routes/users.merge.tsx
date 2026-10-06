// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AccountMergePreview } from "@steward-web/api-client";

import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  type Failure,
  Field,
  PageHeader,
  Select,
  Table,
  TD,
  TH,
  THead,
} from "@steward-web/ui";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/users.merge";

import { mergeAccounts, previewAccountMerge } from "../users/merge.server";
import { listUsers } from "../users/users.server";

const COUNT_FIELDS: { key: keyof AccountMergePreview["counts"]; label: string }[] = [
  { key: "policiesOwned", label: "Policies owned" },
  { key: "raciGrants", label: "RACI grants" },
  { key: "acknowledgmentsMoved", label: "Acks moved" },
  { key: "acknowledgmentsDeduped", label: "Acks deduped" },
  { key: "workflowItems", label: "Workflow items" },
  { key: "preferences", label: "Preferences" },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const sourceUserId = url.searchParams.get("sourceUserId") ?? "";
  const targetUserId = url.searchParams.get("targetUserId") ?? "";
  const allUsers = await listUsers(request);
  const users = allUsers.filter((u) => !u.deletedAt);

  let preview: AccountMergePreview | undefined;
  let previewError: Failure | undefined;
  if (sourceUserId && targetUserId && sourceUserId !== targetUserId) {
    try {
      preview = await previewAccountMerge(request, sourceUserId, targetUserId);
    } catch (error) {
      previewError = refusalOf(error);
    }
  }

  return { preview, previewError, sourceUserId, targetUserId, users };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const form = await request.formData();
  const sourceUserId = String(form.get("sourceUserId") ?? "");
  const targetUserId = String(form.get("targetUserId") ?? "");
  const confirmPrivileged = form.get("confirmPrivileged") === "true";

  try {
    await mergeAccounts(request, sourceUserId, targetUserId, confirmPrivileged);
    return redirect("/users");
  } catch (error) {
    return data({ error: refusalOf(error), ok: false } as const, { status: 400 });
  }
};

export default function MergeAccounts({ actionData, loaderData }: Route.ComponentProps) {
  const { preview, previewError, sourceUserId, targetUserId, users } = loaderData;

  const userOptions = users.map((u) => ({ label: `${u.name} (${u.email})`, value: u.userId }));
  const sourceUser = users.find((u) => u.userId === sourceUserId);
  const sameUser = sourceUserId !== "" && sourceUserId === targetUserId;

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <PageHeader
        eyebrow="Access"
        subtitle="Move one user's policies, acknowledgements and grants onto another, then close the source account."
        title="Merge accounts"
      />

      <Banner title="Merging is irreversible" tone="warn">
        Once its records move to the target, the source account is closed: it can no longer sign in
        and stays on record marked as merged. Preview the change first.
      </Banner>

      <Form className="flex flex-wrap items-end gap-4" method="get">
        <Field label="Source (closed after merge)">
          <Select
            defaultValue={sourceUserId || undefined}
            name="sourceUserId"
            options={userOptions}
            placeholder="Select the source user…"
          />
        </Field>
        <Field label="Target (keeps the records)">
          <Select
            defaultValue={targetUserId || undefined}
            name="targetUserId"
            options={userOptions}
            placeholder="Select the target user…"
          />
        </Field>
        <Button type="submit">Preview merge</Button>
      </Form>
      {sameUser ? (
        <p className="text-sm text-danger">Source and target must be different users.</p>
      ) : null}
      {previewError ? (
        <Banner failure={previewError} title="Couldn't preview this merge" tone="danger" />
      ) : null}
      {actionData && !actionData.ok ? (
        <Banner failure={actionData.error} title="Couldn't merge these accounts" tone="danger" />
      ) : null}

      {preview ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {COUNT_FIELDS.map((f) => (
              <Card key={f.key}>
                <CardBody className="flex flex-col gap-1">
                  <span className="text-2xl font-semibold tabular-nums text-ink">
                    {preview.counts[f.key]}
                  </span>
                  <span className="text-sm text-muted">{f.label}</span>
                </CardBody>
              </Card>
            ))}
          </div>

          {preview.warnings.map((warning) => (
            <Banner key={warning.code} title={warning.message} tone="warn" />
          ))}

          {preview.items.length === 0 ? (
            <p className="text-sm text-muted">
              Nothing to move — the source account owns no records.
            </p>
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Kind</TH>
                  <TH>Record</TH>
                  <TH>Detail</TH>
                </tr>
              </THead>
              <tbody>
                {preview.items.map((item) => (
                  <tr key={`${item.refId}:${item.kind}`}>
                    <TD>
                      <Badge tone="neutral">{item.kind}</Badge>
                    </TD>
                    <TD>{item.label}</TD>
                    <TD className="text-muted">{item.detail}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <div className="flex items-center justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="danger">Merge accounts…</Button>
              </DialogTrigger>
              <DialogContent
                description="Every record the source account owns moves to the target. The source account is then closed: it can no longer sign in, and it stays on record permanently marked as merged. This can't be undone."
                title={`Merge ${sourceUser?.name ?? sourceUserId} into the target?`}
              >
                <Form method="post">
                  <input name="sourceUserId" type="hidden" value={sourceUserId} />
                  <input name="targetUserId" type="hidden" value={targetUserId} />
                  <input
                    name="confirmPrivileged"
                    type="hidden"
                    value={String(preview.requiresPrivilegedConfirm)}
                  />
                  {preview.requiresPrivilegedConfirm ? (
                    <p className="pb-4 text-sm text-danger">
                      This merge affects privileged records and requires an elevated confirmation.
                    </p>
                  ) : null}
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" variant="danger">
                      Merge accounts
                    </Button>
                  </DialogFooter>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      ) : null}

      <Button asChild className="self-start" variant="secondary">
        <Link to="/users">Back to users</Link>
      </Button>
    </div>
  );
}
