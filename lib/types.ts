export type FailureTag = 'Overfunded' | 'Too Early' | 'Bad Product' | 'Market Shift'

/** Full startup record — used in graveyard card grid */
export interface Startup {
  id: string
  name: string
  sector: string | null
  funding_inr: number | null   // in lakhs (₹1L = 100,000)
  founded_year: number | null
  shutdown_date: string | null // YYYY-MM-DD
  reason: string | null
  failure_tag: FailureTag | null
  source_url: string | null
  source_name: string | null
  created_at: string
}

/** Lightweight record — used for canvas particle field (keeps payload small) */
export interface StartupParticle {
  id: string
  name: string
  sector: string | null
  founded_year: number | null
  shutdown_date: string | null
  failure_tag: FailureTag | null
}

/** Aggregate stats for homepage counters */
export interface StartupStats {
  total_dead: number
  total_burned_crore: number
}
