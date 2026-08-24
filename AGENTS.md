# AGENTS.md — coolculator

This repo holds independent sub-projects sharing one root — a Go backend, a React frontend, Docker orchestration, and a Postman collection. Each has its own conventions; this file only covers what's genuinely repo-wide.

| Folder | Conventions |
|---|---|
| [`coolculator-backend/AGENTS.md`](coolculator-backend/AGENTS.md) | Go: layering, adding an operation, test/lint/Docker commands. |
| [`coolculator-ui/AGENTS.md`](coolculator-ui/AGENTS.md) | React/TS: conventions, adding an operation, verifying UI changes for real. |
| [`coolculator-docker/AGENTS.md`](coolculator-docker/AGENTS.md) | Adding a service, Compose conventions. |
| [`coolculator-postman/AGENTS.md`](coolculator-postman/AGENTS.md) | Keeping the collection in sync with the API, Newman usage. |

## Repo-wide rules

- No cross-folder imports/dependencies — each component builds and runs standalone. `coolculator-docker` is the only place that references the others, and only via `build.context`, not shared code.
- Keep [`docs/03-api-contract.md`](docs/03-api-contract.md) in sync with the backend's generated Swagger whenever the API changes — the doc is the human-readable draft, Swagger (`swag init`) is the generated, authoritative one, but they should never say different things.
- Record any non-obvious decision (and, if implementation later contradicts it, the correction) in [`docs/00-decisions.md`](docs/00-decisions.md) — that log is what makes this repo's reasoning legible to someone who wasn't in the room.
- Verify against the real, running thing before considering a change done — a build/typecheck/test pass is necessary, not sufficient. Several real bugs in this project (a CSS specificity clash, a Docker healthcheck failing on IPv6, a test coupled to ambient env state) were only caught this way.
