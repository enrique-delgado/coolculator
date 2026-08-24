# coolculator

A standard calculator, built with a deliberately overkill full-stack approach: Go, React, Docker, Swagger, and Claude Code — an entire stack for one very simple calculator.

All arithmetic is performed by the backend; the frontend is a typed client over it. Both are clean/lite-hexagonally layered, fully unit- and integration-tested, and containerized.

## Components

| Component | What it is |
|---|---|
| [`coolculator-backend`](coolculator-backend) | Go REST API (chi, `go-playground/validator`, `slog`, generated Swagger). All arithmetic lives here. |
| [`coolculator-ui`](coolculator-ui) | React + TypeScript frontend. i18n (EN/ES), 4 themes × light/dark, memory, keyboard support, an About panel. |
| [`coolculator-docker`](coolculator-docker) | Docker Compose wiring the two together; `start.bat` for Windows. |
| [`coolculator-postman`](coolculator-postman) | A Postman collection + 3 environments (local/Docker/Render) covering every operation and documented error case. |

Each has its own `README.md` (setup, run, design notes) and `AGENTS.md` (conventions for working in that folder).

## Quickstart

```bash
cd coolculator-docker
docker compose up --build
```

Then open http://localhost:8081. The backend's Swagger UI is at http://localhost:8080/swagger/index.html.

## Design docs

[`docs/`](docs) has the full spec this was built from: requirements, architecture, the API contract, the test plan, and — in [`docs/00-decisions.md`](docs/00-decisions.md) — every non-obvious decision with its reasoning, alternatives considered, and (where implementation surfaced something the design missed) a correction.

## Build order

Backend → Postman collection → backend Docker → frontend → frontend Docker + Compose (see [`docs/06-roadmap.md`](docs/06-roadmap.md)). Each step was verified against the real, running previous step before moving on — not just "it compiles."

## Built with Claude Code

This project was built in collaboration with [Claude Code](https://claude.com/claude-code) — not as autocomplete, but as an active technical collaborator: proposing a design, then revising it when questioned (the request/response shape, how a `0` operand is distinguished from a missing one, whether the API should echo back what it was sent); and catching real bugs by actually running things rather than trusting that code which compiles is code that works — a CSS specificity bug found via live browser testing, a Docker healthcheck failing on IPv6 found by actually starting the container, a test that only passed by coincidence of an unset env var, caught the moment that var was set for real.

The full decision trail — including the points where a first answer was wrong and got corrected — is in [`docs/00-decisions.md`](docs/00-decisions.md). The complete, unedited conversation this project was built through is in [`CONVERSATION.md`](CONVERSATION.md).
