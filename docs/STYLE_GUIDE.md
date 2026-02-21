# Style Guide

Visual conventions for the eighty-sixed UI. All design tokens are defined in `src/index.css` via Tailwind v4 `@theme`.

## Design Tokens

### Colors

| Token                       | Value              | Usage                              |
| --------------------------- | ------------------ | ---------------------------------- |
| `--color-primary-500`       | `#6366f1` (indigo) | Primary buttons, active nav, links |
| `--color-primary-50`        | `#eef2ff`          | Primary backgrounds, hover states  |
| `--color-success-500`       | `#22c55e`          | Positive values, grade A, profit   |
| `--color-danger-500`        | `#ef4444`          | Negative values, grade F, errors   |
| `--color-warning-500`       | `#f59e0b`          | Caution states, grade C            |
| `--color-surface`           | `#ffffff`          | Card backgrounds                   |
| `--color-surface-secondary` | `#f8fafc`          | Page background                    |
| `--color-surface-tertiary`  | `#f1f5f9`          | Inactive tabs, table headers       |
| `--color-border`            | `#e2e8f0`          | Card borders, dividers             |
| `--color-border-light`      | `#f1f5f9`          | Table row dividers                 |
| `--color-text-primary`      | `#0f172a`          | Headings, primary text             |
| `--color-text-secondary`    | `#475569`          | Labels, descriptions               |
| `--color-text-tertiary`     | `#94a3b8`          | Hints, timestamps, captions        |

Use CSS variables (`var(--color-*)`) for themeable values. Use Tailwind utility classes (`text-emerald-600`, `bg-indigo-50`) for grade colors and contextual highlights.

### Grade Colors

| Grade | Text + Background                |
| ----- | -------------------------------- |
| A     | `text-emerald-600 bg-emerald-50` |
| B     | `text-blue-600 bg-blue-50`       |
| C     | `text-amber-600 bg-amber-50`     |
| D     | `text-orange-600 bg-orange-50`   |
| F     | `text-red-600 bg-red-50`         |

Use `gradeColor(grade)` from `src/lib/utils.ts` — returns the Tailwind class string.

### Typography

- **Font:** Inter, system-ui fallback (`--font-sans`)
- **Page titles:** `text-lg font-bold` (18px)
- **Card headings:** `text-base font-semibold` or `text-sm font-semibold`
- **Body:** `text-sm` (14px)
- **Captions:** `text-xs` (12px)
- **Tiny labels:** `text-[11px]`

### Spacing

- **Page padding:** `p-4 lg:p-8`
- **Card padding:** `p-5` or `p-6`
- **Card gaps:** `gap-4` (grid), `space-y-6` (vertical stack)
- **Form field gaps:** `gap-4` (grid)
- **Max content width:** `max-w-[1400px]` (main), `max-w-3xl` (forms)

## Component Patterns

### Cards

All cards follow this pattern:

```html
<div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
  <h3 className="text-sm font-semibold mb-4">Title</h3>
  <!-- content -->
</div>
```

- Always `rounded-2xl` (16px radius)
- Always `border border-[var(--color-border)]`
- Never use `shadow-*` by default (only `hover:shadow-sm` on KPI cards)

### Buttons

| Type      | Classes                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------- |
| Primary   | `bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium`                                               |
| Secondary | `bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-indigo-50 hover:text-indigo-600 rounded-xl` |
| Danger    | `text-[var(--color-text-tertiary)] hover:text-red-500` (icon-only)                                                          |
| Disabled  | `disabled:bg-gray-300` added to primary                                                                                     |

All buttons: `rounded-xl` (12px), `px-4 py-2.5` or `px-5 py-2.5`, `transition-colors`.

### Form Inputs

```html
<input
  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm
  focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
/>
```

Error state: replace `border-[var(--color-border)]` with `border-red-400`.

### Labels

```html
<label htmlFor="field-id" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"></label>
```

Always pair with `id` on the input.

## Responsive Patterns

- **Sidebar:** Hidden on mobile (`hidden lg:flex`), slide-out drawer on mobile with backdrop
- **Sidebar width:** Desktop `w-[260px]`, mobile `w-[280px]`
- **Grid layouts:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (KPI cards), `grid-cols-1 lg:grid-cols-3` (charts)
- **Show/hide text:** `hidden sm:inline` for button labels on mobile
- **Content offset:** `lg:ml-[260px]` on main content area

## Animations

Two keyframe animations, both gated behind `prefers-reduced-motion`:

| Class              | Effect                         | Usage                               |
| ------------------ | ------------------------------ | ----------------------------------- |
| `animate-fade-in`  | Fade up from 8px below, 300ms  | Page transitions (on page root div) |
| `animate-slide-in` | Slide in from 12px left, 300ms | List items                          |

**Rule:** Always wrap in `@media (prefers-reduced-motion: no-preference)`.

## Icons

Use [Lucide React](https://lucide.dev) exclusively. Standard sizes:

| Context          | Size        |
| ---------------- | ----------- |
| Navigation       | `size={18}` |
| Card headers     | `size={16}` |
| Inline buttons   | `size={14}` |
| Empty state hero | `size={48}` |
| Tiny indicators  | `size={12}` |

All icon-only buttons must have `aria-label`.
