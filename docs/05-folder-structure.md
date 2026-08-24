# Repository / Folder Structure

Single root containing four independent sub-projects, deliberately with no shared root tooling beyond orientation docs:

```
coolculator/                      # repo root
  README.md                       # thin: what this repo is, links to each component + docs/
  AGENTS.md                       # thin: orientation + links to per-folder AGENTS.md (see 07)
  docs/                           # this SDD doc set
  coolculator-backend/            # Go REST API — see 02-architecture.md
    README.md
    AGENTS.md
  coolculator-ui/                 # React + TypeScript frontend
    README.md
    AGENTS.md
  coolculator-docker/             # docker-compose + Windows launcher
    docker-compose.yml
    start.bat
    README.md
    AGENTS.md
  coolculator-postman/            # Postman collection + 3 environments
    coolculator.postman_collection.json
    coolculator-local.postman_environment.json
    coolculator-docker.postman_environment.json
    coolculator-render.postman_environment.json
    README.md
    AGENTS.md
```

## README outline per component

**Root `README.md`:** one paragraph on what coolculator is, a table linking to each sub-folder's README, a pointer to `docs/` for the SDD, and the recommended read/build order (backend → Postman → backend Docker → frontend → frontend Docker, per [`06-roadmap.md`](06-roadmap.md)).

**`coolculator-backend/README.md`:** what it is; prerequisites (Go version); run locally (`go run ./cmd/api`); run tests (`make test`); run in Docker standalone; env vars/config; API summary + link to Swagger UI route; design rationale (layering, error handling, D2/D5 decisions).

**`coolculator-ui/README.md`:** what it is; prerequisites (Node version); run locally (`npm install && npm run dev`); run tests; run in Docker standalone; how to point it at a different backend (the one `VITE_API_BASE_URL`); i18n/theme notes; design rationale (D3 memory-client-side, keyboard/Tab handling).

**`coolculator-docker/README.md`:** what services `docker-compose.yml` starts and why; how to run (`docker compose up --build`, or `start.bat` on Windows); which env file/vars it expects; how it maps to the three Postman environments.

**`coolculator-postman/README.md`:** how to import the collection + 3 environments into Postman; what each environment's single `apiBaseUrl` variable should point to (local Go process, local Docker, Render); and how to run the collection headlessly via Newman — including installing it (`npm install -g newman`, or `npx newman` with no install) and selecting an environment with `-e` — as the optional smoke step from [`04-test-plan.md`](04-test-plan.md).
