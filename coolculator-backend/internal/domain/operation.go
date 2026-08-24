// Package domain holds the calculator's core business types and rules.
// Nothing in this package imports net/http, chi, or any other framework —
// it is pure, dependency-free Go so it can be tested and reused in isolation.
package domain

// Operation identifies a supported arithmetic operation.
type Operation string

const (
	Add        Operation = "add"
	Subtract   Operation = "subtract"
	Multiply   Operation = "multiply"
	Divide     Operation = "divide"
	Pow        Operation = "pow"
	Sqrt       Operation = "sqrt"
	Percentage Operation = "percentage"
)

// unaryOperations is the set of operations that take exactly one operand.
// Every operation not listed here is binary (takes exactly two).
var unaryOperations = map[Operation]bool{
	Sqrt: true,
}

// IsValid reports whether o is one of the operations the calculator supports.
func (o Operation) IsValid() bool {
	switch o {
	case Add, Subtract, Multiply, Divide, Pow, Sqrt, Percentage:
		return true
	default:
		return false
	}
}

// IsUnary reports whether o takes a single operand. IsUnary and IsBinary are
// only meaningful for a valid Operation; callers should check IsValid first.
func (o Operation) IsUnary() bool {
	return unaryOperations[o]
}

// IsBinary reports whether o takes exactly two operands.
func (o Operation) IsBinary() bool {
	return o.IsValid() && !o.IsUnary()
}
