import { fetchRecentArticles } from './sources'
import { extractShutdown } from './extract'
import { ingestStartup } from './ingest'

export interface CrawlerResult {
  inserted: number
  duplicates: number
  errors: number
  skipped: number
}

export async function runCrawler(): Promise<CrawlerResult> {
  const articles = await fetchRecentArticles()
  console.log(`[crawler] fetched ${articles.length} articles`)

  let inserted = 0
  let duplicates = 0
  let errors = 0
  let skipped = 0

  for (const article of articles) {
    const startup = await extractShutdown(article)
    if (!startup) {
      skipped++
      continue
    }

    const result = await ingestStartup(startup)
    if (result === 'inserted') inserted++
    else if (result === 'duplicate') duplicates++
    else errors++
  }

  console.log(`[crawler] done — inserted: ${inserted}, duplicates: ${duplicates}, errors: ${errors}, skipped: ${skipped}`)
  return { inserted, duplicates, errors, skipped }
}
