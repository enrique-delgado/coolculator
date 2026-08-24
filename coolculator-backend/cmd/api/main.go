// Command api is coolculator-backend's composition root: it loads config,
// builds the logger/service/router, and runs the HTTP server with graceful
// shutdown. No business or HTTP-handling logic lives here — only wiring.
//
// @title        coolculator backend API
// @version      1.0
// @description  REST API for the coolculator calculator application.
// @BasePath     /
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "coolculator-backend/docs" // generated Swagger spec, registered via init()
	apphttp "coolculator-backend/internal/http"
	"coolculator-backend/internal/platform/config"
	"coolculator-backend/internal/platform/logger"
	"coolculator-backend/internal/service"
)

func main() {
	cfg := config.Load()
	log := logger.New(logger.ParseLevel(cfg.LogLevel))
	slog.SetDefault(log)

	svc := service.NewCalculatorService()
	router := apphttp.NewRouter(svc, cfg, log)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		log.Info("starting server", "port", cfg.Port, "version", cfg.Version)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Error("server failed to start", "error", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done()
	log.Info("shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("graceful shutdown failed", "error", err)
	}
}
