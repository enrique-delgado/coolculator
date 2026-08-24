import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "./i18n/i18n";
import i18n from "./i18n/i18n";
import { App } from "./App";
import { ThemeProvider } from "./theme/ThemeProvider";

vi.mock("./api/calculatorApi", () => ({
  calculatorApi: {
    calculate: vi.fn().mockResolvedValue(0),
    getInfo: vi.fn().mockResolvedValue({ version: "0.1.0", commit: "abc", builtAt: "now" }),
  },
}));

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>,
  );
}

describe("App — theme and language switching", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-scheme");
    void i18n.changeLanguage("en");
  });

  it("switching the language select updates visible UI text", async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByRole("button", { name: "About" })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Language"), "es");

    expect(await screen.findByRole("button", { name: "Acerca de" })).toBeInTheDocument();
  });

  it("toggling the mode button flips data-theme on the document root", async () => {
    const user = userEvent.setup();
    renderApp();

    const initial = document.documentElement.dataset.theme;
    expect(initial === "light" || initial === "dark").toBe(true);

    await user.click(screen.getByRole("button", { name: /mode$/i }));

    expect(document.documentElement.dataset.theme).not.toBe(initial);
  });

  it("switching the scheme select updates data-scheme on the document root", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.selectOptions(screen.getByLabelText("Theme"), "aurora");

    expect(document.documentElement.dataset.scheme).toBe("aurora");
  });

  it("persists the chosen theme mode and scheme to localStorage", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.selectOptions(screen.getByLabelText("Theme"), "carnival");

    expect(localStorage.getItem("coolculator-theme-scheme")).toBe("carnival");
  });
});
