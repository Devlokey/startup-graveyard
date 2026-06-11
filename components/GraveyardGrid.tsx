'use client'

import { useState, useMemo, useEffect } from 'react'
import StartupCard from './StartupCard'
import type { Startup } from '../lib/types'

const PAGE_SIZE = 20
const ALL_TAGS = ['Overfunded', 'Too Early', 'Bad Product', 'Market Shift']

interface GraveyardGridProps {
  startups: Startup[]
  sectors: string[]
  years: number[]
  initialSearch?: string
}

function formatFunding(lakhs: number | null): string {
  if (!lakhs) return 'Undisclosed'
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(0)} Cr`
  return `₹${lakhs}L`
}

export default function GraveyardGrid({ startups, sectors, years, initialSearch = '' }: GraveyardGridProps) {
  const [search, setSearch] = useState(initialSearch)

  // On mount, pick up ?search= from the URL (works for both SSR and static export)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('search')
    if (q) setSearch(q)
  }, [])
  const [sector, setSector] = useState('')
  const [year, setYear] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Startup | null>(null)

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
    setPage(1)
  }

  const filtered = useMemo(() => {
    return startups.filter((s) => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false
      if (sector && s.sector !== sector) return false
      if (year && s.shutdown_date?.slice(0, 4) !== year) return false
      if (tags.length > 0 && (!s.failure_tag || !tags.includes(s.failure_tag))) return false
      return true
    })
  }, [startups, search, sector, year, tags])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <input
          type="text"
          placeholder="Search name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg glass-card text-white text-sm placeholder-gray-600 outline-none border border-transparent focus:border-purple-500 transition-colors w-48"
        />
        <select
          value={sector}
          onChange={(e) => { setSector(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg glass-card text-sm text-gray-300 outline-none border border-transparent focus:border-purple-500 transition-colors bg-transparent"
        >
          <option value="">All sectors</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={year}
          onChange={(e) => { setYear(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg glass-card text-sm text-gray-300 outline-none border border-transparent focus:border-purple-500 transition-colors bg-transparent"
        >
          <option value="">All years</option>
          {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
        </select>
        <div className="flex gap-2 flex-wrap">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`tag-pill cursor-pointer transition-all ${
                tags.includes(tag) ? 'bg-purple-600/40 border-purple-400/60 text-white' : 'opacity-50 hover:opacity-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-4">{filtered.length} startups</p>

      {paginated.length === 0 ? (
        <p className="text-gray-600 text-sm">No startups match these filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((startup) => (
            <button
              key={startup.id}
              onClick={() => setSelected(startup)}
              className="text-left w-full"
            >
              <StartupCard startup={startup} />
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 glass-card text-sm disabled:opacity-30 hover:border-purple-500/50 transition-colors rounded-lg"
          >
            ← Prev
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 glass-card text-sm disabled:opacity-30 hover:border-purple-500/50 transition-colors rounded-lg"
          >
            Next →
          </button>
        </div>
      )}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card max-w-lg w-full p-6 flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">{selected.name}</h2>
                {selected.sector && (
                  <p className="text-purple-300 text-sm mt-0.5">{selected.sector}</p>
                )}
              </div>
              {selected.failure_tag && (
                <span className="tag-pill shrink-0 mt-0.5">{selected.failure_tag}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Founded: <span className="text-gray-300">{selected.founded_year ?? '?'}</span></span>
              <span>Shut down: <span className="text-gray-300">{selected.shutdown_date?.slice(0, 7) ?? '?'}</span></span>
              <span>Funding: <span className="text-gray-300">{formatFunding(selected.funding_inr)}</span></span>
            </div>

            {selected.reason ? (
              <p className="text-gray-300 text-sm leading-relaxed">{selected.reason}</p>
            ) : (
              <p className="text-gray-600 text-sm italic">No summary available.</p>
            )}

            {selected.source_url && (
              <a
                href={selected.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-purple-400 transition-colors mt-auto"
              >
                via {selected.source_name ?? 'source'} ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
