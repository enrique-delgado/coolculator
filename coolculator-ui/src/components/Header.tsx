import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Header({ onOpenAbout }: { onOpenAbout: () => void }) {
  const { t } = useTranslation();

  return (
    <header className="header">
      <p className="header__title">{t("app.title")}</p>
      <div className="header__controls">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <button type="button" className="header__button" onClick={onOpenAbout}>
          {t("header.about")}
        </button>
      </div>
    </header>
  );
}
