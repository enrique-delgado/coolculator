import { useTranslation } from "react-i18next";

import { formatNumber } from "../format";
import type { useCalculator } from "../hooks/useCalculator";

import { Key } from "./Key";

type Calculator = ReturnType<typeof useCalculator>;

/**
 * Every operation the requirements ask for, laid out as a standard 4-column
 * calculator grid. Buttons are plain, natively focusable <button>s (via
 * Key) placed in the same order as the visual grid (CSS Grid's default
 * auto-placement — no `order`/explicit line overrides), so the browser's
 * native Tab order already matches the visual layout with no explicit
 * `tabIndex` needed. Every operation is therefore reachable by mouse, by
 * Tab + Enter/Space, or a mix of both.
 */
export function Keypad(calc: Calculator) {
  const { t } = useTranslation();
  const { state } = calc;
  const memoryTooltip = t("memory.tooltip", { value: formatNumber(state.memory) });

  return (
    <div className="keypad">
      <MemoryKey calc={calc} tooltip={memoryTooltip} action="memoryClear" />
      <MemoryKey calc={calc} tooltip={memoryTooltip} action="memoryRecall" />
      <MemoryKey calc={calc} tooltip={memoryTooltip} action="memoryAdd" />
      <MemoryKey calc={calc} tooltip={memoryTooltip} action="memorySubtract" />

      <Key variant="action" onClick={calc.clear} aria-label={t("keyLabels.clear")}>
        {t("keys.clear")}
      </Key>
      <Key variant="action" onClick={calc.backspace} aria-label={t("keyLabels.backspace")}>
        {t("keys.backspace")}
      </Key>
      <Key variant="action" onClick={calc.sqrt} aria-label={t("keyLabels.sqrt")}>
        {t("keys.sqrt")}
      </Key>
      <OperatorKey calc={calc} operation="pow" />

      <Digit calc={calc} digit="7" />
      <Digit calc={calc} digit="8" />
      <Digit calc={calc} digit="9" />
      <OperatorKey calc={calc} operation="divide" />

      <Digit calc={calc} digit="4" />
      <Digit calc={calc} digit="5" />
      <Digit calc={calc} digit="6" />
      <OperatorKey calc={calc} operation="multiply" />

      <Digit calc={calc} digit="1" />
      <Digit calc={calc} digit="2" />
      <Digit calc={calc} digit="3" />
      <OperatorKey calc={calc} operation="subtract" />

      <OperatorKey calc={calc} operation="percentage" />
      <Digit calc={calc} digit="0" />
      <Key variant="digit" onClick={calc.inputDecimal} aria-label={t("keyLabels.decimal")}>
        {t("keys.decimal")}
      </Key>
      <OperatorKey calc={calc} operation="add" />

      <Key
        variant="equals"
        className="key--span-4"
        onClick={calc.equals}
        aria-label={t("keyLabels.equals")}
      >
        {t("keys.equals")}
      </Key>
    </div>
  );
}

function Digit({ calc, digit }: { calc: Calculator; digit: string }) {
  const { t } = useTranslation();
  return (
    <Key
      variant="digit"
      onClick={() => calc.inputDigit(digit)}
      aria-label={t("keyLabels.digit", { digit })}
    >
      {digit}
    </Key>
  );
}

type BinaryOperationKey = "add" | "subtract" | "multiply" | "divide" | "pow" | "percentage";

function OperatorKey({ calc, operation }: { calc: Calculator; operation: BinaryOperationKey }) {
  const { t } = useTranslation();
  return (
    <Key
      variant="operator"
      onClick={() => calc.selectOperator(operation)}
      aria-label={t(`keyLabels.${operation}`)}
    >
      {t(`keys.${operation}`)}
    </Key>
  );
}

type MemoryAction = "memoryClear" | "memoryRecall" | "memoryAdd" | "memorySubtract";

function MemoryKey({
  calc,
  tooltip,
  action,
}: {
  calc: Calculator;
  tooltip: string;
  action: MemoryAction;
}) {
  const { t } = useTranslation();
  return (
    <Key
      variant="memory"
      onClick={calc[action]}
      tooltip={tooltip}
      aria-label={`${t(`keyLabels.${action}`)} — ${tooltip}`}
    >
      {t(`keys.${action}`)}
    </Key>
  );
}
