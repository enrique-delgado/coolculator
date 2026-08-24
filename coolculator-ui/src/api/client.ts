import { API_BASE_URL } from "../config/env";
import { logger } from "../logging/logger";

import type { ApiErrorCode, ErrorResponseBody } from "./types";

// Thrown for every failed API call — decode failures, HTTP error responses,
// and network-level failures alike — so callers only ever need to catch one
// error type and branch on `code`.
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly requestId: string | null;

  constructor(code: ApiErrorCode, requestId: string | null, message?: string) {
    super(message ?? code);
    this.name = "ApiError";
    this.code = code;
    this.requestId = requestId;
  }
}

function isErrorResponseBody(value: unknown): value is ErrorResponseBody {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as { error?: { code?: unknown } }).error?.code === "string"
  );
}

export interface RequestOptions {
  // Lets a caller cancel an in-flight request — e.g. the calculator's
  // Clear button aborting a hung calculation, in the spirit of a
  // "fail-safe" calculator rather than one that can get stuck waiting.
  signal?: AbortSignal;
}

export function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export async function apiGet<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, { method: "GET", signal: options?.signal });
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options?.signal,
  });
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, init);
  } catch (cause) {
    if (isAbortError(cause)) {
      // Intentional, caller-initiated cancellation — not a failure to
      // report, so it's rethrown as-is rather than wrapped in ApiError.
      throw cause;
    }
    // fetch() itself threw: no HTTP response at all (backend down, DNS
    // failure, CORS rejection, offline, ...) — there's no error code to
    // read, so this is the one code the frontend invents rather than
    // receives. The user sees a clean, translated message; the real cause
    // goes to the console.
    logger.error(`network error calling ${path}`, cause);
    throw new ApiError("NETWORK_ERROR", null, "Network error");
  }

  const requestId = response.headers.get("X-Request-Id");

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const code: ApiErrorCode = isErrorResponseBody(body)
      ? (body.error.code as ApiErrorCode)
      : "INTERNAL_ERROR";
    logger.error(`API error calling ${path}`, { status: response.status, code, requestId, body });
    throw new ApiError(code, requestId);
  }

  return (await response.json()) as T;
}
