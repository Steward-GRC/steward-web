// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { HardResetRequest, HardResetResult } from "@steward-web/api-client";

import { formatDateTime, useTranslation } from "@steward-web/i18n";
import {
  Badge,
  Banner,
  Button,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogNote,
  type Failure,
  Field,
  Textarea,
  TypeToConfirm,
} from "@steward-web/ui";
import { useState } from "react";

import { HARD_RESET_PHRASE } from "./complianceErrors";
import { SettingsCard } from "./SettingsCard";

export interface HardResetCardProps {
  busy: boolean;
  /** The known refusal code of the last step, worded here. */
  errorCode?: string;
  /** Any other refusal of the last step. */
  failure?: Failure;
  /** True while the Compliance module is on; null when it could not be read. */
  moduleEnabled: boolean | null;
  /** Display names by user id; an id not in it shows as an unknown user. */
  names: Readonly<Record<string, string>>;
  onApprove: (requestId: string) => void;
  onCancel: (requestId: string) => void;
  onExecute: (requestId: string, confirmation: string) => void;
  onRequest: (reason: string) => void;
  requests: readonly HardResetRow[];
  /** What the last reset removed, once it ran. */
  result?: HardResetResult;
  viewer: { id: string; isRoot: boolean };
}

/** A request as the page lists it. */
export type HardResetRow = HardResetRequest;

const isOpen = (row: HardResetRow) => row.state === "pending" || row.state === "approved";

/** Closed requests are history; a few are enough to show what happened. */
const HISTORY = 3;

/**
 * The hard reset card, for site admins. The root admin asks (a reason), a different site admin
 * approves from the list, and the root admin runs the approved request by typing the phrase.
 * The buttons follow the roles: nobody approves their own request, only the requester cancels,
 * and only root asks or runs. The gateway checks all of it again; this only keeps the screen
 * from offering what would be refused.
 */
