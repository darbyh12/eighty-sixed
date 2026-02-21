import type { MenuItem, CompetitorPrice, Recommendation } from './types'
import { generateId, formatCurrency as fmtCurrency } from './utils'

export const demoMenuItems: MenuItem[] = [
  {
    id: 'demo-item-001',
    name: 'Avocado Toast',
    category: 'Breakfast',
    salePrice: 8.0,
    ingredientCost: 2.85,
    laborMinutes: 5,
    laborCostPerMinute: 0.35,
    packagingCost: 0.15,
    wasteFactor: 0.08,
    unitsSold: 145,
    period: 'weekly',
    starred: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-002',
    name: 'Classic Panini',
    category: 'Lunch',
    salePrice: 12.0,
    ingredientCost: 2.1,
    laborMinutes: 7,
    laborCostPerMinute: 0.35,
    packagingCost: 0.25,
    wasteFactor: 0.04,
    unitsSold: 98,
    period: 'weekly',
    starred: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-003',
    name: 'House Salad',
    category: 'Lunch',
    salePrice: 9.5,
    ingredientCost: 3.4,
    laborMinutes: 8,
    laborCostPerMinute: 0.35,
    packagingCost: 0.3,
    wasteFactor: 0.15,
    unitsSold: 42,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-004',
    name: 'Espresso',
    category: 'Beverages',
    salePrice: 3.5,
    ingredientCost: 0.45,
    laborMinutes: 2,
    laborCostPerMinute: 0.35,
    packagingCost: 0.1,
    wasteFactor: 0.02,
    unitsSold: 320,
    period: 'weekly',
    starred: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-005',
    name: 'Cappuccino',
    category: 'Beverages',
    salePrice: 5.5,
    ingredientCost: 0.8,
    laborMinutes: 3,
    laborCostPerMinute: 0.35,
    packagingCost: 0.15,
    wasteFactor: 0.03,
    unitsSold: 210,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-006',
    name: 'Chicken Wrap',
    category: 'Lunch',
    salePrice: 11.0,
    ingredientCost: 3.2,
    laborMinutes: 6,
    laborCostPerMinute: 0.35,
    packagingCost: 0.2,
    wasteFactor: 0.06,
    unitsSold: 87,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-007',
    name: 'Blueberry Muffin',
    category: 'Bakery',
    salePrice: 3.75,
    ingredientCost: 0.9,
    laborMinutes: 2,
    laborCostPerMinute: 0.35,
    packagingCost: 0.08,
    wasteFactor: 0.1,
    unitsSold: 165,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-008',
    name: 'Açaí Bowl',
    category: 'Breakfast',
    salePrice: 13.5,
    ingredientCost: 5.2,
    laborMinutes: 6,
    laborCostPerMinute: 0.35,
    packagingCost: 0.45,
    wasteFactor: 0.12,
    unitsSold: 56,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-009',
    name: 'Iced Matcha Latte',
    category: 'Beverages',
    salePrice: 6.0,
    ingredientCost: 1.1,
    laborMinutes: 3,
    laborCostPerMinute: 0.35,
    packagingCost: 0.2,
    wasteFactor: 0.03,
    unitsSold: 130,
    period: 'weekly',
    starred: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-010',
    name: 'BLT Sandwich',
    category: 'Lunch',
    salePrice: 10.5,
    ingredientCost: 2.8,
    laborMinutes: 5,
    laborCostPerMinute: 0.35,
    packagingCost: 0.2,
    wasteFactor: 0.05,
    unitsSold: 72,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-011',
    name: 'Croissant',
    category: 'Bakery',
    salePrice: 3.25,
    ingredientCost: 0.65,
    laborMinutes: 1,
    laborCostPerMinute: 0.35,
    packagingCost: 0.05,
    wasteFactor: 0.08,
    unitsSold: 200,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
  {
    id: 'demo-item-012',
    name: 'Smoked Salmon Bagel',
    category: 'Breakfast',
    salePrice: 14.0,
    ingredientCost: 5.8,
    laborMinutes: 6,
    laborCostPerMinute: 0.35,
    packagingCost: 0.25,
    wasteFactor: 0.1,
    unitsSold: 38,
    period: 'weekly',
    starred: false,
    createdAt: '2026-01-15',
  },
]

export function generateCompetitorPrices(items: MenuItem[]): CompetitorPrice[] {
  const competitors = ['Urban Grind', 'Bean & Leaf', 'Rise Cafe']
  const platforms: CompetitorPrice['platform'][] = ['DoorDash', 'UberEats', 'Grubhub']
  const prices: CompetitorPrice[] = []

  items.forEach((item) => {
    competitors.forEach((comp) => {
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      const variance = 0.8 + Math.random() * 0.5
      prices.push({
        id: generateId(),
        menuItemId: item.id,
        competitorName: comp,
        platform,
        price: Math.round(item.salePrice * variance * 100) / 100,
        lastUpdated: '2026-02-18',
      })
    })
  })

  return prices
}

export function generateRecommendations(items: MenuItem[]): Recommendation[] {
  const analyzed = items.map((item) => {
    const laborCost = item.laborMinutes * item.laborCostPerMinute
    const totalCost = item.ingredientCost * (1 + item.wasteFactor) + laborCost + item.packagingCost
    const margin = item.salePrice > 0 ? ((item.salePrice - totalCost) / item.salePrice) * 100 : 0
    return { ...item, margin, totalCost }
  })

  const recs: Recommendation[] = []

  // Find items to reprice
  analyzed
    .filter((i) => i.margin < 40 && i.unitsSold > 50)
    .forEach((item) => {
      const suggestedPrice = Math.ceil((item.totalCost / 0.55) * 2) / 2
      recs.push({
        id: generateId(),
        menuItemId: item.id,
        menuItemName: item.name,
        type: 'reprice',
        priority: 'high',
        currentValue: item.salePrice,
        suggestedValue: suggestedPrice,
        projectedImpact: `+${fmtCurrency((suggestedPrice - item.salePrice) * item.unitsSold * 4)}/mo`,
        reasoning: `Margin is ${item.margin.toFixed(0)}%, well below the 55% target. Competitors charge more for comparable items.`,
        implemented: false,
      })
    })

  // Find items to promote
  analyzed
    .filter((i) => i.margin > 65 && i.unitsSold < 100)
    .forEach((item) => {
      recs.push({
        id: generateId(),
        menuItemId: item.id,
        menuItemName: item.name,
        type: 'promote',
        priority: 'medium',
        currentValue: item.unitsSold,
        projectedImpact: `+${fmtCurrency((item.salePrice - item.totalCost) * 30)}/mo if 30 more sold`,
        reasoning: `High margin item (${item.margin.toFixed(0)}%) with room for more sales. Move to top of menu or feature as a special.`,
        implemented: false,
      })
    })

  // Find items to remove
  analyzed
    .filter((i) => i.margin < 25 && i.unitsSold < 60)
    .forEach((item) => {
      recs.push({
        id: generateId(),
        menuItemId: item.id,
        menuItemName: item.name,
        type: 'remove',
        priority: 'high',
        currentValue: item.salePrice,
        projectedImpact: `Save ${fmtCurrency(item.totalCost * item.unitsSold * 0.3)}/mo in waste & labor`,
        reasoning: `Low margin (${item.margin.toFixed(0)}%), low volume (${item.unitsSold}/wk). This item costs more to maintain than it returns.`,
        implemented: false,
      })
    })

  // Optimize suggestions
  analyzed
    .filter((i) => i.wasteFactor >= 0.1)
    .forEach((item) => {
      recs.push({
        id: generateId(),
        menuItemId: item.id,
        menuItemName: item.name,
        type: 'optimize',
        priority: 'medium',
        currentValue: item.wasteFactor * 100,
        suggestedValue: 5,
        projectedImpact: `Save ${fmtCurrency(item.ingredientCost * (item.wasteFactor - 0.05) * item.unitsSold * 4)}/mo`,
        reasoning: `Waste factor at ${(item.wasteFactor * 100).toFixed(0)}% is above the 5% benchmark. Review portion sizes and storage.`,
        implemented: false,
      })
    })

  return recs.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 }
    return p[a.priority] - p[b.priority]
  })
}
