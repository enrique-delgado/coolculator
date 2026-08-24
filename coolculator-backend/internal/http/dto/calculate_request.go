// Package dto holds the REST layer's request/response types. These are wire
// shapes, deliberately kept separate from internal/domain's business types —
// the HTTP contract and the domain model are free to evolve independently.
package dto

// CalculateRequest is the request body for POST /api/v1/calculate.
type CalculateRequest struct {
	// Operation is the arithmetic operation to perform.
	Operation string `json:"operation" validate:"required,oneof=add subtract multiply divide pow sqrt percentage" example:"add"`

	// Operand1 is the first operand. Required — and 0 is a legitimate
	// value. It's a *float64 rather than a plain float64 specifically so
	// that's true: go-playground/validator's `required` tag checks
	// non-nil for a pointer field (not non-zero, as it would for a plain
	// float64), so an explicit 0 is correctly accepted instead of being
	// mistaken for a missing field. See docs/00-decisions.md, D11.
	Operand1 *float64 `json:"operand1" validate:"required" example:"2"`

	// Operand2 is the second operand: required for binary operations,
	// must be omitted for unary ones (currently only "sqrt"). That
	// operation-dependent rule can't be expressed as a static struct tag,
	// so it's enforced by the domain layer instead
	// (internal/domain.Calculation.Compute returns ErrOperandCountMismatch
	// when it's violated) rather than duplicated here.
	Operand2 *float64 `json:"operand2,omitempty" example:"3"`
}
