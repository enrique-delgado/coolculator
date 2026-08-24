# AGENTS.md — coolculator-docker

Scope: this file governs `coolculator-docker/` only. See the repository root `AGENTS.md` for cross-project orientation.

## Adding a service

Add a new top-level entry under `services:` in `docker-compose.yml`, pointing `build.context` at that component's own folder (each component owns its own `Dockerfile` — this file never defines build steps itself). If the browser needs to reach it directly (not just container-to-container), map its port and use the **host-mapped** port in any value handed to the frontend — never the Compose-internal service name (see the `frontend.environment.API_BASE_URL` comment in `docker-compose.yml` for why).

## Conventions

- Prefer relying on each image's own `HEALTHCHECK` (declared in that component's `Dockerfile`) over redeclaring one here — one definition of "healthy" per service, not two that can drift apart.
- `depends_on: condition: service_healthy` (not just `depends_on: [service]`) for anything that shouldn't start before its dependency is actually ready to serve traffic.
- Env vars a service needs at Compose level go in `environment:` on that service, not a shared top-level block — keeps each service's actual requirements visible in one place.
- Optional, non-secret Compose-level overrides (build metadata, etc.) go through `.env.example` → `.env`, referenced as `${VAR:-default}` so the stack still runs with no `.env` present.

## Verifying a change

```bash
docker compose up --build
# both services should reach "healthy" in `docker compose ps`
```

Then re-run the Postman collection's `coolculator-docker` environment against it (`coolculator-postman/`) — that's the actual acceptance check, not just "the containers started."
