package service

import (
	"context"
	"errors"
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"coolculator-backend/internal/domain"
)

func ptr(f float64) *float64 { return &f }

func TestCalculatorService_Calculate_Success(t *testing.T) {
	svc := NewCalculatorService()

	tests := []struct {
		name     string
		op       domain.Operation
		operand1 float64
		operand2 *float64
		want     float64
	}{
		{"add", domain.Add, 2, ptr(3), 5},
		{"add negative operands", domain.Add, -2, ptr(-3), -5},
		{"add with explicit zero operand", domain.Add, 0, ptr(5), 5},
		{"subtract", domain.Subtract, 10, ptr(4), 6},
		{"subtract is not commutative", domain.Subtract, 4, ptr(10), -6},
		{"multiply", domain.Multiply, 6, ptr(7), 42},
		{"multiply by zero", domain.Multiply, 6, ptr(0), 0},
		{"divide", domain.Divide, 10, ptr(4), 2.5},
		{"divide is not commutative", domain.Divide, 100, ptr(10), 10},
		{"pow", domain.Pow, 2, ptr(10), 1024},
		{"pow zero exponent", domain.Pow, 5, ptr(0), 1},
		{"sqrt", domain.Sqrt, 81, nil, 9},
		{"sqrt of zero", domain.Sqrt, 0, nil, 0},
		{"percentage", domain.Percentage, 25, ptr(200), 12.5},
		{"boundary: max float64 divided by itself", domain.Divide, math.MaxFloat64, ptr(math.MaxFloat64), 1},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := svc.Calculate(context.Background(), tt.op, tt.operand1, tt.operand2)
			require.NoError(t, err)
			assert.InDelta(t, tt.want, got, 1e-9)
		})
	}
}

func TestCalculatorService_Calculate_Errors(t *testing.T) {
	svc := NewCalculatorService()

	tests := []struct {
		name     string
		op       domain.Operation
		operand1 float64
		operand2 *float64
		wantErr  error
	}{
		{"division by zero", domain.Divide, 10, ptr(0), domain.ErrDivisionByZero},
		{"percentage of zero base", domain.Percentage, 10, ptr(0), domain.ErrDivisionByZero},
		{"sqrt of negative", domain.Sqrt, -4, nil, domain.ErrInvalidOperand},
		{"unknown operation", domain.Operation("modulo"), 1, ptr(1.0), domain.ErrInvalidOperation},
		{"binary op missing operand2", domain.Add, 1, nil, domain.ErrOperandCountMismatch},
		{"unary op given operand2", domain.Sqrt, 4, ptr(2.0), domain.ErrOperandCountMismatch},
		{"result overflows to +Inf", domain.Pow, 10, ptr(1000.0), domain.ErrResultNotFinite},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := svc.Calculate(context.Background(), tt.op, tt.operand1, tt.operand2)
			require.Error(t, err)
			assert.True(t, errors.Is(err, tt.wantErr), "expected error to wrap %v, got %v", tt.wantErr, err)
		})
	}
}
