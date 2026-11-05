// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { cn } from "@steward-web/ui";
import { Check, Lock } from "lucide-react";

export const SETUP_STEPS = ["details", "domain", "test", "activate"] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

/**
 * A24's four-step stepper: "1 Details | 2 Domain verification | 3 IdP test | 4 Activate". A
 * passed step is green with a check, the one showing is plum, and a step not reached yet is
 * plain; Activate stays locked until both gates pass. A passed step can be opened again.
 */
export const SetupSteps = ({
  done,
  locked,
  onSelect,
  selected,
}: {
  done: ReadonlySet<SetupStep>;
  locked: ReadonlySet<SetupStep>;
  onSelect: (step: SetupStep) => void;
  selected: SetupStep;
}) => {
  const { t } = useTranslation("admin");
  return (
    <ol
      aria-label={t("organizations.setup.steps.label")}
      className="grid grid-cols-2 gap-1.5 text-sm font-semibold sm:grid-cols-4"
    >
      {SETUP_STEPS.map((step, index) => {
        const current = step === selected;
        const passed = done.has(step);
        const closed = locked.has(step) && !passed;
        return (
          <li key={step}>
            <button
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md px-2.5 py-[9px] text-left disabled:cursor-not-allowed",
                current
                  ? "bg-primary text-on-primary"
                  : passed
                    ? "bg-ok-soft text-ok"
                    : "bg-surface text-muted shadow-[inset_0_0_0_1px_var(--border)]",
              )}
              disabled={closed}
              onClick={() => onSelect(step)}
              type="button"
            >
              {passed && !current ? <Check aria-hidden="true" className="size-4" /> : null}
              {closed ? <Lock aria-hidden="true" className="size-4" /> : null}
              {`${index + 1} ${t(`organizations.setup.steps.${step}`)}`}
            </button>
          </li>
        );
      })}
    </ol>
  );
};
