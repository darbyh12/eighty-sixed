import { useState } from 'react'
import { Save, Building2, DollarSign, Link2, Bell, Shield } from 'lucide-react'
import { cn } from '../lib/utils'

interface SettingsProps {
  restaurantName: string
  setRestaurantName: (name: string) => void
}

export function Settings({ restaurantName, setRestaurantName }: SettingsProps) {
  const [name, setName] = useState(restaurantName)
  const [laborRate] = useState('0.35')
  const [defaultWaste] = useState('5')
  const [currency] = useState('USD')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  const handleSave = () => {
    setRestaurantName(name)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'integrations', label: 'Integrations', icon: Link2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-lg font-bold">Settings</h2>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[var(--color-surface-tertiary)] p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center',
              activeTab === tab.id
                ? 'bg-white shadow-sm text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]',
            )}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
              <Building2 size={16} className="text-indigo-500" />
              Restaurant Details
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="settings-restaurant-name"
                  className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"
                >
                  Restaurant Name
                </label>
                <input
                  id="settings-restaurant-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
                />
              </div>
              <div className="opacity-50">
                <label
                  htmlFor="settings-currency"
                  className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"
                >
                  Currency <span className="text-[var(--color-text-tertiary)]">(Coming soon)</span>
                </label>
                <select
                  id="settings-currency"
                  value={currency}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-gray-50 cursor-not-allowed"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
            <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
              <DollarSign size={16} className="text-indigo-500" />
              Default Values
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)] mb-3">
              These defaults will apply to new menu items once backend persistence is connected.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-50">
              <div>
                <label
                  htmlFor="settings-labor-rate"
                  className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"
                >
                  Default Labor Rate ($/min) <span className="text-[var(--color-text-tertiary)]">(Coming soon)</span>
                </label>
                <input
                  id="settings-labor-rate"
                  type="number"
                  step="0.01"
                  value={laborRate}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label
                  htmlFor="settings-waste"
                  className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5"
                >
                  Default Waste Factor (%) <span className="text-[var(--color-text-tertiary)]">(Coming soon)</span>
                </label>
                <input
                  id="settings-waste"
                  type="number"
                  step="1"
                  value={defaultWaste}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm bg-gray-50 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            className={cn(
              'flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all',
              saved ? 'bg-emerald-500 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white',
            )}
          >
            {saved ? (
              <>
                <Save size={16} /> Saved!
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-4">
          {[
            { name: 'Square POS', desc: 'Import sales data from Square', connected: false, icon: '◻️' },
            { name: 'Toast POS', desc: 'Import sales data from Toast', connected: false, icon: '🍞' },
            { name: 'Clover POS', desc: 'Import sales data from Clover', connected: false, icon: '🍀' },
            { name: 'DoorDash', desc: 'Track competitor pricing on DoorDash', connected: false, icon: '🚗' },
            { name: 'Uber Eats', desc: 'Track competitor pricing on Uber Eats', connected: false, icon: '🛵' },
            { name: 'Grubhub', desc: 'Track competitor pricing on Grubhub', connected: false, icon: '🍔' },
          ].map((integration) => (
            <div
              key={integration.name}
              className="bg-white rounded-2xl border border-[var(--color-border)] p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{integration.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">{integration.desc}</p>
                </div>
              </div>
              <button
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-medium transition-colors',
                  integration.connected
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)] hover:bg-indigo-50 hover:text-indigo-600',
                )}
              >
                {integration.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-6 space-y-5">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Bell size={16} className="text-indigo-500" />
            Notification Preferences
            <span className="text-xs font-normal text-[var(--color-text-tertiary)]">(Coming soon)</span>
          </h3>
          {[
            { label: 'Weekly profitability report', desc: 'Get a summary every Monday' },
            { label: 'New recommendations', desc: 'When we spot optimization opportunities' },
            { label: 'Competitor price changes', desc: 'When a competitor changes their pricing' },
            { label: 'Menu item alerts', desc: 'When an item drops below target margin' },
          ].map((pref, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-3 border-b border-[var(--color-border-light)] last:border-0 opacity-50"
            >
              <div>
                <p className="text-sm font-medium">{pref.label}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">{pref.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input type="checkbox" checked={false} disabled readOnly className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Supabase config note */}
      <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-indigo-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-indigo-700">Backend Configuration</p>
            <p className="text-xs text-indigo-600/80 mt-1 leading-relaxed">
              This app uses Supabase for authentication and data storage. Add your{' '}
              <code className="bg-indigo-100 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
              <code className="bg-indigo-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> environment variables to
              connect to your backend. Currently running in demo mode with sample data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
