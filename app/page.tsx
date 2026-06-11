import { createServerClient } from '../lib/supabase'
import HomepageClient from '../components/HomepageClient'
import type { StartupParticle, StartupStats } from '../lib/types'

export default async function HomePage() {
  const supabase = createServerClient()

  const { data: rows, error } = await supabase
    .from('startups')
    .select('*')
    .order('shutdown_date', { ascending: false, nullsFirst: false })

  if (error) console.error('[homepage] supabase error:', error)

  const startups: StartupParticle[] = (rows ?? []).map(
    ({ id, name, sector, founded_year, shutdown_date, failure_tag }) => ({
      id, name, sector, founded_year, shutdown_date, failure_tag,
    })
  )
  const total_dead = rows?.length ?? 0
  const total_burned_crore =
    (rows?.reduce((sum, s) => sum + ((s.funding_inr as number) ?? 0), 0) ?? 0) / 100
  const stats: StartupStats = { total_dead, total_burned_crore }

  return <HomepageClient startups={startups} stats={stats} />
}
