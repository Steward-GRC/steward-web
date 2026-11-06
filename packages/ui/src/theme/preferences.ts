// Copyright 2026 The Steward Authors
// SPDX-License-Identifier: Apache-2.0
import type { DatePreference } from "@steward-web/i18n";

/** The accessibility panel's display options. They save to this browser only. */
export interface DisplayPreferences {
  /** How dates are written; "system" is the app default. */
  dateFormat: DatePreference;
  readableSpacing: boolean;
  reduceMotion: boolean;
  /** How the tab underline moves; null until chosen, then it follows reduced motion. */
  tabTransition: null | TabTransition;
  textSize: TextSize;
  theme: Theme;
  underlineLinks: boolean;
}

export type TabTransition = "current" | "none" | "smooth";

export type TextSize = "default" | "large" | "small" | "x-large" | "x-small";

/** The display theme: follow the system, or force light, dark or high contrast. */
export type Theme = "dark" | "hc" | "light" | "system";

export const DEFAULT_PREFERENCES: DisplayPreferences = {
  dateFormat: "system",
  readableSpacing: false,
  reduceMotion: false,
  tabTransition: null,
  textSize: "default",
  theme: "system",
  underlineLinks: false,
};

export const PREFERENCES_STORAGE_KEY = "steward.display";

const DATE_FORMATS = new Set<DatePreference>(["dmy", "iso", "mdy", "system"]);
const THEMES = new Set<Theme>(["dark", "hc", "light", "system"]);
const TAB_TRANSITIONS = new Set<TabTransition>(["current", "none", "smooth"]);
const SIZES = new Set<TextSize>(["default", "large", "small", "x-large", "x-small"]);

/** Read the saved preferences, ignoring anything malformed or unknown. */
export const parsePreferences = (raw: null | string): DisplayPreferences => {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof DisplayPreferences, unknown>>;
    return {
      dateFormat: DATE_FORMATS.has(value.dateFormat as DatePreference)
        ? (value.dateFormat as DatePreference)
        : "system",
      readableSpacing: value.readableSpacing === true,
      reduceMotion: value.reduceMotion === true,
      tabTransition: TAB_TRANSITIONS.has(value.tabTransition as TabTransition)
        ? (value.tabTransition as TabTransition)
        : null,
      textSize: SIZES.has(value.textSize as TextSize) ? (value.textSize as TextSize) : "default",
      theme: THEMES.has(value.theme as Theme) ? (value.theme as Theme) : "system",
      underlineLinks: value.underlineLinks === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

/** The tab transition in force: the person's choice, else None when the system or the Reduce
 *  motion switch asks for less motion and Current otherwise. */
export const tabTransitionOf = (
  preferences: DisplayPreferences,
  systemReducesMotion: boolean,
): TabTransition =>
  preferences.tabTransition ??
  (preferences.reduceMotion || systemReducesMotion ? "none" : "current");

/** Put the preferences on the <html> element, where the theme's selectors read them. */
export const applyPreferences = (root: HTMLElement, preferences: DisplayPreferences): void => {
  root.classList.remove("dark", "hc", "light", "system");
  root.classList.add(preferences.theme);
  const flag = (name: string, on: boolean) => {
    if (on) root.setAttribute(name, "");
    else root.removeAttribute(name);
  };
  flag("data-readable-spacing", preferences.readableSpacing);
  flag("data-reduce-motion", preferences.reduceMotion);
  flag("data-underline-links", preferences.underlineLinks);
  root.dataset.tabTransition = tabTransitionOf(
    preferences,
    globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true,
  );
  if (preferences.textSize === "default") delete root.dataset.textSize;
  else root.dataset.textSize = preferences.textSize;
};

/**
 * A tiny script for the document head that applies the saved preferences before the first
 * paint, so a dark-theme reader never sees a light flash.
 */
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)})||"{}");var r=document.documentElement;var t=["dark","hc","light","system"].indexOf(p.theme)>=0?p.theme:"system";r.classList.add(t);if(p.readableSpacing===true)r.setAttribute("data-readable-spacing","");if(p.reduceMotion===true)r.setAttribute("data-reduce-motion","");if(p.underlineLinks===true)r.setAttribute("data-underline-links","");if(["x-small","small","large","x-large"].indexOf(p.textSize)>=0)r.setAttribute("data-text-size",p.textSize);}catch(e){document.documentElement.classList.add("system");}})();`;
