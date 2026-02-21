import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X } from 'lucide-react'
import Papa from 'papaparse'
import type { MenuItem } from '../lib/types'
import { generateId, cn } from '../lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_ROWS = 1000

interface ImportDataProps {
  importMenuItems: (items: MenuItem[]) => void
  menuItems: MenuItem[]
}

interface ParsedRow {
  name: string
  category: string
  salePrice: number
  ingredientCost: number
  laborMinutes: number
  unitsSold: number
  valid: boolean
  errors: string[]
  duplicate: boolean
}

export function ImportData({ importMenuItems, menuItems }: ImportDataProps) {
  const [dragOver, setDragOver] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedRow[]>([])
  const [fileName, setFileName] = useState('')
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [parseError, setParseError] = useState('')

  const processFile = useCallback(
    (file: File) => {
      const existingNames = new Set(menuItems.map((i) => i.name.toLowerCase().trim()))
      setParseError('')

      if (file.size > MAX_FILE_SIZE) {
        setParseError(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`)
        return
      }

      setFileName(file.name)
      setImportDone(false)
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: MAX_ROWS,
        complete: (results) => {
          if (results.errors.length > 0) {
            const errorMsgs = results.errors
              .slice(0, 3)
              .map((e) => e.message)
              .join('; ')
            setParseError(`Parse errors: ${errorMsgs}`)
          }

          const rows: ParsedRow[] = results.data.map((row: Record<string, string>) => {
            const errors: string[] = []
            const name = (row.name || row.item_name || row.item || row.Name || row['Item Name'] || '').toString().trim()
            const category = (row.category || row.Category || row.type || 'Uncategorized').toString().trim()
            const salePrice = parseFloat(row.sale_price || row.price || row.Price || row['Sale Price'] || '0')
            const ingredientCost = parseFloat(row.ingredient_cost || row.cost || row.Cost || row['Food Cost'] || '0')
            const laborMinutes = parseInt(row.labor_minutes || row.prep_time || row['Prep Time'] || '5')
            const unitsSold = parseInt(row.units_sold || row.quantity || row.Quantity || row['Units Sold'] || '0')

            if (!name) errors.push('Missing name')
            if (isNaN(salePrice) || salePrice <= 0) errors.push('Invalid price')
            if (isNaN(ingredientCost)) errors.push('Invalid cost')

            const duplicate = existingNames.has(name.toLowerCase())

            return {
              name,
              category,
              salePrice: isNaN(salePrice) ? 0 : salePrice,
              ingredientCost: isNaN(ingredientCost) ? 0 : ingredientCost,
              laborMinutes: isNaN(laborMinutes) ? 5 : laborMinutes,
              unitsSold: isNaN(unitsSold) ? 0 : unitsSold,
              valid: errors.length === 0,
              errors,
              duplicate,
            }
          })
          setParsedData(rows)
        },
        error: (err) => {
          setParseError(`Failed to parse file: ${err.message}`)
        },
      })
    },
    [menuItems],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      setParseError('')
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith('.csv') || file.name.endsWith('.tsv'))) {
        processFile(file)
      } else if (file) {
        setParseError('Unsupported file type. Please upload a .csv or .tsv file.')
      }
    },
    [processFile],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleImport = () => {
    setImporting(true)
    const validRows = parsedData.filter((r) => r.valid)
    const items: MenuItem[] = validRows.map((row) => ({
      id: generateId(),
      name: row.name,
      category: row.category,
      salePrice: row.salePrice,
      ingredientCost: row.ingredientCost,
      laborMinutes: row.laborMinutes,
      laborCostPerMinute: 0.35,
      packagingCost: 0.15,
      wasteFactor: 0.05,
      unitsSold: row.unitsSold,
      period: 'weekly',
      starred: false,
      createdAt: new Date().toISOString().slice(0, 10),
    }))
    setTimeout(() => {
      importMenuItems(items)
      setImporting(false)
      setImportDone(true)
    }, 800)
  }

  const clearImport = () => {
    setParsedData([])
    setFileName('')
    setImportDone(false)
    setParseError('')
  }

  const validCount = parsedData.filter((r) => r.valid).length
  const invalidCount = parsedData.filter((r) => !r.valid).length
  const duplicateCount = parsedData.filter((r) => r.duplicate && r.valid).length

  const downloadTemplate = () => {
    const csv =
      'name,category,sale_price,ingredient_cost,labor_minutes,units_sold\nAvocado Toast,Breakfast,8.00,2.85,5,145\nEspresso,Beverages,3.50,0.45,2,320'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '86d-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      document.getElementById('fileInput')?.click()
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold">Import POS Data</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Upload CSV exports from Square, Toast, or any POS system. We'll map the columns automatically.
        </p>
      </div>

      {/* Supported formats */}
      <div className="flex flex-wrap gap-2">
        {['Square', 'Toast', 'Clover', 'Lightspeed', 'Generic CSV'].map((name) => (
          <span key={name} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-medium">
            {name}
          </span>
        ))}
      </div>

      {/* Parse error */}
      {parseError && (
        <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {parseError}
        </div>
      )}

      {/* Upload zone */}
      {parsedData.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
            dragOver
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-[var(--color-border)] bg-white hover:border-indigo-300 hover:bg-indigo-50/30',
          )}
          onClick={() => document.getElementById('fileInput')?.click()}
          aria-label="Upload CSV file"
        >
          <input id="fileInput" type="file" accept=".csv,.tsv" className="hidden" onChange={handleFileSelect} />
          <Upload
            size={36}
            className={cn('mx-auto mb-4', dragOver ? 'text-indigo-500' : 'text-[var(--color-text-tertiary)]')}
          />
          <p className="text-sm font-medium mb-1">Drop your CSV file here, or click to browse</p>
          <p className="text-xs text-[var(--color-text-tertiary)]">Supports .csv and .tsv files up to 5MB</p>
        </div>
      ) : (
        /* Preview */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">{parsedData.length} rows found</p>
                </div>
              </div>
              <button
                onClick={clearImport}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Clear import"
              >
                <X size={16} className="text-[var(--color-text-tertiary)]" />
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-xs font-medium text-emerald-700">{validCount} valid</span>
              </div>
              {invalidCount > 0 && (
                <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="text-xs font-medium text-red-700">{invalidCount} with errors</span>
                </div>
              )}
              {duplicateCount > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-xl">
                  <AlertCircle size={14} className="text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">
                    {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {/* Preview table */}
            <div className="overflow-x-auto max-h-[300px] overflow-y-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full text-xs">
                <thead className="bg-[var(--color-surface-tertiary)] sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Status</th>
                    <th className="text-left px-3 py-2 font-semibold">Name</th>
                    <th className="text-left px-3 py-2 font-semibold">Category</th>
                    <th className="text-right px-3 py-2 font-semibold">Price</th>
                    <th className="text-right px-3 py-2 font-semibold">Cost</th>
                    <th className="text-right px-3 py-2 font-semibold">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-light)]">
                  {parsedData.slice(0, 20).map((row, i) => (
                    <tr key={i} className={cn(!row.valid ? 'bg-red-50/50' : row.duplicate ? 'bg-amber-50/50' : '')}>
                      <td className="px-3 py-2">
                        {row.valid ? (
                          row.duplicate ? (
                            <span title="Duplicate name">
                              <AlertCircle size={14} className="text-amber-500" />
                            </span>
                          ) : (
                            <CheckCircle2 size={14} className="text-emerald-500" />
                          )
                        ) : (
                          <span title={row.errors.join(', ')}>
                            <AlertCircle size={14} className="text-red-500" />
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">{row.name || '—'}</td>
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2 text-right">${row.salePrice.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">${row.ingredientCost.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{row.unitsSold}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importDone ? (
              <div className="mt-4 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl">
                <CheckCircle2 size={16} />
                <span className="text-sm font-medium">Successfully imported {validCount} items!</span>
              </div>
            ) : (
              <button
                onClick={handleImport}
                disabled={importing || validCount === 0}
                className="mt-4 w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
              >
                {importing ? 'Importing...' : `Import ${validCount} Item${validCount !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Template download */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5">
        <h3 className="text-sm font-semibold mb-2">Need a template?</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-3">
          Download our CSV template with the correct column headers. Works with Square, Toast, and most POS exports.
        </p>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
        >
          <Download size={14} />
          Download Template
        </button>
      </div>
    </div>
  )
}
