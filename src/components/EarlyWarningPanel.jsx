import { formatRel } from '../lib/api'

const STATE_META = {
  stable:    { color: '#4ade80', label: '🟢 stable',   bg: 'rgba(74, 222, 128, 0.12)' },
  build_up:  { color: '#fbbf24', label: '🟡 build-up', bg: 'rgba(251, 191, 36, 0.12)' },
  stress:    { color: '#f87171', label: '🔴 stress',   bg: 'rgba(248, 113, 113, 0.12)' },
}

const QUALITY_META = {
  good:       { color: '#4ade80', label: 'good' },
  weak:       { color: '#fbbf24', label: 'weak' },
  degenerate: { color: '#9ca3af', label: 'degenerate' },
  unknown:    { color: '#9ca3af', label: 'unknown' },
}

function formatRefitAge(hours) {
  if (hours == null) return '—'
  if (hours < 1) return `${Math.round(hours * 60)}m ago`
  if (hours < 24) return `${hours.toFixed(1)}h ago`
  return `${(hours / 24).toFixed(1)}d ago`
}

export default function EarlyWarningPanel({ earlyWarning }) {
  if (!earlyWarning?.assets) return null
  const assetMap = earlyWarning.assets

  // Detect if any asset has degenerate quality → show caveat banner
  const anyDegenerate = Object.values(assetMap).some(
    (a) => a?.quality === 'degenerate'
  )

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <div className="text-sm text-muted">EARLY-WARNING</div>
          <div className="font-semibold">3-state HMM regime</div>
        </div>
        <div className="text-[11px] text-muted">stable · build-up · stress</div>
      </div>

      <div className="text-[11px] text-muted mb-4">
        Hiremath et al. 2604.20949 · latent microstructure regime detector
      </div>

      {anyDegenerate && (
        <div
          className="mb-3 p-2 rounded text-[11px] border"
          style={{
            borderColor: 'rgba(156, 163, 175, 0.4)',
            background: 'rgba(156, 163, 175, 0.06)',
            color: '#cbd5e1',
          }}
        >
          ⚠ <span className="text-muted">EXPERIMENTAL.</span>
          {' '}One or more assets flagged{' '}
          <span style={{ color: '#9ca3af' }}>degenerate</span>{' '}
          — cluster separation too weak to label reliably. Alerts auto-suppress
          on degenerate assets until weights stabilize (~7 days history).
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(assetMap).map(([asset, data]) => {
          if (!data || data.error) {
            return (
              <div key={asset} className="panel-2 p-3 text-xs text-muted">
                {asset}: {data?.error || 'no data'}
              </div>
            )
          }
          const meta = STATE_META[data.state] || STATE_META.stable
          const qmeta = QUALITY_META[data.quality] || QUALITY_META.unknown
          const post = data.posterior || {}
          const fm = data.feature_means || {}

          return (
            <div
              key={asset}
              className="panel-2 p-3"
              style={{ background: meta.bg }}
            >
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-3">
                  <div className="font-mono text-base font-semibold">{asset}</div>
                  <div className="text-[10px] text-muted">
                    n={data.n_samples} · refit {formatRefitAge(data.refit_age_hours)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="pill"
                    style={{
                      borderColor: `${qmeta.color}80`,
                      color: qmeta.color,
                    }}
                  >
                    q: {qmeta.label}
                  </span>
                  <span
                    className="pill"
                    style={{
                      borderColor: `${meta.color}80`,
                      color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                </div>
              </div>

              <PosteriorBar posterior={post} />

              <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-muted">
                <FeatureCell label="stable"   means={fm.stable}   color={STATE_META.stable.color} />
                <FeatureCell label="build-up" means={fm.build_up} color={STATE_META.build_up.color} />
                <FeatureCell label="stress"   means={fm.stress}   color={STATE_META.stress.color} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-[11px] text-muted">
        Updated {formatRel(earlyWarning.fetched_at)}
        {' · '}
        <span title="Re-fits weekly; decode-only between refits to lock state labels.">
          locked weights
        </span>
      </div>
    </div>
  )
}

function PosteriorBar({ posterior }) {
  const stable = posterior.stable ?? 0
  const buildup = posterior.build_up ?? 0
  const stress = posterior.stress ?? 0
  return (
    <div>
      <div className="flex h-3 rounded overflow-hidden border border-border">
        {stable > 0 && (
          <div
            className="transition-all"
            style={{ width: `${stable * 100}%`, background: STATE_META.stable.color, opacity: 0.85 }}
            title={`stable ${(stable * 100).toFixed(1)}%`}
          />
        )}
        {buildup > 0 && (
          <div
            className="transition-all"
            style={{ width: `${buildup * 100}%`, background: STATE_META.build_up.color, opacity: 0.85 }}
            title={`build-up ${(buildup * 100).toFixed(1)}%`}
          />
        )}
        {stress > 0 && (
          <div
            className="transition-all"
            style={{ width: `${stress * 100}%`, background: STATE_META.stress.color, opacity: 0.85 }}
            title={`stress ${(stress * 100).toFixed(1)}%`}
          />
        )}
      </div>
      <div className="flex justify-between mt-1 text-[10px] num">
        <span style={{ color: STATE_META.stable.color }}>
          {(stable * 100).toFixed(0)}%
        </span>
        <span style={{ color: STATE_META.build_up.color }}>
          {(buildup * 100).toFixed(0)}%
        </span>
        <span style={{ color: STATE_META.stress.color }}>
          {(stress * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}

function FeatureCell({ label, means, color }) {
  if (!means) return <div />
  // rv shown in bps for readability (×10000)
  const rvBps = (means.rv_5m ?? 0) * 10000
  return (
    <div
      className="rounded p-1.5 border"
      style={{ borderColor: `${color}40` }}
    >
      <div className="text-[9px] uppercase tracking-wide" style={{ color }}>
        {label}
      </div>
      <div className="num text-[10px] mt-0.5">
        rv {rvBps.toFixed(2)}bps
      </div>
      <div className="num text-[10px]">
        spr {means.spread_bps?.toFixed(2)}bps
      </div>
      <div className="num text-[10px]">
        |imb| {means.abs_imb_5?.toFixed(2)}
      </div>
    </div>
  )
}
