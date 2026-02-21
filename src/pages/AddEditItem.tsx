import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Calculator } from 'lucide-react'
import type { MenuItem } from '../lib/types'
import { formatCurrency, formatPercent, generateId, cn, gradeColor } from '../lib/utils'

interface AddEditItemProps {
  menuItems: MenuItem[]
  addMenuItem: (item: MenuItem) => void
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => void
}

const defaultItem: Omit<MenuItem, 'id' | 'createdAt'> = {
  name: '', category: 'Lunch', salePrice: 0, ingredientCost: 0,
  laborMinutes: 0, laborCostPerMinute: 0.35, packagingCost: 0,
  wasteFactor: 0.05, unitsSold: 0, period: 'weekly', starred: false,
}

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Bakery', 'Desserts', 'Sides', 'Specials']

interface ValidationErrors {
  name?: string
  salePrice?: string
  ingredientCost?: string
  packagingCost?: string
}

export function AddEditItem({ menuItems, addMenuItem, updateMenuItem }: AddEditItemProps) {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const existingItem = useMemo(() => menuItems.find(i => i.id === id), [menuItems, id])

  // Redirect if editing a non-existent item
  useEffect(() => {
    if (isEditing && !existingItem) {
      navigate('/menu', { replace: true })
    }
  }, [isEditing, existingItem, navigate])

  const [form, setForm] = useState(existingItem || { ...defaultItem, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const analysis = useMemo(() => {
    const laborCost = form.laborMinutes * form.laborCostPerMinute
    const adjustedIngredient = form.ingredientCost * (1 + form.wasteFactor)
    const totalCost = adjustedIngredient + laborCost + form.packagingCost
    const profit = form.salePrice - totalCost
    const margin = form.salePrice > 0 ? (profit / form.salePrice) * 100 : 0
    const weeklyProfit = profit * form.unitsSold
    let grade: 'A' | 'B' | 'C' | 'D' | 'F'
    if (margin >= 70) grade = 'A'
    else if (margin >= 55) grade = 'B'
    else if (margin >= 40) grade = 'C'
    else if (margin >= 25) grade = 'D'
    else grade = 'F'
    return { totalCost, profit, margin, weeklyProfit, grade, laborCost, adjustedIngredient }
  }, [form])

  const validate = (): ValidationErrors => {
    const errs: ValidationErrors = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (form.salePrice <= 0) errs.salePrice = 'Price must be greater than $0'
    if (form.ingredientCost < 0) errs.ingredientCost = 'Cost cannot be negative'
    if (form.packagingCost < 0) errs.packagingCost = 'Cost cannot be negative'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    if (isEditing && id) {
      updateMenuItem(id, form)
    } else {
      addMenuItem(form as MenuItem)
    }
    navigate('/menu')
  }

  const updateField = <K extends keyof MenuItem>(field: K, value: MenuItem[K]) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (submitted) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isEditing && !existingItem) return null

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button
        onClick={() => navigate('/menu')}
        className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-6 transition-colors"
        aria-label="Back to Menu"
      >
        <ArrowLeft size={16} />
        Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5" noValidate>
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold mb-5">{isEditing ? 'Edit' : 'Add'} Menu Item</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="item-name" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Item Name</label>
                <input
                  id="item-name"
                  type="text"
                  value={form.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="e.g., Avocado Toast"
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition-all',
                    errors.name ? 'border-red-400' : 'border-[var(--color-border)]'
                  )}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="item-category" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Category</label>
                <select
                  id="item-category"
                  value={form.category}
                  onChange={e => updateField('category', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 cursor-pointer"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="item-price" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Sale Price ($)</label>
                <input
                  id="item-price"
                  type="number" step="0.01" min="0"
                  value={form.salePrice || ''}
                  onChange={e => updateField('salePrice', parseFloat(e.target.value) || 0)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400',
                    errors.salePrice ? 'border-red-400' : 'border-[var(--color-border)]'
                  )}
                />
                {errors.salePrice && <p className="text-xs text-red-500 mt-1">{errors.salePrice}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold mb-5">Cost Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="item-ingredient-cost" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Ingredient Cost ($)</label>
                <input
                  id="item-ingredient-cost"
                  type="number" step="0.01" min="0"
                  value={form.ingredientCost || ''}
                  onChange={e => updateField('ingredientCost', parseFloat(e.target.value) || 0)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400',
                    errors.ingredientCost ? 'border-red-400' : 'border-[var(--color-border)]'
                  )}
                />
                {errors.ingredientCost && <p className="text-xs text-red-500 mt-1">{errors.ingredientCost}</p>}
              </div>
              <div>
                <label htmlFor="item-packaging-cost" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Packaging Cost ($)</label>
                <input
                  id="item-packaging-cost"
                  type="number" step="0.01" min="0"
                  value={form.packagingCost || ''}
                  onChange={e => updateField('packagingCost', parseFloat(e.target.value) || 0)}
                  className={cn(
                    'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400',
                    errors.packagingCost ? 'border-red-400' : 'border-[var(--color-border)]'
                  )}
                />
                {errors.packagingCost && <p className="text-xs text-red-500 mt-1">{errors.packagingCost}</p>}
              </div>
              <div>
                <label htmlFor="item-labor-minutes" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Prep Time (min)</label>
                <input
                  id="item-labor-minutes"
                  type="number" step="1" min="0"
                  value={form.laborMinutes || ''}
                  onChange={e => updateField('laborMinutes', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div>
                <label htmlFor="item-labor-rate" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Labor $/min</label>
                <input
                  id="item-labor-rate"
                  type="number" step="0.01" min="0"
                  value={form.laborCostPerMinute || ''}
                  onChange={e => updateField('laborCostPerMinute', parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div>
                <label htmlFor="item-waste" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Waste Factor (%)</label>
                <input
                  id="item-waste"
                  type="number" step="1" min="0" max="100"
                  value={Math.round(form.wasteFactor * 100) || ''}
                  onChange={e => updateField('wasteFactor', (parseInt(e.target.value) || 0) / 100)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div>
                <label htmlFor="item-units" className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Units Sold / Week</label>
                <input
                  id="item-units"
                  type="number" step="1" min="0"
                  value={form.unitsSold || ''}
                  onChange={e => updateField('unitsSold', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            <Save size={16} />
            {isEditing ? 'Update' : 'Add'} Menu Item
          </button>
        </form>

        {/* Live Cost Calculator */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={16} className="text-indigo-500" />
              <h3 className="text-sm font-semibold">Live Profit Calculator</h3>
            </div>

            <div className="space-y-3">
              <CostRow label="Ingredients (adj.)" value={analysis.adjustedIngredient} />
              <CostRow label="Labor" value={analysis.laborCost} />
              <CostRow label="Packaging" value={form.packagingCost} />
              <div className="border-t border-dashed border-[var(--color-border)] pt-3">
                <CostRow label="Total Cost" value={analysis.totalCost} bold />
              </div>
              <div className="border-t border-[var(--color-border)] pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Profit / Unit</span>
                  <span className={cn('text-lg font-bold', analysis.profit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                    {formatCurrency(analysis.profit)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-secondary)]">Margin</span>
                <span className={cn('text-sm font-semibold', analysis.margin >= 55 ? 'text-emerald-600' : analysis.margin >= 35 ? 'text-amber-600' : 'text-red-500')}>
                  {formatPercent(analysis.margin)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--color-text-secondary)]">Weekly Profit</span>
                <span className={cn('text-sm font-bold', analysis.weeklyProfit >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                  {formatCurrency(analysis.weeklyProfit)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center">
              <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold', gradeColor(analysis.grade))}>
                {analysis.grade}
              </div>
            </div>
            <p className="text-center text-xs text-[var(--color-text-tertiary)] mt-2">Profitability Grade</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CostRow({ label, value, bold = false }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={cn('text-sm', bold ? 'font-semibold' : 'text-[var(--color-text-secondary)]')}>{label}</span>
      <span className={cn('text-sm', bold ? 'font-semibold' : '')}>{formatCurrency(value)}</span>
    </div>
  )
}
