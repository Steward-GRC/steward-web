// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { User } from "@steward-web/api-client";

import { useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogNote,
  Field,
  Input,
  notify,
  Switch,
} from "@steward-web/ui";
import { useEffect, useId, useState } from "react";
import { useFetcher } from "react-router";

import { CARD, failureOf, succeeded, type UserActionResult } from "./userActionResult";

/** D24: the generated password, masked with Show and Copy, shown this once. */
const NewPasswordDialog = ({
  name,
  onClose,
  password,
}: {
  name: string;
  onClose: () => void;
  password: string;
}) => {
  const { t } = useTranslation("admin");
  const id = useId();
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <Dialog onOpenChange={(open) => (open ? undefined : onClose())} open>
      <DialogContent
        description={t("users.profile.newPassword.description")}
        hasInput
        title={t("users.profile.newPassword.title", { name })}
        tone="primary"
      >
        <DialogBody>
          <label className="flex flex-col gap-[5px] text-sm font-medium" htmlFor={id}>
            {t("users.profile.newPassword.label")}
            <span className="flex h-10 items-center gap-2 rounded-md border border-border bg-sunken px-2.5">
              <input
                className="min-w-0 flex-1 bg-transparent font-mono text-base font-normal outline-none"
                id={id}
                readOnly
                type={shown ? "text" : "password"}
                value={password}
              />
              <button
                className="text-sm font-semibold text-primary"
                onClick={() => setShown((value) => !value)}
                type="button"
              >
                {shown ? t("users.profile.newPassword.hide") : t("users.profile.newPassword.show")}
              </button>
              <button
                className="text-sm font-semibold text-primary"
                onClick={() =>
                  void navigator.clipboard?.writeText(password).then(() => setCopied(true))
                }
                type="button"
              >
                {t("users.profile.newPassword.copy")}
              </button>
            </span>
          </label>
          {copied ? (
            <DialogNote tone="ok">{t("users.profile.newPassword.copied")}</DialogNote>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{t("users.profile.newPassword.close")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>{t("users.profile.newPassword.done")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Profile (A17): the read-only username, "Account enabled" (never for root), name and email for
 * a local account (a directory account's live in the directory), then "Reset password" with
 * "Generate & reset" and "Resend welcome email".
 */
export const ProfileTab = ({ user }: { user: User }) => {
  const { t } = useTranslation("admin");
  const save = useFetcher<UserActionResult>();
  const reset = useFetcher<UserActionResult>();
  const welcome = useFetcher<UserActionResult>();
  const enabledId = useId();
  const [password, setPassword] = useState<string>();
  const closed = Boolean(user.deletedAt);

  const generated = reset.state === "idle" && reset.data?.ok ? reset.data.password : undefined;
  useEffect(() => {
    if (generated) setPassword(generated);
  }, [generated]);
  const sent = succeeded(welcome);
  useEffect(() => {
    if (sent) notify.success(t("users.profile.welcome.sent"));
  }, [sent, t]);

  return (
    <div className="flex flex-col gap-3.5">
      <save.Form className={`${CARD} flex flex-col gap-3`} method="post">
        <input name="intent" type="hidden" value="save-profile" />
        <Field label={t("users.profile.username")}>
          <Input disabled readOnly value={user.username || t("users.none")} />
        </Field>
        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-3 text-sm" htmlFor={enabledId}>
            <Switch
              defaultChecked={user.enabled}
              disabled={user.isRoot || closed}
              id={enabledId}
              name="enabled"
              value="true"
            />
            {t("users.profile.enabled")}
          </label>
          {user.isRoot ? (
            <p className="text-sm text-muted">{t("users.profile.rootLocked")}</p>
          ) : null}
        </div>
        {user.localAccount ? (
          <>
            <Field label={t("users.profile.name")}>
              <Input defaultValue={user.name} disabled={closed} name="name" required />
            </Field>
            <Field label={t("users.profile.email")}>
              <Input
                defaultValue={user.email}
                disabled={closed}
                name="email"
                required
                type="email"
              />
            </Field>
          </>
        ) : (
          <p className="text-sm text-muted">{t("users.profile.federated")}</p>
        )}
        {failureOf(save) ? (
          <Banner failure={failureOf(save)} title={t("users.detail.failed")} tone="danger" />
        ) : null}
        <div className="flex items-center gap-3">
          <Button busy={save.state !== "idle"} disabled={closed} type="submit">
            {t("users.detail.save")}
          </Button>
          {succeeded(save) ? (
            <span className="text-sm font-semibold text-ok">{t("users.detail.saved")}</span>
          ) : null}
        </div>
      </save.Form>

      {user.localAccount && !closed ? (
        <div className={`${CARD} flex flex-wrap items-center gap-3`}>
          <div className="min-w-0 flex-1">
            <b>{t("users.profile.password.title")}</b>
            <p className="text-sm text-muted">{t("users.profile.password.description")}</p>
          </div>
          <reset.Form method="post">
            <input name="intent" type="hidden" value="reset-password" />
            <Button busy={reset.state !== "idle"} type="submit" variant="secondary">
              {t("users.profile.password.action")}
            </Button>
          </reset.Form>
        </div>
      ) : null}
      {failureOf(reset) ? (
        <Banner failure={failureOf(reset)} title={t("users.detail.failed")} tone="danger" />
      ) : null}

      {closed ? null : (
        <div className={`${CARD} flex flex-wrap items-center gap-3`}>
          <div className="min-w-0 flex-1">
            <b>{t("users.profile.welcome.title")}</b>
            <p className="text-sm text-muted">{t("users.profile.welcome.description")}</p>
          </div>
          <welcome.Form method="post">
            <input name="intent" type="hidden" value="resend-welcome" />
            <Button busy={welcome.state !== "idle"} type="submit" variant="secondary">
              {t("users.profile.welcome.action")}
            </Button>
          </welcome.Form>
        </div>
      )}
      {failureOf(welcome) ? (
        <Banner failure={failureOf(welcome)} title={t("users.detail.failed")} tone="danger" />
      ) : null}

      {password ? (
        <NewPasswordDialog
          name={user.name}
          onClose={() => setPassword(undefined)}
          password={password}
        />
      ) : null}
    </div>
  );
};
