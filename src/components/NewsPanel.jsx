import { formatRel } from '../lib/api'

const SOURCE_COLORS = {
  coindesk: '#fbbf24',
  cointelegraph: '#7dd3fc',
  decrypt: '#c4b5fd',
}

export default function NewsPanel({ news }) {
  if (!news?.items) return null
  const items = news.items.slice(0, 12)

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-sm text-muted">HEADLINES</div>
          <div className="font-semibold">Aggregated news feed</div>
        </div>
        <div className="text-[11px] text-muted">
          {news.sources_used?.join(' · ') ?? '—'}
        </div>
      </div>

      <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
        {items.map((it, i) => {
          const color = SOURCE_COLORS[it.source] || '#9ca3af'
          return (
            <a
              key={i}
              href={it.link}
              target="_blank"
              rel="noreferrer"
              className="block panel-2 p-2.5 hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className="pill text-[10px] shrink-0"
                  style={{ borderColor: `${color}80`, color }}
                >
                  {it.source}
                </span>
                <div className="text-[10px] text-muted shrink-0">
                  {formatRel(it.published_iso || (it.published_ts && new Date(it.published_ts * 1000).toISOString()))}
                </div>
              </div>
              <div className="text-sm leading-snug font-medium">
                {it.title}
              </div>
              {it.summary && (
                <div className="text-[11px] text-muted mt-1 line-clamp-2">
                  {it.summary}
                </div>
              )}
            </a>
          )
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted">
        Updated {formatRel(news.fetched_at)}
      </div>
    </div>
  )
}