export const HardResetCard = ({
  busy,
  errorCode,
  failure,
  moduleEnabled,
  names,
  onApprove,
  onCancel,
  onExecute,
  onRequest,
  requests,
  result,
  viewer,
}: HardResetCardProps) => {
  const { t } = useTranslation("admin");
  const [reason, setReason] = useState("");
  const nameOf = (id: null | string | undefined) =>
    (id ? names[id] : undefined) ?? t("settings.hardReset.requests.unknownUser");

  const open = requests.filter((row) => isOpen(row));
  const history = requests.filter((row) => !isOpen(row)).slice(0, HISTORY);
  const shown = [...open, ...history];

  return (
    <SettingsCard
      description={t("settings.hardReset.description")}
      pill={
        open.length > 0
          ? t("settings.hardReset.pill.open", { count: open.length })
          : t("settings.hardReset.pill.none")
      }
      title={t("settings.hardReset.title")}
      tone={open.length > 0 ? "warn" : "neutral"}
    >
      <section aria-label={t("settings.hardReset.rules.heading")} className="text-sm">
        <b>{t("settings.hardReset.rules.heading")}</b>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-muted">
          {(["off", "hold", "kept", "record", "people"] as const).map((rule) => (
            <li key={rule}>{t(`settings.hardReset.rules.${rule}`)}</li>
          ))}
        </ul>
      </section>

      {moduleEnabled ? (
        <DialogNote tone="warn">{t("settings.hardReset.moduleOn")}</DialogNote>
      ) : null}

      {errorCode ? (
        <Banner title={t("settings.hardReset.failed")} tone="danger">
          {t(`settings.complianceErrors.${errorCode}`)}
        </Banner>
      ) : failure ? (
        <Banner failure={failure} title={t("settings.hardReset.failed")} tone="danger" />
      ) : null}

      {result ? (
        <Banner title={t("settings.hardReset.done.title")} tone="ok">
          <p>
            {t("settings.hardReset.done.body", {
              approvedBy: nameOf(result.approvedBy),
              count: result.casesDeleted,
              requestedBy: nameOf(result.requestedBy),
            })}
          </p>
          <p>{t("settings.hardReset.done.kept")}</p>
        </Banner>
      ) : null}

      {viewer.isRoot ? (
        open.length > 0 ? (
          <p className="text-sm text-muted">{t("settings.hardReset.request.open")}</p>
        ) : (
          <form
            className="flex flex-col gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (reason.trim() === "") return;
              onRequest(reason.trim());
              setReason("");
            }}
          >
            <b className="text-sm">{t("settings.hardReset.request.heading")}</b>
            <Field
              hint={t("settings.hardReset.request.reasonHint")}
              label={t("settings.hardReset.request.reason")}
            >
              <Textarea
                onChange={(event) => setReason(event.target.value)}
                rows={2}
                value={reason}
              />
            </Field>
            <div className="flex justify-end">
              <Button busy={busy} disabled={reason.trim() === ""} type="submit" variant="secondary">
                {t("settings.hardReset.request.submit")}
              </Button>
            </div>
          </form>
        )
      ) : (
        <p className="text-sm text-muted">{t("settings.hardReset.rootOnly")}</p>
      )}

      <section
        aria-label={t("settings.hardReset.requests.heading")}
        className="flex flex-col gap-2"
      >
        <b className="text-sm">{t("settings.hardReset.requests.heading")}</b>
        {shown.length === 0 ? (
          <p className="text-sm text-muted">{t("settings.hardReset.requests.empty")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {shown.map((row) => {
              const isRequester = row.requestedBy === viewer.id;
              return (
                <li
                  className="flex flex-col gap-1.5 rounded-lg border border-border px-3 py-2.5 text-sm"
                  key={row.id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone={row.state === "approved" ? "ok" : isOpen(row) ? "warn" : "neutral"}
                    >
                      {t(`settings.hardReset.requests.state.${row.state}`, {
                        defaultValue: row.state,
                      })}
                    </Badge>
                    <span className="text-muted">
                      {t("settings.hardReset.requests.asked", {
                        date: formatDateTime(row.requestedAt),
                        name: nameOf(row.requestedBy),
                      })}
                    </span>
                  </div>
                  <p className="break-words">{row.reason}</p>
                  {row.state === "pending" ? (
                    <p className="text-muted">
                      {t("settings.hardReset.requests.expires", {
                        date: formatDateTime(row.expiresAt),
                      })}
                    </p>
                  ) : null}
                  {row.state === "approved" ? (
                    <p className="text-muted">
                      {t("settings.hardReset.requests.approved", {
                        date: formatDateTime(row.approvedAt),
                        name: nameOf(row.approvedBy),
                      })}
                      {row.approvalExpiresAt
                        ? `. ${t("settings.hardReset.requests.approvalExpires", {
                            date: formatDateTime(row.approvalExpiresAt),
                          })}`
                        : ""}
                    </p>
                  ) : null}

                  {row.state === "pending" && isRequester ? (
                    <p className="text-muted">{t("settings.hardReset.requests.waitOther")}</p>
                  ) : null}
                  {row.state === "approved" && !viewer.isRoot ? (
                    <p className="text-muted">{t("settings.hardReset.requests.waitRoot")}</p>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    {row.state === "pending" && !isRequester ? (
                      <Button
                        busy={busy}
                        className="h-8 px-3"
                        onClick={() => onApprove(row.id)}
                        variant="secondary"
                      >
                        {t("settings.hardReset.requests.approve")}
                      </Button>
                    ) : null}
                    {row.state === "approved" && viewer.isRoot ? (
                      <ExecuteDialog
                        busy={busy}
                        moduleEnabled={moduleEnabled}
                        onExecute={(confirmation) => onExecute(row.id, confirmation)}
                      />
                    ) : null}
                    {isOpen(row) && isRequester ? (
                      <Button
                        busy={busy}
                        className="h-8 px-3"
                        onClick={() => onCancel(row.id)}
                        variant="secondary"
                      >
                        {t("settings.hardReset.requests.cancel")}
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </SettingsCard>
  );
};

/**
 * Running an approved request. The dialog sends the admin to export first (reporting has no
 * export of its own to call from here), needs a tick that they did or accept the loss, and
 * needs the phrase typed exactly. It cannot run while the module is on.
 */
const ExecuteDialog = ({
  busy,
  moduleEnabled,
  onExecute,
}: {
  busy: boolean;
  moduleEnabled: boolean | null;
  onExecute: (confirmation: string) => void;
}) => {
  const { t } = useTranslation("admin");
  const [open, setOpen] = useState(false);
  const [exported, setExported] = useState(false);
  return (
    <Dialog
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setExported(false);
      }}
      open={open}
    >
      <Button className="h-8 px-3" onClick={() => setOpen(true)} variant="danger">
        {t("settings.hardReset.requests.run")}
      </Button>
      <DialogContent
        busy={busy}
        description={t("settings.hardReset.dialog.description")}
        hasInput
        title={t("settings.hardReset.dialog.title")}
        tone="danger"
      >
        <TypeToConfirm
          before={
            <>
              <DialogNote tone="warn">
                <b>{t("settings.hardReset.dialog.exportHeading")}</b>{" "}
                {t("settings.hardReset.dialog.exportBody")}
              </DialogNote>
              <label className="flex items-start gap-2.5 text-sm">
                <Checkbox
                  checked={exported}
                  className="mt-0.5"
                  onCheckedChange={(checked) => setExported(checked === true)}
                />
                <span>{t("settings.hardReset.dialog.ack")}</span>
              </label>
              {moduleEnabled ? (
                <DialogNote tone="danger">{t("settings.hardReset.moduleOn")}</DialogNote>
              ) : null}
            </>
          }
          phrase={HARD_RESET_PHRASE}
        >
          {(confirmed) => (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("settings.hardReset.dialog.cancel")}</Button>
              </DialogClose>
              <Button
                busy={busy}
                disabled={!confirmed || !exported || moduleEnabled === true}
                onClick={() => {
                  setOpen(false);
                  setExported(false);
                  onExecute(HARD_RESET_PHRASE);
                }}
                variant="danger"
              >
                {t("settings.hardReset.dialog.confirm")}
              </Button>
            </DialogFooter>
          )}
        </TypeToConfirm>
      </DialogContent>
    </Dialog>
  );
};
