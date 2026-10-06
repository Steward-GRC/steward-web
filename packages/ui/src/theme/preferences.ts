/** The accessibility panel's display options. They save to this browser only. */
export interface DisplayPreferences {
  readableSpacing: boolean;
  reduceMotion: boolean;
  textSize: TextSize;
  theme: Theme;
  underlineLinks: boolean;
}

export type TextSize = "default" | "large" | "small" | "x-large";

/** The display theme: follow the system, or force light, dark or high contrast. */
export type Theme = "dark" | "hc" | "light" | "system";

export const DEFAULT_PREFERENCES: DisplayPreferences = {
  readableSpacing: false,
  reduceMotion: false,
  textSize: "default",
  theme: "system",
  underlineLinks: false,
};

export const PREFERENCES_STORAGE_KEY = "steward.display";

const THEMES = new Set<Theme>(["dark", "hc", "light", "system"]);
const SIZES = new Set<TextSize>(["default", "large", "small", "x-large"]);

/** Read the saved preferences, ignoring anything malformed or unknown. */
export const parsePreferences = (raw: null | string): DisplayPreferences => {
  if (!raw) return DEFAULT_PREFERENCES;
  try {
    const value = JSON.parse(raw) as Partial<Record<keyof DisplayPreferences, unknown>>;
    return {
      readableSpacing: value.readableSpacing === true,
      reduceMotion: value.reduceMotion === true,
      textSize: SIZES.has(value.textSize as TextSize) ? (value.textSize as TextSize) : "default",
      theme: THEMES.has(value.theme as Theme) ? (value.theme as Theme) : "system",
      underlineLinks: value.underlineLinks === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

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
  if (preferences.textSize === "default") delete root.dataset.textSize;
  else root.dataset.textSize = preferences.textSize;
};

/**
 * A tiny script for the document head that applies the saved preferences before the first
 * paint, so a dark-theme reader never sees a light flash.
 */
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(PREFERENCES_STORAGE_KEY)})||"{}");var r=document.documentElement;var t=["dark","hc","light","system"].indexOf(p.theme)>=0?p.theme:"system";r.classList.add(t);if(p.readableSpacing===true)r.setAttribute("data-readable-spacing","");if(p.reduceMotion===true)r.setAttribute("data-reduce-motion","");if(p.underlineLinks===true)r.setAttribute("data-underline-links","");if(["small","large","x-large"].indexOf(p.textSize)>=0)r.setAttribute("data-text-size",p.textSize);}catch(e){document.documentElement.classList.add("system");}})();`;
