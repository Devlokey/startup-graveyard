import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockParseURL } = vi.hoisted(() => ({
  mockParseURL: vi.fn(),
}))

vi.mock('rss-parser', () => ({
  default: class MockParser {
    parseURL = mockParseURL
  },
}))

import { fetchRecentArticles } from '../../crawler/sources'

describe('fetchRecentArticles', () => {
  beforeEach(() => {
    mockParseURL.mockReset()
  })

  it('returns articles from the last 48 hours', async () => {
    const recentDate = new Date(Date.now() - 12 * 60 * 60 * 1000).toUTCString()
    mockParseURL.mockResolvedValue({
      items: [
        { title: 'Startup X shuts down', link: 'https://inc42.com/1', pubDate: recentDate, contentSnippet: 'Details here' },
      ],
    })

    const articles = await fetchRecentArticles()
    expect(articles.length).toBeGreaterThan(0)
    expect(articles[0].title).toBe('Startup X shuts down')
  })

  it('filters out articles older than 48 hours', async () => {
    const oldDate = new Date(Date.now() - 72 * 60 * 60 * 1000).toUTCString()
    mockParseURL.mockResolvedValue({
      items: [
        { title: 'Old news', link: 'https://inc42.com/2', pubDate: oldDate, contentSnippet: 'Old' },
      ],
    })

    const articles = await fetchRecentArticles()
    expect(articles).toHaveLength(0)
  })

  it('skips items without a link', async () => {
    const recentDate = new Date().toUTCString()
    mockParseURL.mockResolvedValue({
      items: [{ title: 'No link article', pubDate: recentDate }],
    })

    const articles = await fetchRecentArticles()
    expect(articles).toHaveLength(0)
  })

  it('continues if one feed throws', async () => {
    mockParseURL
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue({ items: [] })

    await expect(fetchRecentArticles()).resolves.not.toThrow()
  })
})
