import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Star, ArrowUpDown, LayoutGrid, List, Trash2, Edit3, Filter, UtensilsCrossed } from 'lucide-react'
import type { MenuItemAnalysis, SortField, SortDirection, ViewMode } from '../lib/types'
import { formatCurrency, formatPercent, cn, gradeColor } from '../lib/utils'

interface MenuItemsProps {
  analyzedItems: MenuItemAnalysis[]
  toggleStar: (id: string) => void
  deleteMenuItem: (id: string) => void
}

export function MenuItems({ analyzedItems, toggleStar, deleteMenuItem }: MenuItemsProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<SortField>('totalProfit')
  const [sortDir, setSortDir] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = useMemo(() => {
    const cats = new Set(analyzedItems.map((i) => i.category))
    return ['all', ...Array.from(cats).sort()]
  }, [analyzedItems])

  const filtered = useMemo(() => {
    let items = [...analyzedItems]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    }
    if (categoryFilter !== 'all') {
      items = items.filter((i) => i.category === categoryFilter)
    }
    items.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
    })
    return items
  }, [analyzedItems, search, sortField, sortDir, categoryFilter])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteMenuItem(id)
    }
  }

  if (analyzedItems.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <UtensilsCrossed size={48} className="mx-auto text-[var(--color-text-tertiary)] mb-4" />
        <h3 className="text-lg font-semibold mb-2">No menu items yet</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Add your first item or import from a CSV file.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/menu/add"
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} className="inline mr-1" /> Add Item
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search menu items"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="pl-8 pr-8 py-2.5 rounded-xl border border-[var(--color-border)] bg-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[var(--color-surface-tertiary)] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-[var(--color-text-tertiary)]',
              )}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-[var(--color-text-tertiary)]',
              )}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <Link
            to="/menu/add"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add Item</span>
          </Link>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-[var(--color-text-tertiary)]">
        {filtered.length} item{filtered.length !== 1 ? 's' : ''} found
      </p>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search size={36} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">No items match your search</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {filtered.length > 0 && viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-tertiary)] border-b border-[var(--color-border)]">
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)] w-8"></th>
                  <SortHeader label="Item" field="name" current={sortField} dir={sortDir} onSort={handleSort} />
                  <th className="text-left px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Category
                  </th>
                  <SortHeader
                    label="Price"
                    field="salePrice"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Cost"
                    field="totalCost"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Margin"
                    field="profitMargin"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Units/wk"
                    field="unitsSold"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Wkly Profit"
                    field="totalProfit"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    align="right"
                  />
                  <SortHeader
                    label="Grade"
                    field="grade"
                    current={sortField}
                    dir={sortDir}
                    onSort={handleSort}
                    align="center"
                  />
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-light)]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--color-surface-secondary)] transition-colors group">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStar(item.id)}
                        aria-label={item.starred ? `Unstar ${item.name}` : `Star ${item.name}`}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Star size={14} className={item.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[var(--color-surface-tertiary)] px-2 py-1 rounded-md text-[var(--color-text-secondary)]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.salePrice)}</td>
                    <td className="px-4 py-3 text-right text-[var(--color-text-secondary)]">
                      {formatCurrency(item.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'font-semibold',
                          item.profitMargin >= 55
                            ? 'text-emerald-600'
                            : item.profitMargin >= 35
                              ? 'text-amber-600'
                              : 'text-red-500',
                        )}
                      >
                        {formatPercent(item.profitMargin)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{item.unitsSold}</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      <span className={item.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                        {formatCurrency(item.totalProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold',
                          gradeColor(item.grade),
                        )}
                      >
                        {item.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/menu/edit/${item.id}`)}
                          aria-label={`Edit ${item.name}`}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 text-[var(--color-text-tertiary)] hover:text-indigo-500 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          aria-label={`Delete ${item.name}`}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-tertiary)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filtered.length > 0 ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[var(--color-border)] p-4 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{item.category}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStar(item.id)}
                    aria-label={item.starred ? `Unstar ${item.name}` : `Star ${item.name}`}
                  >
                    <Star
                      size={14}
                      className={item.starred ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-300'}
                    />
                  </button>
                  <span
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center',
                      gradeColor(item.grade),
                    )}
                  >
                    {item.grade}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-[var(--color-surface-secondary)] rounded-lg p-2">
                  <p className="text-[var(--color-text-tertiary)]">Price</p>
                  <p className="font-semibold">{formatCurrency(item.salePrice)}</p>
                </div>
                <div className="bg-[var(--color-surface-secondary)] rounded-lg p-2">
                  <p className="text-[var(--color-text-tertiary)]">Cost</p>
                  <p className="font-semibold">{formatCurrency(item.totalCost)}</p>
                </div>
                <div className="bg-[var(--color-surface-secondary)] rounded-lg p-2">
                  <p className="text-[var(--color-text-tertiary)]">Margin</p>
                  <p
                    className={cn(
                      'font-semibold',
                      item.profitMargin >= 55
                        ? 'text-emerald-600'
                        : item.profitMargin >= 35
                          ? 'text-amber-600'
                          : 'text-red-500',
                    )}
                  >
                    {formatPercent(item.profitMargin)}
                  </p>
                </div>
                <div className="bg-[var(--color-surface-secondary)] rounded-lg p-2">
                  <p className="text-[var(--color-text-tertiary)]">Units/wk</p>
                  <p className="font-semibold">{item.unitsSold}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-light)]">
                <p className="text-sm font-bold text-emerald-600">
                  {formatCurrency(item.totalProfit)}
                  <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]"> /wk</span>
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/menu/edit/${item.id}`)}
                    aria-label={`Edit ${item.name}`}
                    className="p-1.5 rounded-lg hover:bg-indigo-50 text-[var(--color-text-tertiary)] hover:text-indigo-500"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    aria-label={`Delete ${item.name}`}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--color-text-tertiary)] hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
  align = 'left',
}: {
  label: string
  field: SortField
  current: SortField
  dir: SortDirection
  onSort: (f: SortField) => void
  align?: string
}) {
  return (
    <th
      className={cn(
        'px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-indigo-500 transition-colors select-none',
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left',
        current === field ? 'text-indigo-600' : 'text-[var(--color-text-secondary)]',
      )}
      onClick={() => onSort(field)}
      aria-sort={current === field ? (dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={current === field ? 'opacity-100' : 'opacity-30'} />
      </span>
    </th>
  )
}
