import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { calculatorApi } from "./calculatorApi";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("calculatorApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends operand2 for a binary operation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result: 5 }));

    const result = await calculatorApi.calculate("add", 2, 3);

    expect(result).toBe(5);
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ operation: "add", operand1: 2, operand2: 3 });
  });

  it("omits operand2 entirely for a unary operation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result: 9 }));

    const result = await calculatorApi.calculate("sqrt", 81);

    expect(result).toBe(9);
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const sentBody = JSON.parse(init.body as string) as Record<string, unknown>;
    expect(sentBody).toEqual({ operation: "sqrt", operand1: 81 });
    expect("operand2" in sentBody).toBe(false);
  });

  it("sends operand1: 0 rather than omitting it", async () => {
    // Regression check mirroring the backend's D11: an explicit 0 must be
    // sent as 0, never dropped as if it were absent.
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result: 5 }));

    await calculatorApi.calculate("add", 0, 5);

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toMatchObject({ operand1: 0 });
  });

  it("fetches build info from GET /info", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ version: "0.1.0", commit: "abc123", builtAt: "2026-08-24T00:00:00Z" }),
    );

    const info = await calculatorApi.getInfo();

    expect(info.version).toBe("0.1.0");
    const [url, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/info$/);
    expect(init.method).toBe("GET");
  });
});
