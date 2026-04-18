import { createServerClient } from '../lib/supabase'
import type { ExtractedStartup } from './extract'

export async function ingestStartup(
  startup: ExtractedStartup
): Promise<'inserted' | 'duplicate' | 'error'> {
  const supabase = createServerClient()

  const { data: existing } = await supabase
    .from('startups')
    .select('id')
    .ilike('name', startup.name)
    .maybeSingle()

  if (existing) return 'duplicate'

  const { error } = await supabase.from('startups').insert({
    name: startup.name,
    sector: startup.sector,
    funding_inr: startup.funding_inr,
    founded_year: startup.founded_year,
    shutdown_date: startup.shutdown_date,
    reason: startup.reason,
    failure_tag: startup.failure_tag,
    source_url: startup.source_url,
    source_name: startup.source_name,
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return 'error'
  }

  return 'inserted'
}
