import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  DollarSign,
  TrendingUp,
  Percent,
  UtensilsCrossed,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  ChevronRight,
  Lightbulb,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import type { MenuItemAnalysis, Recommendation } from '../lib/types'
import { formatCurrency, formatPercent, gradeColor, cn } from '../lib/utils'

interface DashboardProps {
  analyzedItems: MenuItemAnalysis[]
  recommendations: Recommendation[]
}

export function Dashboard({ analyzedItems, recommendations }: DashboardProps) {
  const metrics = useMemo(() => {
    const totalRevenue = analyzedItems.reduce((s, i) => s + i.totalRevenue, 0)
    const totalProfit = analyzedItems.reduce((s, i) => s + i.totalProfit, 0)
    const avgMargin =
      analyzedItems.length > 0 ? analyzedItems.reduce((s, i) => s + i.profitMargin, 0) / analyzedItems.length : 0
    const sorted = [...analyzedItems].sort((a, b) => b.totalProfit - a.totalProfit)
    return {
      totalRevenue,
      totalProfit,
      avgMargin,
      itemCount: analyzedItems.length,
      topPerformer: sorted[0]?.name || 'N/A',
      worstPerformer: sorted[sorted.length - 1]?.name || 'N/A',
    }
  }, [analyzedItems])

  const profitByCategory = useMemo(() => {
    const cats: Record<string, { revenue: number; profit: number; count: number }> = {}
    analyzedItems.forEach((item) => {
      if (!cats[item.category]) cats[item.category] = { revenue: 0, profit: 0, count: 0 }
      cats[item.category].revenue += item.totalRevenue
      cats[item.category].profit += item.totalProfit
      cats[item.category].count++
    })
    return Object.entries(cats).map(([name, data]) => ({ name, ...data }))
  }, [analyzedItems])

  const gradeDistribution = useMemo(() => {
    const grades: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 }
    analyzedItems.forEach((item) => {
      grades[item.grade]++
    })
    return Object.entries(grades)
      .filter(([, v]) => v > 0)
      .map(([grade, count]) => ({ grade, count }))
  }, [analyzedItems])

  const gradeColors: Record<string, string> = {
    A: '#22c55e',
    B: '#3b82f6',
    C: '#f59e0b',
    D: '#f97316',
    F: '#ef4444',
  }

  const topItems = analyzedItems.slice(0, 5)
  const bottomItems = [...analyzedItems].sort((a, b) => a.totalProfit - b.totalProfit).slice(0, 3)
  const openRecs = recommendations.filter((r) => !r.implemented)

  if (analyzedItems.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <UtensilsCrossed size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" />
        <h3 className="text-lg font-semibold mb-2">Welcome to 86'd</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Add menu items to see your profitability dashboard.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/menu/add"
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Add Your First Item
          </Link>
          <Link
            to="/import"
            className="px-5 py-2.5 bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-sm font-medium transition-colors"
          >
            Import CSV
          </Link>
        </div>
      </div>
    )
  }

  // Simulated weekly trend data
  const weeklyTrend = [
    { week: 'W1', revenue: metrics.totalRevenue * 0.88, profit: metrics.totalProfit * 0.85 },
    { week: 'W2', revenue: metrics.totalRevenue * 0.92, profit: metrics.totalProfit * 0.89 },
    { week: 'W3', revenue: metrics.totalRevenue * 0.96, profit: metrics.totalProfit * 0.94 },
    { week: 'W4', revenue: metrics.totalRevenue, profit: metrics.totalProfit },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Weekly Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={8.2}
          icon={<DollarSign size={18} />}
          color="indigo"
        />
        <KPICard
          label="Weekly Profit"
          value={formatCurrency(metrics.totalProfit)}
          change={12.4}
          icon={<TrendingUp size={18} />}
          color="emerald"
        />
        <KPICard
          label="Avg Margin"
          value={formatPercent(metrics.avgMargin)}
          change={-2.1}
          icon={<Percent size={18} />}
          color="amber"
        />
        <KPICard
          label="Menu Items"
          value={String(metrics.itemCount)}
          icon={<UtensilsCrossed size={18} />}
          color="violet"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profit by Category */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Profit by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={profitByCategory} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(value: number) => [formatCurrency(Number(value))]}
              />
              <Bar dataKey="revenue" fill="#c7d2fe" radius={[6, 6, 0, 0]} name="Revenue" />
              <Bar dataKey="profit" fill="#6366f1" radius={[6, 6, 0, 0]} name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Menu Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                dataKey="count"
                nameKey="grade"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                paddingAngle={3}
                strokeWidth={0}
              >
                {gradeDistribution.map((entry) => (
                  <Cell key={entry.grade} fill={gradeColors[entry.grade]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {gradeDistribution.map((entry) => (
              <div key={entry.grade} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: gradeColors[entry.grade] }} />
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {entry.grade} ({entry.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trend + Top/Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Trend */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">4-Week Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(value: number) => [formatCurrency(Number(value))]}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#6366f1"
                fill="url(#profitGrad)"
                strokeWidth={2}
                name="Profit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Top Performers</h3>
            <Link
              to="/menu"
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5"
            >
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {topItems.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">{formatCurrency(item.totalProfit)}</p>
                  <p className="text-[11px] text-[var(--color-text-tertiary)]">{formatPercent(item.profitMargin)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <h3 className="text-sm font-semibold mb-4 text-[var(--color-text-primary)]">Needs Attention</h3>
          <div className="space-y-3">
            {bottomItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-red-50/50">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                    gradeColor(item.grade),
                  )}
                >
                  {item.grade}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-[11px] text-red-500">{formatPercent(item.profitMargin)} margin</p>
                </div>
                <p className="text-sm font-semibold text-red-500">{formatCurrency(item.totalProfit)}</p>
              </div>
            ))}
          </div>

          {openRecs.length > 0 && (
            <Link
              to="/recommendations"
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-50 text-indigo-600 text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              <Lightbulb size={14} />
              {openRecs.length} recommendation{openRecs.length !== 1 ? 's' : ''} available
            </Link>
          )}
        </div>
      </div>

      {/* Starred items row */}
      {analyzedItems.some((i) => i.starred) && (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Starred Items</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {analyzedItems
              .filter((i) => i.starred)
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[var(--color-border-light)] hover:border-indigo-200 transition-colors"
                >
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', gradeColor(item.grade))}>
                      {item.grade}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600">{formatCurrency(item.profit)}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({
  label,
  value,
  change,
  icon,
  color,
}: {
  label: string
  value: string
  change?: number
  icon: React.ReactNode
  color: string
}) {
  const bgColors: Record<string, string> = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    amber: 'bg-amber-50',
    violet: 'bg-violet-50',
  }
  const iconColors: Record<string, string> = {
    indigo: 'text-indigo-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    violet: 'text-violet-500',
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 lg:p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', bgColors[color], iconColors[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full',
              change >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50',
            )}
          >
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-xl lg:text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-[var(--color-text-tertiary)] mt-1">{label}</p>
    </div>
  )
}
