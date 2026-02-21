import { useMemo, useState } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react'
import type { MenuItemAnalysis, CompetitorPrice } from '../lib/types'
import { formatCurrency, cn } from '../lib/utils'

interface CompetitorsProps {
  analyzedItems: MenuItemAnalysis[]
  competitorPrices: CompetitorPrice[]
  refreshRecommendations: () => void
}

export function Competitors({ analyzedItems, competitorPrices, refreshRecommendations }: CompetitorsProps) {
  const [selectedItem, setSelectedItem] = useState<string>('all')

  const comparisonData = useMemo(() => {
    const items = selectedItem === 'all' ? analyzedItems : analyzedItems.filter(i => i.id === selectedItem)
    return items.map(item => {
      const prices = competitorPrices.filter(p => p.menuItemId === item.id)
      const avgCompPrice = prices.length > 0
        ? prices.reduce((s, p) => s + p.price, 0) / prices.length
        : item.salePrice
      const priceDiff = item.salePrice - avgCompPrice
      const priceDiffPct = avgCompPrice > 0 ? (priceDiff / avgCompPrice) * 100 : 0
      return { item, prices, avgCompPrice, priceDiff, priceDiffPct }
    })
  }, [analyzedItems, competitorPrices, selectedItem])

  const competitors = useMemo(() => {
    const names = new Set(competitorPrices.map(p => p.competitorName))
    return Array.from(names).sort()
  }, [competitorPrices])

  const platformColors: Record<string, string> = {
    DoorDash: 'bg-red-50 text-red-600',
    UberEats: 'bg-green-50 text-green-600',
    Grubhub: 'bg-orange-50 text-orange-600',
    Direct: 'bg-blue-50 text-blue-600',
  }

  if (analyzedItems.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <Users size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" />
        <h3 className="text-lg font-semibold mb-2">No menu items to compare</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Add menu items first, then see how your prices stack up.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Competitor Pricing</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            See how your prices compare to {competitors.length} nearby competitors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedItem}
            onChange={e => setSelectedItem(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All Items</option>
            {analyzedItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <button
            onClick={refreshRecommendations}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Competitor overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {competitors.map(name => {
          const prices = competitorPrices.filter(p => p.competitorName === name)
          const avgPrice = prices.reduce((s, p) => s + p.price, 0) / prices.length
          return (
            <div key={name} className="bg-white rounded-2xl border border-[var(--color-border)] p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">{name}</h4>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', platformColors[prices[0]?.platform] || 'bg-gray-50 text-gray-600')}>
                  {prices[0]?.platform}
                </span>
              </div>
              <p className="text-lg font-bold">{formatCurrency(avgPrice)}</p>
              <p className="text-xs text-[var(--color-text-tertiary)]">avg across {prices.length} items</p>
            </div>
          )
        })}
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-tertiary)] border-b border-[var(--color-border)]">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Item</th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Your Price</th>
                {competitors.map(name => (
                  <th key={name} className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">{name}</th>
                ))}
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Avg Comp.</th>
                <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-secondary)]">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-light)]">
              {comparisonData.map(({ item, prices, avgCompPrice, priceDiff, priceDiffPct }) => (
                <tr key={item.id} className="hover:bg-[var(--color-surface-secondary)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">{item.category}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(item.salePrice)}</td>
                  {competitors.map(name => {
                    const p = prices.find(pr => pr.competitorName === name)
                    return (
                      <td key={name} className="px-4 py-3 text-right">
                        {p ? (
                          <span className={cn(
                            'font-medium',
                            p.price > item.salePrice ? 'text-emerald-600' : p.price < item.salePrice ? 'text-red-500' : ''
                          )}>
                            {formatCurrency(p.price)}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-tertiary)]">—</span>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(avgCompPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                      priceDiff < -0.5 ? 'bg-emerald-50 text-emerald-600' :
                      priceDiff > 0.5 ? 'bg-red-50 text-red-600' :
                      'bg-gray-50 text-gray-600'
                    )}>
                      {priceDiff < -0.5 ? <TrendingUp size={12} /> :
                       priceDiff > 0.5 ? <TrendingDown size={12} /> :
                       <Minus size={12} />}
                      {Math.abs(priceDiffPct).toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)]">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Below competitors (room to raise)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Above competitors (review pricing)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" /> In line with market</span>
      </div>
    </div>
  )
}
