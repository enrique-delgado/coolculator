# coolculator-backend

The REST API for **coolculator** — a calculator application. Written in Go, using [chi](https://github.com/go-chi/chi) as the HTTP router. All arithmetic is performed here; the frontend (`coolculator-ui`) is a thin client over this API.

See [`../docs`](../docs) for the full design spec (requirements, architecture, and the reasoning behind every non-obvious decision).

## Prerequisites

- Go 1.23 or newer.

## Running locally

```bash
go run ./cmd/api
```

The server listens on `:8080` by default (see [Configuration](#configuration)). Once it's running:

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","operand1":2,"operand2":3}'
# {"result":5}

curl http://localhost:8080/health
# {"status":"ok"}
```

## Configuration

The binary is configured entirely through environment variables, so the same build runs unmodified across every environment:

| Variable          | Default   | Purpose                                                                 |
|--------------------|-----------|--------------------------------------------------------------------------|
| `PORT`             | `8080`    | TCP port the HTTP server listens on.                                    |
| `LOG_LEVEL`        | `info`    | Minimum log level: `debug`, `info`, `warn`, or `error`.                 |
| `ALLOWED_ORIGINS`  | *(empty)* | Comma-separated CORS allow-list. Empty disables CORS rather than opening it. |
| `VERSION`          | `dev`     | Reported by `/info`. Set at build time.                                 |
| `COMMIT`           | `unknown` | Reported by `/info`. Set at build time.                                 |
| `BUILD_TIME`       | `unknown` | Reported by `/info`. Set at build time.                                 |

## Running tests

```bash
go test ./... -cover                          # unit tests (fast, no network)
go test ./test/integration/... -tags=integration -v   # black-box API tests, real HTTP
```

Or via the Makefile, which runs them in the same order the CI pipeline does (unit, then integration):

```bash
make test
```

## API

| Method | Path                | Purpose                                  |
|--------|----------------------|-------------------------------------------|
| POST   | `/api/v1/calculate`  | Perform a calculation.                    |
| GET    | `/health`            | Liveness probe.                           |
| GET    | `/info`              | Build/version metadata (for the frontend's About panel). |

Full interactive documentation — generated from the handler code, never hand-maintained — is served at `/swagger/index.html` while the server is running. Regenerate it after changing any handler's annotations:

```bash
make swagger
# or: go tool swag init -g cmd/api/main.go -o docs
```

Every response carries an `X-Request-Id` header (echoed back if the caller sent one, generated otherwise) — useful for matching a client-side error to the corresponding server log line. Errors always use the same envelope:

```json
{ "error": { "code": "DIVISION_BY_ZERO", "params": {} } }
```

`code` is a stable, machine-readable identifier — never pre-translated text. The frontend's i18n layer maps each code to user-facing text in the active language.

See [`../docs/03-api-contract.md`](../docs/03-api-contract.md) for the full contract.

## Design notes

- **Layering:** `internal/domain` (pure business rules, no framework imports) → `internal/service` (stateless use-case orchestration) → `internal/http/handler` (REST adapters — decode, validate, translate errors to HTTP; no business logic). Each layer only depends on the one below it.
- **`operand1`/`operand2` are pointers** (`*float64`), not plain `float64` — this lets an explicit `0` be distinguished from a genuinely missing value, which a plain numeric field can't do (see `docs/00-decisions.md`, D11).
- **Errors** are domain sentinel values (`internal/domain/errors.go`), translated to an HTTP status + API error code in exactly one place (`internal/http/handler/errors.go`) — the domain and service layers never import `net/http`.
- **The success response doesn't echo the request** — see `docs/00-decisions.md`, D12.
- Running in Docker: this component's own `Dockerfile` runs standalone (below); wiring it together with the frontend via `docker-compose` is `coolculator-docker`, built in a later phase.

## Running in Docker

Multi-stage build: a `golang:1.25-alpine` builder stage regenerates the Swagger spec and compiles a static binary, then a minimal `alpine:3.20` runtime stage runs it as a non-root user (~42MB image, no Go toolchain included).

```bash
docker build \
  --build-arg VERSION=0.1.0 \
  --build-arg COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ) \
  -t coolculator-backend:local .

docker run -d --name coolculator-backend -p 8080:8080 coolculator-backend:local

curl http://localhost:8080/health
# {"status":"ok"}
curl http://localhost:8080/info
# {"version":"0.1.0","commit":"...","builtAt":"..."}
```

The `VERSION`/`COMMIT`/`BUILD_TIME` build args are optional — omit them for a `dev`/`unknown`-labeled image, which is fine for local use. They're baked into the image as `ENV`, so `/info` reports them with no extra flags needed at `docker run` time.

A `HEALTHCHECK` is built in (`docker ps` shows `healthy`/`unhealthy`), polling `/health` — the same endpoint Docker Compose and cloud container platforms use to know the service is ready.

This has been verified end-to-end: built, run standalone, and the full `coolculator-postman` collection re-run against the running container (17 requests, 52 assertions, all passing).
