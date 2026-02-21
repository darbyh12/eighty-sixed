import { useState } from 'react'
import {
  Lightbulb,
  DollarSign,
  TrendingUp,
  Trash2,
  Wrench,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Filter,
} from 'lucide-react'
import type { Recommendation } from '../lib/types'
import { cn } from '../lib/utils'

interface RecommendationsProps {
  recommendations: Recommendation[]
  toggleRecommendation: (id: string) => void
}

const typeConfig = {
  reprice: { icon: DollarSign, label: 'Reprice', color: 'text-blue-600 bg-blue-50', border: 'border-blue-200' },
  promote: {
    icon: TrendingUp,
    label: 'Promote',
    color: 'text-emerald-600 bg-emerald-50',
    border: 'border-emerald-200',
  },
  remove: { icon: Trash2, label: 'Remove', color: 'text-red-600 bg-red-50', border: 'border-red-200' },
  optimize: { icon: Wrench, label: 'Optimize', color: 'text-amber-600 bg-amber-50', border: 'border-amber-200' },
}

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
}

export function Recommendations({ recommendations, toggleRecommendation }: RecommendationsProps) {
  const [filterType, setFilterType] = useState<string>('all')
  const [showImplemented, setShowImplemented] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = recommendations.filter((r) => {
    if (filterType !== 'all' && r.type !== filterType) return false
    if (!showImplemented && r.implemented) return false
    return true
  })

  const openCount = recommendations.filter((r) => !r.implemented).length
  const implementedCount = recommendations.filter((r) => r.implemented).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">Actionable Insights</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {openCount} open recommendation{openCount !== 1 ? 's' : ''} to boost your profits
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = recommendations.filter((r) => r.type === type && !r.implemented).length
          const Icon = config.icon
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? 'all' : type)}
              className={cn(
                'p-4 rounded-2xl border transition-all text-left',
                filterType === type
                  ? `${config.border} border-2 bg-white shadow-sm`
                  : 'border-[var(--color-border)] bg-white hover:shadow-sm',
              )}
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', config.color)}>
                <Icon size={16} />
              </div>
              <p className="text-lg font-bold">{count}</p>
              <p className="text-xs text-[var(--color-text-secondary)]">{config.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-text-tertiary)]" />
          <span className="text-xs text-[var(--color-text-secondary)]">
            Showing {filtered.length} of {recommendations.length}
          </span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showImplemented}
            onChange={(e) => setShowImplemented(e.target.checked)}
            className="rounded border-[var(--color-border)] text-indigo-500 focus:ring-indigo-200"
          />
          <span className="text-xs text-[var(--color-text-secondary)]">Show implemented ({implementedCount})</span>
        </label>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-3">
        {filtered.map((rec) => {
          const config = typeConfig[rec.type]
          const Icon = config.icon
          const priority = priorityConfig[rec.priority]
          const isExpanded = expandedId === rec.id

          return (
            <div
              key={rec.id}
              className={cn(
                'bg-white rounded-2xl border transition-all',
                rec.implemented
                  ? 'border-emerald-200 bg-emerald-50/30 opacity-75'
                  : 'border-[var(--color-border)] hover:shadow-sm',
              )}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', config.color)}>
                    <Icon size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h4 className="text-sm font-semibold">{rec.menuItemName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase', config.color)}
                          >
                            {config.label}
                          </span>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', priority.color)}>
                            {priority.label} priority
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRecommendation(rec.id)}
                        aria-label={
                          rec.implemented
                            ? `Mark ${rec.menuItemName} recommendation as not implemented`
                            : `Mark ${rec.menuItemName} recommendation as implemented`
                        }
                        className={cn(
                          'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                          rec.implemented
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-tertiary)] hover:bg-emerald-50 hover:text-emerald-500',
                        )}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    </div>

                    {/* Impact */}
                    <div className="flex items-center gap-2 mt-2 mb-2">
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {rec.projectedImpact}
                      </span>
                      {rec.suggestedValue !== undefined && rec.type === 'reprice' && (
                        <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
                          ${rec.currentValue.toFixed(2)} <ArrowRight size={10} /> ${rec.suggestedValue.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Expandable reasoning */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                      className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-1"
                    >
                      {isExpanded ? 'Hide details' : 'Why this matters'}
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {isExpanded && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed bg-[var(--color-surface-secondary)] p-3 rounded-xl">
                        {rec.reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb size={36} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">No recommendations to show</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              {showImplemented ? 'All clear!' : 'Try showing implemented recommendations'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
