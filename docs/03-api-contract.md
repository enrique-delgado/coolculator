# API Contract (draft — full detail generated as Swagger/OpenAPI from code)

Base path: defined once per environment via the API base URL (see [D4](00-decisions.md#d4--deployment-target-containerized-classic-deploy-everywhere-no-faas) and the Postman environments). All routes below are relative to it, e.g. `{baseUrl}/api/v1/calculate`.

## `POST /api/v1/calculate`

**Request**
```json
{
  "operation": "divide",
  "operand1": 10,
  "operand2": 0
}
```
- `operation`: one of `add | subtract | multiply | divide | pow | sqrt | percentage` (required).
- `operand1`: number, **required**. `0` is a valid value — see [D11](00-decisions.md#d11--operand1--operand2-as-flat-pointer-fields-not-an-array).
- `operand2`: number, **optional** — required for binary operations, must be absent for unary ones (`sqrt`). `0` is a valid value here too, distinct from "not provided." Presence/absence is enforced by a struct-level rule keyed on `operation`, not a per-field tag (see D11) — undocumentable as a single static Swagger schema constraint, same limitation noted for `X-Request-Id` in D10.
- Fixed two-operand shape covers every operation currently in scope (all unary or binary); see D11 for what would change if a future operation needed more.

**Response — success (200)**
```json
{
  "result": 5
}
```
Does not echo `operation`/`operand1`/`operand2` — the caller already has them. Kept as a one-field object rather than a bare `5` for future extensibility. See [D12](00-decisions.md#d12--success-response-does-not-echo-the-request).

**Response — error (400)**
```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "params": {}
  }
}
```
Error codes (non-exhaustive, extended as needed): `DIVISION_BY_ZERO`, `INVALID_OPERAND`, `INVALID_OPERATION`, `OPERAND_COUNT_MISMATCH`, `RESULT_NOT_FINITE`. See [D5](00-decisions.md#d5--backend-error-messages-locale-agnostic-codes-not-translated-strings) — the frontend maps each code to translated text.

## `GET /health`
Liveness probe.
```json
{ "status": "ok" }
```
`200` when healthy; used by Docker `HEALTHCHECK` and the integration suite (D2).

## `GET /info`
```json
{ "version": "0.1.0", "commit": "abc1234", "builtAt": "2026-08-23T00:00:00Z" }
```
Consumed by the frontend's About panel. Named `/info` (not `/version`) so the payload can grow beyond a bare version string (e.g. service name, environment) without implying a rename later — a common convention for exposing build/runtime metadata from a service.

## Conventions
- All responses `Content-Type: application/json`.
- All errors use the `{ "error": { "code", "params" } }` envelope — never a bare string.
- HTTP status: `200` success, `400` validation/domain errors, `404` unknown route, `500` unexpected/internal (logged with full detail server-side, generic code returned to client).
- Every response carries an `X-Request-Id` header — echoed back if the caller sent one, generated otherwise. Useful for matching a client-side error (frontend console log, Postman run) to the corresponding server log line. See [D8](00-decisions.md#d8--request-id-header-x-request-id-generated-if-absent).

> This is the human-readable draft for review. Once implementation starts, `swaggo` annotations on the handlers generate the authoritative OpenAPI spec, and the Postman collection is built against that spec.
