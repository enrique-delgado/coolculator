// Package service is the use-case layer: it orchestrates domain rules for
// the HTTP layer without knowing anything about HTTP itself.
package service

import (
	"context"

	"coolculator-backend/internal/domain"
)

// CalculatorService performs calculator operations.
type CalculatorService interface {
	Calculate(ctx context.Context, op domain.Operation, operand1 float64, operand2 *float64) (float64, error)
}

// calculatorService is the default, stateless CalculatorService. It holds no
// mutable fields, so a single shared instance is safe for concurrent use —
// every call is independent, satisfying the thread-safety requirement by
// construction rather than by locking.
type calculatorService struct{}

// NewCalculatorService builds the default CalculatorService.
func NewCalculatorService() CalculatorService {
	return &calculatorService{}
}

// Calculate delegates to the domain layer. ctx is accepted (idiomatic Go for
// any service call that could later add I/O, tracing, etc.) though unused
// today, since a pure arithmetic calculation needs neither cancellation nor
// deadlines.
func (s *calculatorService) Calculate(_ context.Context, op domain.Operation, operand1 float64, operand2 *float64) (float64, error) {
	calc := domain.Calculation{
		Operation: op,
		Operand1:  operand1,
		Operand2:  operand2,
	}
	return calc.Compute()
}
