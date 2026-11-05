// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Passkey, SecondFactor } from "@steward-web/api-client";

import { createPasskey, passkeyCreationSupported } from "@steward-web/auth";
import { formatDate, useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  CodeInput,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  type Failure,
  Field,
  Input,
  QrCode,
} from "@steward-web/ui";
import { KeyRound, Lock, Mail, Smartphone } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useFetcher } from "react-router";

/** What the security page's action answers. */
export interface SecurityResult {
  error?: Failure;
  /** A step that worked: an app or passkey added, or the other sessions signed out. */
  ok?: "passkey" | "totp";
  /** A passkey registration under way: the browser's creation options and its handle. */
  passkey?: { optionsJson: string; sessionId: string };
  /** The confirming code was wrong. */
  problem?: "code";
  revoked?: number;
  /** An authenticator-app enrolment under way: the QR's URI. */
  totp?: { otpauthUri: string; secretMasked?: null | string };
}

const card = "overflow-hidden rounded-[10px] border border-border bg-surface";
const cardHead = "border-b border-border-strong bg-sunken px-4 py-3 text-[15px] font-semibold";
const row = "flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0";
const textAction = "text-sm font-semibold hover:underline";
const outline =
  "inline-flex h-[34px] items-center rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold hover:bg-sunken";

/** One method's row: its icon, name and line, then its actions. */
const MethodRow = ({
  actions,
  detail,
  icon,
  name,
}: {
  actions?: ReactNode;
  detail: string;
  icon: ReactNode;
  name: string;
}) => (
  <li className={row}>
    <span aria-hidden="true" className="flex text-muted">
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <b className="font-semibold">{name}</b>
      <span className="text-[13px] text-muted">{detail}</span>
    </span>
    {actions}
  </li>
);

/** Rename and Remove for an app or a passkey, each through its own small dialog. */
const MethodActions = ({
  methodId,
  name,
  removeIntent,
}: {
  methodId: string;
  name: string;
  removeIntent: { credentialId?: string; intent: "remove-passkey" | "remove-totp" };
}) => {
  const { t } = useTranslation(["settings", "common"]);
  const fetcher = useFetcher<SecurityResult>();
  const [renaming, setRenaming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const busy = fetcher.state !== "idle";
  return (
    <span className="flex items-center gap-3">
      <Dialog onOpenChange={setRenaming} open={renaming}>
        <button
          className={`${textAction} text-primary`}
          onClick={() => setRenaming(true)}
          type="button"
        >
          {t("security.rename")}
        </button>
        <DialogContent hasInput title={t("security.renameTitle", { name })}>
          <fetcher.Form method="post" onSubmit={() => setRenaming(false)}>
            <input name="intent" type="hidden" value="rename" />
            <input name="methodId" type="hidden" value={methodId} />
            <DialogBody>
              <Field label={t("security.nameLabel")}>
                <Input defaultValue={name} name="label" />
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t("actions.cancel", { ns: "common" })}
                </Button>
              </DialogClose>
              <Button busy={busy} type="submit">
                {t("security.renameConfirm")}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setRemoving} open={removing}>
        <button
          className={`${textAction} text-danger`}
          onClick={() => setRemoving(true)}
          type="button"
        >
          {t("security.remove")}
        </button>
        <DialogContent
          description={t("security.removeDescription")}
          title={t("security.removeTitle", { name })}
          tone="danger"
        >
          <fetcher.Form method="post" onSubmit={() => setRemoving(false)}>
            <input name="intent" type="hidden" value={removeIntent.intent} />
            {removeIntent.credentialId ? (
              <input name="credentialId" type="hidden" value={removeIntent.credentialId} />
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t("actions.cancel", { ns: "common" })}
                </Button>
              </DialogClose>
              <Button busy={busy} type="submit" variant="danger">
                {t("security.remove")}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </span>
  );
};

/** Adding an authenticator app: Set up, then the QR and its first code. */
const TotpSetup = () => {
  const { t } = useTranslation("settings");
  const begin = useFetcher<SecurityResult>();
  const confirm = useFetcher<SecurityResult>();
  const [code, setCode] = useState("");
  const enrolment = begin.data?.totp;
  if (!enrolment) {
    return (
      <begin.Form method="post">
        <input name="intent" type="hidden" value="totp-begin" />
        <button className={outline} disabled={begin.state !== "idle"} type="submit">
          {t("security.totp.setUp")}
        </button>
      </begin.Form>
    );
  }
  return (
    <confirm.Form className="flex w-full flex-col gap-3 rounded-lg bg-sunken p-3.5" method="post">
      <input name="intent" type="hidden" value="totp-confirm" />
      <div className="flex flex-wrap items-center gap-4">
        <QrCode label={t("security.totp.qrLabel")} value={enrolment.otpauthUri} />
        <p className="max-w-sm text-sm text-muted">{t("security.totp.scan")}</p>
      </div>
      <CodeInput
        aria-invalid={confirm.data?.problem === "code" || undefined}
        aria-label={t("security.totp.code")}
        name="code"
        onChange={setCode}
        value={code}
      />
      {confirm.data?.problem === "code" ? (
        <p className="text-sm text-danger" role="alert">
          {t("security.totp.wrongCode")}
        </p>
      ) : null}
      <div>
        <Button busy={confirm.state !== "idle"} disabled={code.length < 6} type="submit">
          {t("security.totp.confirm")}
        </Button>
      </div>
    </confirm.Form>
  );
};

