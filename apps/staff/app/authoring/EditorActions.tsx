// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The editor's header actions (U11): the AI menu (U27), Submit for approval (D37) and the
// Actions menu with Discard draft (D3).
import { nextVersion, type VersionChange } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import {
  Button,
  type ChangeType,
  cn,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogNote,
  type Failure,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  notify,
  Spinner,
} from "@steward-web/ui";
import { Check, ChevronDown, Dot, FileText, PencilLine, Sparkles } from "lucide-react";
import { useId, useState } from "react";
import { useFetcher } from "react-router";

import { aiOffReason } from "./ai/aiOff";

const headerButton = "h-[38px] px-3";

/** What the gateway works out on submit (steward-gateway#52): shown only once it sends it. */
export interface VersionPreview {
  change: ChangeType;
  /** The published version it follows; absent for a first publish. */
  from?: string;
  reacknowledge: boolean;
  reasons: readonly string[];
  to: string;
}

type Answer = { error: Failure; ok: false } | { ok: true };

const CHANGES: ChangeType[] = ["major", "minor", "fix"];

/** D37's version block: "v2.0.0 → v3.0.0 Major · Worked out by Steward", why, and the type. */
const VersionBlock = ({ version }: { version: VersionPreview }) => {
  const { t } = useTranslation(["authoring", "policy"]);
  const name = useId();
  const [change, setChange] = useState(version.change);
  return (
    <div className="overflow-hidden rounded-lg shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex flex-wrap items-center gap-3 bg-primary-soft px-4 py-3.5">
        {version.from ? (
          <>
            <span className="font-mono text-[15px] font-medium text-muted line-through">
              v{version.from}
            </span>
            <span className="text-muted">→</span>
          </>
        ) : null}
        <span className="font-mono text-xl font-semibold text-on-primary-soft">v{version.to}</span>
        <span className="rounded-sm bg-primary px-[9px] py-[3px] text-xs font-semibold text-on-primary">
          {t(`change.${version.change}`, { ns: "policy" })}
        </span>
        <span className="ml-auto text-xs font-medium text-on-primary-soft">
          {t("editor.submit.workedOut")}
        </span>
      </div>
      <div className="flex flex-col gap-1.5 px-4 py-3 text-sm">
        <b>{t("editor.submit.why", { change: t(`change.${version.change}`, { ns: "policy" }) })}</b>
        {version.reasons.map((reason) => (
          <span className="flex gap-2" key={reason}>
            <Dot aria-hidden="true" className="size-4 shrink-0" />
            <span>{reason}</span>
          </span>
        ))}
        {version.reacknowledge ? (
          <span className="mt-1 rounded-md bg-sunken px-2.5 py-2">
            {t("editor.submit.reacknowledge")}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-t border-border px-4 py-2.5 text-sm">
        <span className="text-muted" id={name}>
          {t("editor.submit.changeType")}
        </span>
        <span
          aria-labelledby={name}
          className="flex gap-0.5 rounded-md bg-sunken p-[3px]"
          role="radiogroup"
        >
          {CHANGES.map((value) => (
            <label
              className={cn(
                "cursor-pointer rounded-sm px-2.5 py-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                change === value ? "bg-surface font-bold shadow-[var(--shadow-1)]" : "text-muted",
              )}
              key={value}
            >
              <input
                checked={change === value}
                className="sr-only"
                name="changeType"
                onChange={() => setChange(value)}
                type="radio"
                value={value}
              />
              {t(`change.${value}`, { ns: "policy" })}
            </label>
          ))}
        </span>
        <span className="text-muted">{t("editor.submit.lowering")}</span>
      </div>
    </div>
  );
};

/**
 * The author's pick for a revision of a published document (#156): Major, Minor or Fix, and the
 * version it gives. The service keeps no pick, so this is only worked out here and sent with the
 * submit; later screens still read the service's plain number.
 */
const ChangePicker = ({ published }: { published: string }) => {
  const { t } = useTranslation(["authoring", "policy"]);
  const name = useId();
  const [change, setChange] = useState<VersionChange>("minor");
  return (
    <div className="flex flex-col gap-3 rounded-lg px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[15px] font-medium text-muted line-through">
          v{published}
        </span>
        <span aria-hidden="true" className="text-muted">
          →
        </span>
        <span className="font-mono text-xl font-semibold" data-testid="next-version">
          v{nextVersion(published, change)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 text-sm">
        <span className="text-muted" id={name}>
          {t("editor.submit.changeType")}
        </span>
        <span
          aria-labelledby={name}
          className="flex gap-0.5 rounded-md bg-sunken p-[3px]"
          role="radiogroup"
        >
          {CHANGES.map((value) => (
            <label
              className={cn(
                "cursor-pointer rounded-sm px-2.5 py-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                change === value ? "bg-surface font-bold shadow-[var(--shadow-1)]" : "text-muted",
              )}
              key={value}
            >
              <input
                checked={change === value}
                className="sr-only"
                name="changeType"
                onChange={() => setChange(value)}
                type="radio"
                value={value}
              />
              {t(`change.${value}`, { ns: "policy" })}
            </label>
          ))}
        </span>
      </div>
    </div>
  );
};

/**
 * Submit for approval (D37). With a required section empty it says which instead of opening.
 * The dialog names the document and where it goes, shows the version Steward worked out when
 * the gateway sends one, and submits with Keep editing beside it.
 */
export const SubmitForApproval = ({
  disabled,
  document,
  incompleteButtons = 0,
  missing,
  published,
  version,
  workflow,
}: {
  disabled?: boolean;
  document: { number: string; title: string };
  /** Button cards with an empty label or link (bug log 183); the submit waits until none is. */
  incompleteButtons?: number;
  missing: readonly string[];
  /** The published version this revision follows; absent for a first publish. */
  published?: string;
  version?: VersionPreview;
  workflow?: string;
}) => {
  const { t } = useTranslation(["authoring", "common"]);
  const fetcher = useFetcher<Answer>();
  const [open, setOpen] = useState(false);
  const busy = fetcher.state !== "idle";
  const refusal = fetcher.data && !fetcher.data.ok ? fetcher.data.error : undefined;
  return (
    <>
      <Button
        className="h-[38px] px-4"
        disabled={disabled}
        onClick={() => {
          // a toast, not a box in the header: the header's container would hold a fixed box
          // against itself instead of the window (bug log 202)
          if (missing.length > 0) {
            notify.warning(t("editor.submit.fillRequired"), {
              description: t("editor.submit.empty", { sections: missing.join(", ") }),
            });
          } else if (incompleteButtons > 0) {
            notify.warning(t("editor.submit.fillButtons"), {
              description: t("editor.submit.buttonsIncomplete", { count: incompleteButtons }),
            });
          } else setOpen(true);
        }}
      >
        {t("editor.submit.action")}
      </Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent
          busy={busy}
          description={t("editor.submit.description", {
            number: document.number,
            title: document.title,
            workflow: workflow ?? t("editor.submit.approvers"),
          })}
          size={version ? "wide" : "standard"}
          title={t("editor.submit.title")}
        >
          <fetcher.Form method="post">
            <input name="intent" type="hidden" value="submit-review" />
            {version || published || refusal ? (
              <DialogBody>
                {version ? <VersionBlock version={version} /> : null}
                {!version && published ? <ChangePicker published={published} /> : null}
                {refusal ? (
                  <DialogNote tone="danger">
                    <b className="block">
                      {refusal.code === "FAILED_PRECONDITION"
                        ? t("editor.review.submitRefused")
                        : t("editor.review.submitFailed")}
                    </b>
                    {refusal.code === "FAILED_PRECONDITION"
                      ? t("editor.review.submitRefusedDetail")
                      : null}
                  </DialogNote>
                ) : null}
              </DialogBody>
            ) : null}
            <DialogFooter>
              <DialogClose asChild>
                <Button disabled={busy} variant="secondary">
                  {t("editor.submit.keepEditing")}
                </Button>
              </DialogClose>
              <Button busy={busy} type="submit">
                {t("editor.submit.action")}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

/** Actions ▾ (U11): Discard draft, through D3's wording for the draft's state. */
export const ActionsMenu = ({
  inReview,
  published,
}: {
  inReview: boolean;
  /** The published version a discard leaves live; absent for a never-published draft. */
  published?: string;
}) => {
  const { t } = useTranslation("authoring");
  const fetcher = useFetcher<Answer>();
  const [discarding, setDiscarding] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const live = published ? ` ${t("editor.discard.stillLive", { version: published })}` : "";
  const wording = inReview
    ? `${t("editor.discard.inReview")}${live}`
    : published
      ? `${t("editor.discard.published")}${live}`
      : t("editor.discard.draft");
  return (
    <>
      <Menu>
        <MenuTrigger asChild>
          <Button className="h-[38px] px-2.5" variant="secondary">
            {t("editor.actions.menu")}
            <ChevronDown aria-hidden="true" />
          </Button>
        </MenuTrigger>
        <MenuContent>
          {inReview ? (
            <MenuItem onSelect={() => setWithdrawing(true)}>{t("editor.withdraw.menu")}</MenuItem>
          ) : null}
          <MenuItem onSelect={() => setDiscarding(true)}>{t("editor.discard.menu")}</MenuItem>
        </MenuContent>
      </Menu>
      <Dialog onOpenChange={setWithdrawing} open={withdrawing}>
        <DialogContent
          busy={fetcher.state !== "idle"}
          description={t("editor.withdraw.description")}
          title={t("editor.withdraw.title")}
        >
          <fetcher.Form method="post">
            <input name="intent" type="hidden" value="withdraw" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("editor.withdraw.keep")}</Button>
              </DialogClose>
              <Button busy={fetcher.state !== "idle"} type="submit">
                {t("editor.withdraw.action")}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
      <Dialog onOpenChange={setDiscarding} open={discarding}>
        <DialogContent
          busy={fetcher.state !== "idle"}
          description={wording}
          title={t("editor.discard.title")}
          tone="danger"
        >
          <fetcher.Form method="post">
            <input name="intent" type="hidden" value="discard" />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">{t("editor.discard.keep")}</Button>
              </DialogClose>
              <Button busy={fetcher.state !== "idle"} type="submit" variant="danger">
                {t("editor.discard.action")}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export type AiChoice = "generate" | "improve" | "result" | "review" | "rewrite";

/** "working" while an AI task runs, "ready" when its result waits to be looked at. */
export type AiStatus = "idle" | "ready" | "working";

/**
 * The AI menu (U27): Generate a draft… on an empty draft or Improve draft…, then Rewrite a section…
 * and Review draft. It spins while a task runs and pulses with a saffron dot when a result is
 * ready, adding "AI result ready to review". With AI off it's a disabled button that says why
 * on hover and focus.
 */
export const AiMenu = ({
  available,
  emptyDraft = false,
  onChoose,
  reason,
  status = "idle",
}: {
  available: boolean;
  emptyDraft?: boolean;
  onChoose: (choice: AiChoice) => void;
  reason?: null | string;
  status?: AiStatus;
}) => {
  const { t } = useTranslation("authoring");
  const reasonId = useId();
  if (!available) {
    return (
      <span className="group relative">
        <Button
          aria-describedby={reasonId}
          aria-disabled="true"
          className={cn(headerButton, "opacity-55")}
          onClick={(event) => event.preventDefault()}
          variant="secondary"
        >
          <Sparkles aria-hidden="true" />
          {t("editor.aiMenu.label")}
        </Button>
        <span
          className="pointer-events-none absolute top-full right-0 z-[var(--z-popover)] mt-1 hidden w-max max-w-xs rounded-md bg-ink px-2 py-1 text-xs text-surface group-focus-within:block group-hover:block"
          id={reasonId}
          role="tooltip"
        >
          {t(aiOffReason(reason))}
        </span>
      </span>
    );
  }
  const items: { choice: AiChoice; icon: typeof FileText }[] = [
    { choice: emptyDraft ? "generate" : "improve", icon: FileText },
    { choice: "rewrite", icon: PencilLine },
    { choice: "review", icon: Check },
  ];
  const ready = status === "ready";
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button
          aria-busy={status === "working" || undefined}
          aria-label={
            status === "idle"
              ? undefined
              : t(ready ? "editor.aiMenu.labelReady" : "editor.aiMenu.labelWorking")
          }
          className={cn(
            headerButton,
            ready && "motion-safe:animate-[pulse_1.6s_ease-in-out_infinite]",
          )}
          data-ready={ready || undefined}
          variant="secondary"
        >
          <Sparkles aria-hidden="true" />
          {t("editor.aiMenu.label")}
          {status === "working" ? (
            <Spinner aria-hidden="true" className="size-3.5" />
          ) : ready ? (
            <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
          ) : (
            <ChevronDown aria-hidden="true" />
          )}
        </Button>
      </MenuTrigger>
      <MenuContent>
        {items.map(({ choice, icon: Icon }) => (
          <MenuItem key={choice} onSelect={() => onChoose(choice)}>
            <Icon aria-hidden="true" />
            {t(`editor.aiMenu.${choice}`)}
          </MenuItem>
        ))}
        {ready ? (
          <>
            <MenuSeparator />
            <MenuItem className="font-semibold text-primary" onSelect={() => onChoose("result")}>
              <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
              {t("editor.aiMenu.result")}
            </MenuItem>
          </>
        ) : null}
      </MenuContent>
    </Menu>
  );
};
