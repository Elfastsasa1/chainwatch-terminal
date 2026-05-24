import { formatRel } from '../lib/api'

const BIAS = {
  bid_strong: { color: '#4ade80', label: '🟢 strong bid' },
  bid_lean: { color: '#86efac', label: '🟢 mild bid' },
  balanced: { color: '#9ca3af', label: '⚪ balanced' },
  ask_lean: { color: '#fca5a5', label: '🔴 mild ask' },
  ask_strong: { color: '#f87171', label: '🔴 strong ask' },
}

function classify(imb) {
  if (imb > 0.20) return 'bid_strong'
  if (imb > 0.05) return 'bid_lean'
  if (imb < -0.20) return 'ask_strong'
  if (imb < -0.05) return 'ask_lean'
  return 'balanced'
}

export default function MicrostructurePanel({ microstructure }) {
  if (!microstructure?.assets) return null
  const assetMap = microstructure.assets

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-sm text-muted">MICROSTRUCTURE</div>
          <div className="font-semibold">Order book imbalance</div>
        </div>
        <div className="text-[11px] text-muted">top-5 / 10 / 20 levels</div>
      </div>

      <div className="space-y-3">
        {Object.entries(assetMap).map(([asset, data]) => {
          if (!data?.latest) {
            return (
              <div key={asset} className="panel-2 p-3 text-xs text-muted">
                {asset}: no data
              </div>
            )
          }
          const l = data.latest
          const w = data['window_60m'] || {}
          const bias = classify(l.imb_5)
          const meta = BIAS[bias]
          return (
            <div key={asset} className="panel-2 p-3">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <div className="font-mono text-base font-semibold">{asset}</div>
                  <div className="num text-xs text-muted">
                    ${l.mid_price?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted">
                    spread {l.spread_bps?.toFixed(1)}bps
                  </div>
                </div>
                <div className="pill" style={{ borderColor: `${meta.color}80`, color: meta.color }}>
                  {meta.label}
                </div>
              </div>

              <ImbBar label="top 5" value={l.imb_5} mean={w.imb_5_mean} />
              <ImbBar label="top 10" value={l.imb_10} mean={w.imb_10_mean} />
              <ImbBar label="top 20" value={l.imb_20} mean={w.imb_20_mean} />

              <div className="text-[10px] text-muted mt-1.5">
                60m: imb5 mean {w.imb_5_mean?.toFixed(3) ?? '—'} ·
                min {w.imb_5_min?.toFixed(3) ?? '—'} / max {w.imb_5_max?.toFixed(3) ?? '—'} ·
                n={w.samples ?? '—'}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted">
        Updated {formatRel(microstructure.fetched_at)}
      </div>
    </div>
  )
}

function ImbBar({ label, value, mean }) {
  if (value == null) return null
  // map [-1, 1] to [0, 100]
  const pct = ((value + 1) / 2) * 100
  const isPos = value >= 0
  return (
    <div className="flex items-center gap-2 my-1">
      <div className="text-[10px] text-muted w-12 num">{label}</div>
      <div className="flex-1 relative h-2.5 bg-border rounded overflow-hidden">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-bg/60" />
        <div
          className="absolute top-0 bottom-0 transition-all"
          style={{
            left: isPos ? '50%' : `${pct}%`,
            width: `${Math.abs(pct - 50)}%`,
            background: isPos ? '#4ade80' : '#f87171',
            opacity: 0.85,
          }}
        />
      </div>
      <div className="num text-xs w-14 text-right">
        {value > 0 ? '+' : ''}{value.toFixed(3)}
      </div>
    </div>
  )
}
