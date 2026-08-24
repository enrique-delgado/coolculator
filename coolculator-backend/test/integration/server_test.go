//go:build integration

// Package integration holds black-box API tests: they boot the real router
// behind an httptest.Server and drive it over actual HTTP, the way any real
// client (frontend, Postman, curl) would. See docs/00-decisions.md, D2.
package integration

import (
	"log/slog"
	"net/http/httptest"
	"testing"

	apphttp "coolculator-backend/internal/http"
	"coolculator-backend/internal/platform/config"
	"coolculator-backend/internal/platform/logger"
	"coolculator-backend/internal/service"
)

// newTestServer boots the same router main.go wires up in production,
// behind an httptest.Server.
func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	cfg := config.Config{Version: "test", Commit: "test", BuildTime: "test"}
	log := logger.New(slog.LevelError) // quiet unless something goes wrong
	svc := service.NewCalculatorService()
	router := apphttp.NewRouter(svc, cfg, log)

	srv := httptest.NewServer(router)
	t.Cleanup(srv.Close)
	return srv
}
