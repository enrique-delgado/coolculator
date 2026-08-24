import { createContext, useContext } from "react";

export const THEME_MODES = ["light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

// Two sober/minimalist, two youthful/psychedelic — independent of light/dark.
export const COLOR_SCHEMES = ["slate", "graphite", "aurora", "carnival"] as const;
export type ColorScheme = (typeof COLOR_SCHEMES)[number];

export interface ThemeContextValue {
  mode: ThemeMode;
  scheme: ColorScheme;
  setMode(mode: ThemeMode): void;
  setScheme(scheme: ColorScheme): void;
  toggleMode(): void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
