import type { Startup } from '../lib/types'

interface StartupCardProps {
  startup: Startup
}

function formatFunding(lakhs: number | null): string {
  if (!lakhs) return 'Undisclosed'
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(0)} Cr`
  return `₹${lakhs}L`
}

function formatYear(dateStr: string | null): string {
  if (!dateStr) return '?'
  return dateStr.slice(0, 4)
}

export default function StartupCard({ startup }: StartupCardProps) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:border-purple-500/50 hover:bg-purple-950/20 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white text-base leading-tight">{startup.name}</h3>
        {startup.failure_tag && (
          <span className="tag-pill shrink-0">{startup.failure_tag}</span>
        )}
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        {startup.sector && (
          <span className="text-purple-300">{startup.sector}</span>
        )}
        <span>{formatFunding(startup.funding_inr)}</span>
        <span>
          {startup.founded_year ?? '?'} → {formatYear(startup.shutdown_date)}
        </span>
      </div>

      {startup.reason && (
        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{startup.reason}</p>
      )}

      {startup.source_url && (
        <a
          href={startup.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-600 hover:text-purple-400 transition-colors mt-auto"
        >
          via {startup.source_name ?? 'source'} ↗
        </a>
      )}
    </div>
  )
}
