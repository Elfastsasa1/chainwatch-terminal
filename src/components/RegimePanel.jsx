import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, ReferenceLine } from 'recharts'
import { formatRel } from '../lib/api'

const REGIME_META = {
  mono: { color: '#fbbf24', label: 'mono', desc: 'fragile' },
  multi: { color: '#4ade80', label: 'multi', desc: 'healthy' },
  rich_multi: { color: '#c4b5fd', label: 'rich', desc: '🔥 high edge' },
  breaking_down: { color: '#f87171', label: 'break', desc: 'transition' },
}

export default function RegimePanel({ regime }) {
  if (!regime?.intervals) return null
  const intervals = ['1d', '4h']
  const fetched = regime.fetched_at

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="text-sm text-muted">MF-DFA REGIME</div>
          <div className="font-semibold">Fractal regime classification</div>
        </div>
        <div className="text-xs text-muted">
          h(q) decay · backtest +10-12% fwd-20bar on rich
        </div>
      </div>

      <div className="space-y-3">
        {intervals.map((tf) => {
          const block = regime.intervals[tf]
          const assets = block?.assets || []
          return (
            <div key={tf}>
              <div className="text-xs text-muted mb-2 font-mono">{tf.toUpperCase()}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {assets.map((a) => <RegimeCard key={a.symbol} a={a} />)}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted">
        Updated {formatRel(fetched)} · BTC/ETH/SOL · 500-bar window
      </div>
    </div>
  )
}

function RegimeCard({ a }) {
  const meta = REGIME_META[a.classification] || REGIME_META.multi
  const sym = a.symbol.replace('USDT', '')
  const hQ = a.h_q || {}
  const points = Object.entries(hQ)
    .map(([q, h]) => ({ q: Number(q), h }))
    .sort((x, y) => x.q - y.q)

  return (
    <div className="panel-2 p-3 hover:border-accent/40 transition-colors">
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-mono text-base font-semibold">{sym}</div>
        <span
          className="pill"
          style={{ borderColor: `${meta.color}80`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>

      <div className="text-[10px] text-muted mb-2">{meta.desc}</div>

      <div className="grid grid-cols-2 gap-2 text-xs num mb-2">
        <Stat label="h(2)" value={a.h_2_hurst?.toFixed(3) ?? '—'} />
        <Stat label="decay" value={a.decay?.toFixed(3) ?? '—'} highlight={a.classification === 'rich_multi'} />
      </div>

      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points}>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <ReferenceLine y={0.5} stroke="#252a35" strokeDasharray="2 2" />
            <Tooltip content={<HqTooltip />} />
            <Line
              type="monotone"
              dataKey="h"
              stroke={meta.color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between text-[10px] text-muted mt-1 px-1">
        <span>q=-5</span>
        <span>h(q) curve</span>
        <span>q=+5</span>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div>
      <div className="text-[10px] text-muted">{label}</div>
      <div className={highlight ? 'text-purple font-semibold' : ''}>{value}</div>
    </div>
  )
}

function HqTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="panel-2 px-2 py-1 text-[11px] num shadow-lg">
      <div>q = {p.q}</div>
      <div>h = {p.h.toFixed(4)}</div>
    </div>
  )
}
