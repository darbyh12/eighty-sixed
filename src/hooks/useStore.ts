import { useState, useCallback, useMemo } from 'react'
import type { MenuItem, MenuItemAnalysis, CompetitorPrice, Recommendation } from '../lib/types'
import { analyzeMenuItem } from '../lib/utils'
import { demoMenuItems, generateCompetitorPrices, generateRecommendations } from '../lib/demo-data'

export function useStore() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(demoMenuItems)
  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPrice[]>(() =>
    generateCompetitorPrices(demoMenuItems),
  )
  const [recommendations, setRecommendations] = useState<Recommendation[]>(() => generateRecommendations(demoMenuItems))
  const [restaurantName, setRestaurantName] = useState('My Café')

  const analyzedItems: MenuItemAnalysis[] = useMemo(
    () => menuItems.map(analyzeMenuItem).sort((a, b) => b.totalProfit - a.totalProfit),
    [menuItems],
  )

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => [...prev, item])
  }, [])

  const updateMenuItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
    // Cascade: remove related competitor prices and recommendations
    setCompetitorPrices((prev) => prev.filter((p) => p.menuItemId !== id))
    setRecommendations((prev) => prev.filter((r) => r.menuItemId !== id))
  }, [])

  const toggleStar = useCallback((id: string) => {
    setMenuItems((prev) => prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item)))
  }, [])

  const importMenuItems = useCallback((items: MenuItem[]) => {
    setMenuItems((prev) => [...prev, ...items])
  }, [])

  const toggleRecommendation = useCallback((id: string) => {
    setRecommendations((prev) => prev.map((r) => (r.id === id ? { ...r, implemented: !r.implemented } : r)))
  }, [])

  const refreshRecommendations = useCallback(() => {
    setRecommendations(generateRecommendations(menuItems))
    setCompetitorPrices(generateCompetitorPrices(menuItems))
  }, [menuItems])

  return {
    menuItems,
    analyzedItems,
    competitorPrices,
    recommendations,
    restaurantName,
    setRestaurantName,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleStar,
    importMenuItems,
    toggleRecommendation,
    refreshRecommendations,
    setCompetitorPrices,
  }
}
