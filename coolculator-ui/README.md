# coolculator-ui

The React + TypeScript frontend for **coolculator**. All arithmetic is performed by `coolculator-backend` — this app is a thin, typed client over that API, plus the UI chrome around it (memory, themes, i18n, an About panel).

See [`../docs`](../docs) for the full design spec.

## Prerequisites

- Node.js 20+ (built and tested against Node 24).

## Running locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173` by default. It expects `coolculator-backend` reachable at whatever `VITE_API_BASE_URL` is set to — see [Configuration](#configuration).

## Configuration

The single place the frontend's API base URL is defined is `VITE_API_BASE_URL`, read through `src/config/env.ts` — nothing else in the app touches `import.meta.env` directly. Changing environments means changing this one value:

| File         | Purpose                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.env`       | Committed, working local default (`coolculator-backend` run directly on `:8080`).                                                                     |
| `.env.local` | Gitignored — override locally without touching the committed default (e.g. to point at a Docker or Render backend). Copy `.env.example` to start one. |

Also configurable (About panel content — see [Design notes](#design-notes)):

| Variable            | Purpose                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `VITE_AUTHOR_NAME`  | Shown in the About panel. **Unset by default** — set it to your name.                                |
| `VITE_AUTHOR_EMAIL` | Shown in the About panel. Defaults to the project owner's email.                                     |
| `VITE_GITHUB_URL`   | Shown in the About panel, linked. **Unset by default** — set it once this repo has a home on GitHub. |

## Running tests

```bash
npm test              # vitest run — unit + component tests
npm run test:coverage # same, with a coverage report
npm run test:watch    # watch mode
```

Also: `npm run typecheck` (strict TypeScript, no emit) and `npm run lint` (ESLint).

## What's covered

Per [`../docs/04-test-plan.md`](../docs/04-test-plan.md): the calculator reducer (pure state-machine logic), the `useCalculator` hook (keypad → API wiring, mocked), the API client and `calculatorApi` (including that an explicit `operand1: 0` is sent as `0`, never omitted), memory operations and their hover tooltip, Tab order across the keypad, API-error → translated-message rendering, and theme/language switching.

## Design notes

- **All arithmetic goes through the backend** — the UI never computes a result itself, even for something as simple as addition, per the project's explicit separation-of-concerns goal.
- **Memory (M+/M−/MR/MC) is client-side only** (`src/features/calculator/state/calculatorReducer.ts`) — see `docs/00-decisions.md`, D3. It's the one exception: bookkeeping, not a math operation.
- **Keyboard operability**: every button is a real, natively focusable `<button>`, placed in the same order as the visual grid — so native Tab order already matches what a sighted mouse user sees, with no `tabIndex` management needed. Digits, `+ - * /`, `^` (power), `%`, Enter/`=`, Escape, and Backspace also work as direct single-key shortcuts. Square root and the four memory operations are intentionally **not** given invented single-key shortcuts — there's no standard convention for them on a normal keyboard, and Tab + Enter/Space already reaches them.
- **Fail-safe**: Clear (`C`) aborts an in-flight calculation via `AbortController` rather than leaving the UI waiting on a request it no longer cares about.
- **Theming**: two independent axes — light/dark, and four color schemes (two sober: Slate, Graphite; two psychedelic: Aurora, Carnival) — both pure CSS via `[data-theme]`/`[data-scheme]` attributes on `<html>` (`src/theme/themes.css`), so switching either is a CSS-only change. Both persist to `localStorage`.
- **i18n**: English and Spanish via `react-i18next` (`src/i18n/locales/*.json`); auto-detects the browser's language on first visit, then remembers the choice. Adding a third language is one more locale file plus one line in `src/i18n/i18n.ts`.
- **Errors**: the API client throws a typed `ApiError` with the backend's stable error code; the UI never shows raw error text — every code is mapped to a translated, user-safe message (`errors.*` in the locale files), while the full technical detail (and the `X-Request-Id` that correlates it to a backend log line) goes to `src/logging/logger.ts`.

## Running in Docker

Not yet — this component's Dockerfile is built in a later phase (see the repository root for the overall build order).
