// Package config loads the backend's runtime configuration from environment
// variables, so the same built binary/image runs unmodified across every
// environment (local, Docker, Render, ...) — only the environment differs.
package config

import (
	"os"
	"strings"
)

// Config holds all runtime configuration for the backend.
type Config struct {
	// Port is the TCP port the HTTP server listens on.
	Port string
	// LogLevel is the minimum slog level to emit: debug|info|warn|error.
	LogLevel string
	// AllowedOrigins is the CORS allow-list. Empty disables CORS entirely
	// rather than defaulting to an open policy — set explicitly per
	// environment (e.g. the frontend's own origin).
	AllowedOrigins []string
	// Version, Commit, and BuildTime back the /info endpoint. Read from
	// the environment like everything else here — kept consistent with
	// the rest of Config rather than mixed with a separate -ldflags
	// mechanism. The Dockerfile bakes them in as image ENV from build
	// ARGs, so a container needs no extra flags at `docker run` time;
	// default to "dev"/"unknown" so a plain `go run` still works locally.
	Version   string
	Commit    string
	BuildTime string
}

// Load reads configuration from environment variables, applying sane
// defaults for local development where a variable isn't set.
func Load() Config {
	return Config{
		Port:           getEnv("PORT", "8080"),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		AllowedOrigins: splitCSV(getEnv("ALLOWED_ORIGINS", "")),
		Version:        getEnv("VERSION", "dev"),
		Commit:         getEnv("COMMIT", "unknown"),
		BuildTime:      getEnv("BUILD_TIME", "unknown"),
	}
}

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func splitCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}
