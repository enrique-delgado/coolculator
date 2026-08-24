package handler

import (
	"net/http"

	"coolculator-backend/internal/http/dto"
)

// HealthHandler handles GET /health — a liveness probe. It always returns
// 200 with a fixed body as long as the process is up and able to serve
// HTTP; the backend has no dependencies to check (no database, no
// downstream service), so there's nothing else to report on.
type HealthHandler struct{}

// NewHealthHandler builds a HealthHandler.
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// ServeHTTP godoc
// @Summary      Liveness probe
// @Description  Returns 200 if the service is up. Used by Docker's HEALTHCHECK and by deployment platforms to determine whether the service is ready to receive traffic.
// @Tags         ops
// @Produce      json
// @Success      200  {object}  dto.HealthResponse
// @Header       200  {string}  X-Request-Id  "Request ID used for this request"
// @Router       /health [get]
func (h *HealthHandler) ServeHTTP(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, dto.HealthResponse{Status: "ok"})
}
