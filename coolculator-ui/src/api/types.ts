// Wire types mirroring coolculator-backend's contract (see
// ../../docs/03-api-contract.md at the repository root). Kept separate from
// the calculator feature's own domain types (src/features/calculator) so
// the API contract and the UI's internal model can evolve independently.

export type Operation = "add" | "subtract" | "multiply" | "divide" | "pow" | "sqrt" | "percentage";

export interface CalculateRequest {
  operation: Operation;
  operand1: number;
  // Omitted (not present at all) for unary operations — matches the
  // backend's DTO, which distinguishes "absent" from "explicitly 0" via a
  // pointer (see docs/00-decisions.md, D11). JSON.stringify drops
  // `undefined` properties entirely, which is exactly the "omitted" case.
  operand2?: number;
}

export interface CalculateResponse {
  result: number;
}

export interface InfoResponse {
  version: string;
  commit: string;
  builtAt: string;
}

// Every API error code the backend documents (docs/03-api-contract.md) —
// kept as a union so the i18n layer's error-code -> message mapping is
// exhaustively checked by the compiler. "NETWORK_ERROR" is a frontend-only
// addition for when the backend can't be reached at all (no HTTP response
// to read a code from).
export type ApiErrorCode =
  | "MALFORMED_REQUEST"
  | "INVALID_OPERATION"
  | "INVALID_OPERAND"
  | "OPERAND_COUNT_MISMATCH"
  | "DIVISION_BY_ZERO"
  | "RESULT_NOT_FINITE"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR";

export interface ErrorResponseBody {
  error: {
    code: string;
    params: Record<string, unknown>;
  };
}
