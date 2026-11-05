// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { useId, useState } from "react";

import { Button } from "#ui/components/Button";
import { Checkbox } from "#ui/components/Controls";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "#ui/components/Overlays";
import { cn } from "#ui/lib/cn";

/** Someone who could take the seat, or who can't, with why ("author of this draft"). */
export interface ReassignCandidate {
  id: string;
  name: string;
  /** Why they can't take this seat; absent when they can. */
  refused?: string;
  role?: string;
}

/** The pick: an eligible approver, or (site admins only) someone outside the list. */
export type ReassignChoice =
  | { outside: string; reason: string }
  | { reason: string; toUserId: string };

export interface ReassignDialogProps {
  candidates: readonly ReassignCandidate[];
  /** Site admins may hand the seat to someone outside the list. */
  canPickOutside?: boolean;
  current: { name: string; role?: string };
  /** The refusal, when the reassignment fails. */
  error?: string;
  onOpenChange: (open: boolean) => void;
  onReassign: (choice: ReassignChoice) => void;
  open: boolean;
  /** The stage whose pending seat moves. */
  stageName: string;
}

const row = "flex h-[42px] items-center gap-2.5 px-3 text-base";

/**
 * Reassign approver (D14): hands a pending seat to someone else. It shows who holds the seat
 * now and the eligible approvers, each with their role; the ones who can't take it are marked
 * "Refused" with why. Site admins may also name someone outside the list, after acknowledging
 * it's recorded. A reason is always required. An outside click doesn't close it.
 */
export const ReassignDialog = ({
  canPickOutside,
  candidates,
  current,
  error,
  onOpenChange,
  onReassign,
  open,
  stageName,
}: ReassignDialogProps) => {
  const { t } = useTranslation("approvals");
  const listId = useId();
  const reasonId = useId();
  const outsideId = useId();
  const [picked, setPicked] = useState<string>();
  const [outside, setOutside] = useState<string>();
  const [acknowledged, setAcknowledged] = useState(false);
  const [reason, setReason] = useState("");

  const outsideReady = outside !== undefined && outside.trim() !== "" && acknowledged;
  const ready = reason.trim() !== "" && (outside === undefined ? Boolean(picked) : outsideReady);

  const submit = () => {
    if (!ready) return;
    onReassign(
      outside === undefined
        ? { reason: reason.trim(), toUserId: picked! }
        : { outside: outside.trim(), reason: reason.trim() },
    );
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        description={t("reassign.description", { stage: stageName })}
        hasInput
        title={t("reassign.title")}
      >
        <DialogBody className="flex flex-col gap-3 text-base">
          <div className="flex items-center gap-2.5 rounded-lg bg-sunken px-3 py-2.5">
            <span className="text-xs font-medium text-muted">{t("reassign.current")}</span>
            <b className="font-semibold">{current.name}</b>
            {current.role ? <span className="text-muted">· {current.role}</span> : null}
          </div>

          <span className="text-[13px] font-semibold" id={listId}>
            {t("reassign.eligible")}
          </span>
          <div
            aria-labelledby={listId}
            className="flex flex-col rounded-lg shadow-[inset_0_0_0_1px_var(--border)] hc:border hc:border-border"
            role="radiogroup"
          >
            {candidates.map((candidate, index) => {
              const chosen = outside === undefined && picked === candidate.id;
              return (
                <label
                  className={cn(
                    row,
                    index > 0 && "border-t border-border",
                    index === 0 && "rounded-t-lg",
                    index === candidates.length - 1 && "rounded-b-lg",
                    chosen && "bg-primary-soft font-semibold text-on-primary-soft",
                    candidate.refused ? "cursor-not-allowed text-muted" : "cursor-pointer",
                  )}
                  key={candidate.id}
                >
                  <input
                    checked={chosen}
                    className="accent-[var(--primary)]"
                    disabled={Boolean(candidate.refused)}
                    name="approver"
                    onChange={() => {
                      setOutside(undefined);
                      setPicked(candidate.id);
                    }}
                    type="radio"
                    value={candidate.id}
                  />
                  {candidate.name}{" "}
                  {candidate.role ? (
                    <span className={chosen ? "font-normal" : "text-muted"}>
                      · {candidate.role}
                    </span>
                  ) : null}
                  {candidate.refused ? (
                    <>
                      <span className="ml-auto rounded-[4px] bg-danger-soft px-[7px] py-0.5 text-[11px] font-semibold text-danger hc:outline hc:outline-1">
                        {t("reassign.refused")}
                      </span>
                      <span className="text-xs">{candidate.refused}</span>
                    </>
                  ) : null}
                </label>
              );
            })}
          </div>

          {canPickOutside ? (
            outside === undefined ? (
              <button
                className="self-start text-[13px] font-medium text-primary hover:text-primary-hover"
                onClick={() => setOutside("")}
                type="button"
              >
                {t("reassign.outside")}
              </button>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg bg-sunken p-3">
                <label
                  className="flex flex-col gap-1.5 text-[13px] font-medium"
                  htmlFor={outsideId}
                >
                  {t("reassign.outsideWho")}
                  <input
                    className="h-9 rounded-md border border-control bg-surface px-2.5 text-base font-normal"
                    id={outsideId}
                    onChange={(event) => setOutside(event.target.value)}
                    value={outside}
                  />
                </label>
                <label className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={acknowledged}
                    className="mt-0.5"
                    onCheckedChange={(value) => setAcknowledged(value === true)}
                  />
                  {t("reassign.outsideAcknowledge")}
                </label>
              </div>
            )
          ) : null}

          <label className="flex flex-col gap-1.5 text-[13px] font-medium" htmlFor={reasonId}>
            {t("reassign.reason")}
            <textarea
              className="h-[60px] rounded-md border border-control bg-surface px-2.5 py-2 text-base font-normal"
              id={reasonId}
              onChange={(event) => setReason(event.target.value)}
              value={reason}
            />
          </label>
          {error ? (
            <p className="text-sm font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              {t("reassign.cancel")}
            </Button>
          </DialogClose>
          <Button disabled={!ready} onClick={submit} type="button">
            {t("reassign.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
