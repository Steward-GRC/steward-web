// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { AccountMergePreview } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import { refusalOf } from "@steward-web/shell";
import {
  Badge,
  Banner,
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogNote,
  EmptyState,
  type Failure,
  Select,
  Table,
  TD,
  TH,
  THead,
  TypeToConfirm,
} from "@steward-web/ui";
import { useState } from "react";
import { data, Form, Link, redirect } from "react-router";

import type { Route } from "./+types/users.merge";

import { likelyDuplicates } from "../users/duplicates";
import { mergeAccounts, previewAccountMerge } from "../users/merge.server";
import { listUsers } from "../users/users.server";

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

const COUNTS = [
  "policiesOwned",
  "raciGrants",
  "acknowledgmentsMoved",
  "acknowledgmentsDeduped",
  "workflowItems",
  "preferences",
] as const satisfies readonly (keyof AccountMergePreview["counts"])[];

const KINDS = new Set([
  "ACKNOWLEDGMENT",
  "POLICY_OWNER",
  "PREFERENCE",
  "RACI_GRANT",
  "WORKFLOW_ITEM",
]);

/**
 * Merge accounts (A21): the red irreversibility note, source → target on one line, "Preview
 * merge" beside "Merge accounts", then the six counts, the warnings and the records that move.
 * "Merge accounts" turns on once a preview has run and opens the confirm (D21).
 */
