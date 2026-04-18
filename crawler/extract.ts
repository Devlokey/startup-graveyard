import Anthropic from '@anthropic-ai/sdk'
import type { Article } from './sources'
import type { FailureTag } from '../lib/types'

const anthropic = new Anthropic()

export interface ExtractedStartup {
  name: string
  sector: string | null
  funding_inr: number | null
  founded_year: number | null
  shutdown_date: string | null
  reason: string
  failure_tag: FailureTag | null
  source_url: string
  source_name: string
}

export async function extractShutdown(article: Article): Promise<ExtractedStartup | null> {
  const prompt = `You are extracting structured data from a news article about Indian startups.

Article title: ${article.title}
Article content: ${article.content}
Article URL: ${article.url}

Determine if this article reports an Indian startup shutting down, closing, or winding up operations.

If YES, respond with valid JSON only (no markdown, no explanation):
{
  "is_shutdown": true,
  "name": "startup name",
  "sector": "one of: Edtech, Fintech, D2C, SaaS, Healthtech, Agritech, Logistics, Social, Gaming, Other",
  "funding_inr": <total funding raised in lakhs as integer, or null if unknown>,
  "founded_year": <4-digit year as integer, or null if unknown>,
  "shutdown_date": "YYYY-MM-DD or null",
  "reason": "1-2 sentence summary of why they shut down",
  "failure_tag": "one of: Overfunded, Too Early, Bad Product, Market Shift, or null"
}

If NO, respond with: {"is_shutdown": false}`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  try {
    const parsed = JSON.parse(text)
    if (!parsed.is_shutdown) return null

    const hostname = new URL(article.url).hostname.replace('www.', '')
    const sourceName = hostname.split('.')[0]

    return {
      name: parsed.name ?? 'Unknown',
      sector: parsed.sector ?? null,
      funding_inr: typeof parsed.funding_inr === 'number' ? parsed.funding_inr : null,
      founded_year: typeof parsed.founded_year === 'number' ? parsed.founded_year : null,
      shutdown_date: parsed.shutdown_date ?? null,
      reason: parsed.reason ?? '',
      failure_tag: parsed.failure_tag ?? null,
      source_url: article.url,
      source_name: sourceName,
    }
  } catch {
    return null
  }
}
