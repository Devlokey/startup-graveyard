// @vitest-environment happy-dom
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ParticleField from '../../components/ParticleField'

describe('ParticleField', () => {
  it('renders tap hint label for mobile users', () => {
    render(<ParticleField startups={[]} searchQuery="" activeTags={[]} />)
    expect(screen.getByTestId('tap-hint')).toBeInTheDocument()
  })
})
