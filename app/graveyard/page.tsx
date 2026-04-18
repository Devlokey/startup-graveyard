import { createServerClient } from '../../lib/supabase'
import GraveyardGrid from '../../components/GraveyardGrid'
import type { Startup } from '../../lib/types'

export const revalidate = 3600

export default async function GraveyardPage() {
  const supabase = createServerClient()

  const { data } = await supabase
    .from('startups')
    .select('*')
    .order('shutdown_date', { ascending: false, nullsFirst: false })

  const startups: Startup[] = data ?? []

  const sectors = Array.from(
    new Set(startups.map((s) => s.sector).filter(Boolean) as string[])
  ).sort()
  const years = Array.from(
    new Set(
      startups
        .map((s) => s.shutdown_date?.slice(0, 4))
        .filter((y): y is string => Boolean(y))
        .map(Number)
    )
  ).sort((a, b) => b - a)

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold neon-text mb-2">The Graveyard</h1>
        <p className="text-gray-500 text-sm">Every Indian startup that didn't make it. Sorted by shutdown date.</p>
      </div>
      <GraveyardGrid startups={startups} sectors={sectors} years={years} />
    </div>
  )
}
