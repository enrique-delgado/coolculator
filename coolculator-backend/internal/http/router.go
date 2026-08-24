// Package http assembles the backend's inbound REST adapter: the middleware
// chain, routes, and generated Swagger UI. Subpackages hold the actual
// controllers (handler), wire types (dto), and this application's own
// middleware (middleware); this file is where they're wired together.
package http

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-playground/validator/v10"
	httpSwagger "github.com/swaggo/http-swagger/v2"

	"coolculator-backend/internal/http/handler"
	appmiddleware "coolculator-backend/internal/http/middleware"
	"coolculator-backend/internal/platform/config"
)

// NewRouter builds the backend's complete HTTP handler: middleware chain,
// routes, and the Swagger UI served from the generated OpenAPI spec.
func NewRouter(svc handler.CalculatorService, cfg config.Config, logger *slog.Logger) http.Handler {
	r := chi.NewRouter()

	// Request ID must come first: every later middleware and handler
	// expects it in context.
	r.Use(chimiddleware.RequestID)
	r.Use(appmiddleware.EchoRequestID)
	r.Use(appmiddleware.StructuredLogger(logger))
	r.Use(chimiddleware.Recoverer)

	if len(cfg.AllowedOrigins) > 0 {
		r.Use(cors.Handler(cors.Options{
			AllowedOrigins: cfg.AllowedOrigins,
			AllowedMethods: []string{http.MethodGet, http.MethodPost, http.MethodOptions},
			AllowedHeaders: []string{"Content-Type", chimiddleware.RequestIDHeader},
			ExposedHeaders: []string{chimiddleware.RequestIDHeader},
			MaxAge:         300,
		}))
	}

	validate := validator.New(validator.WithRequiredStructEnabled())

	calculateHandler := handler.NewCalculateHandler(svc, validate)
	healthHandler := handler.NewHealthHandler()
	infoHandler := handler.NewInfoHandler(cfg.Version, cfg.Commit, cfg.BuildTime)

	r.Get("/health", healthHandler.ServeHTTP)
	r.Get("/info", infoHandler.ServeHTTP)
	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/calculate", calculateHandler.ServeHTTP)
	})

	r.Get("/swagger/*", httpSwagger.WrapHandler)

	return r
}
