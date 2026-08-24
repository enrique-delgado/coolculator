# AGENTS.md — coolculator-postman

Scope: this file governs `coolculator-postman/` only. See the repository root `AGENTS.md` for cross-project orientation.

## Keeping the collection in sync

Whenever `coolculator-backend`'s API surface changes:

1. Update the request(s) in `coolculator.postman_collection.json` to match — new operation → new request in the **Calculate** folder; new error code → new request in **Calculate — Error Cases**.
2. Update `../docs/03-api-contract.md` (repository root) alongside it — that file and this collection should never drift apart.
3. Re-run the collection against a live local instance before committing (see below) — every request should still pass.

## Editing the collection

Edit via the Postman app (Import → edit → **Export**, overwriting the JSON file), or edit the JSON directly for small changes — it's a standard Postman Collection Format v2.1 file, plain enough to hand-edit for adding one request. Keep the per-request `test` scripts: every request should assert its status code and the response fields that matter, not just "it returned something."

## Running via Newman (for CI or ad hoc)

```bash
npm install -g newman   # one-time; or use npx newman without installing
newman run coolculator.postman_collection.json -e coolculator-docker.postman_environment.json
```

See `README.md` for the full command reference, including how to override `apiBaseUrl` ad hoc without editing an environment file.

## Conventions

- Every request must use `{{apiBaseUrl}}` — never a hardcoded host. That's the entire point of the three environment files.
- Every request needs at least a status-code assertion; error-case requests must also assert the exact `error.code` returned, not just the status.
- Don't hand-edit the three `*.postman_environment.json` files' `id` fields — leave them as-is; only `values` should change.
