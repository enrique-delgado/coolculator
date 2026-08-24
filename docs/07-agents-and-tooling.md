# AGENTS.md, Tooling & Quality Recommendations

## `AGENTS.md` placement (per [D7](00-decisions.md#d7--agentsmd-thin-root--one-scoped-file-per-component))

**Root `AGENTS.md`** — orientation only, roughly:
- One paragraph: this repo holds independent sub-projects (Go backend, React frontend, Docker orchestration, Postman collection); each has its own conventions.
- A table pointing to each sub-folder's `AGENTS.md`.
- Repo-wide rules that are genuinely repo-wide and few: e.g. "don't add cross-folder imports/dependencies," "keep the API contract in `docs/03-api-contract.md` in sync with `swaggo` output."

**`coolculator-backend/AGENTS.md`** — Go-specific: layering rules (domain never imports `net/http`; handlers never contain business logic), how to add a new operation (domain → service test → service → handler test → handler → Swagger annotation), test commands (`make test`, `make test-unit`, `make test-integration`), lint/format commands, error-handling conventions (sentinel errors + `errors.Is`, no panics across API boundary).

**`coolculator-ui/AGENTS.md`** — React/TS-specific: component conventions (functional components, hooks, no class components), where new UI strings go (`i18n/en.json` + `es.json`, never hardcoded), how theming tokens work, test commands (`npm test`), the single-API-base-URL rule (`config/env.ts` only).

**`coolculator-docker/AGENTS.md`** — how to add a new service to `docker-compose.yml`, env var naming convention, how the three environments (local/docker/render) map to Postman.

**`coolculator-postman/AGENTS.md`** — keep the collection in sync with `docs/03-api-contract.md`/Swagger whenever the API changes; how to regenerate/export; the Newman install + invocation for CI (see [`04-test-plan.md`](04-test-plan.md) for the exact commands).

## Recommended tooling

**Backend (Go):**
- `gofmt`/`goimports` + `golangci-lint` (staticcheck, errcheck, govet bundled) as a pre-commit/CI gate.
- `swaggo/swag` for OpenAPI generation from annotations.
- `testify` for assertions/mocks.

**Frontend (React/TS):**
- ESLint + Prettier, TypeScript `strict` mode on.
- Vitest + React Testing Library.

**Shared:**
- A single root-level GitHub Actions workflow (or two, one per component) implementing the CI order in [`04-test-plan.md`](04-test-plan.md).
- Conventional commits, if changelogs are wanted later — optional, not required.

## MCP servers / extra agent tooling

At this project's current scope, no additional MCP servers are needed — the built-in file/search/bash tools plus the `code-review` skill (already available in this environment) cover code quality review as the project evolves. Revisit if the project grows to need, e.g., a live GitHub-issues MCP or a database MCP once persistence is introduced (Phase 2).

## Skills

Use the environment's built-in `/code-review` (or `/code-review ultra` for deeper passes) periodically as the codebase grows, and `/simplify` after a feature lands to catch reuse/simplification opportunities before they calcify — both apply cleanly to this repo's Go and TypeScript code without any project-specific setup.
