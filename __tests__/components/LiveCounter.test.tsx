// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LiveCounter from '../../components/LiveCounter'

describe('LiveCounter', () => {
  it('renders the formatted target value', () => {
    render(<LiveCounter value={12487} suffix=" startups failed" />)
    expect(screen.getByTestId('live-counter')).toBeInTheDocument()
  })

  it('renders the prefix when provided', () => {
    render(<LiveCounter value={82400} prefix="₹" suffix=" Cr burned" />)
    const el = screen.getByTestId('live-counter')
    expect(el).toBeInTheDocument()
  })
})
