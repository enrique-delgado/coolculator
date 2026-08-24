import { useEffect } from "react";

import type { BinaryOperation } from "../calculatorTypes";

interface KeyboardActions {
  inputDigit(digit: string): void;
  inputDecimal(): void;
  backspace(): void;
  clear(): void;
  selectOperator(operation: BinaryOperation): void;
  equals(): void;
}

// Direct single-key shortcuts, layered on top of full keyboard operability
// that every button already has natively (Tab to focus, Enter/Space to
// activate — see Keypad.tsx). Deliberately covers only keys with an
// unambiguous, discoverable meaning: digits, the four basic operators,
// '^' for power, '%' for percentage, Enter/'=' for equals, Escape to
// clear, Backspace to delete. Square root and the four memory operations
// have no standard single-key convention on a normal keyboard, so they're
// reachable via Tab/Enter only rather than an invented mnemonic no one
// would guess without being told.
export function useKeyboardInput({
  inputDigit,
  inputDecimal,
  backspace,
  clear,
  selectOperator,
  equals,
}: KeyboardActions): void {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (/^[0-9]$/.test(event.key)) {
        inputDigit(event.key);
        return;
      }

      switch (event.key) {
        case ".":
        case ",":
          inputDecimal();
          break;
        case "+":
          selectOperator("add");
          break;
        case "-":
          selectOperator("subtract");
          break;
        case "*":
          selectOperator("multiply");
          break;
        case "/":
          event.preventDefault(); // Firefox binds bare "/" to quick-find.
          selectOperator("divide");
          break;
        case "^":
          selectOperator("pow");
          break;
        case "%":
          selectOperator("percentage");
          break;
        case "Enter":
        case "=":
          event.preventDefault();
          equals();
          break;
        case "Escape":
          clear();
          break;
        case "Backspace":
          backspace();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, backspace, clear, selectOperator, equals]);
}
