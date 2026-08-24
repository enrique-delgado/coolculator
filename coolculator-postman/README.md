# coolculator-postman

A Postman collection for `coolculator-backend`'s API, plus three environments so the same collection targets a local run, a Docker run, or a Render deployment by switching one variable.

## Importing into Postman

1. Postman → **Import** → select `coolculator.postman_collection.json`.
2. **Import** again for each of the three environment files (`coolculator-local`, `coolculator-docker`, `coolculator-render`).
3. Pick an environment from the dropdown in the top-right corner before sending requests.

Every request in the collection uses `{{apiBaseUrl}}` — the single variable each environment defines — so nothing else needs to change when switching targets.

| Environment | `apiBaseUrl` | Points at |
|---|---|---|
| `coolculator-local` | `http://localhost:8080` | `coolculator-backend` run directly (`go run ./cmd/api`) |
| `coolculator-docker` | `http://localhost:8080` | `coolculator-backend` run via `coolculator-docker`'s `docker-compose` (update this if that component maps a different host port once it's built) |
| `coolculator-render` | `https://coolculator-backend.onrender.com` | The Render deployment — **replace with the real service URL** once deployed; this is a placeholder |

## What's in the collection

- **Health & Info** — `GET /health`, `GET /info`.
- **Calculate** — one request per operation (add, subtract, multiply, divide, pow, sqrt, percentage), plus a regression request (`Explicit Zero Operand`) proving `operand1: 0` is accepted rather than treated as missing.
- **Calculate — Error Cases** — division by zero, negative `sqrt`, a missing required operand, an unsupported operation, both directions of operand-count mismatch, and malformed JSON — one request per documented error code.

Every request asserts its status code and relevant response fields; a collection-level test (applies to every request) asserts the `X-Request-Id` response header is always present.

## Running headlessly via Newman

[Newman](https://github.com/postmanlabs/newman) is Postman's CLI collection runner — this is what CI (or you, ad hoc) uses to run the collection without opening the Postman app.

```bash
# One-time setup — Newman isn't installed with anything else in this repo:
npm install -g newman
# (or skip the install and run it ad hoc via: npx newman ...)

# Run the collection against a given environment:
newman run coolculator.postman_collection.json \
  -e coolculator-local.postman_environment.json
```

Swap `-e` to target a different environment. To point at a URL that isn't in any environment file yet (e.g. a fresh local port), override the variable directly without editing the file:

```bash
newman run coolculator.postman_collection.json \
  -e coolculator-local.postman_environment.json \
  --env-var apiBaseUrl=http://localhost:8090
```

This collection has been run against a live instance of `coolculator-backend` and passes in full (17 requests, 52 assertions).

## Keeping this in sync

Whenever `coolculator-backend`'s API changes (new operation, new error code, new field), update this collection alongside it — see [`../docs/03-api-contract.md`](../docs/03-api-contract.md) for the source-of-truth contract and the backend's generated Swagger (`/swagger/index.html`) for the authoritative schema.
