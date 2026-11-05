// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { Session, User, UserDeletionPreview } from "@steward-web/api-client";

import { formatDayMonth, formatRelativeTime, useTranslation } from "@steward-web/i18n";
import {
  Banner,
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogNote,
  DialogTrigger,
  Field,
  StepUpDialog,
  Textarea,
} from "@steward-web/ui";
import { useEffect, useId, useState } from "react";
import { useFetcher } from "react-router";

import { DeleteUserDialog } from "./DeleteUserDialog";
import { CARD, failureOf, succeeded, type UserActionResult } from "./userActionResult";
import { browserOf } from "./userAgent";

const DAY = 86_400_000;

/** "now" for a session in use, "2 hours ago" within a day, else "2 Oct". */
const sessionTime = (session: Session, now: string) => {
  const at = session.lastSeenAt ?? session.authenticatedAt;
  const age = Date.now() - new Date(at).getTime();
  if (session.active && age < 5 * 60_000) return now;
  return age < DAY ? formatRelativeTime(at) : formatDayMonth(at);
};

/** "Act as this user" (D19): a reason, then the admin goes to staff as them. */
const ActAs = ({ user }: { user: User }) => {
  const { t } = useTranslation("admin");
  const act = useFetcher<UserActionResult>();
  const [reason, setReason] = useState("");
  // The gateway refuses to act as a site admin or the root.
  const allowed = !user.isRoot && !user.roles.includes("site-admin") && user.enabled;
  return (
    <div className={`${CARD} flex flex-col gap-2`}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <b>{t("users.advanced.actAs.title")}</b>
          <p className="text-sm text-muted">
            {allowed
              ? t("users.advanced.actAs.description", { name: user.name })
              : t("users.advanced.actAs.notAllowed")}
          </p>
        </div>
        <Dialog onOpenChange={(open) => (open ? undefined : setReason(""))}>
          <DialogTrigger asChild>
            <Button className="px-3" disabled={!allowed} variant="secondary">
              {t("users.advanced.actAs.action", { name: user.name })}
            </Button>
          </DialogTrigger>
          <DialogContent
            busy={act.state !== "idle"}
            description={t("users.advanced.actAs.dialogDescription")}
            hasInput
            title={t("users.advanced.actAs.dialogTitle", { name: user.name })}
            tone="primary"
          >
            <act.Form method="post">
              <input name="intent" type="hidden" value="act-as" />
              <DialogBody>
                <Field label={t("users.advanced.actAs.reason")}>
                  <Textarea
                    name="reason"
                    onChange={(event) => setReason(event.target.value)}
                    required
                    rows={2}
                    value={reason}
                  />
                </Field>
              </DialogBody>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="secondary">{t("users.advanced.actAs.cancel")}</Button>
                </DialogClose>
                <Button busy={act.state !== "idle"} disabled={!reason.trim()} type="submit">
                  {t("users.advanced.actAs.action", { name: user.name })}
                </Button>
              </DialogFooter>
            </act.Form>
          </DialogContent>
        </Dialog>
      </div>
      {failureOf(act) ? (
        <Banner failure={failureOf(act)} title={t("users.advanced.actAs.failed")} tone="danger" />
      ) : null}
    </div>
  );
};

