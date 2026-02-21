import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { Layout } from './components/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Dashboard } from './pages/Dashboard'
import { MenuItems } from './pages/MenuItems'
import { AddEditItem } from './pages/AddEditItem'
import { ImportData } from './pages/ImportData'
import { Competitors } from './pages/Competitors'
import { Recommendations } from './pages/Recommendations'
import { Settings } from './pages/Settings'
import { ScenarioModeler } from './pages/ScenarioModeler'
import { Link } from 'react-router-dom'

function EditItemWrapper(props: React.ComponentProps<typeof AddEditItem>) {
  const { id } = useParams()
  return <AddEditItem key={id} {...props} />
}

function NotFound() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold mb-2">404 — Page not found</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

export default function App() {
  const store = useStore()

  return (
    <BrowserRouter>
      <Layout restaurantName={store.restaurantName}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard {...store} />} />
            <Route path="/menu" element={<MenuItems {...store} />} />
            <Route path="/menu/add" element={<AddEditItem {...store} />} />
            <Route path="/menu/edit/:id" element={<EditItemWrapper {...store} />} />
            <Route path="/import" element={<ImportData {...store} />} />
            <Route path="/competitors" element={<Competitors {...store} />} />
            <Route path="/recommendations" element={<Recommendations {...store} />} />
            <Route path="/scenarios" element={<ScenarioModeler {...store} />} />
            <Route path="/settings" element={<Settings {...store} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </Layout>
    </BrowserRouter>
  )
}
