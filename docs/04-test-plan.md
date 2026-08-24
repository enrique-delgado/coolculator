# Test Plan

## Backend (`coolculator-backend`)

**Unit tests (required — REST handlers + services, per the requirements):**
- `internal/service/*_test.go` — every operation, boundary values, division by zero, invalid input, `NaN`/`Inf` results.
- `internal/http/handler/*_test.go` — request parsing/validation, correct status codes and error envelopes, service mocked behind an interface so handler tests don't hit real logic twice.
- Encouraged, not required: domain value-object tests (`internal/domain/*_test.go`).
- Tooling: standard `testing` package + `testify` (`assert`/`require` + `mock` where a service double is useful). Table-driven tests throughout (idiomatic Go).
- Coverage: `go test ./... -cover -coverprofile=coverage.out`; `go tool cover -html` for a local report; summary surfaced in CI.

**Integration tests (API-level, per [D2](00-decisions.md#d2--api-integration-tests-go-httptest--testify)):**
- Location: `test/integration/`, build-tagged `integration` so `go test ./...` (unit) stays fast and these run as a distinct step.
- Approach: boot the real `router.go` against an `httptest.Server`, drive it with `net/http` (or `resty`) as a black-box client.
- Coverage: (i) `/health` returns 200 — service-up check; (ii) `/api/v1/calculate` happy paths for every operation; (iii) documented error cases (division by zero, invalid operand, wrong arity).
- Build lifecycle order: `make test` runs unit → integration, in that sequence — the integration suite only runs once the unit suite has passed. CI job fails fast on unit failures before attempting integration.

**Optional smoke layer:** once a real deployment exists (Docker/Render), run the Postman collection as a black-box smoke check via [Newman](https://github.com/postmanlabs/newman) (Postman's command-line collection runner) — reuses a required deliverable instead of a new tool, complementary to the in-process integration suite above.

```bash
# One-time setup — Newman isn't installed with anything else in this repo:
npm install -g newman
# (or skip the global install and run it ad hoc via: npx newman ...)

# Run the collection against a given environment:
newman run coolculator-postman/coolculator.postman_collection.json \
  -e coolculator-postman/coolculator-docker.postman_environment.json
```
Swap the `-e` file to target a different environment — `coolculator-local.postman_environment.json` or `coolculator-render.postman_environment.json` — each sets the same single `apiBaseUrl` variable to the right value for that environment (see [`05-folder-structure.md`](05-folder-structure.md)).

## Frontend (`coolculator-ui`)

- Framework: Vitest + React Testing Library.
- Unit/component tests: keypad → API-call wiring (API mocked), memory operations (M+/M−/MR/MC) and their tooltip, theme + language switching, Tab-order across the keypad, API-error → user-message rendering.
- Coverage: `vitest run --coverage`.

## CI pipeline order (both components)
1. Lint/format check.
2. Backend unit tests → backend integration tests.
3. Frontend unit/component tests.
4. Build both Docker images.
5. (Optional, post-deploy) Newman smoke run against the deployed environment.

Detailed CI workflow file is produced during the implementation phase, once the SDD docs are approved.
