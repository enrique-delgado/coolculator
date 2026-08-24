package handler

import (
	"errors"
	"net/http"

	"coolculator-backend/internal/domain"
)

// API error codes. Stable, machine-readable, and locale-agnostic — the
// frontend's i18n layer maps each to translated user-facing text rather than
// the API returning text directly. See docs/00-decisions.md, D5.
const (
	CodeMalformedRequest     = "MALFORMED_REQUEST"
	CodeInvalidOperation     = "INVALID_OPERATION"
	CodeInvalidOperand       = "INVALID_OPERAND"
	CodeOperandCountMismatch = "OPERAND_COUNT_MISMATCH"
	CodeDivisionByZero       = "DIVISION_BY_ZERO"
	CodeResultNotFinite      = "RESULT_NOT_FINITE"
	CodeInternalError        = "INTERNAL_ERROR"
)

// mapDomainError translates a domain error into an HTTP status and API error
// code. This is the one place domain errors cross into HTTP terms — the
// domain and service layers stay unaware of status codes entirely.
// Anything unrecognized is treated as internal: the caller gets a generic
// code, and the caller is expected to log the real error before calling
// this (mapDomainError itself never logs).
func mapDomainError(err error) (status int, code string) {
	switch {
	case errors.Is(err, domain.ErrDivisionByZero):
		return http.StatusBadRequest, CodeDivisionByZero
	case errors.Is(err, domain.ErrInvalidOperand):
		return http.StatusBadRequest, CodeInvalidOperand
	case errors.Is(err, domain.ErrInvalidOperation):
		return http.StatusBadRequest, CodeInvalidOperation
	case errors.Is(err, domain.ErrOperandCountMismatch):
		return http.StatusBadRequest, CodeOperandCountMismatch
	case errors.Is(err, domain.ErrResultNotFinite):
		return http.StatusBadRequest, CodeResultNotFinite
	default:
		return http.StatusInternalServerError, CodeInternalError
	}
}
