import { useState, useMemo } from 'react'
import { FlaskConical, ArrowRight, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { MenuItemAnalysis } from '../lib/types'
import { formatCurrency, cn } from '../lib/utils'

interface ScenarioModelerProps {
  analyzedItems: MenuItemAnalysis[]
}

interface Scenario {
  itemId: string
  field: 'salePrice' | 'ingredientCost' | 'unitsSold' | 'wasteFactor'
  newValue: number
}

export function ScenarioModeler({ analyzedItems }: ScenarioModelerProps) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedItemId, setSelectedItemId] = useState(analyzedItems[0]?.id || '')
  const [selectedField, setSelectedField] = useState<Scenario['field']>('salePrice')
  const [newValue, setNewValue] = useState('')

  const selectedItem = analyzedItems.find(i => i.id === selectedItemId)

  const projectedItems = useMemo(() => {
    return analyzedItems.map(item => {
      const itemScenarios = scenarios.filter(s => s.itemId === item.id)
      if (itemScenarios.length === 0) return { current: item, projected: item, changed: false }

      const projected = { ...item }
      itemScenarios.forEach(s => {
        ;(projected as Record<string, unknown>)[s.field] = s.newValue
      })

      // Recalculate
      const laborCost = projected.laborMinutes * projected.laborCostPerMinute
      const adjustedIngredient = projected.ingredientCost * (1 + projected.wasteFactor)
      const totalCost = adjustedIngredient + laborCost + projected.packagingCost
      const profit = projected.salePrice - totalCost
      const profitMargin = projected.salePrice > 0 ? (profit / projected.salePrice) * 100 : 0
      const totalRevenue = projected.salePrice * projected.unitsSold
      const totalProfit = profit * projected.unitsSold

      return {
        current: item,
        projected: { ...projected, totalCost, profit, profitMargin, totalRevenue, totalProfit },
        changed: true,
      }
    })
  }, [analyzedItems, scenarios])

  const summary = useMemo(() => {
    const currentTotal = projectedItems.reduce((s, i) => s + i.current.totalProfit, 0)
    const projectedTotal = projectedItems.reduce((s, i) => s + i.projected.totalProfit, 0)
    const currentRevenue = projectedItems.reduce((s, i) => s + i.current.totalRevenue, 0)
    const projectedRevenue = projectedItems.reduce((s, i) => s + i.projected.totalRevenue, 0)
    return {
      currentProfit: currentTotal, projectedProfit: projectedTotal,
      profitDiff: projectedTotal - currentTotal,
      currentRevenue, projectedRevenue,
      revenueDiff: projectedRevenue - currentRevenue,
    }
  }, [projectedItems])

  const chartData = projectedItems
    .filter(i => i.changed)
    .map(i => ({
      name: i.current.name.length > 15 ? i.current.name.slice(0, 15) + '...' : i.current.name,
      Current: Math.round(i.current.totalProfit),
      Projected: Math.round(i.projected.totalProfit),
    }))

  const addScenario = () => {
    if (!selectedItemId || !newValue) return
    setScenarios(prev => {
      const existing = prev.findIndex(s => s.itemId === selectedItemId && s.field === selectedField)
      const raw = parseFloat(newValue)
      const adjustedValue = selectedField === 'wasteFactor' ? raw / 100 : raw
      const scenario: Scenario = { itemId: selectedItemId, field: selectedField, newValue: adjustedValue }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = scenario
        return updated
      }
      return [...prev, scenario]
    })
    setNewValue('')
  }

  const removeScenario = (idx: number) => {
    setScenarios(prev => prev.filter((_, i) => i !== idx))
  }

  const fieldLabels: Record<string, string> = {
    salePrice: 'Sale Price', ingredientCost: 'Ingredient Cost',
    unitsSold: 'Units Sold', wasteFactor: 'Waste Factor',
  }

  if (analyzedItems.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <FlaskConical size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" />
        <h3 className="text-lg font-semibold mb-2">No menu items to model</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">Add menu items first, then come back to test scenarios.</p>
      </div>
    )
  }

  const getCurrentValue = () => {
    if (!selectedItem) return ''
    const val = selectedItem[selectedField]
    return selectedField === 'wasteFactor' ? ((val as number) * 100).toFixed(0) : val
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold">Scenario Modeler</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          What happens if you change prices, reduce waste, or boost sales? Test it here.
        </p>
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Current Weekly Profit</p>
          <p className="text-xl font-bold">{formatCurrency(summary.currentProfit)}</p>
        </div>
        <div className={cn(
          'rounded-2xl border p-5',
          summary.profitDiff > 0 ? 'bg-emerald-50 border-emerald-200' :
          summary.profitDiff < 0 ? 'bg-red-50 border-red-200' :
          'bg-white border-[var(--color-border)]'
        )}>
          <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Projected Weekly Profit</p>
          <p className="text-xl font-bold">{formatCurrency(summary.projectedProfit)}</p>
          {summary.profitDiff !== 0 && (
            <p className={cn('text-xs font-semibold mt-1 flex items-center gap-1',
              summary.profitDiff > 0 ? 'text-emerald-600' : 'text-red-600'
            )}>
              {summary.profitDiff > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {summary.profitDiff > 0 ? '+' : ''}{formatCurrency(summary.profitDiff)}/wk
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <p className="text-xs text-[var(--color-text-tertiary)] mb-1">Monthly Impact</p>
          <p className={cn('text-xl font-bold',
            summary.profitDiff > 0 ? 'text-emerald-600' : summary.profitDiff < 0 ? 'text-red-600' : ''
          )}>
            {summary.profitDiff >= 0 ? '+' : ''}{formatCurrency(summary.profitDiff * 4.33)}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">per month</p>
        </div>
      </div>

      {/* Add scenario */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <FlaskConical size={16} className="text-indigo-500" />
          Add a "What If"
        </h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedItemId}
            onChange={e => setSelectedItemId(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white"
          >
            {analyzedItems.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <select
            value={selectedField}
            onChange={e => setSelectedField(e.target.value as Scenario['field'])}
            className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white"
          >
            {Object.entries(fieldLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              placeholder={`Currently: ${getCurrentValue()}`}
              className="w-full sm:w-40 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <button
            onClick={addScenario}
            disabled={!newValue}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Add
          </button>
        </div>

        {/* Active scenarios */}
        {scenarios.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Active Scenarios</p>
              <button
                onClick={() => setScenarios([])}
                className="flex items-center gap-1 text-xs text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
              >
                <RotateCcw size={12} />
                Reset all
              </button>
            </div>
            {scenarios.map((s, i) => {
              const item = analyzedItems.find(it => it.id === s.itemId)
              const currentVal = item ? item[s.field as keyof typeof item] as number : 0
              return (
                <div key={i} className="flex items-center gap-3 bg-[var(--color-surface-secondary)] px-3 py-2 rounded-xl text-xs">
                  <span className="font-medium">{item?.name}</span>
                  <span className="text-[var(--color-text-tertiary)]">{fieldLabels[s.field]}</span>
                  <span className="text-[var(--color-text-secondary)]">
                    {s.field === 'wasteFactor' ? `${(currentVal * 100).toFixed(0)}%` : currentVal}
                  </span>
                  <ArrowRight size={10} className="text-[var(--color-text-tertiary)]" />
                  <span className="font-semibold text-indigo-600">
                    {s.field === 'wasteFactor' ? `${(s.newValue * 100).toFixed(0)}%` : s.newValue}
                  </span>
                  <button onClick={() => removeScenario(i)} aria-label={`Remove scenario for ${item?.name}`} className="ml-auto text-[var(--color-text-tertiary)] hover:text-red-500">
                    &times;
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-sm font-semibold mb-4">Impact Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }} formatter={(v: number) => [formatCurrency(Number(v))]} />
              <Legend />
              <Bar dataKey="Current" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Projected" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
