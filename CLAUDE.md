# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Item        | Value                                                             |
| ----------- | ----------------------------------------------------------------- |
| Stack       | React 19 + TypeScript 5.9 + Vite 7 + Tailwind CSS v4              |
| Dev         | `npm run dev`                                                     |
| Build       | `npm run build`                                                   |
| Test        | `npm test`                                                        |
| Lint        | `npm run lint`                                                    |
| Type-check  | `npm run type-check`                                              |
| Format      | `npm run format` (write) / `npm run format:check` (CI)            |
| Validate    | `npm run validate` (type-check + lint + format + test)            |
| Single test | `npx vitest run src/lib/utils.test.ts`                            |
| Watch mode  | `npm run test:watch`                                              |
| Deploy      | Netlify (auto-deploys from main, runs tests in production builds) |

## Architecture

Restaurant menu profitability analyzer built with React 19 + TypeScript + Vite 7 + Tailwind CSS v4.

**State management:** Single custom hook `useStore()` in `src/hooks/useStore.ts` — no Context or Redux. All app state lives here: menu items, competitor prices, recommendations, restaurant name. Computed `analyzedItems` are memoized and auto-sorted by totalProfit descending.

**Routing:** React Router v7 in `src/App.tsx`. Pages receive props from `useStore()` — there is no provider/context pattern. The `EditItemWrapper` in App.tsx uses `key={id}` to force remount on route param change.

**Data flow:** Raw `MenuItem` → `analyzeMenuItem()` (in `src/lib/utils.ts`) → `MenuItemAnalysis` with computed costs, profit, margin, and letter grade (A-F). Grade thresholds: A≥70%, B≥55%, C≥40%, D≥25%, F<25%.

**Demo mode:** When Supabase env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are missing, the app runs with 12 hardcoded demo items from `src/lib/demo-data.ts`. Demo items use stable IDs (`demo-item-001` through `demo-item-012`).

**Cascade deletion:** `deleteMenuItem()` in useStore also removes related competitorPrices and recommendations.

## Key Conventions

- `wasteFactor` is stored as a decimal (0.05 = 5%) but displayed as a percentage to users. The ScenarioModeler divides user input by 100 before storing.
- `safeNum()` helper in utils.ts guards all `analyzeMenuItem` calculations against NaN/undefined.
- Tests are colocated with source files (`.test.ts` / `.test.tsx`).
- Test helpers use factory functions (e.g., `makeItem()`) for creating test data.
- Hook tests use `renderHook()` + `act()` from React Testing Library.
- Component tests use `render()` + `screen` queries + `fireEvent`.
- CSS uses custom design token variables (`--color-primary-*`, `--color-surface`, `--color-text-*`) defined in `src/index.css` via Tailwind v4 `@theme`.
- Animations respect `prefers-reduced-motion`.
- Path alias: `@/` maps to `src/` (configured in tsconfig.app.json and vite.config.ts).
- Unused function args prefixed with `_` (ESLint rule).
- Code style: no semicolons, single quotes, 2-space indent (enforced by Prettier).

## Core Types (src/lib/types.ts)

<!-- prettier-ignore -->
- `MenuItem` — raw item data (price, costs, labor, waste, units sold)
- `MenuItemAnalysis` — extends MenuItem with computed fields (totalCost, profit, profitMargin, grade)
- `CompetitorPrice` — linked to MenuItem by `menuItemId`
- `Recommendation` — types: `'reprice' | 'promote' | 'remove' | 'optimize'`; linked by `menuItemId`
- `SortField` — union of sortable column names including `salePrice` and `totalCost`

## Source Files

| File                       | Purpose                                                                         |
| -------------------------- | ------------------------------------------------------------------------------- |
| `docs/PATTERNS.md`         | Validation, NaN safety, cascade deletion, wasteFactor encoding, form patterns   |
| `docs/STYLE_GUIDE.md`      | Design tokens, typography, spacing, color system, component styling conventions |
| `docs/TESTING_STRATEGY.md` | Vitest setup, render helpers, factory functions, mock patterns, edge cases      |

## Updating Documentation

When you modify code, check if these docs need updating:

| If you...                                                | Update...                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------ |
| Add a new data type linked to `menuItemId`               | `docs/PATTERNS.md` — add cascade deletion note                     |
| Add a new numeric calculation                            | `docs/PATTERNS.md` — ensure `safeNum()` usage is documented        |
| Change design tokens or add new CSS variables            | `docs/STYLE_GUIDE.md` — update token table                         |
| Add a new component pattern (card variant, button style) | `docs/STYLE_GUIDE.md` — add to component patterns                  |
| Add a new test file or testing utility                   | `docs/TESTING_STRATEGY.md` — update file table and patterns        |
| Change test setup or add new mock strategies             | `docs/TESTING_STRATEGY.md` — document new patterns                 |
| Add a new page or route                                  | This file (CLAUDE.md) — update architecture section if significant |
| Add a new convention or anti-pattern                     | This file (CLAUDE.md) — add to Key Conventions or Anti-Patterns    |

## Exemplar Files

Read these before writing similar code — they demonstrate project conventions:

| Category   | File                        | Why                                                                                          |
| ---------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| State hook | `src/hooks/useStore.ts`     | Clean CRUD with `useCallback`, cascade deletion, memoized derived data                       |
| Page       | `src/pages/AddEditItem.tsx` | Type-safe `updateField<K>`, validation pattern, redirect on missing item, live calculator    |
| Utility    | `src/lib/utils.ts`          | `safeNum()` guard on all inputs, pure functions, grade thresholds                            |
| Test       | `src/lib/utils.test.ts`     | Factory function, edge cases (NaN, zero, negative), grade boundary tests, closeTo assertions |

## Anti-Patterns

| Risk       | Anti-Pattern                                                               | Do Instead                                                                           |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **High**   | Early return before hooks (`if (!data) return` above `useState`/`useMemo`) | Move all hooks before any conditional return — React rules of hooks                  |
| **High**   | Using raw numbers from user input without NaN guard                        | Wrap in `safeNum()` or validate before calculation                                   |
| **High**   | Deleting a MenuItem without cascading                                      | Always filter related `competitorPrices` and `recommendations` in `deleteMenuItem()` |
| **High**   | Storing wasteFactor as percentage (e.g., `5`)                              | Store as decimal (`0.05`), convert on input/display only                             |
| **Medium** | Using `as any` for Recharts tooltip formatters                             | Use `(value: number) => [formatCurrency(Number(value))]`                             |
| **Medium** | Adding `generateId()` to module-level demo data                            | Use hardcoded stable IDs for demo items                                              |
| **Medium** | Icon-only button without `aria-label`                                      | Always add `aria-label="Description"`                                                |
| **Medium** | Form `<label>` without `htmlFor`/`id` pair                                 | Always associate labels: `<label htmlFor="x">` + `<input id="x">`                    |
| **Low**    | Animation without `prefers-reduced-motion` gate                            | Wrap in `@media (prefers-reduced-motion: no-preference)`                             |
| **Low**    | `scroll-behavior: smooth` ungated                                          | Also wrap in `prefers-reduced-motion` media query                                    |
