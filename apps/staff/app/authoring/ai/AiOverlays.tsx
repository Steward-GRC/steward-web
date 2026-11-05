// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The editor's three AI overlays (Authoring D13): Rewrite a section, the Review suggestion
// sheet (original beside suggested, Discard or Apply to draft) and the AI review sheet
// (findings grouped Blocker, Warning, Note, each with a jump to its section).
import type { ReworkChoice } from "@steward-web/editor-steward";

import { useTranslation } from "@steward-web/i18n";
import {
  Button,
  cn,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  Input,
  SideSheetBody,
  SideSheetContent,
} from "@steward-web/ui";
import { AiJobProgress, type AiJobStage } from "@steward-web/ui/domain";
import { Info, OctagonX, RefreshCw, TriangleAlert } from "lucide-react";
import { useId, useState } from "react";

import type { FindingSeverity, ReviewFinding } from "./results";

export interface SectionChoice {
  key: string;
  title: string;
}

const control =
  "h-10 w-full rounded-md border border-control bg-surface px-2.5 text-base text-ink focus-visible:border-primary";

/** D13 "Rewrite a section": the section, Rewrite or Clarify, and an optional instruction. */
export const RewriteSectionDialog = ({
  busy,
  onOpenChange,
  onSuggest,
  open,
  sections,
}: {
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggest: (request: { choice: ReworkChoice; instruction: string; sectionKey: string }) => void;
  open: boolean;
  sections: readonly SectionChoice[];
}) => {
  const { t } = useTranslation("ai");
  const ids = useId();
  const [sectionKey, setSectionKey] = useState(sections[0]?.key ?? "");
  const [choice, setChoice] = useState<ReworkChoice>("rewrite");
  const [instruction, setInstruction] = useState("");
  const chosen = sections.some((section) => section.key === sectionKey)
    ? sectionKey
    : (sections[0]?.key ?? "");

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        busy={busy}
        description={t("rewrite.description")}
        hasInput
        title={t("rewrite.title")}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSuggest({ choice, instruction: instruction.trim(), sectionKey: chosen });
          }}
        >
          <DialogBody>
            <div className="flex flex-col gap-[5px]">
              <label className="text-sm font-medium" htmlFor={`${ids}-section`}>
                {t("rewrite.section")}
              </label>
              <select
                className={control}
                id={`${ids}-section`}
                onChange={(event) => setSectionKey(event.target.value)}
                value={chosen}
              >
                {sections.map((section) => (
                  <option key={section.key} value={section.key}>
                    {section.title}
                  </option>
                ))}
              </select>
            </div>
            <div
              aria-label={t("rewrite.kind")}
              className="flex h-10 rounded-md bg-sunken p-[3px]"
              role="radiogroup"
            >
              {(["rewrite", "clarify"] as const).map((value) => (
                <label
                  className={cn(
                    "flex flex-1 cursor-pointer items-center justify-center rounded-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                    choice === value && "bg-surface font-semibold",
                  )}
                  key={value}
                >
                  <input
                    checked={choice === value}
                    className="sr-only"
                    name={`${ids}-kind`}
                    onChange={() => setChoice(value)}
                    type="radio"
                    value={value}
                  />
                  {t(`rewrite.${value}`)}
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-[5px]">
              <label className="text-sm font-medium" htmlFor={`${ids}-instruction`}>
                {t("rewrite.instruction")}
              </label>
              <Input
                id={`${ids}-instruction`}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder={t("rewrite.instructionHint")}
                value={instruction}
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">{t("rewrite.cancel")}</Button>
            </DialogClose>
            <Button busy={busy} type="submit">
              {t("rewrite.suggest")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const SheetFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex shrink-0 justify-end gap-2 border-t border-border px-[18px] py-3">
    {children}
  </div>
);

/** A labelled column of D13's Review suggestion: "ORIGINAL" or "SUGGESTED" over the text. */
const Column = ({
  children,
  className,
  label,
  labelClassName,
}: {
  children: React.ReactNode;
  className?: string;
  label: string;
  labelClassName?: string;
}) => {
  const id = useId();
  return (
    <section
      aria-labelledby={id}
      className={cn("flex flex-col gap-1.5 px-[18px] py-3.5", className)}
    >
      <h3
        className={cn(
          "text-[11px] font-semibold tracking-[.06em] text-muted uppercase",
          labelClassName,
        )}
        id={id}
      >
        {label}
      </h3>
      <p className="font-serif text-[15px] leading-[1.55] whitespace-pre-line">{children}</p>
    </section>
  );
};

/**
 * D13 "Review suggestion": the original beside the suggestion, then Discard or Apply to draft.
 * While the suggestion is on its way it shows the job's progress instead.
 */
export const SuggestionSheet = ({
  error,
  onApply,
  onOpenChange,
  onRetry,
  open,
  original,
  stage,
  suggested,
}: {
  error?: null | string;
  onApply: () => void;
  onOpenChange: (open: boolean) => void;
  onRetry?: () => void;
  open: boolean;
  original: string;
  stage?: AiJobStage;
  suggested?: null | string;
}) => {
  const { t } = useTranslation("ai");
  const ready = typeof suggested === "string" && (!stage || stage === "done");
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <SideSheetContent className="sm:w-[520px]" title={t("suggestion.title")}>
        <SideSheetBody className="gap-0 p-0">
          {ready ? (
            <div className="grid grid-cols-1 sm:grid-cols-2">
              <Column className="border-border sm:border-r" label={t("suggestion.original")}>
                {original}
              </Column>
              <Column
                className="bg-primary-soft"
                label={t("suggestion.suggested")}
                labelClassName="text-on-primary-soft"
              >
                {suggested}
              </Column>
            </div>
          ) : (
            <AiJobProgress
              className="px-[18px] py-4"
              error={error}
              onRetry={onRetry}
              stage={stage ?? "queued"}
            />
          )}
        </SideSheetBody>
        <SheetFooter>
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            {t("suggestion.discard")}
          </Button>
          {ready ? <Button onClick={onApply}>{t("suggestion.apply")}</Button> : null}
        </SheetFooter>
      </SideSheetContent>
    </Dialog>
  );
};

const SEVERITY_ORDER: FindingSeverity[] = ["blocker", "warn", "info"];

const SEVERITY_STYLE: Record<
  FindingSeverity,
  { className: string; icon: typeof Info; label: "blocker" | "note" | "warning" }
> = {
  blocker: { className: "bg-danger-soft text-danger", icon: OctagonX, label: "blocker" },
  info: { className: "bg-info-soft text-info", icon: Info, label: "note" },
  warn: { className: "bg-warn-soft text-warn", icon: TriangleAlert, label: "warning" },
};

/**
 * D13 "AI review": a pre-submit gap check, its findings grouped Blocker, Warning, Note, each
 * with "Jump to §n" when it names a section, or "No gaps found". Re-run review starts again.
 */
export const AiReviewSheet = ({
  error,
  findings,
  onJump,
  onOpenChange,
  onRerun,
  open,
  sections,
  stage,
}: {
  error?: null | string;
  findings: readonly ReviewFinding[];
  onJump: (sectionKey: string) => void;
  onOpenChange: (open: boolean) => void;
  onRerun: () => void;
  open: boolean;
  sections: readonly SectionChoice[];
  stage: AiJobStage;
}) => {
  const { t } = useTranslation("ai");
  const ordered = SEVERITY_ORDER.flatMap((severity) =>
    findings.filter((finding) => finding.severity === severity),
  );
  const working = stage !== "done";
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <SideSheetContent
        busy={stage !== "done" && stage !== "failed"}
        className="sm:w-[520px]"
        description={t("reviewSheet.description")}
        title={t("reviewSheet.title")}
      >
        <SideSheetBody className="gap-2 px-3.5 py-2.5">
          {working ? (
            <AiJobProgress className="px-1 py-2" error={error} onRetry={onRerun} stage={stage} />
          ) : ordered.length === 0 ? (
            <p className="px-1 py-2 text-sm text-muted">{t("reviewSheet.none")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {ordered.map((finding, index) => {
                const { className, icon: Icon, label } = SEVERITY_STYLE[finding.severity];
                const position = sections.findIndex(
                  (section) => section.key === finding.sectionKey,
                );
                return (
                  <li
                    className={cn("flex items-start gap-2.5 rounded-lg px-3 py-2.5", className)}
                    key={`${finding.severity}-${index}`}
                  >
                    <Icon aria-hidden="true" className="mt-0.5 size-4 flex-none" />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <h3 className="text-sm font-bold">
                        {t(`finding.${label}`)} · {finding.finding}
                      </h3>
                      {finding.suggestion ? (
                        <p className="text-[13px] text-ink">{finding.suggestion}</p>
                      ) : null}
                    </div>
                    {position === -1 ? null : (
                      <Button
                        className="h-auto shrink-0 p-0 font-semibold whitespace-nowrap text-current"
                        onClick={() => onJump(finding.sectionKey!)}
                        variant="link"
                      >
                        {t("reviewSheet.jump", { number: position + 1 })}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </SideSheetBody>
        <SheetFooter>
          <Button disabled={working && stage !== "failed"} onClick={onRerun} variant="secondary">
            <RefreshCw aria-hidden="true" />
            {t("reviewSheet.rerun")}
          </Button>
        </SheetFooter>
      </SideSheetContent>
    </Dialog>
  );
};
