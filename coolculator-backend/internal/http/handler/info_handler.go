package handler

import (
	"net/http"

	"coolculator-backend/internal/http/dto"
)

// InfoHandler handles GET /info — build/version metadata, consumed by the
// frontend's About panel. Named /info rather than /version so the payload
// can grow beyond a bare version string later without implying a rename.
type InfoHandler struct {
	version   string
	commit    string
	buildTime string
}

// NewInfoHandler builds an InfoHandler reporting the given build metadata.
func NewInfoHandler(version, commit, buildTime string) *InfoHandler {
	return &InfoHandler{version: version, commit: commit, buildTime: buildTime}
}

// ServeHTTP godoc
// @Summary      Build and version info
// @Description  Returns the backend's version, commit, and build time. Consumed by the frontend's About panel.
// @Tags         ops
// @Produce      json
// @Success      200  {object}  dto.InfoResponse
// @Header       200  {string}  X-Request-Id  "Request ID used for this request"
// @Router       /info [get]
func (h *InfoHandler) ServeHTTP(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, dto.InfoResponse{
		Version: h.version,
		Commit:  h.commit,
		BuiltAt: h.buildTime,
	})
}
