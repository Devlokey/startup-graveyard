// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import HomepageClient from '../../components/HomepageClient'

// ParticleField accesses canvas and window.innerWidth — mock to avoid jsdom errors
vi.mock('../../components/ParticleField', () => ({
  default: () => null,
}))

const mockStats = { total_dead: 258, total_burned_crore: 78116 }
const mockStartups: never[] = []

describe('HomepageClient', () => {
  it('renders mobile dead-count stat block', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    expect(screen.getByTestId('mobile-dead-count')).toBeInTheDocument()
  })

  it('renders mobile burned-count stat block', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    expect(screen.getByTestId('mobile-burned-count')).toBeInTheDocument()
  })

  it('renders tag pill buttons with min-h-[36px] for touch targets', () => {
    render(<HomepageClient startups={mockStartups} stats={mockStats} />)
    const pills = screen.getAllByRole('button')
    expect(pills.length).toBe(4) // Overfunded, Too Early, Bad Product, Market Shift
    pills.forEach((pill) => {
      expect(pill.className).toContain('min-h-[36px]')
    })
  })
})
