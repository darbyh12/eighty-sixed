import { describe, it, expect } from 'vitest'
import { demoMenuItems, generateCompetitorPrices, generateRecommendations } from './demo-data'
import type { MenuItem } from './types'

describe('demoMenuItems', () => {
  it('has stable IDs across calls', () => {
    const ids1 = demoMenuItems.map((i) => i.id)
    // Since these are hardcoded, they should always be the same
    expect(ids1[0]).toBe('demo-item-001')
    expect(ids1[ids1.length - 1]).toBe('demo-item-012')
  })

  it('has 12 items', () => {
    expect(demoMenuItems.length).toBe(12)
  })

  it('all items have required fields', () => {
    demoMenuItems.forEach((item) => {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.salePrice).toBeGreaterThan(0)
      expect(item.wasteFactor).toBeGreaterThanOrEqual(0)
      expect(item.wasteFactor).toBeLessThanOrEqual(1)
    })
  })
})

describe('generateCompetitorPrices', () => {
  it('returns prices for each item', () => {
    const prices = generateCompetitorPrices(demoMenuItems.slice(0, 3))
    expect(prices.length).toBeGreaterThan(0)
    // 3 items * 3 competitors = 9 prices
    expect(prices.length).toBe(9)
  })

  it('returns correct structure', () => {
    const prices = generateCompetitorPrices(demoMenuItems.slice(0, 1))
    prices.forEach((p) => {
      expect(p.id).toBeTruthy()
      expect(p.menuItemId).toBe(demoMenuItems[0].id)
      expect(p.competitorName).toBeTruthy()
      expect(p.platform).toBeTruthy()
      expect(typeof p.price).toBe('number')
      expect(p.price).toBeGreaterThan(0)
    })
  })

  it('handles empty array', () => {
    const prices = generateCompetitorPrices([])
    expect(prices).toEqual([])
  })
})

describe('generateRecommendations', () => {
  it('returns recommendations sorted by priority', () => {
    const recs = generateRecommendations(demoMenuItems)
    expect(recs.length).toBeGreaterThan(0)

    const priorityOrder = { high: 0, medium: 1, low: 2 }
    for (let i = 1; i < recs.length; i++) {
      expect(priorityOrder[recs[i].priority]).toBeGreaterThanOrEqual(priorityOrder[recs[i - 1].priority])
    }
  })

  it('handles empty array', () => {
    const recs = generateRecommendations([])
    expect(recs).toEqual([])
  })

  it('handles items with zero sale price', () => {
    const items: MenuItem[] = [
      {
        id: 'zero-price',
        name: 'Free Item',
        category: 'Test',
        salePrice: 0,
        ingredientCost: 1,
        laborMinutes: 5,
        laborCostPerMinute: 0.35,
        packagingCost: 0.15,
        wasteFactor: 0.05,
        unitsSold: 100,
        period: 'weekly',
        starred: false,
        createdAt: '2026-01-01',
      },
    ]
    // Should not throw
    const recs = generateRecommendations(items)
    expect(Array.isArray(recs)).toBe(true)
  })

  it('all recommendations have required fields', () => {
    const recs = generateRecommendations(demoMenuItems)
    recs.forEach((rec) => {
      expect(rec.id).toBeTruthy()
      expect(rec.menuItemId).toBeTruthy()
      expect(rec.menuItemName).toBeTruthy()
      expect(['reprice', 'promote', 'remove', 'optimize']).toContain(rec.type)
      expect(['high', 'medium', 'low']).toContain(rec.priority)
      expect(rec.implemented).toBe(false)
    })
  })
})
