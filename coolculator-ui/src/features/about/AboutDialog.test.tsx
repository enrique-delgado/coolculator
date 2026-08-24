import type { ComponentProps } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { CalculatorApi } from "../../api/calculatorApi";
import "../../i18n/i18n";

import { AboutDialog } from "./AboutDialog";

function fakeApi(overrides: Partial<CalculatorApi> = {}): CalculatorApi {
  return {
    calculate: vi.fn().mockResolvedValue(0),
    getInfo: vi.fn().mockResolvedValue({ version: "1.2.3", commit: "abc", builtAt: "now" }),
    ...overrides,
  };
}

// Fixture values passed explicitly as props — never read from the real
// .env — so this suite is independent of whatever VITE_AUTHOR_NAME/
// VITE_GITHUB_URL happen to be configured for local dev.
function renderAbout(overrides: Partial<ComponentProps<typeof AboutDialog>> = {}) {
  return render(
    <AboutDialog
      api={fakeApi()}
      onClose={vi.fn()}
      authorName="Ada Lovelace"
      authorEmail="ada@example.com"
      githubUrl="https://github.com/example/coolculator"
      {...overrides}
    />,
  );
}

describe("AboutDialog", () => {
  it("fetches and displays the backend version", async () => {
    renderAbout();

    await waitFor(() => expect(screen.getByText("1.2.3")).toBeInTheDocument());
  });

  it("shows an 'unavailable' message if the backend can't be reached", async () => {
    renderAbout({
      api: fakeApi({ getInfo: vi.fn().mockRejectedValue(new Error("network down")) }),
    });

    await waitFor(() => expect(screen.getByText(/Unavailable/)).toBeInTheDocument());
  });

  it("shows the author name/email and a working repository link when configured", () => {
    renderAbout();

    expect(screen.getByText(/Ada Lovelace/)).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "https://github.com/example/coolculator" }),
    ).toHaveAttribute("href", "https://github.com/example/coolculator");
  });

  it("falls back to placeholders when author name and repository URL are unset", () => {
    renderAbout({ authorName: "", githubUrl: "" });

    expect(screen.getByText(/set VITE_AUTHOR_NAME/)).toBeInTheDocument();
    expect(screen.getByText(/set VITE_GITHUB_URL/)).toBeInTheDocument();
  });

  it("closes on Escape and on backdrop click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderAbout({ onClose });

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("does not close when the dialog content itself is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderAbout({ onClose });

    await user.click(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
