import { apiGet, apiPost, type RequestOptions } from "./client";

import type { CalculateResponse, InfoResponse, Operation } from "./types";

// Declared here, at the point of use, rather than assumed by every
// consumer — src/features/calculator's hook depends on this interface, so
// tests can substitute a fake without touching the network.
export interface CalculatorApi {
  calculate(
    operation: Operation,
    operand1: number,
    operand2?: number,
    options?: RequestOptions,
  ): Promise<number>;
  getInfo(options?: RequestOptions): Promise<InfoResponse>;
}

export const calculatorApi: CalculatorApi = {
  async calculate(operation, operand1, operand2, options) {
    const response = await apiPost<CalculateResponse>(
      "/api/v1/calculate",
      {
        operation,
        operand1,
        // Omit the key entirely for a unary operation, rather than send
        // `operand2: undefined` — JSON.stringify drops it either way, but
        // being explicit here keeps the intent visible: absent, not null.
        ...(operand2 !== undefined ? { operand2 } : {}),
      },
      options,
    );
    return response.result;
  },

  async getInfo(options) {
    return apiGet<InfoResponse>("/info", options);
  },
};
