// Package logger builds the application's structured logger.
package logger

import (
	"log/slog"
	"os"
	"strings"
)

// New builds a JSON-structured slog.Logger writing to stdout — JSON so log
// aggregation tools can filter/search on fields rather than parsing text.
func New(level slog.Level) *slog.Logger {
	handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})
	return slog.New(handler)
}

// ParseLevel maps a level name (case-insensitive) to a slog.Level, defaulting
// to Info for an empty or unrecognized value rather than failing startup
// over a logging misconfiguration.
func ParseLevel(name string) slog.Level {
	switch strings.ToLower(name) {
	case "debug":
		return slog.LevelDebug
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}
