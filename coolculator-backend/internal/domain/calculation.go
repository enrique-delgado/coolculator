package domain

import "math"

// Calculation is the input to a computation: an operation plus its operands.
// Operand2 is nil for unary operations (see Operation.IsUnary).
type Calculation struct {
	Operation Operation
	Operand1  float64
	Operand2  *float64
}

// Compute executes the calculation and returns its result, or a domain error
// if the operands are invalid for the operation or the result isn't finite.
func (c Calculation) Compute() (float64, error) {
	if !c.Operation.IsValid() {
		return 0, ErrInvalidOperation
	}

	if c.Operation.IsUnary() && c.Operand2 != nil {
		return 0, ErrOperandCountMismatch
	}
	if c.Operation.IsBinary() && c.Operand2 == nil {
		return 0, ErrOperandCountMismatch
	}

	var result float64
	switch c.Operation {
	case Add:
		result = c.Operand1 + *c.Operand2
	case Subtract:
		result = c.Operand1 - *c.Operand2
	case Multiply:
		result = c.Operand1 * *c.Operand2
	case Divide:
		if *c.Operand2 == 0 {
			return 0, ErrDivisionByZero
		}
		result = c.Operand1 / *c.Operand2
	case Pow:
		result = math.Pow(c.Operand1, *c.Operand2)
	case Sqrt:
		if c.Operand1 < 0 {
			return 0, ErrInvalidOperand
		}
		result = math.Sqrt(c.Operand1)
	case Percentage:
		// "operand1 is what percent of operand2" — e.g. 25, 200 -> 12.5.
		if *c.Operand2 == 0 {
			return 0, ErrDivisionByZero
		}
		result = (c.Operand1 / *c.Operand2) * 100
	default:
		// Unreachable: Operation.IsValid already rejected anything else.
		return 0, ErrInvalidOperation
	}

	if math.IsNaN(result) || math.IsInf(result, 0) {
		return 0, ErrResultNotFinite
	}
	return result, nil
}
