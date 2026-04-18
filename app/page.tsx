import { createServerClient } from '../lib/supabase'
import HomepageClient from '../components/HomepageClient'
import type { StartupParticle, StartupStats } from '../lib/types'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = createServerClient()

  const [particlesResult, statsResult] = await Promise.all([
    supabase
      .from('startups')
      .select('id, name, sector, founded_year, shutdown_date, failure_tag')
      .limit(1000)
      .order('created_at', { ascending: false }),
    supabase.from('startup_stats').select('*').single(),
  ])

  const startups: StartupParticle[] = particlesResult.data ?? []
  const stats: StartupStats = statsResult.data ?? { total_dead: 0, total_burned_crore: 0 }

  return <HomepageClient startups={startups} stats={stats} />
}
