import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { CalculatorApi } from "../../api/calculatorApi";
import { FRONTEND_VERSION } from "../../config/about";
import { logger } from "../../logging/logger";

interface AboutDialogProps {
  api: CalculatorApi;
  onClose: () => void;
  // Passed as props rather than imported directly from config/about, so
  // this component's rendering (including the empty-value placeholders) is
  // fully driven by its inputs and testable without env-var/module
  // mocking. App.tsx is the one place that reads config/about's values.
  authorName: string;
  authorEmail: string;
  githubUrl: string;
}

type BackendVersionState =
  { status: "loading" } | { status: "loaded"; version: string } | { status: "error" };

export function AboutDialog({
  api,
  onClose,
  authorName,
  authorEmail,
  githubUrl,
}: AboutDialogProps) {
  const { t } = useTranslation();
  const [backend, setBackend] = useState<BackendVersionState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    api
      .getInfo()
      .then((info) => {
        if (!cancelled) setBackend({ status: "loaded", version: info.version });
      })
      .catch((err: unknown) => {
        // The About panel is informational — a failed lookup here isn't a
        // calculation error, so it degrades to "Unavailable" rather than
        // the shared error-code display the calculator itself uses.
        logger.error("failed to load backend info for About panel", err);
        if (!cancelled) setBackend({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const year = new Date().getFullYear();

  return (
    <div className="about-backdrop" onClick={onClose} role="presentation">
      <div
        className="about-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="about-dialog-title">{t("about.title")}</h2>

        <dl>
          <dt>{t("about.frontendVersion")}</dt>
          <dd>{FRONTEND_VERSION}</dd>

          <dt>{t("about.backendVersion")}</dt>
          <dd>
            {backend.status === "loading" && t("about.backendVersionLoading")}
            {backend.status === "loaded" && backend.version}
            {backend.status === "error" && t("about.backendVersionUnavailable")}
          </dd>

          <dt>{t("about.repository")}</dt>
          <dd>
            {githubUrl ? (
              <a href={githubUrl} target="_blank" rel="noreferrer">
                {githubUrl}
              </a>
            ) : (
              t("about.repositoryPlaceholder")
            )}
          </dd>

          <dt>{t("about.author")}</dt>
          <dd>
            {authorName || t("about.authorNamePlaceholder")}
            {authorEmail ? ` — ${authorEmail}` : ""}
          </dd>
        </dl>

        <p>{t("about.copyright", { year })}</p>
        <p>{t("about.contribute")}</p>

        <button type="button" className="about-dialog__close" onClick={onClose}>
          {t("about.close")}
        </button>
      </div>
    </div>
  );
}
