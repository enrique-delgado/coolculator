package domain

import "errors"

// Sentinel domain errors. Handlers translate these to HTTP status codes and
// the API's error codes (see internal/http/handler) — this package stays
// unaware of HTTP entirely.
var (
	// ErrInvalidOperation is returned when the requested operation is not
	// one of the supported values.
	ErrInvalidOperation = errors.New("invalid operation")

	// ErrOperandCountMismatch is returned when the number of operands
	// supplied doesn't match what the operation requires (e.g. a second
	// operand given for a unary operation, or missing for a binary one).
	ErrOperandCountMismatch = errors.New("operand count mismatch")

	// ErrDivisionByZero is returned when dividing by zero.
	ErrDivisionByZero = errors.New("division by zero")

	// ErrInvalidOperand is returned when an operand's value is not valid
	// for the requested operation (e.g. a negative operand to Sqrt).
	ErrInvalidOperand = errors.New("invalid operand")

	// ErrResultNotFinite is returned when a calculation would produce a
	// result that isn't a finite number (overflow, NaN, +/-Inf).
	ErrResultNotFinite = errors.New("result not finite")
)
