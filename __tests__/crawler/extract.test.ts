import { describe, it, expect, vi } from 'vitest'

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}))

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

import { extractShutdown } from '../../crawler/extract'
import type { Article } from '../../crawler/sources'

const article: Article = {
  title: 'Edtech startup LearnX shuts down after burning ₹120 Cr',
  url: 'https://inc42.com/learnx-shutdown',
  content: 'LearnX, which raised ₹120 Cr, has shut down due to poor unit economics.',
  publishedAt: new Date(),
}

function mockAnthropicResponse(text: string) {
  mockCreate.mockResolvedValue({
    content: [{ type: 'text', text }],
  })
}

describe('extractShutdown', () => {
  it('returns structured data for a shutdown article', async () => {
    mockAnthropicResponse(JSON.stringify({
      is_shutdown: true,
      name: 'LearnX',
      sector: 'Edtech',
      funding_inr: 12000,
      founded_year: 2019,
      shutdown_date: '2024-03-01',
      reason: 'Shut down due to poor unit economics after raising ₹120 Cr.',
      failure_tag: 'Overfunded',
    }))

    const result = await extractShutdown(article)
    expect(result).not.toBeNull()
    expect(result!.name).toBe('LearnX')
    expect(result!.sector).toBe('Edtech')
    expect(result!.funding_inr).toBe(12000)
    expect(result!.failure_tag).toBe('Overfunded')
    expect(result!.source_url).toBe('https://inc42.com/learnx-shutdown')
    expect(result!.source_name).toBe('inc42')
  })

  it('returns null for a non-shutdown article', async () => {
    mockAnthropicResponse(JSON.stringify({ is_shutdown: false }))
    const result = await extractShutdown(article)
    expect(result).toBeNull()
  })

  it('returns null if Claude returns malformed JSON', async () => {
    mockAnthropicResponse('not valid json at all')
    const result = await extractShutdown(article)
    expect(result).toBeNull()
  })
})
