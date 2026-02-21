import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioModeler } from './ScenarioModeler'
import { analyzeMenuItem } from '../lib/utils'
import { demoMenuItems } from '../lib/demo-data'

const analyzedItems = demoMenuItems.map(analyzeMenuItem)

describe('ScenarioModeler', () => {
  it('renders without crashing', () => {
    render(<ScenarioModeler analyzedItems={analyzedItems} />)
    expect(screen.getByText('Scenario Modeler')).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    render(<ScenarioModeler analyzedItems={[]} />)
    expect(screen.getByText('No menu items to model')).toBeInTheDocument()
  })

  it('shows current weekly profit', () => {
    render(<ScenarioModeler analyzedItems={analyzedItems} />)
    expect(screen.getByText('Current Weekly Profit')).toBeInTheDocument()
  })

  it('adds a scenario with correct waste factor conversion', () => {
    render(<ScenarioModeler analyzedItems={analyzedItems} />)

    // Select waste factor field
    const fieldSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(fieldSelect, { target: { value: 'wasteFactor' } })

    // Enter 10 (meaning 10%)
    const input = screen.getByPlaceholderText(/Currently:/)
    fireEvent.change(input, { target: { value: '10' } })

    // Click Add
    fireEvent.click(screen.getByText('Add'))

    // Should show "10%" in the scenario list (converted from 0.10 stored value)
    expect(screen.getByText('Active Scenarios')).toBeInTheDocument()
    // The displayed new value should be 10%
    expect(screen.getByText('10%')).toBeInTheDocument()
  })
})
