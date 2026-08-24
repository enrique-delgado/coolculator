package handler

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"coolculator-backend/internal/http/dto"
)

func TestInfoHandler(t *testing.T) {
	h := NewInfoHandler("1.2.3", "abc1234", "2026-08-23T00:00:00Z")
	req := httptest.NewRequest(http.MethodGet, "/info", nil)
	rec := httptest.NewRecorder()

	h.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	var resp dto.InfoResponse
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &resp))
	assert.Equal(t, "1.2.3", resp.Version)
	assert.Equal(t, "abc1234", resp.Commit)
	assert.Equal(t, "2026-08-23T00:00:00Z", resp.BuiltAt)
}
