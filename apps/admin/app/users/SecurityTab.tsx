// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { MfaFactor } from "@steward-web/api-client";

import { formatDate, useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  EmptyState,
  Field,
  Input,
} from "@steward-web/ui";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import { CARD, failureOf, type UserActionResult } from "./userActionResult";

const KINDS = new Set(["email", "passkey", "totp"]);

/** One second factor: its name, kind and date, with Rename and Reset unless it's the email code. */
const FactorRow = ({ factor, readOnly }: { factor: MfaFactor; readOnly: boolean }) => {
  const { t } = useTranslation("admin");
  const rename = useFetcher<UserActionResult>();
  const reset = useFetcher<UserActionResult>();
  const labelId = useId();
  const [renaming, setRenaming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const kind = KINDS.has(factor.kind) ? t(`users.security.kinds.${factor.kind}`) : factor.kind;
  const name = factor.label || kind;
  const editable = factor.kind !== "email" && !readOnly;
  const detail = factor.enrolledAt
    ? `${kind} · ${t("users.security.added", { date: formatDate(factor.enrolledAt) })}`
    : t("users.security.implicit");
  const failure = failureOf(rename) ?? failureOf(reset);

  return (
    <li className="flex flex-col gap-2 border-b border-border px-3.5 py-2.5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <b className="font-semibold">{name}</b>
          <p className="text-sm text-muted">{detail}</p>
        </div>
        {editable ? (
          <>
            <Dialog onOpenChange={setRenaming} open={renaming}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  {t("users.security.rename")}
                </Button>
              </DialogTrigger>
              <DialogContent hasInput title={t("users.security.renameTitle", { method: name })}>
                <rename.Form method="post" onSubmit={() => setRenaming(false)}>
                  <input name="intent" type="hidden" value="rename-factor" />
                  <input name="methodId" type="hidden" value={factor.id} />
                  <DialogBody>
                    <Field
                      hint={t("users.security.renameHint")}
                      label={t("users.security.renameLabel")}
                    >
                      <Input defaultValue={factor.label ?? ""} id={labelId} name="label" />
                    </Field>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">{t("users.security.cancel")}</Button>
                    </DialogClose>
                    <Button type="submit">{t("users.security.rename")}</Button>
                  </DialogFooter>
                </rename.Form>
              </DialogContent>
            </Dialog>
            <Dialog onOpenChange={setResetting} open={resetting}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  {t("users.security.reset")}
                </Button>
              </DialogTrigger>
              <DialogContent
                description={t("users.security.resetDescription")}
                title={t("users.security.resetTitle", { method: name })}
                tone="danger"
              >
                <reset.Form method="post" onSubmit={() => setResetting(false)}>
                  <input name="intent" type="hidden" value="reset-factor" />
                  <input name="methodId" type="hidden" value={factor.id} />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">{t("users.security.cancel")}</Button>
                    </DialogClose>
                    <Button type="submit" variant="danger">
                      {t("users.security.reset")}
                    </Button>
                  </DialogFooter>
                </reset.Form>
              </DialogContent>
            </Dialog>
          </>
        ) : null}
      </div>
      {failure ? (
        <Banner failure={failure} title={t("users.security.failed")} tone="danger" />
      ) : null}
    </li>
  );
};

/**
 * Security (A18): the person's second factors, each with Rename and Reset ("This removes the
 * method — the user must set it up again the next time they sign in."). The email code is
 * always there and can't be changed.
 */
export const SecurityTab = ({
  factors,
  readOnly,
}: {
  factors: readonly MfaFactor[];
  readOnly: boolean;
}) => {
  const { t } = useTranslation("admin");
  const titleId = useId();
  const enrolled = factors.filter((factor) => factor.kind !== "email");
  return (
    <section aria-labelledby={titleId} className={`${CARD} flex flex-col gap-2 p-0`}>
      <h2 className="px-3.5 pt-3 font-semibold" id={titleId}>
        {t("users.security.title")}
      </h2>
      {enrolled.length === 0 ? (
        <EmptyState className="py-4" title={t("users.security.empty")} />
      ) : null}
      <ul aria-labelledby={titleId} className="flex flex-col">
        {factors.map((factor) => (
          <FactorRow factor={factor} key={factor.id} readOnly={readOnly} />
        ))}
      </ul>
    </section>
  );
};
