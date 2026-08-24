import { useTranslation } from "react-i18next";

import { SUPPORTED_LANGUAGES } from "../i18n/i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  return (
    <select
      value={i18n.resolvedLanguage ?? "en"}
      onChange={(e) => void i18n.changeLanguage(e.target.value)}
      aria-label={t("header.language")}
    >
      {SUPPORTED_LANGUAGES.map((lng) => (
        <option key={lng} value={lng}>
          {lng.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
