'use client'

import { useState } from 'react'
import ParticleField from './ParticleField'
import LiveCounter from './LiveCounter'
import type { StartupParticle, StartupStats } from '../lib/types'

const ALL_TAGS = ['Overfunded', 'Too Early', 'Bad Product', 'Market Shift'] as const

interface HomepageClientProps {
  startups: StartupParticle[]
  stats: StartupStats
}

export default function HomepageClient({ startups, stats }: HomepageClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <>
      <ParticleField
        startups={startups}
        searchQuery={searchQuery}
        activeTags={activeTags}
      />

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Mobile hero: big number stacked layout */}
        <div className="md:hidden mb-6 text-center space-y-1">
          <div
            className="text-6xl font-extrabold leading-none tracking-tight"
            data-testid="mobile-dead-count"
          >
            <LiveCounter value={stats.total_dead} className="neon-text" duration={2500} />
          </div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[rgba(200,180,255,0.45)]">
            startups failed &amp; counting
          </p>
          <div
            className="mt-3 text-[26px] font-bold leading-none text-white"
            data-testid="mobile-burned-count"
          >
            <LiveCounter value={stats.total_burned_crore} prefix="₹" suffix=" Cr" duration={2500} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[rgba(200,180,255,0.35)]">
            burned
          </p>
        </div>

        {/* Desktop hero: existing layout — untouched */}
        <div className="hidden md:block mb-8 space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <LiveCounter
              value={stats.total_dead}
              suffix=" startups failed"
              className="neon-text"
              duration={2500}
            />
            <span className="text-gray-500 text-2xl ml-2">… and counting.</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-400">
            <LiveCounter
              value={stats.total_burned_crore}
              prefix="₹"
              suffix=" Cr burned"
              duration={2500}
            />
          </p>
        </div>

        <div className="w-full max-w-md mb-4">
          <input
            type="text"
            placeholder="Search a startup name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl glass-card text-white placeholder-gray-600 outline-none focus:border-purple-500 border border-transparent transition-colors text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`tag-pill cursor-pointer transition-all ${
                activeTags.includes(tag)
                  ? 'bg-purple-600/40 border-purple-400/60 text-white'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <a
          href="/graveyard"
          className="text-sm text-gray-500 hover:text-purple-300 transition-colors underline underline-offset-4"
        >
          Browse all startups →
        </a>
      </div>
    </>
  )
}
