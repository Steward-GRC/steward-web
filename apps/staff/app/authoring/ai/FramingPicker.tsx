// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
// The framing picker (#399): how an AI draft or revision should read. The default keeps the
// gateway's tone; Plain, Professional and Formal name a register; Your own wording takes the
// author's description, at most 500 characters. Shared by the generate and revise pages.
import { DraftFraming } from "@steward-web/api-client";
import { useTranslation } from "@steward-web/i18n";
import { cn, Textarea } from "@steward-web/ui";
import { useId } from "react";

import {
  CUSTOM_FRAMING_MAX,
  FRAMING_CHOICES,
  type FramingChoice,
  framingProblem,
  wordingLength,
} from "./framing";

export interface FramingValue {
  framing: FramingChoice;
  wording: string;
}

export const NO_FRAMING: FramingValue = { framing: "", wording: "" };

const OPTION_KEY = {
  "": "default",
  [DraftFraming.Custom]: "custom",
  [DraftFraming.Formal]: "formal",
  [DraftFraming.Plain]: "plain",
  [DraftFraming.Professional]: "professional",
} as const;

interface FramingPickerProps {
  onChange: (value: FramingValue) => void;
  /** The author has tried to move on or submit: say what is missing, not only what is too long. */
  tried: boolean;
  value: FramingValue;
}

export const FramingPicker = ({ onChange, tried, value }: FramingPickerProps) => {
  const { t } = useTranslation("ai");
  const ids = useId();
  const custom = value.framing === DraftFraming.Custom;
  const used = wordingLength(value.wording);
  const found = framingProblem(value.framing, value.wording);
  const problem = found === "tooLong" || tried ? found : null;
  const invalid = custom && problem !== null;

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{t("framing.legend")}</legend>
      {FRAMING_CHOICES.map((choice) => {
        const key = OPTION_KEY[choice];
        const chosen = value.framing === choice;
        return (
          <div
            className={cn(
              "grid grid-cols-[auto_1fr] items-start gap-x-2.5 rounded-md px-2.5 py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
              chosen
                ? "bg-primary-soft text-on-primary-soft"
                : "shadow-[inset_0_0_0_1px_var(--color-border)]",
            )}
            key={choice || "default"}
          >
            <input
              aria-describedby={`${ids}-${key}-hint`}
              checked={chosen}
              className="mt-1"
              id={`${ids}-${key}`}
              name={`${ids}-framing`}
              onChange={() => onChange({ ...value, framing: choice })}
              type="radio"
            />
            <label className="cursor-pointer text-sm font-semibold" htmlFor={`${ids}-${key}`}>
              {t(`framing.option.${key}.label`)}
            </label>
            <span className="col-start-2 text-xs text-muted" id={`${ids}-${key}-hint`}>
              {t(`framing.option.${key}.hint`)}
            </span>
          </div>
        );
      })}
      {custom ? (
        <div className="flex flex-col gap-[5px]">
          <label className="text-sm font-medium" htmlFor={`${ids}-wording`}>
            {t("framing.wording")}
          </label>
          <Textarea
            aria-describedby={`${ids}-count${invalid ? ` ${ids}-problem` : ""}`}
            aria-invalid={invalid ? true : undefined}
            className="min-h-14"
            id={`${ids}-wording`}
            onChange={(event) => onChange({ ...value, wording: event.target.value })}
            placeholder={t("framing.wordingHint")}
            value={value.wording}
          />
          <span
            className={cn("text-xs", used > CUSTOM_FRAMING_MAX ? "text-danger" : "text-muted")}
            id={`${ids}-count`}
          >
            {t("framing.count", { max: CUSTOM_FRAMING_MAX, used })}
          </span>
          {invalid ? (
            <span className="text-[13px] text-danger" id={`${ids}-problem`}>
              {t(`framing.error.${problem}`, { max: CUSTOM_FRAMING_MAX })}
            </span>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
};
