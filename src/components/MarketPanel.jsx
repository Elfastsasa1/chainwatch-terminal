import { formatNum, formatPct, formatRel } from '../lib/api'

export default function MarketPanel({ market }) {
  if (!market) return null
  const fg = market.fear_greed || {}
  const fgVal = fg.value ?? null
  const fgColor = fgVal == null ? '#6b7280'
    : fgVal < 25 ? '#f87171'
    : fgVal < 45 ? '#fbbf24'
    : fgVal < 55 ? '#9ca3af'
    : fgVal < 75 ? '#4ade80'
    : '#c4b5fd'

  return (
    <div className="panel p-5 h-full flex flex-col">
      <div className="text-sm text-muted">MARKET</div>
      <div className="font-semibold mb-4">Global snapshot</div>

      <div className="space-y-3 flex-1">
        <Row
          label="Total cap"
          value={`$${formatNum(market.market_cap_usd)}`}
          delta={market.market_cap_change_24h_pct}
        />
        <Row
          label="DeFi TVL"
          value={`$${formatNum(market.defi_tvl_usd)}`}
        />
        <Row label="BTC dominance" value={`${market.btc_dominance_pct?.toFixed(1)}%`} />
        <Row label="ETH dominance" value={`${market.eth_dominance_pct?.toFixed(1)}%`} />
      </div>

      <div className="mt-5 panel-2 p-3">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-xs text-muted">Fear & Greed</div>
          <div className="text-[10px] text-muted">{fg.classification ?? '—'}</div>
        </div>
        <div className="flex items-end gap-3">
          <div
            className="text-3xl font-mono font-bold tabular-nums"
            style={{ color: fgColor }}
          >
            {fgVal ?? '—'}
          </div>
          <div className="flex-1 h-1.5 rounded bg-border overflow-hidden">
            <div
              className="h-full transition-all"
              style={{
                width: `${fgVal ?? 0}%`,
                background: fgColor,
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-muted">
        Updated {formatRel(market.fetched_at)}
      </div>
    </div>
  )
}

function Row({ label, value, delta }) {
  return (
    <div className="flex items-baseline justify-between">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-right">
        <span className="num font-medium">{value}</span>
        {delta != null && (
          <span className={`ml-2 text-xs num ${delta >= 0 ? 'text-green' : 'text-red'}`}>
            {formatPct(delta)}
          </span>
        )}
      </div>
    </div>
  )
}
