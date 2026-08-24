package dto

// ErrorResponse is the response body for every error (4xx/5xx) the API
// returns — always this envelope, never a bare string.
type ErrorResponse struct {
	Error ErrorDetail `json:"error"`
}

// ErrorDetail carries a stable, machine-readable error code plus any
// structured parameters relevant to it. The API never returns pre-translated
// error text — the frontend's i18n layer maps Code to user-facing text in
// the active language. See docs/00-decisions.md, D5.
type ErrorDetail struct {
	Code string `json:"code" example:"DIVISION_BY_ZERO"`
	// Params carries any structured parameters relevant to the error.
	// Always present (never null) so clients don't need a nil check —
	// just empty ({}) when the error carries no parameters.
	Params map[string]any `json:"params"`
}
