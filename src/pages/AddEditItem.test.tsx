import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AddEditItem } from './AddEditItem'
import { demoMenuItems } from '../lib/demo-data'

function renderAddEdit(props = {}, route = '/menu/add') {
  const defaultProps = {
    menuItems: demoMenuItems,
    addMenuItem: vi.fn(),
    updateMenuItem: vi.fn(),
    ...props,
  }

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/menu/add" element={<AddEditItem {...defaultProps} />} />
        <Route path="/menu/edit/:id" element={<AddEditItem {...defaultProps} />} />
        <Route path="/menu" element={<div data-testid="menu-page">Menu</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AddEditItem', () => {
  it('renders add mode', () => {
    renderAddEdit()
    expect(screen.getByText('Add Menu Item', { selector: 'h3' })).toBeInTheDocument()
  })

  it('renders edit mode with existing data', () => {
    renderAddEdit({}, `/menu/edit/${demoMenuItems[0].id}`)
    expect(screen.getByText('Edit Menu Item', { selector: 'h3' })).toBeInTheDocument()
    expect(screen.getByDisplayValue(demoMenuItems[0].name)).toBeInTheDocument()
  })

  it('redirects to menu if editing non-existent item', () => {
    renderAddEdit({}, '/menu/edit/nonexistent-id')
    expect(screen.getByTestId('menu-page')).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', () => {
    renderAddEdit()
    const submitBtn = screen.getByText('Add Menu Item', { selector: 'button' })
    fireEvent.click(submitBtn)

    expect(screen.getByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Price must be greater than $0')).toBeInTheDocument()
  })

  it('calls addMenuItem on valid submit', () => {
    const addMenuItem = vi.fn()
    renderAddEdit({ addMenuItem })

    fireEvent.change(screen.getByLabelText('Item Name'), { target: { value: 'New Dish' } })
    fireEvent.change(screen.getByLabelText('Sale Price ($)'), { target: { value: '15.00' } })

    const submitBtn = screen.getByText('Add Menu Item', { selector: 'button' })
    fireEvent.click(submitBtn)

    expect(addMenuItem).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Dish', salePrice: 15 })
    )
  })

  it('shows live profit calculator', () => {
    renderAddEdit()
    expect(screen.getByText('Live Profit Calculator')).toBeInTheDocument()
    expect(screen.getByText('Profitability Grade')).toBeInTheDocument()
  })
})
