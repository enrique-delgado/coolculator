# syntax=docker/dockerfile:1

# ---- Build stage ----------------------------------------------------------
FROM golang:1.25-alpine AS builder
WORKDIR /src

# Cache module downloads in their own layer, separate from source changes.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Regenerate the Swagger spec from the handler annotations — it's gitignored
# (see .gitignore) so the annotations stay the single source of truth rather
# than a committed, driftable copy — then compile a static, stripped binary.
RUN go tool swag init -g cmd/api/main.go -o docs \
 && CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/coolculator-backend ./cmd/api

# ---- Runtime stage ----------------------------------------------------------
FROM alpine:3.20 AS runtime

# ca-certificates: not needed by any endpoint today (no outbound HTTPS
# calls), kept anyway — a few hundred KB, and the first outbound HTTPS call
# added later would silently fail without it.
RUN apk add --no-cache ca-certificates \
 && addgroup -S coolculator && adduser -S coolculator -G coolculator

WORKDIR /app
COPY --from=builder /out/coolculator-backend .

# Baked into the image so `docker run` needs no extra flags to get a
# meaningful /info response; override any of these at build time with
# --build-arg, or at run time with -e (env always wins over image ENV).
ARG VERSION=dev
ARG COMMIT=unknown
ARG BUILD_TIME=unknown
ENV VERSION=${VERSION} \
    COMMIT=${COMMIT} \
    BUILD_TIME=${BUILD_TIME} \
    PORT=8080

USER coolculator
EXPOSE 8080

# Same liveness check Docker/Compose/most cloud container platforms expect;
# wget is busybox-provided in alpine, so no extra package needed for it.
# 127.0.0.1, not "localhost": found via coolculator-ui's Dockerfile that
# "localhost" can resolve to ::1 first and fail in an IPv4-only container —
# Go's net/http happens to listen dual-stack by default so this specific
# binary isn't actually affected, but pinning to 127.0.0.1 removes the
# ambiguity rather than relying on that implementation detail.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" || exit 1

ENTRYPOINT ["./coolculator-backend"]
