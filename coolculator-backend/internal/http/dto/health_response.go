package dto

// HealthResponse is the response body for GET /health.
type HealthResponse struct {
	Status string `json:"status" example:"ok"`
}
