import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../api/client";
import type { CalculatorApi } from "../../../api/calculatorApi";

import { useCalculator } from "./useCalculator";

function fakeApi(overrides: Partial<CalculatorApi> = {}): CalculatorApi {
  return {
    calculate: vi.fn().mockResolvedValue(0),
    getInfo: vi.fn().mockResolvedValue({ version: "0", commit: "0", builtAt: "0" }),
    ...overrides,
  };
}

describe("useCalculator", () => {
  it("performs a simple addition end to end: 2 + 3 = 5", async () => {
    const api = fakeApi({ calculate: vi.fn().mockResolvedValue(5) });
    const { result } = renderHook(() => useCalculator(api));

    act(() => result.current.inputDigit("2"));
    act(() => result.current.selectOperator("add"));
    act(() => result.current.inputDigit("3"));
    act(() => result.current.equals());

    await waitFor(() => expect(result.current.state.display).toBe("5"));
    expect(api.calculate).toHaveBeenCalledWith("add", 2, 3, expect.anything());
    expect(result.current.state.pendingOperation).toBeNull();
  });

  it("treats an explicit 0 as a real operand, not a missing one", async () => {
    const calculate = vi.fn().mockResolvedValue(5);
    const api = fakeApi({ calculate });
    const { result } = renderHook(() => useCalculator(api));

    act(() => result.current.inputDigit("0"));
    act(() => result.current.selectOperator("add"));
    act(() => result.current.inputDigit("5"));
    act(() => result.current.equals());

    await waitFor(() => expect(calculate).toHaveBeenCalled());
    expect(calculate).toHaveBeenCalledWith("add", 0, 5, expect.anything());
  });

  it("chains operators: computes the pending op before starting the next one", async () => {
    const calculate = vi.fn().mockResolvedValueOnce(5).mockResolvedValueOnce(20);
    const api = fakeApi({ calculate });
    const { result } = renderHook(() => useCalculator(api));

    act(() => result.current.inputDigit("2")); // 2
    act(() => result.current.selectOperator("add")); // 2 +
    act(() => result.current.inputDigit("3")); // 2 + 3
    act(() => result.current.selectOperator("multiply")); // computes 2+3=5, then "5 *"

    await waitFor(() => expect(result.current.state.display).toBe("5"));
    expect(result.current.state.pendingOperation).toBe("multiply");

    act(() => result.current.inputDigit("4")); // 5 * 4
    act(() => result.current.equals());

    await waitFor(() => expect(result.current.state.display).toBe("20"));
    expect(calculate).toHaveBeenNthCalledWith(1, "add", 2, 3, expect.anything());
    expect(calculate).toHaveBeenNthCalledWith(2, "multiply", 5, 4, expect.anything());
  });

  it("sqrt computes immediately without disturbing a pending chain", async () => {
    const calculate = vi.fn().mockResolvedValueOnce(3);
    const api = fakeApi({ calculate });
    const { result } = renderHook(() => useCalculator(api));

    act(() => result.current.inputDigit("5"));
    act(() => result.current.selectOperator("add")); // 5 + (no API call yet — nothing to chain)
    act(() => result.current.inputDigit("9"));
    act(() => result.current.sqrt()); // sqrt(9) = 3, "5 +" chain preserved

    await waitFor(() => expect(result.current.state.display).toBe("3"));
    expect(calculate).toHaveBeenCalledWith("sqrt", 9, undefined, expect.anything());
    expect(result.current.state.pendingOperation).toBe("add");
    expect(result.current.state.previousOperand).toBe(5);
  });

  it("surfaces the backend's error code on failure and resets for the next entry", async () => {
    const api = fakeApi({
      calculate: vi.fn().mockRejectedValue(new ApiError("DIVISION_BY_ZERO", "req-1")),
    });
    const { result } = renderHook(() => useCalculator(api));

    act(() => result.current.inputDigit("1"));
    act(() => result.current.selectOperator("divide"));
    act(() => result.current.inputDigit("0"));
    act(() => result.current.equals());

    await waitFor(() => expect(result.current.state.errorCode).toBe("DIVISION_BY_ZERO"));
    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.display).toBe("0");
  });

  describe("memory (client-side, no API call)", () => {
    it("M+ / MR / MC round-trip without touching the api", () => {
      const calculate = vi.fn();
      const api = fakeApi({ calculate });
      const { result } = renderHook(() => useCalculator(api));

      act(() => result.current.inputDigit("7"));
      act(() => result.current.memoryAdd());
      act(() => result.current.clear());
      act(() => result.current.memoryRecall());

      expect(result.current.state.display).toBe("7");
      expect(calculate).not.toHaveBeenCalled();

      act(() => result.current.memoryClear());
      act(() => result.current.memoryRecall());
      expect(result.current.state.display).toBe("0");
    });
  });

  it("clear aborts an in-flight calculation", async () => {
    let rejectFn!: (err: unknown) => void;
    const calculate = vi.fn().mockReturnValue(
      new Promise((_resolve, reject) => {
        rejectFn = reject;
      }),
    );
    const api = fakeApi({ calculate });
    const { result } = renderHook(() => useCalculator(api));

    act(() => result.current.inputDigit("1"));
    act(() => result.current.selectOperator("add"));
    act(() => result.current.inputDigit("2"));
    act(() => result.current.equals());

    expect(result.current.state.isLoading).toBe(true);

    act(() => result.current.clear());
    // Simulate the fetch actually honoring the abort signal.
    act(() => rejectFn(new DOMException("aborted", "AbortError")));

    await waitFor(() => expect(result.current.state.isLoading).toBe(false));
    expect(result.current.state.errorCode).toBeNull();
    expect(result.current.state.display).toBe("0");
  });
});
