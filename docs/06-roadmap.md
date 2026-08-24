# Roadmap

## Build order

Set during the initial planning discussion and confirmed here: each step's output (a stable contract, generated Swagger, a running container) is what the next step is built against.

1. **Backend** (`coolculator-backend`) — domain, service, handlers, unit tests, integration tests, Swagger.
2. **Postman collection** for the backend — requests + 3 environments.
3. **Backend Docker** — Dockerfile, verified standalone (`docker build && docker run`, then re-run the Postman collection against it).
4. **Frontend** (`coolculator-ui`) — components, API client, i18n, theming, memory, About panel, unit tests.
5. **Frontend Docker** — Dockerfile, then `coolculator-docker`'s compose file wiring both together + the Windows `.bat` launcher.

Each step ends with its own README written before moving to the next, so documentation never lags implementation.

## Milestone gate before implementation starts

This SDD doc set is reviewed and approved before implementation begins; further edits are folded back into these docs as they come up.

## Phase 2 backlog (deferred by [D1](00-decisions.md#d1--scope-ship-the-core-first-defer-heavier-infrastructure-to-a-backlog), not dropped)

Tracked here so this scope isn't lost, just sequenced — coolculator is expected to keep evolving beyond this first release:

- **Observability:** Prometheus metrics endpoint, OpenTelemetry tracing, a Grafana/dashboard example.
- **Serverless/FaaS:** AWS Lambda (or equivalent) handler adapter on top of the existing container image, API Gateway wiring.
- **Scale validation:** load-testing script (e.g. `k6`) and a documented capacity/scaling story, if very high request volumes need to be demonstrated rather than just designed for.
- **API-test DSL parity:** revisit Godog (Go's Cucumber/Gherkin implementation) if more readable, BDD-style `Given/When/Then` scenarios are wanted instead of Go-native `httptest`/`testify`.
- **Backend i18n:** `Accept-Language`-aware error responses, if D5's locale-agnostic-codes approach turns out to be insufficient.
- **Generated frontend types:** derive TypeScript API types from the backend's OpenAPI spec instead of hand-maintaining them.
- **Deeper DDD:** aggregates/domain events, if the domain grows beyond stateless arithmetic (e.g. calculation history, user accounts).
- **CI/CD:** promote the CI pipeline in `04-test-plan.md` into a full deploy pipeline (e.g. auto-deploy to Render on merge to main).
