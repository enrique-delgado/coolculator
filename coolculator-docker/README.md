# coolculator-docker

Runs `coolculator-backend` and `coolculator-ui` together via Docker Compose — the two components' own Dockerfiles do the actual building; this just wires them together.

## Running

```bash
docker compose up --build
```

Or on Windows, double-click `build-and-start.bat` (equivalent, plus prints the URLs).

| Service | URL |
|---|---|
| Frontend | http://localhost:8081 |
| Backend | http://localhost:8080 (Swagger UI at `/swagger/index.html`) |

The frontend won't start until the backend reports healthy (`depends_on: condition: service_healthy`, watching the backend image's own `HEALTHCHECK`) — no fixed sleep, no race where the page loads before the API it needs is actually up.

## What's here

- **`backend`** — builds `../coolculator-backend`'s image, maps `8080:8080`. `ALLOWED_ORIGINS` is set to the frontend's host-facing origin (`http://localhost:8081`) so the browser's CORS preflight succeeds.
- **`frontend`** — builds `../coolculator-ui`'s image, maps `8081:80`. `API_BASE_URL` is set to `http://localhost:8080` — **deliberately the host-mapped port, not the Docker-internal service name** (`http://backend:8080`). The frontend is a static SPA: its API calls run in the *browser*, which only ever sees the host's ports, not the Compose network. See `coolculator-ui/src/config/env.ts` and its `docker/` folder for how that value actually reaches the running app (a small runtime-config script regenerated at container startup, not baked into the build).

## Configuration

Optional — everything works with no `.env` file at all. Copy `.env.example` to `.env` to set the backend's build metadata (`VERSION`, `COMMIT`, `BUILD_TIME`), e.g. from CI.

## Mapping to the Postman environments

`../coolculator-postman`'s three environments correspond to:

| Environment | `apiBaseUrl` | Matches |
|---|---|---|
| `coolculator-local` | `http://localhost:8080` | `coolculator-backend` run directly (`go run ./cmd/api`) |
| `coolculator-docker` | `http://localhost:8080` | This compose stack — same port, since the backend's host mapping here is also `:8080` |
| `coolculator-render` | *(placeholder)* | A future Render deployment |

This has been verified end-to-end: `docker compose up --build`, both containers reach `healthy`, the full Postman collection passes against it unmodified (17 requests, 52 assertions), and the frontend was exercised in a real browser through the composed stack — including the About panel's live call to the backend's `/info` across the two containers.

## Stopping

```bash
docker compose down
```