export default function MergeAccounts({ actionData, loaderData }: Route.ComponentProps) {
  const { preview, previewError, sourceUserId, targetUserId, users } = loaderData;
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);

  const options = users.map((u) => ({
    label: t("merge.person", { email: u.email, name: u.name }),
    value: u.userId,
  }));
  const sourceUser = users.find((u) => u.userId === sourceUserId);
  const targetUser = users.find((u) => u.userId === targetUserId);
  const sameUser = sourceUserId !== "" && sourceUserId === targetUserId;
  const duplicates = likelyDuplicates(users);

  return (
    <div className="flex w-full flex-col gap-3 p-4 md:p-6">
      <header>
        <h1 className="text-[26px] leading-[1.3] font-semibold">{t("merge.title")}</h1>
        <p className="text-base text-muted">{t("merge.subtitle")}</p>
      </header>
      <p className="rounded-lg bg-danger-soft px-3.5 py-2.5 font-semibold text-danger">
        {t("merge.irreversible")}
      </p>

      <section aria-labelledby="likely-duplicates" className="flex flex-col gap-2">
        <h2 className="text-base font-semibold" id="likely-duplicates">
          {t("merge.likely.title")}
        </h2>
        {duplicates.length === 0 ? (
          <p className="text-sm text-muted">{t("merge.likely.none")}</p>
        ) : (
          <ul aria-label={t("merge.likely.title")} className="flex flex-col gap-2">
            {duplicates.map((group) => (
              <li
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5"
                key={group.email}
              >
                <span className="min-w-0 flex-1 text-sm">
                  {group.accounts.map((account) => account.name).join(" · ")}
                  <span className="block text-muted">{group.email}</span>
                </span>
                <Button asChild size="sm" variant="secondary">
                  <Link
                    to={`/users/merge?sourceUserId=${encodeURIComponent(group.sourceUserId)}&targetUserId=${encodeURIComponent(group.targetUserId)}`}
                  >
                    {t("merge.likely.preview")}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Form className="flex flex-col gap-3" method="get">
        <div className="grid items-center gap-2 md:grid-cols-[1fr_30px_1fr]">
          <Select
            aria-label={t("merge.source")}
            className="h-10 px-2.5"
            defaultValue={sourceUserId || undefined}
            name="sourceUserId"
            options={options}
            placeholder={t("merge.chooseSource")}
          />
          <span aria-hidden="true" className="text-center text-muted max-md:rotate-90">
            →
          </span>
          <Select
            aria-label={t("merge.target")}
            className="h-10 px-2.5"
            defaultValue={targetUserId || undefined}
            name="targetUserId"
            options={options}
            placeholder={t("merge.chooseTarget")}
          />
        </div>
        {sameUser ? <p className="text-sm text-danger">{t("merge.sameUser")}</p> : null}
        {previewError ? (
          <Banner failure={previewError} title={t("merge.previewFailed")} tone="danger" />
        ) : null}
        {actionData && !actionData.ok ? (
          <Banner failure={actionData.error} title={t("merge.failed")} tone="danger" />
        ) : null}

        {preview ? (
          <ul
            aria-label={t("merge.counts.label")}
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
          >
            {COUNTS.map((key) => (
              <li
                className="flex flex-col gap-0.5 rounded-lg border border-border bg-surface p-2.5"
                key={key}
              >
                <b className="text-xl tabular-nums">{preview.counts[key]}</b>
                <span className="text-2xs text-muted">{t(`merge.counts.${key}`)}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex justify-end gap-2">
          <Button className="h-[38px] px-3.5 text-base" type="submit" variant="secondary">
            {t("merge.preview")}
          </Button>
          <Button
            className="h-[38px] px-3.5 text-base"
            disabled={!preview}
            onClick={() => setOpen(true)}
            variant="danger"
          >
            {t("merge.confirm.submit")}
          </Button>
        </div>
      </Form>

      {preview ? (
        <>
          {preview.warnings.map((warning) => (
            <Banner key={warning.code} title={warning.message} tone="warn" />
          ))}
          {preview.items.length === 0 ? (
            <EmptyState compact title={t("merge.nothing")} />
          ) : (
            <Table>
              <caption className="sr-only">{t("merge.items.label")}</caption>
              <THead>
                <tr>
                  <TH>{t("merge.items.kind")}</TH>
                  <TH>{t("merge.items.record")}</TH>
                  <TH>{t("merge.items.detail")}</TH>
                </tr>
              </THead>
              <tbody>
                {preview.items.map((item) => (
                  <tr key={`${item.refId}:${item.kind}`}>
                    <TD>
                      <Badge tone="neutral">
                        {KINDS.has(item.kind) ? t(`merge.items.kinds.${item.kind}`) : item.kind}
                      </Badge>
                    </TD>
                    <TD>{item.label}</TD>
                    <TD className="text-muted">{item.detail}</TD>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Dialog onOpenChange={setOpen} open={open}>
            <DialogContent
              className="sm:max-w-[560px]"
              hasInput
              size="wide"
              title={t("merge.confirm.title")}
              tone="danger"
            >
              <Form method="post">
                <input name="sourceUserId" type="hidden" value={sourceUserId} />
                <input name="targetUserId" type="hidden" value={targetUserId} />
                <input
                  name="confirmPrivileged"
                  type="hidden"
                  value={String(preview.requiresPrivilegedConfirm)}
                />
                <TypeToConfirm
                  before={
                    <>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <MergeAccountCard
                          email={sourceUser?.email}
                          label={t("merge.confirm.source")}
                          name={sourceUser?.name ?? sourceUserId}
                          tone="danger"
                        />
                        <MergeAccountCard
                          email={targetUser?.email}
                          label={t("merge.confirm.target")}
                          name={targetUser?.name ?? targetUserId}
                          tone="ok"
                        />
                      </div>
                      {preview.requiresPrivilegedConfirm ? (
                        <DialogNote tone="danger">{t("merge.privileged")}</DialogNote>
                      ) : null}
                    </>
                  }
                  phrase={sourceUser?.email ?? sourceUserId}
                >
                  {(confirmed) => (
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="secondary">{t("merge.cancel")}</Button>
                      </DialogClose>
                      <Button disabled={!confirmed} type="submit" variant="danger">
                        {t("merge.confirm.submit")}
                      </Button>
                    </DialogFooter>
                  )}
                </TypeToConfirm>
              </Form>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}

/** One side of the merge confirm (D21): the source closes, the target keeps the records. */
const MergeAccountCard = ({
  email,
  label,
  name,
  tone,
}: {
  email?: string;
  label: string;
  name: string;
  tone: "danger" | "ok";
}) => (
  <div
    className={
      tone === "danger"
        ? "rounded-[8px] p-3 shadow-[inset_0_0_0_1.5px_var(--danger)]"
        : "rounded-[8px] p-3 shadow-[inset_0_0_0_1.5px_var(--ok)]"
    }
  >
    <span
      className={
        tone === "danger"
          ? "block text-[10px] font-semibold tracking-[.06em] text-danger uppercase"
          : "block text-[10px] font-semibold tracking-[.06em] text-ok uppercase"
      }
    >
      {label}
    </span>
    <b className="block">{name}</b>
    {email ? <span className="block text-sm text-muted">{email}</span> : null}
  </div>
);
