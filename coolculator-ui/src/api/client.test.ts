import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiGet, apiPost, ApiError } from "./client";

function jsonResponse(body: unknown, init: { status?: number; requestId?: string } = {}) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (init.requestId) headers.set("X-Request-Id", init.requestId);
  return new Response(JSON.stringify(body), { status: init.status ?? 200, headers });
}

describe("api client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the decoded body on success", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result: 5 }));

    const result = await apiPost<{ result: number }>("/api/v1/calculate", {
      operation: "add",
      operand1: 2,
      operand2: 3,
    });

    expect(result).toEqual({ result: 5 });
  });

  it("sends the body as JSON with a Content-Type header", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ result: 5 }));

    await apiPost("/api/v1/calculate", { operation: "add", operand1: 2, operand2: 3 });

    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ operation: "add", operand1: 2, operand2: 3 }));
  });

  it("throws an ApiError with the backend's code on an error response", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        { error: { code: "DIVISION_BY_ZERO", params: {} } },
        { status: 400, requestId: "req-123" },
      ),
    );

    const promise = apiGet("/api/v1/calculate");

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ code: "DIVISION_BY_ZERO", requestId: "req-123" });
  });

  it("falls back to INTERNAL_ERROR when the error body is unparseable", async () => {
    const headers = new Headers();
    vi.mocked(fetch).mockResolvedValueOnce(new Response("not json", { status: 500, headers }));

    await expect(apiGet("/health")).rejects.toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("throws NETWORK_ERROR when fetch itself rejects (backend unreachable)", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(apiGet("/health")).rejects.toMatchObject({
      code: "NETWORK_ERROR",
      requestId: null,
    });
  });
});
