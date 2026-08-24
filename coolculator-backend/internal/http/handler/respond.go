package handler

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"coolculator-backend/internal/http/dto"
)

// writeJSON writes body as the JSON response with the given status code.
func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		// The status and headers are already committed at this point, so
		// there's nothing left to do but record that the write failed.
		slog.Error("failed to encode response body", "error", err)
	}
}

// writeError writes the standard error envelope with the given status and
// API error code (see docs/03-api-contract.md's Conventions).
func writeError(w http.ResponseWriter, status int, code string) {
	writeJSON(w, status, dto.ErrorResponse{
		Error: dto.ErrorDetail{Code: code, Params: map[string]any{}},
	})
}
