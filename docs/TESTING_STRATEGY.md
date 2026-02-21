# Testing Strategy

Testing setup and conventions for eighty-sixed. 59 tests across 7 files.

## Setup

- **Runner:** Vitest v4 (`vitest.config.ts`)
- **Environment:** jsdom
- **DOM assertions:** `@testing-library/jest-dom` (imported in `src/test/setup.ts`)
- **Component rendering:** `@testing-library/react`
- **Global mode:** enabled (`globals: true` in vitest config)

Run tests:

```bash
npm test                              # All tests, once
npm run test:watch                    # Watch mode
npx vitest run src/lib/utils.test.ts  # Single file
```

## Test File Locations

Tests are colocated next to source files:

| Test File                            | Tests | What It Covers                                                                         |
| ------------------------------------ | ----- | -------------------------------------------------------------------------------------- |
| `src/lib/utils.test.ts`              | 17    | `analyzeMenuItem`, `formatCurrency`, `formatPercent`, `cn`, `gradeColor`, `generateId` |
| `src/lib/demo-data.test.ts`          | 10    | Stable IDs, data structure, edge cases (zero price, empty array)                       |
| `src/hooks/useStore.test.ts`         | 9     | CRUD, cascade delete, star toggle, import, sort order                                  |
| `src/pages/MenuItems.test.tsx`       | 8     | Rendering, search filter, empty states, delete confirmation, star toggle               |
| `src/pages/AddEditItem.test.tsx`     | 6     | Add/edit modes, validation errors, redirect on missing item, submission                |
| `src/pages/ImportData.test.tsx`      | 5     | Upload zone, keyboard accessibility, template download, supported formats              |
| `src/pages/ScenarioModeler.test.tsx` | 4     | Rendering, empty state, wasteFactor conversion                                         |

## Patterns

### Factory Functions

Create test data with a `makeItem()` helper that provides sensible defaults:

```typescript
function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 'test-1',
    name: 'Test Item',
    category: 'Lunch',
    salePrice: 10,
    ingredientCost: 2,
    laborMinutes: 5,
    laborCostPerMinute: 0.35,
    packagingCost: 0.15,
    wasteFactor: 0.05,
    unitsSold: 100,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-01',
    ...overrides,
  }
}
```

Use `makeItem({ salePrice: 0 })` to test edge cases with minimal boilerplate.

### Component Test Helpers

Wrap rendering in a helper function with default props:

```typescript
function renderMenuItems(props = {}) {
  const defaultProps = {
    analyzedItems,
    toggleStar: vi.fn(),
    deleteMenuItem: vi.fn(),
    ...props,
  }
  return render(
    <MemoryRouter>
      <MenuItems {...defaultProps} />
    </MemoryRouter>
  )
}
```

- Use `vi.fn()` for all callback props
- Wrap in `<MemoryRouter>` when the component uses React Router hooks or `<Link>`
- Use `<MemoryRouter initialEntries={['/menu/edit/123']}>` for route-parameter tests

### Hook Tests

Use `renderHook` + `act` from React Testing Library:

```typescript
import { renderHook, act } from '@testing-library/react'

const { result } = renderHook(() => useStore())

act(() => {
  result.current.deleteMenuItem(firstId)
})

expect(result.current.menuItems.find((i) => i.id === firstId)).toBeUndefined()
```

### Mocking

- **Callbacks:** `vi.fn()` — verify calls with `expect(fn).toHaveBeenCalledWith(...)`
- **window.confirm:** `vi.spyOn(window, 'confirm').mockReturnValue(true)` — always `vi.restoreAllMocks()` after
- **No module mocks:** The codebase avoids `vi.mock()` in favor of prop injection

### Assertions

- **DOM presence:** `expect(screen.getByText('...')).toBeInTheDocument()`
- **Numeric precision:** `expect(result.totalCost).toBeCloseTo(4.0, 2)`
- **Pattern matching:** `expect(id).toMatch(/^[0-9a-f]{8}-...$/)`
- **Negative:** `expect(fn).not.toHaveBeenCalled()`

### Query Priority

Follow Testing Library's query priority:

1. `getByRole` / `getByLabelText` — accessible queries (preferred)
2. `getByPlaceholderText` / `getByDisplayValue` — form elements
3. `getByText` — visible text (with `{ selector: 'button' }` to disambiguate)
4. `getAllByLabelText` — multiple similar elements (star/delete buttons)
5. `getByTestId` — last resort

## Edge Cases to Always Test

Based on the domain (numeric financial data from user input):

- **NaN inputs** — empty form fields, malformed CSV data
- **Zero values** — `salePrice: 0` (division-by-zero in margin calc)
- **Negative values** — negative costs (should still produce finite results)
- **Empty arrays** — no menu items (empty states)
- **Grade boundaries** — test at exact thresholds (70%, 55%, 40%, 25%)