/** Registering a passkey: the gateway's options, the browser's prompt, then the credential. */
const PasskeyRegister = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation("settings");
  const begin = useFetcher<SecurityResult>();
  const finish = useFetcher<SecurityResult>();
  const [failure, setFailure] = useState<"cancelled" | "failed">();
  // Only the browser knows; the server's page offers the button, and the browser takes it
  // back once it finds it can't create a passkey.
  const [supported, setSupported] = useState(true);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser's API is only readable after hydration
    setSupported(passkeyCreationSupported());
  }, []);
  const options = begin.data?.passkey;

  // Once the gateway answers with options, the browser's own prompt takes over.
  useEffect(() => {
    if (!options) return;
    let current = true;
    void createPasskey(options.optionsJson).then((answer) => {
      if (!current) return;
      if ("failure" in answer) {
        setFailure(answer.failure);
        return;
      }
      void finish.submit(
        {
          credentialJson: answer.credentialJson,
          intent: "passkey-finish",
          sessionId: options.sessionId,
        },
        { method: "post" },
      );
    });
    return () => {
      current = false;
    };
    // finish is a fetcher; its submit is stable for the component's life.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  useEffect(() => {
    if (finish.data?.ok === "passkey") onDone();
  }, [finish.data, onDone]);

  if (!supported)
    return <span className="text-sm text-muted">{t("security.passkey.unsupported")}</span>;
  return (
    <span className="flex flex-col items-end gap-1">
      <begin.Form method="post">
        <input name="intent" type="hidden" value="passkey-begin" />
        <button
          className={outline}
          disabled={begin.state !== "idle" || finish.state !== "idle"}
          type="submit"
        >
          {t("security.passkey.register")}
        </button>
      </begin.Form>
      {failure ? (
        <span className="text-xs text-danger" role="alert">
          {t(`security.passkey.${failure}`)}
        </span>
      ) : null}
    </span>
  );
};

export interface SecurityMethodsProps {
  /** The caller's second factors (`myFactors`): email, and the app when enrolled. */
  factors: readonly SecondFactor[];
  /** The caller's passkeys, or null when they couldn't be read. */
  passkeys: null | readonly Passkey[];
}

/**
 * Profile: security (U33). "Security methods": the email code (the baseline, which can't be
 * removed), the authenticator app (Set up, or Rename and Remove), each passkey (Rename and
 * Remove), and "Passwordless sign-in" with "Register a passkey". Then the sessions, with "Sign
 * out everywhere else".
 */
export const SecurityMethods = ({ factors, passkeys }: SecurityMethodsProps) => {
  const { t } = useTranslation("settings");
  const sessions = useFetcher<SecurityResult>();
  const [passkeyAdded, setPasskeyAdded] = useState(false);
  const totp = factors.find((factor) => factor.kind === "totp");
  const totpName = totp?.label || t("security.totp.name");

  return (
    <div className="flex flex-col gap-3.5">
      <section aria-labelledby="security-methods" className={card}>
        <h2 className={cardHead} id="security-methods">
          {t("security.title")}
        </h2>
        <ul>
          <MethodRow
            actions={<Lock aria-label={t("security.email.locked")} className="size-4 text-muted" />}
            detail={t("security.email.detail")}
            icon={<Mail className="size-[18px]" />}
            name={t("security.email.name")}
          />
          <MethodRow
            actions={
              totp ? (
                <MethodActions
                  methodId="totp"
                  name={totpName}
                  removeIntent={{ intent: "remove-totp" }}
                />
              ) : (
                <TotpSetup />
              )
            }
            detail={
              totp
                ? t("security.totp.detail", { date: formatDate(totp.enrolledAt, { fallback: "" }) })
                : t("security.totp.add")
            }
            icon={<Smartphone className="size-[18px]" />}
            name={totpName}
          />
          {(passkeys ?? []).map((passkey) => {
            const name = passkey.label || t("security.passkey.name");
            return (
              <MethodRow
                actions={
                  <MethodActions
                    methodId={passkey.id}
                    name={name}
                    removeIntent={{ credentialId: passkey.id, intent: "remove-passkey" }}
                  />
                }
                detail={t("security.passkey.detail", { date: formatDate(passkey.createdAt) })}
                icon={<KeyRound className="size-[18px]" />}
                key={passkey.id}
                name={name}
              />
            );
          })}
          <MethodRow
            actions={<PasskeyRegister onDone={() => setPasskeyAdded(true)} />}
            detail={t("security.passwordless.detail")}
            icon={<KeyRound className="size-[18px]" />}
            name={t("security.passwordless.name")}
          />
        </ul>
      </section>
      {passkeyAdded ? (
        <p className="rounded-lg bg-ok-soft px-3.5 py-2.5 text-[13px] text-ok" role="status">
          {t("security.passkey.registered")}
        </p>
      ) : null}

      <section aria-labelledby="security-sessions" className={card}>
        <h2 className={cardHead} id="security-sessions">
          {t("security.sessions.title")}
        </h2>
        <sessions.Form className="flex flex-wrap items-center gap-3 px-4 py-3" method="post">
          <input name="intent" type="hidden" value="revoke-sessions" />
          <p className="min-w-0 flex-1 text-sm text-muted">{t("security.sessions.detail")}</p>
          <button className={outline} disabled={sessions.state !== "idle"} type="submit">
            {t("security.sessions.signOut")}
          </button>
        </sessions.Form>
        {sessions.data?.revoked === undefined ? null : (
          <p className="border-t border-border px-4 py-2.5 text-[13px] text-ok" role="status">
            {t("security.sessions.done", { count: sessions.data.revoked })}
          </p>
        )}
        {sessions.data?.error ? (
          <Banner
            className="m-3"
            failure={sessions.data.error}
            title={t("security.sessions.failed")}
            tone="danger"
          />
        ) : null}
      </section>
    </div>
  );
};
