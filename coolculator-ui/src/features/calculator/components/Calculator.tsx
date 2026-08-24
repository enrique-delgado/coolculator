import type { CalculatorApi } from "../../../api/calculatorApi";
import { useCalculator } from "../hooks/useCalculator";
import { useKeyboardInput } from "../hooks/useKeyboardInput";

import { Display } from "./Display";
import { Keypad } from "./Keypad";

export function Calculator({ api }: { api: CalculatorApi }) {
  const calc = useCalculator(api);
  useKeyboardInput(calc);

  return (
    <div className="calculator">
      <Display state={calc.state} />
      <Keypad {...calc} />
    </div>
  );
}
