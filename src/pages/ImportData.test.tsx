import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImportData } from './ImportData'

function renderImport(props = {}) {
  const defaultProps = {
    importMenuItems: vi.fn(),
    menuItems: [],
    ...props,
  }
  return render(<ImportData {...defaultProps} />)
}

describe('ImportData', () => {
  it('renders upload zone', () => {
    renderImport()
    expect(screen.getByText(/Drop your CSV file here/)).toBeInTheDocument()
  })

  it('has keyboard accessible upload zone', () => {
    renderImport()
    const uploadZone = screen.getByRole('button', { name: 'Upload CSV file' })
    expect(uploadZone).toBeInTheDocument()
    expect(uploadZone).toHaveAttribute('tabIndex', '0')
  })

  it('shows template download button', () => {
    renderImport()
    expect(screen.getByText('Download Template')).toBeInTheDocument()
  })

  it('shows supported formats', () => {
    renderImport()
    expect(screen.getByText('Square')).toBeInTheDocument()
    expect(screen.getByText('Toast')).toBeInTheDocument()
    expect(screen.getByText('Generic CSV')).toBeInTheDocument()
  })

  it('shows file size limit info', () => {
    renderImport()
    expect(screen.getByText(/up to 5MB/)).toBeInTheDocument()
  })
})
