# Patterns

Established patterns in the eighty-sixed codebase. Read these before writing new code.

## NaN Safety — `safeNum()` Guard

All numeric calculations must go through `safeNum()` (in `src/lib/utils.ts`) to prevent NaN propagation.

```typescript
// src/lib/utils.ts
function safeNum(val: unknown): number {
  const n = Number(val)
  return isNaN(n) || !isFinite(n) ? 0 : n
}
```

**When to use:** Any function that accepts user-provided numbers or parsed CSV values. Applied throughout `analyzeMenuItem()` and `formatCurrency()`.

**Why:** Menu items can have NaN from empty form fields, CSV import parsing, or stale data. A single NaN propagates through every calculation and renders as "NaN" in the UI.

## wasteFactor Encoding

`wasteFactor` is stored as a **decimal** (e.g., `0.05` for 5%) but displayed to users as a **percentage**.

| Context           | Value             | Code                                 |
| ----------------- | ----------------- | ------------------------------------ |
| Storage / types   | `0.05`            | `item.wasteFactor`                   |
| User input (form) | `5`               | `parseInt(e.target.value) / 100`     |
| Display           | `5%`              | `(val * 100).toFixed(0) + '%'`       |
| Calculation       | `1.05` multiplier | `ingredientCost * (1 + wasteFactor)` |

**Files that convert:** `src/pages/AddEditItem.tsx` (form), `src/pages/ScenarioModeler.tsx` (what-if input + display).

## Cascade Deletion

When deleting a `MenuItem`, related data must also be removed. Implemented in `useStore.ts`:

```typescript
const deleteMenuItem = useCallback((id: string) => {
  setMenuItems((prev) => prev.filter((item) => item.id !== id))
  setCompetitorPrices((prev) => prev.filter((p) => p.menuItemId !== id))
  setRecommendations((prev) => prev.filter((r) => r.menuItemId !== id))
}, [])
```

**Rule:** If you add a new data type linked to `menuItemId`, add a corresponding filter line in `deleteMenuItem()`.

## Form Validation

Forms use a `validate()` function that returns an errors object, checked on submit:

```typescript
interface ValidationErrors {
  name?: string
  salePrice?: string
}

const validate = (): ValidationErrors => {
  const errs: ValidationErrors = {}
  if (!form.name.trim()) errs.name = 'Name is required'
  if (form.salePrice <= 0) errs.salePrice = 'Price must be greater than $0'
  return errs
}

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  setSubmitted(true)
  const validationErrors = validate()
  setErrors(validationErrors)
  if (Object.keys(validationErrors).length > 0) return
  // ... save
}
```

**Pattern:** Errors clear per-field as the user types (when `submitted` is true). See `AddEditItem.tsx`.

## Type-Safe Field Updates

Use generic `updateField` for forms backed by typed objects:

```typescript
const updateField = <K extends keyof MenuItem>(field: K, value: MenuItem[K]) => {
  setForm((prev) => ({ ...prev, [field]: value }))
}
```

**Why:** Prevents typos in field names and enforces correct value types at compile time. Avoids `as any`.

## Stable Demo IDs

Demo data items in `src/lib/demo-data.ts` use hardcoded IDs (`demo-item-001` through `demo-item-012`), not `generateId()`.

**Why:** `generateId()` produces different UUIDs on every module load. Tests and cross-references to demo items would break if IDs changed between renders or test runs.

## Empty State Pattern

Pages check for empty data **after** all hooks have been called (React rules of hooks), then return an early empty state:

```typescript
export function Dashboard({ analyzedItems }: Props) {
  // All hooks FIRST
  const metrics = useMemo(() => { ... }, [analyzedItems])
  const gradeData = useMemo(() => { ... }, [analyzedItems])

  // Empty check AFTER hooks
  if (analyzedItems.length === 0) {
    return <EmptyState />
  }

  return <MainContent />
}
```

**Anti-pattern:** Never put an early return before any `useState`, `useMemo`, `useCallback`, or `useEffect` call.

## Division-by-Zero Guards

Always check `salePrice > 0` before computing profit margin:

```typescript
const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0
```

Applied in `analyzeMenuItem()` (utils.ts), `generateRecommendations()` (demo-data.ts), and `AddEditItem.tsx` live calculator.

## Delete Confirmation

Destructive actions use `window.confirm()` before executing:

```typescript
const handleDelete = (id: string, name: string) => {
  if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
    deleteMenuItem(id)
  }
}
```

## Accessibility

- All icon-only buttons require `aria-label`
- Form inputs require `htmlFor`/`id` label associations
- Hover-only actions also have `focus-within:opacity-100` for keyboard users
- Sort headers use `aria-sort` attribute
- Animations are wrapped in `@media (prefers-reduced-motion: no-preference)`
