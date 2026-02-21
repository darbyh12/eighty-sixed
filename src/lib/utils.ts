import type { MenuItem, MenuItemAnalysis } from './types'

function safeNum(val: unknown): number {
  const n = Number(val)
  return isNaN(n) || !isFinite(n) ? 0 : n
}

export function analyzeMenuItem(item: MenuItem): MenuItemAnalysis {
  const laborCost = safeNum(item.laborMinutes) * safeNum(item.laborCostPerMinute)
  const adjustedIngredientCost = safeNum(item.ingredientCost) * (1 + safeNum(item.wasteFactor))
  const totalCost = adjustedIngredientCost + laborCost + safeNum(item.packagingCost)
  const salePrice = safeNum(item.salePrice)
  const profit = salePrice - totalCost
  const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0
  const unitsSold = safeNum(item.unitsSold)
  const totalRevenue = salePrice * unitsSold
  const totalProfit = profit * unitsSold

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (profitMargin >= 70) grade = 'A'
  else if (profitMargin >= 55) grade = 'B'
  else if (profitMargin >= 40) grade = 'C'
  else if (profitMargin >= 25) grade = 'D'
  else grade = 'F'

  return {
    ...item,
    totalCost,
    profit,
    profitMargin,
    totalRevenue,
    totalProfit,
    grade,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(safeNum(value))
}

export function formatPercent(value: number): string {
  return `${safeNum(value).toFixed(1)}%`
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function gradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-emerald-600 bg-emerald-50'
    case 'B':
      return 'text-blue-600 bg-blue-50'
    case 'C':
      return 'text-amber-600 bg-amber-50'
    case 'D':
      return 'text-orange-600 bg-orange-50'
    case 'F':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function generateId(): string {
  return crypto.randomUUID()
}
