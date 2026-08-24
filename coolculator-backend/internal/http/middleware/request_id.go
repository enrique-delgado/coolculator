// Package middleware holds this application's own HTTP middleware —
// request-ID echoing and structured request logging. Cross-cutting concerns
// with no per-handler code, chained onto the router in internal/http.
package middleware

import (
	"net/http"

	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

// EchoRequestID writes the request ID that chi's own middleware.RequestID
// placed in the request context back onto the response, under the same
// X-Request-Id header it may have been read from. chi's RequestID middleware
// only stores the ID in context — it never touches the response — so this
// is what actually makes the ID visible to the caller. Must be mounted
// after chi's middleware.RequestID in the chain.
func EchoRequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set(chimiddleware.RequestIDHeader, chimiddleware.GetReqID(r.Context()))
		next.ServeHTTP(w, r)
	})
}