/** Sessions: status, browser · address and time, with "Log out user" (D23). */
const Sessions = ({ sessions, user }: { sessions: readonly Session[]; user: User }) => {
  const { t } = useTranslation("admin");
  const logOut = useFetcher<UserActionResult>();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const statusOf = (session: Session) =>
    session.active
      ? t("users.advanced.sessions.active")
      : new Date(session.expiresAt).getTime() <= Date.now()
        ? t("users.advanced.sessions.expired")
        : t("users.advanced.sessions.revoked");

  return (
    <section
      aria-labelledby={titleId}
      className="overflow-hidden rounded-[10px] border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border-strong bg-sunken px-3.5 py-2.5">
        <b id={titleId}>{t("users.advanced.sessions.title")}</b>
        {user.deletedAt ? null : (
          <Dialog onOpenChange={setOpen} open={open}>
            <DialogTrigger asChild>
              <button className="text-sm font-semibold text-primary hover:underline" type="button">
                {t("users.advanced.sessions.logOut")}
              </button>
            </DialogTrigger>
            <DialogContent
              description={t("users.advanced.sessions.dialogDescription", { name: user.name })}
              title={t("users.advanced.sessions.dialogTitle", { name: user.name })}
            >
              <logOut.Form method="post" onSubmit={() => setOpen(false)}>
                <input name="intent" type="hidden" value="revoke-sessions" />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">{t("users.advanced.sessions.cancel")}</Button>
                  </DialogClose>
                  <Button type="submit">{t("users.advanced.sessions.logOut")}</Button>
                </DialogFooter>
              </logOut.Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {failureOf(logOut) ? (
        <Banner
          className="m-3"
          failure={failureOf(logOut)}
          title={t("users.advanced.sessions.failed")}
          tone="danger"
        />
      ) : null}
      {sessions.length === 0 ? (
        <p className="px-3.5 py-2.5 text-sm text-muted">{t("users.advanced.sessions.empty")}</p>
      ) : (
        <ul aria-labelledby={titleId}>
          {sessions.map((session) => (
            <li
              className="grid grid-cols-[80px_1fr] gap-x-2 border-b border-border px-3.5 py-[9px] text-sm last:border-b-0 sm:grid-cols-[80px_1fr_120px]"
              key={session.sessionId}
            >
              <span className={cn("font-semibold", session.active ? "text-ok" : "text-muted")}>
                {statusOf(session)}
              </span>
              <span className="min-w-0">
                <span>{browserOf(session.userAgent)}</span> ·{" "}
                <span className="font-mono">
                  {session.clientIp ?? t("users.advanced.sessions.unknownAddress")}
                </span>
              </span>
              <span className="text-muted max-sm:col-start-2">
                {sessionTime(session, t("users.advanced.sessions.now"))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

/** "Make this user the root" (D22), then the emailed code (D18). Only the current root. */
const MakeRoot = ({
  rootName,
  user,
  viewerIsRoot,
}: {
  rootName: string;
  user: User;
  viewerIsRoot: boolean;
}) => {
  const { t } = useTranslation("admin");
  const send = useFetcher<UserActionResult>();
  const grant = useFetcher<UserActionResult>();
  const [confirming, setConfirming] = useState(false);
  const [code, setCode] = useState(false);

  const codeSent = succeeded(send);
  useEffect(() => {
    if (codeSent) setCode(true);
  }, [codeSent]);
  const granted = succeeded(grant);
  useEffect(() => {
    if (granted) setCode(false);
  }, [granted]);

  const sendCode = () => void send.submit({ intent: "send-step-up" }, { method: "post" });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <b>{t("users.advanced.root.title")}</b>
          <p className="text-sm text-muted">
            {user.isRoot
              ? t("users.advanced.root.alreadyRoot")
              : t("users.advanced.root.onlyRoot", { name: rootName })}
          </p>
        </div>
        <Dialog onOpenChange={setConfirming} open={confirming}>
          <DialogTrigger asChild>
            <button
              className="flex h-[34px] items-center rounded-md px-3 text-sm font-semibold text-danger shadow-[inset_0_0_0_1.5px_var(--danger)] hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!viewerIsRoot || user.isRoot || Boolean(user.deletedAt)}
              type="button"
            >
              {t("users.advanced.root.action")}
            </button>
          </DialogTrigger>
          <DialogContent
            description={t("users.advanced.root.dialogDescription", { name: user.name })}
            title={t("users.advanced.root.dialogTitle", { name: user.name })}
            tone="danger"
          >
            <DialogBody>
              <DialogNote>{t("users.advanced.root.next")}</DialogNote>
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("users.advanced.root.cancel")}</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  setConfirming(false);
                  sendCode();
                }}
                variant="danger"
              >
                {t("users.advanced.root.confirm")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <StepUpDialog
        busy={grant.state !== "idle"}
        error={failureOf(grant) ? t("users.advanced.root.wrongCode") : undefined}
        note={t("users.advanced.root.stepUpNote")}
        onConfirm={(otp) => void grant.submit({ intent: "make-root", otp }, { method: "post" })}
        onOpenChange={setCode}
        onResend={sendCode}
        open={code}
      />
      {failureOf(send) ? (
        <Banner failure={failureOf(send)} title={t("users.advanced.root.failed")} tone="danger" />
      ) : null}
    </div>
  );
};

/**
 * Advanced (A20): "Act as this user" (D19), Sessions with "Log out user" (D23), then the red
 * box with "Make this user the root" (D22) and "Delete user" (D20).
 */
export const AdvancedTab = ({
  deletionPreview,
  people,
  rootName,
  sessions,
  user,
  viewerIsRoot,
}: {
  deletionPreview: null | UserDeletionPreview;
  people: readonly { id: string; name: string }[];
  rootName: string;
  sessions: readonly Session[];
  user: User;
  viewerIsRoot: boolean;
}) => {
  const { t } = useTranslation("admin");
  return (
    <div className="flex flex-col gap-3.5">
      {user.deletedAt ? null : <ActAs user={user} />}
      <Sessions sessions={sessions} user={user} />
      {user.deletedAt ? null : (
        <div className="flex flex-col gap-2.5 rounded-[10px] bg-surface p-3.5 shadow-[inset_0_0_0_1px_var(--danger)]">
          <MakeRoot rootName={rootName} user={user} viewerIsRoot={viewerIsRoot} />
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-2.5">
            <div className="min-w-0 flex-1">
              <b>{t("users.advanced.delete.title")}</b>
              <p className="text-sm text-muted">
                {user.isRoot
                  ? t("users.advanced.delete.rootProtected")
                  : t("users.advanced.delete.description")}
              </p>
            </div>
            <DeleteUserDialog
              disabled={user.isRoot || deletionPreview === null}
              people={people}
              preview={deletionPreview}
              user={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};
