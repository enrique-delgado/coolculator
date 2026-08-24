# AGENTS.md — coolculator-ui

Scope: this file governs `coolculator-ui/` only. See the repository root `AGENTS.md` for cross-project orientation.

## Conventions

- Functional components and hooks only — no class components.
- Every user-facing string goes in `src/i18n/locales/en.json` **and** `es.json`, never hardcoded in a component. Adding a UI string means adding it to both files with the same key.
- The API base URL is `src/config/env.ts`'s `API_BASE_URL` — nothing else reads `import.meta.env.VITE_API_BASE_URL` directly.
- All calculator arithmetic goes through `CalculatorApi` (`src/api/calculatorApi.ts`) — never computed client-side, even trivially. The one deliberate exception is memory (M+/M−/MR/MC), which is local bookkeeping, not a math operation (see `docs/00-decisions.md`, D3).
- Colors are theme tokens (`var(--...)` from `src/theme/themes.css`), never a literal color value in a component or in `global.css`. Watch selector specificity when adding a new interactive state (see the `:hover` fix in `global.css` — a bare `.key:hover { background }` will beat a variant class like `.key--equals` on specificity; use `filter` for state changes that must layer over a variant's own background instead).
- New keyboard shortcuts (`src/features/calculator/hooks/useKeyboardInput.ts`) are added only for keys with an unambiguous, discoverable meaning. Don't invent a mnemonic for something without one — native Tab + Enter/Space already makes every button keyboard-operable.

## Adding a new operation

Mirrors the backend's process:

1. Add it to `BINARY_OPERATIONS` or `UNARY_OPERATIONS` in `src/features/calculator/calculatorTypes.ts`.
2. Add a button for it in `src/features/calculator/components/Keypad.tsx` (reuse `OperatorKey` for a binary op).
3. Add its symbol/label to both locale files (`keys.*`, `keyLabels.*`).
4. If it needs new state-machine behavior, add reducer test cases in `calculatorReducer.test.ts` first.

## Commands

```bash
npm run dev         # local dev server
npm test             # vitest run
npm run test:watch
npm run test:coverage
npm run typecheck    # tsc -b --noEmit
npm run lint          # eslint .
npm run format        # prettier --write .
npm run build         # typecheck + production build
npm run preview       # serve the production build locally
```

## Verifying a change actually works

Automated tests mock the API and never render real CSS interactions (`:hover`, focus rings) — they won't catch everything. Before considering a UI change done, run it against a live `coolculator-backend` and look at it: `npm run build && npm run preview`, point `VITE_API_BASE_URL` at the running backend, and click through the affected flow. A real theming bug (a `:hover` specificity clash hiding a button's color) was caught exactly this way during initial implementation and wouldn't have shown up in the test suite alone.
