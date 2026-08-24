# Requirements Specification — coolculator

This document defines the functional and non-functional requirements for **coolculator**, a full-stack calculator application. It was shaped through an initial requirements-and-architecture discussion, whose individual decisions (and the reasoning behind them) are logged in [`00-decisions.md`](00-decisions.md). Items explicitly deferred are marked **(Phase 2)** and tracked in [`06-roadmap.md`](06-roadmap.md).

## Overview

A full-stack calculator: React (TypeScript) frontend, Go REST backend. All arithmetic is evaluated server-side by design — the frontend is a thin client over the API — to keep responsibilities clearly separated, even though this isn't the most efficient choice for the operations involved.

## Functional Requirements

### Operations (backend, exposed via REST, invoked by frontend)
- Addition, Subtraction, Multiplication, Division
- Exponentiation, Square Root, Percentage

### Backend (REST API)
- One endpoint family for calculator operations; validates input declaratively (request DTOs carry validation tags).
- Handles edge cases explicitly: division by zero, invalid/non-numeric input, overflow/NaN/Inf results.
- Returns results — and errors — as JSON, using a consistent envelope (see [`03-api-contract.md`](03-api-contract.md)).
- Clear layer separation: REST handlers → service layer → domain (see [`02-architecture.md`](02-architecture.md)).
- Swagger/OpenAPI documentation generated from code annotations (`swaggo`).
- Structured logs for every operation invocation (input, result or error, duration).
- Exposes `/health` (liveness) and `/info` (build/version info, consumed by the frontend's About screen).

### Frontend (React + TypeScript)
- Full mouse, keyboard, or mixed operation — every calculation performable either way.
- Consistent `Tab` order across all interactive elements.
- Input validation and clear inline error/validation messages.
- Responsive layout with basic mobile support.
- Two languages, English and Spanish, structured so adding a third is just a new locale file (`react-i18next`).
- Memory function (M+, M−, MR, MC) — **client-side only**, per [D3](00-decisions.md#d3--calculator-memory-mm%E2%88%92mrmc-client-side-only). Hovering any memory button shows a tooltip with the current stored value.
- Light/dark mode toggle.
- Four selectable color themes: two sober/minimalist, two youthful/psychedelic — independent of the light/dark toggle.
- "About" panel showing: frontend version, backend version (fetched via `/info`), GitHub repo URL, author name + email, copyright text, and a short contribution invitation.
- A single, centrally defined API base URL (one constant / one env var) used by every API call — changing environments means changing that one value.
- On API failure (e.g. backend unreachable), show a clean user-facing error message; log the detailed error to the browser console (or an injectable logger).

## Non-Functional Requirements (in scope now)

- Clean, idiomatic, readable code on both sides; SOLID applied where it earns its keep (not forced onto a 4-operation domain).
- Lite-hexagonal / clean layering on the backend (handlers ⊥ services ⊥ domain), enabling unit tests per layer without a live server.
- Backend is stateless and thread-safe by construction — no shared mutable state across requests.
- Idiomatic Go error handling (wrapped errors, sentinel/domain error types, no panics across API boundaries).
- Unit tests required for every REST handler and every service class/function; encouraged for other units (validators, domain helpers). Coverage report generated (`go test -cover`, Vitest `--coverage`).
- Integration/API-level tests per [D2](00-decisions.md#d2--api-integration-tests-go-httptest--testify), run immediately after unit tests in the build.
- Documentation: root + per-component READMEs (setup, run, API examples, design rationale), see [`05-folder-structure.md`](05-folder-structure.md).
- Runs in Docker, individually and together via `docker-compose`; see [D4](00-decisions.md#d4--deployment-target-containerized-classic-deploy-everywhere-no-faas).
- Basic structured logging (backend: `slog`; frontend: console + swappable logger) — full metrics/tracing stack is Phase 2.

## Deferred to Phase 2 (see roadmap for detail)

- Full observability stack (Prometheus metrics, OpenTelemetry tracing, dashboards).
- Multi-cloud serverless/FaaS deployment (e.g. AWS Lambda adapter).
- Load/scale validation ("millions of requests") — the design won't preclude it, but we won't build or prove it now.
- Backend-side i18n / `Accept-Language`-aware error text (currently: locale-agnostic error codes, see D5).
- Deeper DDD tactical patterns (aggregates, domain events) — overkill for this domain size today.

## Constraints

- Frontend: React + TypeScript.
- Backend: Go.
- Deployment: Docker-first, container-portable (D4).

## Deliverables Checklist

- [ ] Backend source (`coolculator-backend`) with unit + integration tests and coverage report.
- [ ] Postman collection + 3 environments (`coolculator-postman`).
- [ ] Backend Dockerfile, verified to run standalone.
- [ ] Frontend source (`coolculator-ui`) with unit tests and coverage report.
- [ ] Frontend Dockerfile, verified to run standalone.
- [ ] `docker-compose` + Windows `.bat` launcher (`coolculator-docker`), verified to run both together.
- [ ] Root + per-component READMEs (setup, run instructions, API examples, design decisions).
- [ ] This SDD doc set, reviewed and approved before implementation begins.
