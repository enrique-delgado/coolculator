# Architecture

## Backend — `coolculator-backend` (lite-hexagonal / clean layering)

Rationale: full hexagonal/DDD (ports-and-adapters with multiple driven adapters, aggregates, domain events) is more than a stateless 4-operation calculator needs — see [D1](00-decisions.md#d1--scope-ship-the-core-first-defer-heavier-infrastructure-to-a-backlog). We keep the *shape* (clear inbound/outbound boundaries, dependency inversion, testable core) without the ceremony that shape doesn't need yet.

```
coolculator-backend/
  cmd/api/main.go            # composition root: wires config, logger, router, starts server
  internal/
    domain/                  # pure business types & rules — no framework imports
      operation.go           #   Operation enum (Add, Subtract, ..., Sqrt, Percentage)
      calculation.go         #   Operand, CalculationResult value types
      errors.go              #   sentinel domain errors (ErrDivisionByZero, ErrInvalidOperand, ...)
    service/                 # use-case layer: orchestrates domain rules, stateless
      calculator_service.go
      calculator_service_test.go
    http/                    # inbound adapter: REST
      handler/
        calculate_handler.go
        health_handler.go
        info_handler.go
        *_test.go            # handler unit tests, service mocked via interface
      dto/                   # request/response structs with validation tags
      middleware/            # request-id, recovery, CORS, structured-log middleware
      router.go
    platform/
      logger/                # slog setup
      config/                # env-based config loader
  test/
    integration/              # httptest-based suite, build-tagged `integration` — see D2
  docs/                        # swaggo-generated OpenAPI output (generated, not hand-written)
  Dockerfile
  Makefile
  go.mod
```

**Key choices:**
- Router: `chi`. See [D9](00-decisions.md#d9--router-chi).
- Validation: `go-playground/validator` struct tags on DTOs, so validation is declarative, matching the requirement. `operand1`/`operand2` are `*float64` (pointers, not plain `float64`), so `validate:"required"` checks non-nil rather than non-zero — otherwise a legitimate `0` operand would be wrongly rejected. See [D11](00-decisions.md#d11--operand1--operand2-as-flat-pointer-fields-not-an-array). Cross-field rules that depend on another field's value (e.g. `operand2`'s presence depending on `operation`) aren't expressible as a single declarative tag — those are a registered struct-level validator function, still declarative in the sense that it plugs into the same validation pipeline, but hand-written.
- Swagger: `swaggo/swag` annotations on handlers, generated at build time. Cross-cutting middleware behavior (`X-Request-Id`, see D8) isn't auto-detected by swag's static parsing, so it's documented explicitly via `@Param header`/`@Header` annotations on each handler — see [D10](00-decisions.md#d10--document-x-request-id-in-swagger-via-per-handler-annotations).
- Logging: `log/slog`, structured, one line per operation with input/result/duration/request-id.
- Request ID: `chi`'s built-in `middleware.RequestID` reads an incoming `X-Request-Id` header if the caller sent one, otherwise generates a UUID at the edge; the ID is echoed back on the response header, carried through `context.Context`, and included in every `slog` line for that request. See [D8](00-decisions.md#d8--request-id-header-x-request-id-generated-if-absent).
- Errors: domain sentinel errors (`errors.Is`-compatible), translated to HTTP status + error code at the handler boundary only — the service/domain layers never know about HTTP.
- Concurrency/thread-safety: handlers and services hold no mutable fields; every request is independent. No global state.

## Frontend — `coolculator-ui` (React + TypeScript)

```
coolculator-ui/
  src/
    api/
      client.ts               # fetch wrapper; single BASE_URL from one config module
      calculatorApi.ts        # typed calls: calculate(), getVersion()
    features/
      calculator/
        components/           # Display, Keypad, MemoryPanel (tooltip on hover)
        hooks/useCalculator.ts
        state/                # memory state (client-side, D3), local reducer or context
      about/
        AboutDialog.tsx
    i18n/
      en.json
      es.json
      i18n.ts                 # react-i18next setup
    theme/
      ThemeProvider.tsx        # light/dark + 4 color-scheme tokens via CSS variables
      themes/{sober-1,sober-2,psychedelic-1,psychedelic-2}.css
    config/
      env.ts                   # single source of API_BASE_URL, from VITE_API_BASE_URL
    logging/
      logger.ts                 # console-backed, swappable
  Dockerfile
  package.json
```

**Key choices:**
- Build tool: Vite.
- i18n: `react-i18next`, keyed by backend error codes for error strings (D5) plus all static UI copy.
- Theming: CSS custom properties switched via a `data-theme` / `data-scheme` attribute on `<html>`, so themes are pure CSS — no runtime style recomputation.
- API base URL: one `.env` variable (`VITE_API_BASE_URL`), read through a single `config/env.ts` module — nothing else references `import.meta.env` directly, satisfying "one change updates everything."
- Error handling: API client throws a typed `ApiError`; UI shows a translated, user-safe message, full error logged via `logging/logger.ts`.
- Keyboard: a single keymap module maps digit/operator keys to the same handlers the buttons use, and `tabIndex` is set explicitly across the keypad so `Tab` order is deterministic regardless of CSS layout.

## Cross-cutting

- **API contract** is the single source of truth both sides code against — see [`03-api-contract.md`](03-api-contract.md). Backend generates Swagger from code; frontend types are kept in sync manually at this scope (Phase 2 candidate: generate frontend types from the OpenAPI spec).
- **Versioning:** both components expose their version (backend via `/info`, frontend via a build-time constant) for the About screen.
