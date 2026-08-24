import type { ApiErrorCode } from "../../../api/types";
import { formatNumber, MAX_INPUT_LENGTH } from "../format";
import type { BinaryOperation } from "../calculatorTypes";

export interface CalculatorState {
  display: string;
  previousOperand: number | null;
  pendingOperation: BinaryOperation | null;
  overwrite: boolean;
  memory: number;
  errorCode: ApiErrorCode | null;
  isLoading: boolean;
}

export const initialCalculatorState: CalculatorState = {
  display: "0",
  previousOperand: null,
  pendingOperation: null,
  overwrite: true,
  memory: 0,
  errorCode: null,
  isLoading: false,
};

export type CalculatorAction =
  | { type: "DIGIT"; digit: string }
  | { type: "DECIMAL" }
  | { type: "BACKSPACE" }
  | { type: "CLEAR" }
  // Bookkeeping only — no calculation needed yet (first operator press, or
  // the operator was changed before a new number was typed).
  | { type: "SET_OPERATOR"; operation: BinaryOperation; operand: number }
  | { type: "API_START" }
  | { type: "API_SUCCESS_CHAIN"; result: number; nextOperation: BinaryOperation }
  | { type: "API_SUCCESS_EQUALS"; result: number }
  | { type: "API_SUCCESS_UNARY"; result: number }
  | { type: "API_ERROR"; code: ApiErrorCode }
  | { type: "MEMORY_RECALL" }
  | { type: "MEMORY_CLEAR" }
  | { type: "MEMORY_ADD" }
  | { type: "MEMORY_SUBTRACT" };

// resetKeepingMemory is used by CLEAR and API_ERROR — memory is explicit,
// separate state a user manages with its own buttons, so nothing else
// should silently erase it (see docs/00-decisions.md, D3).
function resetKeepingMemory(
  state: CalculatorState,
  overrides: Partial<CalculatorState> = {},
): CalculatorState {
  return { ...initialCalculatorState, memory: state.memory, ...overrides };
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction,
): CalculatorState {
  switch (action.type) {
    case "DIGIT": {
      if (state.errorCode) {
        return resetKeepingMemory(state, { display: action.digit, overwrite: false });
      }
      if (state.overwrite) {
        return { ...state, display: action.digit === "0" ? "0" : action.digit, overwrite: false };
      }
      if (state.display === "0") {
        return { ...state, display: action.digit };
      }
      if (state.display.replace(/[-.]/g, "").length >= MAX_INPUT_LENGTH) {
        return state;
      }
      return { ...state, display: state.display + action.digit };
    }

    case "DECIMAL": {
      if (state.errorCode) {
        return resetKeepingMemory(state, { display: "0.", overwrite: false });
      }
      if (state.overwrite) {
        return { ...state, display: "0.", overwrite: false };
      }
      if (state.display.includes(".")) return state;
      return { ...state, display: state.display + "." };
    }

    case "BACKSPACE": {
      if (state.errorCode || state.overwrite) return state;
      const next = state.display.slice(0, -1);
      if (next === "" || next === "-") {
        return { ...state, display: "0", overwrite: true };
      }
      return { ...state, display: next };
    }

    case "CLEAR":
      return resetKeepingMemory(state);

    case "SET_OPERATOR":
      return {
        ...state,
        previousOperand: action.operand,
        pendingOperation: action.operation,
        overwrite: true,
        errorCode: null,
      };

    case "API_START":
      return { ...state, isLoading: true, errorCode: null };

    case "API_SUCCESS_CHAIN":
      return {
        ...state,
        display: formatNumber(action.result),
        previousOperand: action.result,
        pendingOperation: action.nextOperation,
        overwrite: true,
        isLoading: false,
      };

    case "API_SUCCESS_EQUALS":
      return {
        ...state,
        display: formatNumber(action.result),
        previousOperand: null,
        pendingOperation: null,
        overwrite: true,
        isLoading: false,
      };

    case "API_SUCCESS_UNARY":
      // Deliberately leaves previousOperand/pendingOperation untouched, so
      // e.g. "5 + √9 =" chains correctly to 8, not just "3".
      return { ...state, display: formatNumber(action.result), overwrite: true, isLoading: false };

    case "API_ERROR":
      return resetKeepingMemory(state, { errorCode: action.code });

    case "MEMORY_RECALL":
      return { ...state, display: formatNumber(state.memory), overwrite: true, errorCode: null };

    case "MEMORY_CLEAR":
      return { ...state, memory: 0 };

    case "MEMORY_ADD":
      return { ...state, memory: state.memory + Number(state.display) };

    case "MEMORY_SUBTRACT":
      return { ...state, memory: state.memory - Number(state.display) };

    default:
      return state;
  }
}
