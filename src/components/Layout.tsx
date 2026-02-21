import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UtensilsCrossed,
  Upload,
  Users,
  Lightbulb,
  Settings,
  FlaskConical,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/menu', label: 'Menu Items', icon: UtensilsCrossed },
  { path: '/import', label: 'Import Data', icon: Upload },
  { path: '/competitors', label: 'Competitors', icon: Users },
  { path: '/recommendations', label: 'Insights', icon: Lightbulb },
  { path: '/scenarios', label: 'Scenarios', icon: FlaskConical },
  { path: '/settings', label: 'Settings', icon: Settings },
]

interface LayoutProps {
  children: React.ReactNode
  restaurantName: string
}

export function Layout({ children, restaurantName }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const currentPage = navItems.find((item) => {
    if (item.path === '/') return location.pathname === '/'
    return location.pathname.startsWith(item.path)
  })

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-secondary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-white border-r border-[var(--color-border)] fixed h-screen z-30">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[var(--color-border)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <span className="text-white font-extrabold text-sm">86</span>
          </div>
          <div>
            <h1 className="font-bold text-[15px] text-[var(--color-text-primary)]">86'd</h1>
            <p className="text-[11px] text-[var(--color-text-tertiary)] leading-none">{restaurantName}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-tertiary)] hover:text-[var(--color-text-primary)]'
                }`
              }
            >
              <item.icon size={18} strokeWidth={2} className="shrink-0" />
              <span>{item.label}</span>
              <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[var(--color-border)]">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-700 mb-1">Pro Tip</p>
            <p className="text-[11px] text-indigo-600/80 leading-relaxed">
              Import your POS data to get personalized profit insights for every menu item.
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 w-[280px] bg-white z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">86</span>
            </div>
            <h1 className="font-bold text-[15px]">86'd</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium transition-all ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-[var(--color-text-secondary)] hover:bg-gray-50'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)] h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 mr-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            {currentPage && (
              <>
                <currentPage.icon size={18} className="text-indigo-500" />
                <h2 className="text-[15px] font-semibold">{currentPage.label}</h2>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[var(--color-surface-tertiary)] px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">Demo Mode</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold">
              {restaurantName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
