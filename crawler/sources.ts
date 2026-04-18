import Parser from 'rss-parser'

const parser = new Parser()

export interface Article {
  title: string
  url: string
  content: string
  publishedAt: Date
}

const RSS_FEEDS = [
  'https://inc42.com/feed/',
  'https://entrackr.com/feed/',
  'https://economictimes.indiatimes.com/tech/startups/rssfeeds/78570550.cms',
  'https://yourstory.com/feed',
  'https://news.google.com/rss/search?q=indian+startup+shuts+down+OR+winds+up+OR+shutdown&hl=en-IN&gl=IN&ceid=IN:en',
]

const MAX_AGE_MS = 48 * 60 * 60 * 1000

export async function fetchRecentArticles(): Promise<Article[]> {
  const cutoff = new Date(Date.now() - MAX_AGE_MS)
  const articles: Article[] = []

  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl)
      for (const item of feed.items) {
        if (!item.link || !item.title) continue
        const pubDate = item.pubDate ? new Date(item.pubDate) : null
        if (pubDate && pubDate < cutoff) continue
        articles.push({
          title: item.title,
          url: item.link,
          content: item.contentSnippet ?? item.content ?? '',
          publishedAt: pubDate ?? new Date(),
        })
      }
    } catch (err) {
      console.error(`Failed to fetch feed ${feedUrl}:`, err)
    }
  }

  return articles
}
