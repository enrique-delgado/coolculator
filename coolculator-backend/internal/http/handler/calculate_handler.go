// Package handler holds the REST layer's controllers: thin adapters that
// decode/validate HTTP requests, delegate to a service, and translate the
// result back to HTTP. No business logic lives here.
package handler

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/go-playground/validator/v10"

	"coolculator-backend/internal/domain"
	"coolculator-backend/internal/http/dto"
)

// CalculatorService is the subset of service.CalculatorService this handler
// needs. Declared here, at the consumer, rather than importing the service
// package's interface directly — a small hexagonal touch that keeps this
// adapter decoupled from the application layer's package, and is what
// calculate_handler_test.go substitutes with a fake.
type CalculatorService interface {
	Calculate(ctx context.Context, op domain.Operation, operand1 float64, operand2 *float64) (float64, error)
}

// CalculateHandler handles POST /api/v1/calculate.
type CalculateHandler struct {
	service  CalculatorService
	validate *validator.Validate
}

// NewCalculateHandler builds a CalculateHandler.
func NewCalculateHandler(service CalculatorService, validate *validator.Validate) *CalculateHandler {
	return &CalculateHandler{service: service, validate: validate}
}

// ServeHTTP godoc
// @Summary      Perform a calculation
// @Description  Executes an arithmetic operation on one or two operands. operand2 is required for binary operations (add, subtract, multiply, divide, pow, percentage) and must be omitted for unary ones (sqrt).
// @Tags         calculator
// @Accept       json
// @Produce      json
// @Param        X-Request-Id  header  string                false  "Client-supplied request ID; the server generates one if omitted"
// @Param        request       body    dto.CalculateRequest  true   "Calculation request"
// @Success      200  {object}  dto.CalculateResponse
// @Header       200  {string}  X-Request-Id  "Request ID used for this request"
// @Failure      400  {object}  dto.ErrorResponse
// @Header       400  {string}  X-Request-Id  "Request ID used for this request"
// @Failure      500  {object}  dto.ErrorResponse
// @Header       500  {string}  X-Request-Id  "Request ID used for this request"
// @Router       /api/v1/calculate [post]
func (h *CalculateHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var req dto.CalculateRequest

	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, CodeMalformedRequest)
		return
	}

	if err := h.validate.Struct(req); err != nil {
		writeError(w, http.StatusBadRequest, validationErrorCode(err))
		return
	}

	result, err := h.service.Calculate(r.Context(), domain.Operation(req.Operation), *req.Operand1, req.Operand2)
	if err != nil {
		status, code := mapDomainError(err)
		if status == http.StatusInternalServerError {
			slog.ErrorContext(r.Context(), "calculation failed unexpectedly", "error", err)
		}
		writeError(w, status, code)
		return
	}

	writeJSON(w, http.StatusOK, dto.CalculateResponse{Result: result})
}

// validationErrorCode maps the first failing struct-tag validation to an API
// error code. Falls back to CodeInvalidOperand for anything unrecognized —
// conservative, since at least one operand-shaped field is almost always
// the culprit for a request that got this far.
func validationErrorCode(err error) string {
	var verrs validator.ValidationErrors
	if errors.As(err, &verrs) {
		for _, fe := range verrs {
			if fe.StructField() == "Operation" {
				return CodeInvalidOperation
			}
		}
	}
	return CodeInvalidOperand
}
