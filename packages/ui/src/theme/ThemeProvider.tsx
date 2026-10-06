import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  applyPreferences,
  DEFAULT_PREFERENCES,
  type DisplayPreferences,
  parsePreferences,
  PREFERENCES_STORAGE_KEY,
} from "./preferences";

interface PreferencesContextValue {
  preferences: DisplayPreferences;
  reset: () => void;
  update: (change: Partial<DisplayPreferences>) => void;
}

const PreferencesContext = createContext<null | PreferencesContextValue>(null);

const read = (): DisplayPreferences => {
  try {
    return parsePreferences(globalThis.localStorage?.getItem(PREFERENCES_STORAGE_KEY) ?? null);
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

const write = (preferences: DisplayPreferences) => {
  try {
    globalThis.localStorage?.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage can be blocked; the choice still applies to this page.
  }
};

/** Holds the display preferences, applies them to <html> and saves them to this browser. */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // The server render has no storage, so it starts from the defaults and the boot script has
  // already applied the saved ones; the effect below catches the state up after hydration.
  const [preferences, setPreferences] = useState<DisplayPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after hydration
    setPreferences(read());
  }, []);

  useEffect(() => {
    applyPreferences(document.documentElement, preferences);
  }, [preferences]);

  const update = useCallback((change: Partial<DisplayPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...change };
      write(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    write(DEFAULT_PREFERENCES);
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = useMemo(() => ({ preferences, reset, update }), [preferences, reset, update]);
  return <PreferencesContext value={value}>{children}</PreferencesContext>;
};

export const usePreferences = (): PreferencesContextValue => {
  const value = use(PreferencesContext);
  if (!value) throw new Error("usePreferences needs a ThemeProvider above it");
  return value;
};
