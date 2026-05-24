import { formatNum, formatPct, formatRel } from '../lib/api'

const SIGNAL_META = {
  risk_on_strong: { color: '#4ade80', label: '🟢🟢 strong risk-on', desc: 'capital flooding in' },
  risk_on: { color: '#86efac', label: '🟢 risk-on', desc: 'mint > redeem' },
  neutral: { color: '#9ca3af', label: '⚪ neutral', desc: 'balanced flow' },
  risk_off: { color: '#fca5a5', label: '🔴 risk-off', desc: 'redemptions rising' },
  risk_off_strong: { color: '#f87171', label: '🔴🔴 strong risk-off', desc: 'capital fleeing' },
}

export default function StablesPanel({ stables }) {
  if (!stables?.aggregate) return null
  const agg = stables.aggregate
  const meta = SIGNAL_META[agg.signal] || SIGNAL_META.neutral

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-sm text-muted">STABLECOIN LIQUIDITY</div>
          <div className="font-semibold">Risk on/off via supply delta</div>
        </div>
        <span
          className="pill"
          style={{ borderColor: `${meta.color}80`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>

      <div className="panel-2 p-4 mb-3">
        <div className="flex items-baseline gap-4">
          <div>
            <div className="text-[10px] text-muted">Total supply</div>
            <div className="text-xl num font-semibold">
              ${formatNum(agg.total_supply_usd)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted">24h Δ</div>
            <div className={`text-xl num font-semibold ${agg.total_supply_24h_pct >= 0 ? 'text-green' : 'text-red'}`}>
              {formatPct(agg.total_supply_24h_pct, 3)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-muted">USD Δ</div>
            <div className={`text-xl num font-semibold ${agg.total_delta_24h_usd >= 0 ? 'text-green' : 'text-red'}`}>
              {agg.total_delta_24h_usd >= 0 ? '+' : ''}${formatNum(agg.total_delta_24h_usd)}
            </div>
          </div>
        </div>
        <div className="text-[11px] text-muted mt-2">{meta.desc}</div>
      </div>

      <div className="space-y-1.5">
        {(stables.top || []).slice(0, 6).map((c) => (
          <div key={c.symbol} className="flex items-baseline justify-between text-sm">
            <div className="flex items-baseline gap-2">
              <div className="font-mono w-12">{c.symbol}</div>
              <div className="text-[10px] text-muted">{c.name}</div>
            </div>
            <div className="flex items-baseline gap-3 num">
              <div>${formatNum(c.circulating_usd)}</div>
              <div className={`w-16 text-right ${c.delta_24h_pct >= 0 ? 'text-green' : 'text-red'}`}>
                {formatPct(c.delta_24h_pct, 3)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-[11px] text-muted">
        Updated {formatRel(stables.fetched_at)}
      </div>
    </div>
  )
}
