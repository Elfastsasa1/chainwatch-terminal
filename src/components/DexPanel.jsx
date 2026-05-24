import { formatNum, formatPct, formatRel } from '../lib/api'

export default function DexPanel({ dex }) {
  if (!dex?.aggregate) return null
  const agg = dex.aggregate
  const top = (dex.top || []).slice(0, 8)

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-sm text-muted">DEX FLOW</div>
          <div className="font-semibold">24h volume rotation</div>
        </div>
        <div className="text-right text-xs">
          <div className="num font-semibold">${formatNum(agg.total_volume_24h_usd)}</div>
          <div className={`num ${agg.total_change_1d_pct >= 0 ? 'text-green' : 'text-red'}`}>
            {formatPct(agg.total_change_1d_pct, 1)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {top.map((p) => (
          <div key={p.name} className="flex items-baseline gap-3 text-sm">
            <div className="flex-1 min-w-0">
              <div className="truncate font-medium">{p.name}</div>
              <div className="text-[10px] text-muted">
                {p.chain_count} chain{p.chain_count !== 1 ? 's' : ''}
                {p.category && ` · ${p.category}`}
              </div>
            </div>
            <div className="flex-1 max-w-[140px]">
              <div className="h-1.5 bg-border rounded overflow-hidden">
                <div
                  className="h-full bg-accent/70"
                  style={{ width: `${Math.min(p.share_pct * 4, 100)}%` }}
                />
              </div>
            </div>
            <div className="num text-right w-16">${formatNum(p.volume_24h_usd)}</div>
            <div className={`num text-right w-14 text-xs ${(p.change_1d_pct ?? 0) >= 0 ? 'text-green' : 'text-red'}`}>
              {formatPct(p.change_1d_pct ?? 0, 1)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-muted">
        {agg.protocol_count} protocols tracked · Updated {formatRel(dex.fetched_at)}
      </div>
    </div>
  )
}
