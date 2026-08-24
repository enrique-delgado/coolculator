import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  COLOR_SCHEMES,
  THEME_MODES,
  ThemeContext,
  type ColorScheme,
  type ThemeMode,
} from "./ThemeContext";

const MODE_STORAGE_KEY = "coolculator-theme-mode";
const SCHEME_STORAGE_KEY = "coolculator-theme-scheme";

function isThemeMode(value: string | null): value is ThemeMode {
  return value !== null && (THEME_MODES as readonly string[]).includes(value);
}

function isColorScheme(value: string | null): value is ColorScheme {
  return value !== null && (COLOR_SCHEMES as readonly string[]).includes(value);
}

function prefersDarkMode(): boolean {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

function readStoredMode(): ThemeMode {
  const stored = localStorage.getItem(MODE_STORAGE_KEY);
  if (isThemeMode(stored)) return stored;
  return prefersDarkMode() ? "dark" : "light";
}

function readStoredScheme(): ColorScheme {
  const stored = localStorage.getItem(SCHEME_STORAGE_KEY);
  return isColorScheme(stored) ? stored : "slate";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);
  const [scheme, setSchemeState] = useState<ColorScheme>(readStoredScheme);

  // Pure CSS switch: every color in the app comes from the custom
  // properties themes.css defines per [data-theme][data-scheme] pair, so
  // there's nothing to recompute in JS beyond these two attributes.
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.dataset.scheme = scheme;
  }, [mode, scheme]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(MODE_STORAGE_KEY, next);
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
    localStorage.setItem(SCHEME_STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, scheme, setMode, setScheme, toggleMode }),
    [mode, scheme, setMode, setScheme, toggleMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
