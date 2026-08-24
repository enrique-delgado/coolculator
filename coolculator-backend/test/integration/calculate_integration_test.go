//go:build integration

package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func postCalculate(t *testing.T, url, body string) *http.Response {
	t.Helper()
	resp, err := http.Post(url+"/api/v1/calculate", "application/json", bytes.NewBufferString(body))
	require.NoError(t, err)
	t.Cleanup(func() { resp.Body.Close() })
	return resp
}

func TestCalculate_HappyPaths(t *testing.T) {
	srv := newTestServer(t)

	tests := []struct {
		name string
		body string
		want float64
	}{
		{"add", `{"operation":"add","operand1":2,"operand2":3}`, 5},
		{"subtract", `{"operation":"subtract","operand1":10,"operand2":4}`, 6},
		{"multiply", `{"operation":"multiply","operand1":6,"operand2":7}`, 42},
		{"divide", `{"operation":"divide","operand1":10,"operand2":4}`, 2.5},
		{"pow", `{"operation":"pow","operand1":2,"operand2":10}`, 1024},
		{"sqrt", `{"operation":"sqrt","operand1":81}`, 9},
		{"percentage", `{"operation":"percentage","operand1":25,"operand2":200}`, 12.5},
		{"explicit zero operand accepted", `{"operation":"add","operand1":0,"operand2":5}`, 5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := postCalculate(t, srv.URL, tt.body)

			require.Equal(t, http.StatusOK, resp.StatusCode)
			assert.NotEmpty(t, resp.Header.Get("X-Request-Id"))

			var body struct {
				Result float64 `json:"result"`
			}
			require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
			assert.InDelta(t, tt.want, body.Result, 1e-9)
		})
	}
}

func TestCalculate_ErrorCases(t *testing.T) {
	srv := newTestServer(t)

	tests := []struct {
		name     string
		body     string
		wantCode string
	}{
		{"division by zero", `{"operation":"divide","operand1":10,"operand2":0}`, "DIVISION_BY_ZERO"},
		{"negative sqrt", `{"operation":"sqrt","operand1":-4}`, "INVALID_OPERAND"},
		{"missing operand1", `{"operation":"add","operand2":2}`, "INVALID_OPERAND"},
		{"unsupported operation", `{"operation":"modulo","operand1":1,"operand2":2}`, "INVALID_OPERATION"},
		{"binary op missing operand2", `{"operation":"add","operand1":1}`, "OPERAND_COUNT_MISMATCH"},
		{"unary op given operand2", `{"operation":"sqrt","operand1":4,"operand2":2}`, "OPERAND_COUNT_MISMATCH"},
		{"malformed json", `{not json`, "MALFORMED_REQUEST"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := postCalculate(t, srv.URL, tt.body)

			require.Equal(t, http.StatusBadRequest, resp.StatusCode)
			assert.NotEmpty(t, resp.Header.Get("X-Request-Id"))

			var body struct {
				Error struct {
					Code string `json:"code"`
				} `json:"error"`
			}
			require.NoError(t, json.NewDecoder(resp.Body).Decode(&body))
			assert.Equal(t, tt.wantCode, body.Error.Code)
		})
	}
}

func TestCalculate_HonorsIncomingRequestID(t *testing.T) {
	srv := newTestServer(t)

	req, err := http.NewRequest(http.MethodPost, srv.URL+"/api/v1/calculate", bytes.NewBufferString(`{"operation":"add","operand1":1,"operand2":1}`))
	require.NoError(t, err)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-Id", "test-fixed-id-123")

	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, "test-fixed-id-123", resp.Header.Get("X-Request-Id"))
}
