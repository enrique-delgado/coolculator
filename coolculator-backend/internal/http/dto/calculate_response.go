package dto

// CalculateResponse is the success response body for POST /api/v1/calculate.
// It deliberately does not echo the request (operation/operands) — the
// caller already has those values. See docs/00-decisions.md, D12.
type CalculateResponse struct {
	Result float64 `json:"result" example:"5"`
}
