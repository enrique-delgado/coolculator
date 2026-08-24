import type { Operation } from "../../api/types";

// The subset of Operation that takes two operands vs. one — the reducer and
// hook branch on this to decide whether a second value is needed before a
// calculation can run. Kept in sync with coolculator-backend's own
// unary/binary split (internal/domain/operation.go).
export const BINARY_OPERATIONS = [
  "add",
  "subtract",
  "multiply",
  "divide",
  "pow",
  "percentage",
] as const;
export type BinaryOperation = (typeof BINARY_OPERATIONS)[number];

export const UNARY_OPERATIONS = ["sqrt"] as const;
export type UnaryOperation = (typeof UNARY_OPERATIONS)[number];

export type { Operation };
