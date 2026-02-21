export interface MenuItem {
  id: string
  name: string
  category: string
  salePrice: number
  ingredientCost: number
  laborMinutes: number
  laborCostPerMinute: number
  packagingCost: number
  wasteFactor: number // percentage, e.g., 0.05 for 5%
  unitsSold: number
  period: string // e.g., "weekly", "monthly"
  starred: boolean
  createdAt: string
}

export interface MenuItemAnalysis extends MenuItem {
  totalCost: number
  profit: number
  profitMargin: number
  totalRevenue: number
  totalProfit: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

export interface CompetitorPrice {
  id: string
  menuItemId: string
  competitorName: string
  platform: 'DoorDash' | 'UberEats' | 'Grubhub' | 'Direct'
  price: number
  lastUpdated: string
}

export interface Recommendation {
  id: string
  menuItemId: string
  menuItemName: string
  type: 'reprice' | 'promote' | 'remove' | 'optimize'
  priority: 'high' | 'medium' | 'low'
  currentValue: number
  suggestedValue?: number
  projectedImpact: string
  reasoning: string
  implemented: boolean
}

export type ViewMode = 'grid' | 'table'
export type SortField =
  | 'name'
  | 'salePrice'
  | 'totalCost'
  | 'profit'
  | 'profitMargin'
  | 'unitsSold'
  | 'totalRevenue'
  | 'totalProfit'
  | 'grade'
export type SortDirection = 'asc' | 'desc'
