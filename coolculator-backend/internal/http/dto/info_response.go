package dto

// InfoResponse is the response body for GET /info — build/version metadata,
// consumed by the frontend's About panel. Named /info rather than /version
// precisely so this can carry more than a bare version string.
type InfoResponse struct {
	Version string `json:"version" example:"0.1.0"`
	Commit  string `json:"commit" example:"abc1234"`
	BuiltAt string `json:"builtAt" example:"2026-08-23T00:00:00Z"`
}
