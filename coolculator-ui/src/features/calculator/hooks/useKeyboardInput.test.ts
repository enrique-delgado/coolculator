import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useKeyboardInput } from "./useKeyboardInput";

function fakeActions() {
  return {
    inputDigit: vi.fn(),
    inputDecimal: vi.fn(),
    backspace: vi.fn(),
    clear: vi.fn(),
    selectOperator: vi.fn(),
    equals: vi.fn(),
  };
}

function press(key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
  window.dispatchEvent(event);
  return event;
}

describe("useKeyboardInput", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("routes digit keys to inputDigit", () => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    press("7");

    expect(actions.inputDigit).toHaveBeenCalledWith("7");
  });

  it("routes '.' and ',' to inputDecimal", () => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    press(".");
    press(",");

    expect(actions.inputDecimal).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["+", "add"],
    ["-", "subtract"],
    ["*", "multiply"],
    ["/", "divide"],
    ["^", "pow"],
    ["%", "percentage"],
  ] as const)("routes %s to selectOperator(%s)", (key, operation) => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    press(key);

    expect(actions.selectOperator).toHaveBeenCalledWith(operation);
  });

  it("prevents the browser default for '/' (Firefox quick-find)", () => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    const event = press("/");

    expect(event.defaultPrevented).toBe(true);
  });

  it("routes Enter and '=' to equals, and prevents default", () => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    const enter = press("Enter");
    press("=");

    expect(actions.equals).toHaveBeenCalledTimes(2);
    expect(enter.defaultPrevented).toBe(true);
  });

  it("routes Escape to clear and Backspace to backspace", () => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    press("Escape");
    press("Backspace");

    expect(actions.clear).toHaveBeenCalledTimes(1);
    expect(actions.backspace).toHaveBeenCalledTimes(1);
  });

  it("ignores keys combined with Ctrl/Cmd/Alt (browser shortcuts)", () => {
    const actions = fakeActions();
    renderHook(() => useKeyboardInput(actions));

    press("c", { ctrlKey: true });
    press("5", { metaKey: true });
    press("+", { altKey: true });

    expect(actions.inputDigit).not.toHaveBeenCalled();
    expect(actions.selectOperator).not.toHaveBeenCalled();
  });

  it("removes its listener on unmount", () => {
    const actions = fakeActions();
    const { unmount } = renderHook(() => useKeyboardInput(actions));

    unmount();
    press("7");

    expect(actions.inputDigit).not.toHaveBeenCalled();
  });
});
