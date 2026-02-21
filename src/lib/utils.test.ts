import { describe, it, expect } from 'vitest'
import { analyzeMenuItem, formatCurrency, formatPercent, cn, gradeColor, generateId } from './utils'
import type { MenuItem } from './types'

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

describe('analyzeMenuItem', () => {
  it('calculates correct values for normal input', () => {
    const item = makeItem()
    const result = analyzeMenuItem(item)

    // ingredientCost * (1 + wasteFactor) = 2 * 1.05 = 2.1
    // labor = 5 * 0.35 = 1.75
    // totalCost = 2.1 + 1.75 + 0.15 = 4.0
    expect(result.totalCost).toBeCloseTo(4.0, 2)
    // profit = 10 - 4.0 = 6.0
    expect(result.profit).toBeCloseTo(6.0, 2)
    // margin = (6 / 10) * 100 = 60%
    expect(result.profitMargin).toBeCloseTo(60.0, 1)
    // totalRevenue = 10 * 100 = 1000
    expect(result.totalRevenue).toBe(1000)
    // totalProfit = 6 * 100 = 600
    expect(result.totalProfit).toBeCloseTo(600, 1)
    expect(result.grade).toBe('B')
  })

  it('handles zero sale price', () => {
    const result = analyzeMenuItem(makeItem({ salePrice: 0 }))
    expect(result.profitMargin).toBe(0)
    expect(result.profit).toBeLessThan(0)
    expect(result.grade).toBe('F')
  })

  it('handles NaN inputs gracefully', () => {
    const result = analyzeMenuItem(makeItem({
      salePrice: NaN,
      ingredientCost: NaN,
    }))
    expect(result.profitMargin).toBe(0)
    expect(Number.isFinite(result.totalCost)).toBe(true)
    expect(Number.isFinite(result.totalProfit)).toBe(true)
  })

  it('handles negative values', () => {
    const result = analyzeMenuItem(makeItem({ ingredientCost: -5 }))
    expect(Number.isFinite(result.totalCost)).toBe(true)
    expect(Number.isFinite(result.profit)).toBe(true)
  })

  it('assigns correct grades', () => {
    // salePrice=100, cost~3.15 → margin ~96.8% → A
    expect(analyzeMenuItem(makeItem({ salePrice: 100, ingredientCost: 1 })).grade).toBe('A')
    // salePrice=10, cost~4.0 → margin ~60% → B
    expect(analyzeMenuItem(makeItem({ salePrice: 10, ingredientCost: 2 })).grade).toBe('B')
    // salePrice=10, cost~6.1 → margin ~39% → D (not C, since 40 threshold is >=)
    expect(analyzeMenuItem(makeItem({ salePrice: 10, ingredientCost: 4 })).grade).toBe('D')
    // salePrice=10, cost~8.2 → margin ~18% → F
    expect(analyzeMenuItem(makeItem({ salePrice: 10, ingredientCost: 6 })).grade).toBe('F')
    // Verify C grade: need margin ~45%. salePrice=20, ingredientCost=7 → cost~9.25 → margin ~53.75% → C
    expect(analyzeMenuItem(makeItem({ salePrice: 20, ingredientCost: 7 })).grade).toBe('C')
  })
})

describe('formatCurrency', () => {
  it('formats positive values', () => {
    expect(formatCurrency(10)).toBe('$10.00')
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats negative values', () => {
    expect(formatCurrency(-5.5)).toBe('-$5.50')
  })

  it('handles NaN', () => {
    expect(formatCurrency(NaN)).toBe('$0.00')
  })
})

describe('formatPercent', () => {
  it('formats correctly', () => {
    expect(formatPercent(55.3)).toBe('55.3%')
    expect(formatPercent(0)).toBe('0.0%')
  })

  it('handles NaN', () => {
    expect(formatPercent(NaN)).toBe('0.0%')
  })
})

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})

describe('gradeColor', () => {
  it('returns correct colors for each grade', () => {
    expect(gradeColor('A')).toContain('emerald')
    expect(gradeColor('B')).toContain('blue')
    expect(gradeColor('C')).toContain('amber')
    expect(gradeColor('D')).toContain('orange')
    expect(gradeColor('F')).toContain('red')
  })

  it('returns gray for unknown grade', () => {
    expect(gradeColor('X')).toContain('gray')
  })
})

describe('generateId', () => {
  it('returns a UUID string', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})
