import { useTranslation } from "react-i18next";

import { COLOR_SCHEMES, useTheme, type ColorScheme } from "../theme/ThemeContext";

export function ThemeSwitcher() {
  const { t } = useTranslation();
  const { mode, scheme, toggleMode, setScheme } = useTheme();

  return (
    <>
      <button
        type="button"
        className="header__button"
        onClick={toggleMode}
        aria-label={mode === "dark" ? t("header.lightMode") : t("header.darkMode")}
        title={mode === "dark" ? t("header.lightMode") : t("header.darkMode")}
      >
        {mode === "dark" ? "☀️" : "🌙"}
      </button>
      <select
        value={scheme}
        onChange={(e) => setScheme(e.target.value as ColorScheme)}
        aria-label={t("header.theme")}
      >
        {COLOR_SCHEMES.map((s) => (
          <option key={s} value={s}>
            {t(`themes.${s}`)}
          </option>
        ))}
      </select>
    </>
  );
}
