import { describe, expect, it } from "vitest";

import {
  calculatorReducer,
  initialCalculatorState,
  type CalculatorState,
} from "./calculatorReducer";

function state(overrides: Partial<CalculatorState> = {}): CalculatorState {
  return { ...initialCalculatorState, ...overrides };
}

describe("calculatorReducer", () => {
  describe("digit entry", () => {
    it("replaces the display when overwrite is true", () => {
      const result = calculatorReducer(state({ overwrite: true }), { type: "DIGIT", digit: "5" });
      expect(result.display).toBe("5");
      expect(result.overwrite).toBe(false);
    });

    it("appends digits after the first", () => {
      const result = calculatorReducer(state({ display: "5", overwrite: false }), {
        type: "DIGIT",
        digit: "2",
      });
      expect(result.display).toBe("52");
    });

    it("does not produce a leading zero", () => {
      const result = calculatorReducer(state({ display: "0", overwrite: false }), {
        type: "DIGIT",
        digit: "7",
      });
      expect(result.display).toBe("7");
    });

    it("starts a fresh entry if a digit is pressed after an error", () => {
      const result = calculatorReducer(state({ errorCode: "DIVISION_BY_ZERO" }), {
        type: "DIGIT",
        digit: "9",
      });
      expect(result.display).toBe("9");
      expect(result.errorCode).toBeNull();
    });
  });

  describe("decimal", () => {
    it("starts '0.' when overwrite is true", () => {
      const result = calculatorReducer(state({ overwrite: true }), { type: "DECIMAL" });
      expect(result.display).toBe("0.");
    });

    it("does not add a second decimal point", () => {
      const result = calculatorReducer(state({ display: "1.5", overwrite: false }), {
        type: "DECIMAL",
      });
      expect(result.display).toBe("1.5");
    });
  });

  describe("backspace", () => {
    it("removes the last character", () => {
      const result = calculatorReducer(state({ display: "123", overwrite: false }), {
        type: "BACKSPACE",
      });
      expect(result.display).toBe("12");
    });

    it("resets to '0' and overwrite once the display empties", () => {
      const result = calculatorReducer(state({ display: "1", overwrite: false }), {
        type: "BACKSPACE",
      });
      expect(result.display).toBe("0");
      expect(result.overwrite).toBe(true);
    });

    it("is a no-op immediately after an operator (overwrite true)", () => {
      const s = state({ display: "5", overwrite: true });
      expect(calculatorReducer(s, { type: "BACKSPACE" })).toBe(s);
    });
  });

  describe("clear", () => {
    it("resets everything except memory", () => {
      const result = calculatorReducer(
        state({ display: "42", previousOperand: 10, pendingOperation: "add", memory: 7 }),
        { type: "CLEAR" },
      );
      expect(result).toEqual({ ...initialCalculatorState, memory: 7 });
    });
  });

  describe("operator selection (SET_OPERATOR — no computation needed yet)", () => {
    it("stores the operand and operation", () => {
      const result = calculatorReducer(state({ display: "5" }), {
        type: "SET_OPERATOR",
        operation: "add",
        operand: 5,
      });
      expect(result.previousOperand).toBe(5);
      expect(result.pendingOperation).toBe("add");
      expect(result.overwrite).toBe(true);
    });
  });

  describe("API lifecycle", () => {
    it("API_START sets isLoading and clears any prior error", () => {
      const result = calculatorReducer(state({ errorCode: "NETWORK_ERROR" }), {
        type: "API_START",
      });
      expect(result.isLoading).toBe(true);
      expect(result.errorCode).toBeNull();
    });

    it("API_SUCCESS_CHAIN updates the display and carries the next operation", () => {
      const result = calculatorReducer(state({ isLoading: true }), {
        type: "API_SUCCESS_CHAIN",
        result: 8,
        nextOperation: "multiply",
      });
      expect(result.display).toBe("8");
      expect(result.previousOperand).toBe(8);
      expect(result.pendingOperation).toBe("multiply");
      expect(result.overwrite).toBe(true);
      expect(result.isLoading).toBe(false);
    });

    it("API_SUCCESS_EQUALS clears the pending operation", () => {
      const result = calculatorReducer(
        state({ isLoading: true, previousOperand: 2, pendingOperation: "add" }),
        { type: "API_SUCCESS_EQUALS", result: 5 },
      );
      expect(result.display).toBe("5");
      expect(result.previousOperand).toBeNull();
      expect(result.pendingOperation).toBeNull();
    });

    it("API_SUCCESS_UNARY leaves a pending chain intact", () => {
      const result = calculatorReducer(
        state({ isLoading: true, previousOperand: 5, pendingOperation: "add" }),
        { type: "API_SUCCESS_UNARY", result: 3 },
      );
      expect(result.display).toBe("3");
      expect(result.previousOperand).toBe(5);
      expect(result.pendingOperation).toBe("add");
    });

    it("API_ERROR resets to a clean slate (keeping memory) with the error code set", () => {
      const result = calculatorReducer(
        state({
          isLoading: true,
          display: "10",
          previousOperand: 10,
          pendingOperation: "divide",
          memory: 3,
        }),
        { type: "API_ERROR", code: "DIVISION_BY_ZERO" },
      );
      expect(result.errorCode).toBe("DIVISION_BY_ZERO");
      expect(result.display).toBe("0");
      expect(result.previousOperand).toBeNull();
      expect(result.memory).toBe(3);
    });
  });

  describe("memory (client-side only, per D3)", () => {
    it("M+ adds the displayed value to memory", () => {
      const result = calculatorReducer(state({ display: "4", memory: 10 }), { type: "MEMORY_ADD" });
      expect(result.memory).toBe(14);
    });

    it("M- subtracts the displayed value from memory", () => {
      const result = calculatorReducer(state({ display: "4", memory: 10 }), {
        type: "MEMORY_SUBTRACT",
      });
      expect(result.memory).toBe(6);
    });

    it("MR recalls memory into the display and arms overwrite", () => {
      const result = calculatorReducer(state({ memory: 42 }), { type: "MEMORY_RECALL" });
      expect(result.display).toBe("42");
      expect(result.overwrite).toBe(true);
    });

    it("MC clears memory only", () => {
      const result = calculatorReducer(state({ memory: 42, display: "7" }), {
        type: "MEMORY_CLEAR",
      });
      expect(result.memory).toBe(0);
      expect(result.display).toBe("7");
    });
  });
});
