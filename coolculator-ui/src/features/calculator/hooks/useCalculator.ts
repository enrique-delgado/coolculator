import { useCallback, useReducer, useRef } from "react";

import { ApiError, isAbortError } from "../../../api/client";
import type { CalculatorApi } from "../../../api/calculatorApi";
import type { ApiErrorCode } from "../../../api/types";
import { logger } from "../../../logging/logger";
import type { BinaryOperation } from "../calculatorTypes";
import { calculatorReducer, initialCalculatorState } from "../state/calculatorReducer";

function errorCodeOf(err: unknown): ApiErrorCode {
  return err instanceof ApiError ? err.code : "NETWORK_ERROR";
}

// Orchestrates the calculator: owns the reducer, and is the one place that
// decides *when* a button press needs to call the backend (every actual
// arithmetic operation) versus when it's pure local bookkeeping (digit
// entry, memory — see docs/00-decisions.md, D3).
export function useCalculator(api: CalculatorApi) {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);

  // Tracks the one in-flight request, if any, so Clear can actually abort
  // it rather than just ignoring whatever response eventually arrives —
  // see the "fail-safe" note on RequestOptions in src/api/client.ts.
  const abortRef = useRef<AbortController | null>(null);

  const runCalculation = useCallback(
    (
      operation: BinaryOperation | "sqrt",
      operand1: number,
      operand2: number | undefined,
      onSuccess: (result: number) => void,
    ) => {
      const controller = new AbortController();
      abortRef.current = controller;
      dispatch({ type: "API_START" });

      void api
        .calculate(operation, operand1, operand2, { signal: controller.signal })
        .then(onSuccess)
        .catch((err: unknown) => {
          if (isAbortError(err)) return;
          logger.error(`calculation failed: ${operation}`, err);
          dispatch({ type: "API_ERROR", code: errorCodeOf(err) });
        })
        .finally(() => {
          if (abortRef.current === controller) abortRef.current = null;
        });
    },
    [api],
  );

  const inputDigit = useCallback(
    (digit: string) => {
      if (state.isLoading) return;
      dispatch({ type: "DIGIT", digit });
    },
    [state.isLoading],
  );

  const inputDecimal = useCallback(() => {
    if (state.isLoading) return;
    dispatch({ type: "DECIMAL" });
  }, [state.isLoading]);

  const backspace = useCallback(() => {
    if (state.isLoading) return;
    dispatch({ type: "BACKSPACE" });
  }, [state.isLoading]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: "CLEAR" });
  }, []);

  const selectOperator = useCallback(
    (operation: BinaryOperation) => {
      if (state.isLoading) return;
      const current = Number(state.display);

      if (state.previousOperand === null) {
        dispatch({ type: "SET_OPERATOR", operation, operand: current });
        return;
      }
      if (state.overwrite) {
        dispatch({ type: "SET_OPERATOR", operation, operand: state.previousOperand });
        return;
      }
      const previousOperand = state.previousOperand;
      const pendingOperation = state.pendingOperation as BinaryOperation;
      runCalculation(pendingOperation, previousOperand, current, (result) => {
        dispatch({ type: "API_SUCCESS_CHAIN", result, nextOperation: operation });
      });
    },
    [
      state.isLoading,
      state.display,
      state.previousOperand,
      state.overwrite,
      state.pendingOperation,
      runCalculation,
    ],
  );

  const equals = useCallback(() => {
    if (state.isLoading) return;
    if (state.pendingOperation === null || state.previousOperand === null) return;
    const current = Number(state.display);
    const previousOperand = state.previousOperand;
    const pendingOperation = state.pendingOperation;
    runCalculation(pendingOperation, previousOperand, current, (result) => {
      dispatch({ type: "API_SUCCESS_EQUALS", result });
    });
  }, [
    state.isLoading,
    state.pendingOperation,
    state.previousOperand,
    state.display,
    runCalculation,
  ]);

  const sqrt = useCallback(() => {
    if (state.isLoading) return;
    const current = Number(state.display);
    runCalculation("sqrt", current, undefined, (result) => {
      dispatch({ type: "API_SUCCESS_UNARY", result });
    });
  }, [state.isLoading, state.display, runCalculation]);

  const memoryRecall = useCallback(() => dispatch({ type: "MEMORY_RECALL" }), []);
  const memoryClear = useCallback(() => dispatch({ type: "MEMORY_CLEAR" }), []);
  const memoryAdd = useCallback(() => dispatch({ type: "MEMORY_ADD" }), []);
  const memorySubtract = useCallback(() => dispatch({ type: "MEMORY_SUBTRACT" }), []);

  return {
    state,
    inputDigit,
    inputDecimal,
    backspace,
    clear,
    selectOperator,
    equals,
    sqrt,
    memoryRecall,
    memoryClear,
    memoryAdd,
    memorySubtract,
  };
}
