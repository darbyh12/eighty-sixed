import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from './useStore'
import type { MenuItem } from '../lib/types'

function makeItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: `test-${Math.random().toString(36).slice(2)}`,
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

describe('useStore', () => {
  it('initializes with demo data', () => {
    const { result } = renderHook(() => useStore())
    expect(result.current.menuItems.length).toBe(12)
    expect(result.current.analyzedItems.length).toBe(12)
    expect(result.current.competitorPrices.length).toBeGreaterThan(0)
    expect(result.current.recommendations.length).toBeGreaterThan(0)
    expect(result.current.restaurantName).toBe('My Café')
  })

  it('adds a menu item', () => {
    const { result } = renderHook(() => useStore())
    const newItem = makeItem({ id: 'new-item', name: 'New Item' })

    act(() => {
      result.current.addMenuItem(newItem)
    })

    expect(result.current.menuItems.length).toBe(13)
    expect(result.current.menuItems.find((i) => i.id === 'new-item')).toBeTruthy()
  })

  it('updates a menu item', () => {
    const { result } = renderHook(() => useStore())
    const firstId = result.current.menuItems[0].id

    act(() => {
      result.current.updateMenuItem(firstId, { name: 'Updated Name' })
    })

    expect(result.current.menuItems.find((i) => i.id === firstId)?.name).toBe('Updated Name')
  })

  it('deletes a menu item and cascades to related data', () => {
    const { result } = renderHook(() => useStore())
    const firstId = result.current.menuItems[0].id
    const initialCompPrices = result.current.competitorPrices.filter((p) => p.menuItemId === firstId).length

    expect(initialCompPrices).toBeGreaterThan(0) // has competitor prices

    act(() => {
      result.current.deleteMenuItem(firstId)
    })

    expect(result.current.menuItems.find((i) => i.id === firstId)).toBeUndefined()
    expect(result.current.competitorPrices.filter((p) => p.menuItemId === firstId).length).toBe(0)
    expect(result.current.recommendations.filter((r) => r.menuItemId === firstId).length).toBe(0)
  })

  it('toggles star on a menu item', () => {
    const { result } = renderHook(() => useStore())
    const firstId = result.current.menuItems[0].id
    const wasStarred = result.current.menuItems[0].starred

    act(() => {
      result.current.toggleStar(firstId)
    })

    expect(result.current.menuItems.find((i) => i.id === firstId)?.starred).toBe(!wasStarred)
  })

  it('imports menu items', () => {
    const { result } = renderHook(() => useStore())
    const items = [makeItem({ id: 'import-1' }), makeItem({ id: 'import-2' })]

    act(() => {
      result.current.importMenuItems(items)
    })

    expect(result.current.menuItems.length).toBe(14)
  })

  it('toggles recommendation', () => {
    const { result } = renderHook(() => useStore())
    const recId = result.current.recommendations[0].id
    const wasImplemented = result.current.recommendations[0].implemented

    act(() => {
      result.current.toggleRecommendation(recId)
    })

    expect(result.current.recommendations.find((r) => r.id === recId)?.implemented).toBe(!wasImplemented)
  })

  it('sets restaurant name', () => {
    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.setRestaurantName('New Name')
    })

    expect(result.current.restaurantName).toBe('New Name')
  })

  it('analyzedItems are sorted by totalProfit descending', () => {
    const { result } = renderHook(() => useStore())
    const items = result.current.analyzedItems
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].totalProfit).toBeGreaterThanOrEqual(items[i].totalProfit)
    }
  })
})
