package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"coolculator-backend/internal/domain"
	"coolculator-backend/internal/http/dto"
)

// fakeCalculatorService is a hand-written test double for CalculatorService.
// A single-method interface doesn't earn testify/mock's reflection-based
// ceremony — a small struct with a func field is simpler and just as clear.
type fakeCalculatorService struct {
	result float64
	err    error
	// captured records the arguments of the last Calculate call, so tests
	// can assert on exactly what the handler passed through.
	captured struct {
		op       domain.Operation
		operand1 float64
		operand2 *float64
	}
}

func (f *fakeCalculatorService) Calculate(_ context.Context, op domain.Operation, operand1 float64, operand2 *float64) (float64, error) {
	f.captured.op = op
	f.captured.operand1 = operand1
	f.captured.operand2 = operand2
	return f.result, f.err
}

func newTestHandler(svc CalculatorService) *CalculateHandler {
	return NewCalculateHandler(svc, validator.New(validator.WithRequiredStructEnabled()))
}

func doCalculateRequest(t *testing.T, h *CalculateHandler, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestCalculateHandler_Success(t *testing.T) {
	fake := &fakeCalculatorService{result: 5}
	h := newTestHandler(fake)

	rec := doCalculateRequest(t, h, `{"operation":"add","operand1":2,"operand2":3}`)

	require.Equal(t, http.StatusOK, rec.Code)
	var resp dto.CalculateResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, 5.0, resp.Result)
	assert.Equal(t, domain.Add, fake.captured.op)
	assert.Equal(t, 2.0, fake.captured.operand1)
	require.NotNil(t, fake.captured.operand2)
	assert.Equal(t, 3.0, *fake.captured.operand2)

	// The success response must not echo the request (D12).
	assert.NotContains(t, rec.Body.String(), "operand1")
	assert.NotContains(t, rec.Body.String(), "operation")
}

func TestCalculateHandler_ExplicitZeroOperandIsNotTreatedAsMissing(t *testing.T) {
	// Regression test for D11: operand1/operand2 are pointers specifically
	// so an explicit 0 passes `validate:"required"` instead of being
	// mistaken for an absent field.
	fake := &fakeCalculatorService{result: 5}
	h := newTestHandler(fake)

	rec := doCalculateRequest(t, h, `{"operation":"add","operand1":0,"operand2":5}`)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, 0.0, fake.captured.operand1)
}

func TestCalculateHandler_UnaryOperationWithoutOperand2(t *testing.T) {
	fake := &fakeCalculatorService{result: 3}
	h := newTestHandler(fake)

	rec := doCalculateRequest(t, h, `{"operation":"sqrt","operand1":9}`)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Nil(t, fake.captured.operand2)
}

func TestCalculateHandler_MalformedJSON(t *testing.T) {
	h := newTestHandler(&fakeCalculatorService{})

	rec := doCalculateRequest(t, h, `{not valid json`)

	assertErrorResponse(t, rec, http.StatusBadRequest, CodeMalformedRequest)
}

func TestCalculateHandler_ValidationErrors(t *testing.T) {
	tests := []struct {
		name     string
		body     string
		wantCode string
	}{
		{"missing operation", `{"operand1":1,"operand2":2}`, CodeInvalidOperation},
		{"unsupported operation", `{"operation":"modulo","operand1":1,"operand2":2}`, CodeInvalidOperation},
		{"missing operand1", `{"operation":"add","operand2":2}`, CodeInvalidOperand},
		{"operand1 explicit null", `{"operation":"add","operand1":null,"operand2":2}`, CodeInvalidOperand},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			h := newTestHandler(&fakeCalculatorService{})
			rec := doCalculateRequest(t, h, tt.body)
			assertErrorResponse(t, rec, http.StatusBadRequest, tt.wantCode)
		})
	}
}

func TestCalculateHandler_DomainErrorsMapToApiErrors(t *testing.T) {
	tests := []struct {
		name       string
		domainErr  error
		wantStatus int
		wantCode   string
	}{
		{"division by zero", domain.ErrDivisionByZero, http.StatusBadRequest, CodeDivisionByZero},
		{"invalid operand", domain.ErrInvalidOperand, http.StatusBadRequest, CodeInvalidOperand},
		{"operand count mismatch", domain.ErrOperandCountMismatch, http.StatusBadRequest, CodeOperandCountMismatch},
		{"result not finite", domain.ErrResultNotFinite, http.StatusBadRequest, CodeResultNotFinite},
		{"unexpected error", errors.New("boom"), http.StatusInternalServerError, CodeInternalError},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			fake := &fakeCalculatorService{err: tt.domainErr}
			h := newTestHandler(fake)

			rec := doCalculateRequest(t, h, `{"operation":"add","operand1":1,"operand2":2}`)

			assertErrorResponse(t, rec, tt.wantStatus, tt.wantCode)
		})
	}
}

func assertErrorResponse(t *testing.T, rec *httptest.ResponseRecorder, wantStatus int, wantCode string) {
	t.Helper()
	require.Equal(t, wantStatus, rec.Code)
	var resp dto.ErrorResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, wantCode, resp.Error.Code)
	assert.NotNil(t, resp.Error.Params)
}
