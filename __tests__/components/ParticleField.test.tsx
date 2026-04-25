// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ParticleField, { getMobileParticles } from '../../components/ParticleField'
import type { StartupParticle } from '../../lib/types'

const makeStartups = (n: number): StartupParticle[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `id-${i}`,
    name: `Startup ${i}`,
    sector: null,
    founded_year: null,
    shutdown_date: null,
    failure_tag: null,
  }))

describe('getMobileParticles', () => {
  it('returns every 3rd startup on mobile', () => {
    const startups = makeStartups(9)
    const result = getMobileParticles(startups, true)
    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('Startup 0')
    expect(result[1].name).toBe('Startup 3')
    expect(result[2].name).toBe('Startup 6')
  })

  it('returns all startups on desktop', () => {
    const startups = makeStartups(9)
    const result = getMobileParticles(startups, false)
    expect(result).toHaveLength(9)
  })

  it('returns every 3rd of 258 startups on mobile (~86)', () => {
    const startups = makeStartups(258)
    const result = getMobileParticles(startups, true)
    expect(result).toHaveLength(86)
  })
})

describe('ParticleField', () => {
  it('renders tap hint label for mobile users', () => {
    render(<ParticleField startups={[]} searchQuery="" activeTags={[]} />)
    expect(screen.getByTestId('tap-hint')).toBeInTheDocument()
  })
})
