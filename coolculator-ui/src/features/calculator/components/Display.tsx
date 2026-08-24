import { useTranslation } from "react-i18next";

import type { CalculatorState } from "../state/calculatorReducer";
import { formatNumber } from "../format";

export function Display({ state }: { state: CalculatorState }) {
  const { t } = useTranslation();

  const pendingLine =
    state.pendingOperation !== null && state.previousOperand !== null
      ? `${formatNumber(state.previousOperand)} ${t(`keys.${state.pendingOperation}`)}`
      : " "; // Reserves the line's height so the layout doesn't jump.

  const valueLine = state.isLoading
    ? "…"
    : state.errorCode
      ? t(`errors.${state.errorCode}`)
      : state.display;

  return (
    <div className="display" role="status" aria-live="polite" aria-label={t("display.ariaLabel")}>
      <div className="display__pending">{pendingLine}</div>
      <div className={`display__value${state.errorCode ? " display__value--error" : ""}`}>
        {valueLine}
      </div>
    </div>
  );
}
