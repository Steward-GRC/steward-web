// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { type ReactNode, useId, useState } from "react";
import { Form } from "react-router";

import { useRegisterCommandActions } from "#ui/commands/CommandActions";
import { Button } from "#ui/components/Button";
import { Field } from "#ui/components/Field";
import { Textarea } from "#ui/components/Input";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "#ui/components/Overlays";
import { cn } from "#ui/lib/cn";

export interface DecisionPanelProps {
  busy?: boolean;
  /** Hidden fields the route's action needs (run, task, version). */
  children?: ReactNode;
  className?: string;
  /** The gateway's refusal, shown above the buttons. */
  error?: ReactNode;
  /** "One more approval publishes this as v3.0.0 (Major). Bob is notified either way." */
  note?: ReactNode;
}

const decide =
  "h-[48px] rounded-[8px] text-[15px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 md:h-[42px] md:rounded-md md:text-base";

type Decision = "approve" | "reject";

/**
 * The decision dialog the command bar opens ("I approve" / "I reject", bug log 57): the same
 * required comment and the same fields as the panel, with the one chosen decision to confirm.
 */
const DecisionDialog = ({
  busy,
  children,
  decision,
  error,
  onClose,
}: {
  busy?: boolean;
  children?: ReactNode;
  decision: Decision | null;
  error?: ReactNode;
  onClose: () => void;
}) => {
  const { t } = useTranslation(["approvals", "common"]);
  const [comment, setComment] = useState("");
  const ready = comment.trim().length > 0 && !busy;
  return (
    <Dialog
      onOpenChange={(next) => {
        if (!next) {
          setComment("");
          onClose();
        }
      }}
      open={decision !== null}
    >
      {decision ? (
        <DialogContent
          busy={busy}
          description={t(`approvals:review.decision.dialog.${decision}.description`)}
          hasInput
          title={t(`approvals:review.decision.dialog.${decision}.title`)}
          tone={decision === "reject" ? "danger" : "primary"}
        >
          <Form method="post">
            <DialogBody>
              {children}
              <Field
                hint={t("approvals:review.decision.commentHint")}
                label={t("approvals:review.decision.comment")}
              >
                <Textarea
                  name="comment"
                  onChange={(event) => setComment(event.target.value)}
                  required
                  value={comment}
                />
              </Field>
              {error ? (
                <p className="mt-2 text-sm font-medium text-danger" role="alert">
                  {error}
                </p>
              ) : null}
            </DialogBody>
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={busy} type="button" variant="secondary">
                  {t("common:actions.cancel")}
                </Button>
              </DialogClose>
              <Button
                disabled={!ready}
                name="intent"
                type="submit"
                value={decision}
                variant={decision === "reject" ? "danger" : "primary"}
              >
                {t(`approvals:review.decision.${decision}`)}
              </Button>
            </DialogFooter>
          </Form>
        </DialogContent>
      ) : null}
    </Dialog>
  );
};

/**
 * The decision panel (U25): sticky beside the diff on a desktop and a pinned footer on a phone
 * (U25m). "Decision comment" is required, so Reject (outlined danger) and Approve (primary)
 * stay off until there's one. It posts `intent` (approve or reject) and `comment` to the
 * route's action, with the caller's hidden fields.
 */
export const DecisionPanel = ({ busy, children, className, error, note }: DecisionPanelProps) => {
  const { t } = useTranslation("approvals");
  const [comment, setComment] = useState("");
  const titleId = useId();
  const commentId = useId();
  const hintId = useId();
  const ready = comment.trim().length > 0 && !busy;
  const [dialog, setDialog] = useState<Decision | null>(null);
  // The panel exists only while the person may decide here, so these are on the command bar
  // exactly when the page's own buttons are (same permissions).
  useRegisterCommandActions([
    { id: "approve", label: t("review.decision.command.approve"), run: () => setDialog("approve") },
    { id: "reject", label: t("review.decision.command.reject"), run: () => setDialog("reject") },
  ]);
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "z-[var(--z-sticky)] overflow-hidden bg-surface text-ink max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:border-t max-md:border-border-strong max-md:shadow-[0_-8px_24px_rgb(38_27_37/.08)] md:sticky md:top-4 md:rounded-lg md:border md:border-border md:shadow-[var(--shadow-3)]",
        className,
      )}
    >
      <h2
        className="px-4 pt-3 text-[15px] font-semibold md:border-b md:border-border-strong md:bg-sunken md:px-[18px] md:py-3.5 md:text-md"
        id={titleId}
      >
        {t("review.decision.title")}
      </h2>
      <Form
        className="flex flex-col gap-2.5 px-4 pt-2.5 pb-[22px] md:gap-3 md:px-[18px] md:py-4"
        method="post"
      >
        {children}
        {note ? <p className="hidden text-sm leading-normal text-muted md:block">{note}</p> : null}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium max-md:sr-only" htmlFor={commentId}>
            {t("review.decision.comment")}
          </label>
          <span className="text-xs text-muted max-md:sr-only" id={hintId}>
            {t("review.decision.commentHint")}
          </span>
          <textarea
            aria-describedby={hintId}
            className="h-[72px] w-full rounded-md border border-control bg-surface px-2.5 py-2 text-base leading-normal text-ink placeholder:text-muted focus-visible:border-2 focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--primary-soft)] focus-visible:outline-none md:h-[110px]"
            id={commentId}
            name="comment"
            onChange={(event) => setComment(event.target.value)}
            placeholder={t("review.decision.commentPhone")}
            required
            value={comment}
          />
        </div>
        {error ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <button
            className={cn(
              decide,
              "flex-1 text-danger shadow-[inset_0_0_0_1.5px_var(--danger)] hover:bg-danger-soft",
            )}
            disabled={!ready}
            name="intent"
            type="submit"
            value="reject"
          >
            {t("review.decision.reject")}
          </button>
          <button
            className={cn(
              decide,
              "flex-[1.4] bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active",
            )}
            disabled={!ready}
            name="intent"
            type="submit"
            value="approve"
          >
            {t("review.decision.approve")}
          </button>
        </div>
        <p className="text-xs text-muted max-md:hidden">{t("review.decision.recorded")}</p>
        <p className="text-xs text-muted md:hidden">{t("review.decision.phoneNote")}</p>
      </Form>
      <DecisionDialog busy={busy} decision={dialog} error={error} onClose={() => setDialog(null)}>
        {children}
      </DecisionDialog>
    </section>
  );
};
