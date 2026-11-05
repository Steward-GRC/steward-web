// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import { useTranslation } from "@steward-web/i18n";
import { cn, Switch, type TextSize, usePreferences } from "@steward-web/ui";
import { PersonStanding, X } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";

const SIZES: readonly { size: TextSize; text: string }[] = [
  { size: "small", text: "text-xs" },
  { size: "default", text: "text-sm" },
  { size: "large", text: "text-base" },
  { size: "x-large", text: "text-lg" },
];

/** The browser's speech, when it has one. */
const speechOf = (): null | SpeechSynthesis =>
  (globalThis as { speechSynthesis?: null | SpeechSynthesis }).speechSynthesis ?? null;

/** What "Read" reads: the page's main content, without the shell around it. */
const mainText = () => {
  const main = document.querySelector("main");
  return (main?.textContent || main?.textContent || "").trim();
};

/** "Read aloud": Read, Pause, Resume and Stop over the page's main content, at a speed and voice. */
const ReadAloud = () => {
  const { t } = useTranslation("shell");
  const labelId = useId();
  const [speech, setSpeech] = useState<null | SpeechSynthesis>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);

  useEffect(() => {
    const synth = speechOf();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the browser's speech is only readable after hydration
    setSpeech(synth);
    if (!synth) return;
    const load = () => setVoices(synth.getVoices());
    load();
    synth.addEventListener?.("voiceschanged", load);
    return () => synth.removeEventListener?.("voiceschanged", load);
  }, []);

  if (!speech) {
    return (
      <div className="flex flex-col gap-2">
        <b className="text-[13px]">{t("accessibility.read.title")}</b>
        <p className="text-[13px] text-muted">{t("accessibility.read.unavailable")}</p>
      </div>
    );
  }

  const read = () => {
    speech.cancel();
    const utterance = new SpeechSynthesisUtterance(mainText());
    utterance.rate = rate;
    utterance.voice = voices.find((v) => v.name === voice) ?? null;
    speech.speak(utterance);
  };
  const button =
    "inline-flex h-9 items-center rounded-md border border-border-strong px-3 text-sm hover:bg-sunken";

  return (
    <div aria-labelledby={labelId} className="flex flex-col gap-2" role="group">
      <b className="text-[13px]" id={labelId}>
        {t("accessibility.read.title")}
      </b>
      <div className="flex flex-wrap gap-1.5">
        <button
          className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-semibold text-on-primary hover:bg-primary-hover"
          onClick={read}
          type="button"
        >
          {t("accessibility.read.read")}
        </button>
        <button className={button} onClick={() => speech.pause()} type="button">
          {t("accessibility.read.pause")}
        </button>
        <button className={button} onClick={() => speech.resume()} type="button">
          {t("accessibility.read.resume")}
        </button>
        <button className={button} onClick={() => speech.cancel()} type="button">
          {t("accessibility.read.stop")}
        </button>
      </div>
      <div className="grid grid-cols-[60px_1fr] items-center gap-2 text-[13px]">
        <label htmlFor={`${labelId}-speed`}>{t("accessibility.read.speed")}</label>
        <input
          aria-valuetext={t("accessibility.read.speedValue", { rate })}
          className="accent-[var(--primary)]"
          id={`${labelId}-speed`}
          max={2}
          min={0.5}
          onChange={(event) => setRate(Number(event.target.value))}
          step={0.25}
          type="range"
          value={rate}
        />
        <label htmlFor={`${labelId}-voice`}>{t("accessibility.read.voice")}</label>
        <select
          className="h-[34px] rounded-md border border-control bg-surface px-2.5 text-sm"
          id={`${labelId}-voice`}
          onChange={(event) => setVoice(event.target.value)}
          value={voice}
        >
          <option value="">{t("accessibility.read.systemVoice")}</option>
          {voices.map((v) => (
            <option key={v.voiceURI || v.name} value={v.name}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

/** One Display switch: its label, then the switch. */
const Toggle = ({
  checked,
  children,
  onChange,
}: {
  checked: boolean;
  children: ReactNode;
  onChange: (on: boolean) => void;
}) => (
  <label className="flex h-10 items-center justify-between gap-3">
    {children}
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
);

/**
 * Accessibility options (H12): text size, the display switches (high contrast, reduced motion,
 * readable spacing, underlined links), read aloud, and Reset. Every choice applies at once
 * and saves to this browser. `onClose` adds the header's close button.
 */
export const AccessibilityPanel = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useTranslation("shell");
  const { preferences, reset, update } = usePreferences();
  const titleId = useId();
  const sizeName = useId();
  return (
    <section aria-labelledby={titleId} className="text-base text-ink">
      <div className="flex items-center gap-2.5 border-b border-border px-[18px] py-4">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-on-primary">
          <PersonStanding aria-hidden="true" className="size-[18px]" />
        </span>
        <h2 className="text-md font-bold" id={titleId}>
          {t("accessibility.title")}
        </h2>
        {onClose ? (
          <button
            aria-label={t("accessibility.close")}
            className="ml-auto flex text-muted hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-col gap-4 px-[18px] py-3.5">
        <div className="flex flex-col gap-2">
          <b className="text-[13px]">{t("accessibility.textSize.title")}</b>
          <div
            aria-label={t("accessibility.textSize.title")}
            className="grid grid-cols-4 gap-0.5 rounded-lg bg-sunken p-[3px]"
            role="radiogroup"
          >
            {SIZES.map(({ size, text }) => (
              <label
                className={cn(
                  "flex h-[34px] cursor-pointer items-center justify-center rounded-md px-1 text-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus",
                  text,
                  preferences.textSize === size &&
                    "bg-surface font-semibold shadow-[var(--shadow-1)] hc:outline hc:outline-1",
                )}
                key={size}
              >
                <input
                  checked={preferences.textSize === size}
                  className="sr-only"
                  name={sizeName}
                  onChange={() => update({ textSize: size })}
                  type="radio"
                  value={size}
                />
                {t(`accessibility.textSize.${size}`)}
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <b className="mb-1.5 text-[13px]">{t("accessibility.display")}</b>
          <Toggle
            checked={preferences.theme === "hc"}
            onChange={(on) => update({ theme: on ? "hc" : "system" })}
          >
            {t("accessibility.highContrast")}
          </Toggle>
          <Toggle
            checked={preferences.reduceMotion}
            onChange={(on) => update({ reduceMotion: on })}
          >
            {t("accessibility.reduceMotion")}
          </Toggle>
          <Toggle
            checked={preferences.readableSpacing}
            onChange={(on) => update({ readableSpacing: on })}
          >
            {t("accessibility.readableSpacing")}
          </Toggle>
          <Toggle
            checked={preferences.underlineLinks}
            onChange={(on) => update({ underlineLinks: on })}
          >
            {t("accessibility.underlineLinks")}
          </Toggle>
        </div>
        <ReadAloud />
        <div className="flex items-center justify-between border-t border-border pt-3 text-[13px]">
          <span className="text-muted">{t("accessibility.saved")}</span>
          <button
            className="font-semibold text-primary hover:underline"
            onClick={reset}
            type="button"
          >
            {t("accessibility.reset")}
          </button>
        </div>
      </div>
    </section>
  );
};
