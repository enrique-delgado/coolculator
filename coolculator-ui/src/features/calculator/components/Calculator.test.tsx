import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../api/client";
import type { CalculatorApi } from "../../../api/calculatorApi";
import "../../../i18n/i18n"; // initializes the default i18next instance used by useTranslation()

import { Calculator } from "./Calculator";

function fakeApi(overrides: Partial<CalculatorApi> = {}): CalculatorApi {
  return {
    calculate: vi.fn().mockResolvedValue(0),
    getInfo: vi.fn().mockResolvedValue({ version: "0", commit: "0", builtAt: "0" }),
    ...overrides,
  };
}

describe("Calculator", () => {
  beforeEach(() => {
    // Keypad wiring — API mocked, per docs/04-test-plan.md.
  });

  it("wires the keypad to the API: 2 + 3 = shows 5", async () => {
    const user = userEvent.setup();
    const api = fakeApi({ calculate: vi.fn().mockResolvedValue(5) });
    render(<Calculator api={api} />);

    await user.click(screen.getByRole("button", { name: "Digit 2" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    await user.click(screen.getByRole("button", { name: "Digit 3" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("5"));
    expect(api.calculate).toHaveBeenCalledWith("add", 2, 3, expect.anything());
  });

  it("shows a translated, user-safe message when the API call fails", async () => {
    const user = userEvent.setup();
    const api = fakeApi({
      calculate: vi.fn().mockRejectedValue(new ApiError("DIVISION_BY_ZERO", "req-1")),
    });
    render(<Calculator api={api} />);

    await user.click(screen.getByRole("button", { name: "Digit 1" }));
    await user.click(screen.getByRole("button", { name: "Divide" }));
    await user.click(screen.getByRole("button", { name: "Digit 0" }));
    await user.click(screen.getByRole("button", { name: "Equals" }));

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Can't divide by zero."),
    );
  });

  describe("memory", () => {
    it("M+ stores the displayed value; MC then MR proves it round-trips and clears", async () => {
      const user = userEvent.setup();
      render(<Calculator api={fakeApi()} />);

      await user.click(screen.getByRole("button", { name: "Digit 7" }));
      await user.click(screen.getByRole("button", { name: /^Memory add/ }));
      await user.click(screen.getByRole("button", { name: "Clear" }));
      await user.click(screen.getByRole("button", { name: /^Memory recall/ }));

      expect(screen.getByRole("status")).toHaveTextContent("7");
    });

    it("shows the current memory value as a tooltip on the memory buttons", async () => {
      const user = userEvent.setup();
      render(<Calculator api={fakeApi()} />);

      await user.click(screen.getByRole("button", { name: "Digit 9" }));
      await user.click(screen.getByRole("button", { name: /^Memory add/ }));

      const recall = screen.getByRole("button", { name: /^Memory recall/ });
      expect(recall).toHaveAttribute("title", "Memory: 9");
    });
  });

  it("keeps the keypad's Tab order matching its visual layout (no explicit tabIndex needed)", () => {
    const { container } = render(<Calculator api={fakeApi()} />);
    const keypad = container.querySelector(".keypad");
    expect(keypad).not.toBeNull();

    const buttons = within(keypad as HTMLElement).getAllByRole("button");
    const labels = buttons.map((b) => b.textContent);

    // First row is the memory cluster, then Clear/Backspace/√/xʸ, ending
    // with a full-width "=" — i.e. DOM order already matches the grid a
    // sighted mouse user sees, so native Tab order needs no help.
    expect(labels.slice(0, 4)).toEqual(["MC", "MR", "M+", "M-"]);
    expect(labels[labels.length - 1]).toBe("=");
  });
});
