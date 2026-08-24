# AGENTS.md — coolculator-backend

Scope: this file governs `coolculator-backend/` only. See the repository root `AGENTS.md` for cross-project orientation.

## Layering — don't cross these boundaries

```
internal/domain   → pure business types & rules. No imports from net/http, chi, or any other package in this tree.
internal/service   → stateless use-case orchestration. Calls domain; knows nothing about HTTP.
internal/http/*    → REST adapters (handlers, DTOs, middleware, router). Decode/validate/translate only — no business logic.
```

A handler must never compute a result itself, and the domain package must never reference an HTTP status code or a `dto` type.

## Adding a new operation

1. Add the constant to `internal/domain/operation.go` and, if it's unary, to `unaryOperations`.
2. Add its case to `internal/domain/calculation.go`'s `Compute` switch.
3. Add table-driven cases to `internal/service/calculator_service_test.go`.
4. Add it to the `oneof=...` validator tag on `dto.CalculateRequest.Operation`.
5. Add a happy-path case to `test/integration/calculate_integration_test.go`.
6. Update `docs/03-api-contract.md`'s operation list (repository root).

No handler code changes — `CalculateHandler` is operation-agnostic by design.

## Commands

```bash
make run               # go run ./cmd/api
make test              # unit tests, then integration tests (same order as CI)
make test-unit
make test-integration
make swagger           # regenerate docs/ from handler annotations — run after any handler doc-comment change
make fmt               # gofmt -l -w .
make vet
make docker-build       # standalone image; swag regeneration happens inside the build
make docker-run         # run the image built above, mapped to :8080
```

## Conventions

- Errors: sentinel values in `internal/domain/errors.go`, checked with `errors.Is`. Never panic across a handler boundary — `chi/middleware.Recoverer` is a safety net, not a substitute for returning an error.
- Every handler mapping a domain error to an HTTP response goes through `mapDomainError` in `internal/http/handler/errors.go` — that's the one place domain errors become status codes/API error codes.
- New API error codes: add the constant in `internal/http/handler/errors.go` and document it in `docs/03-api-contract.md`.
- `operand1`/`operand2`-shaped fields anywhere in the DTO layer must be pointer types (`*float64`), not plain `float64` — see the README's Design notes and `docs/00-decisions.md` D11 for why.
- Keep `docs/03-api-contract.md` (repository root) in sync with reality — it's the human-readable draft; `make swagger`'s output is the generated, authoritative one.
