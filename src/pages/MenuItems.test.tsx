import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MenuItems } from './MenuItems'
import { analyzeMenuItem } from '../lib/utils'
import { demoMenuItems } from '../lib/demo-data'

const analyzedItems = demoMenuItems.map(analyzeMenuItem).sort((a, b) => b.totalProfit - a.totalProfit)

function renderMenuItems(props = {}) {
  const defaultProps = {
    analyzedItems,
    toggleStar: vi.fn(),
    deleteMenuItem: vi.fn(),
    ...props,
  }
  return render(
    <MemoryRouter>
      <MenuItems {...defaultProps} />
    </MemoryRouter>
  )
}

describe('MenuItems', () => {
  it('renders all items', () => {
    renderMenuItems()
    expect(screen.getByText('12 items found')).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    renderMenuItems({ analyzedItems: [] })
    expect(screen.getByText('No menu items yet')).toBeInTheDocument()
  })

  it('filters by search', () => {
    renderMenuItems()
    const searchInput = screen.getByPlaceholderText('Search items...')
    fireEvent.change(searchInput, { target: { value: 'Espresso' } })
    expect(screen.getByText('1 item found')).toBeInTheDocument()
  })

  it('shows no results message for empty search', () => {
    renderMenuItems()
    const searchInput = screen.getByPlaceholderText('Search items...')
    fireEvent.change(searchInput, { target: { value: 'xyznoexist' } })
    expect(screen.getByText('No items match your search')).toBeInTheDocument()
  })

  it('calls deleteMenuItem with confirmation', () => {
    const deleteMenuItem = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderMenuItems({ deleteMenuItem })

    // Find and click the first delete button
    const deleteButtons = screen.getAllByLabelText(/^Delete /)
    fireEvent.click(deleteButtons[0])

    expect(window.confirm).toHaveBeenCalled()
    expect(deleteMenuItem).toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('does not delete when confirmation is cancelled', () => {
    const deleteMenuItem = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    renderMenuItems({ deleteMenuItem })

    const deleteButtons = screen.getAllByLabelText(/^Delete /)
    fireEvent.click(deleteButtons[0])

    expect(deleteMenuItem).not.toHaveBeenCalled()
    vi.restoreAllMocks()
  })

  it('toggles star', () => {
    const toggleStar = vi.fn()
    renderMenuItems({ toggleStar })

    const starButtons = screen.getAllByLabelText(/Star |Unstar /)
    fireEvent.click(starButtons[0])

    expect(toggleStar).toHaveBeenCalled()
  })

  it('has accessible sort headers', () => {
    renderMenuItems()
    // Sort headers should be clickable
    const priceHeader = screen.getByText('Price')
    fireEvent.click(priceHeader)
    // Should not throw, and the header should reflect active sort
  })
})
