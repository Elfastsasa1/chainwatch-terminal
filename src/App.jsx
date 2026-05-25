import { useEffect, useState, useCallback } from 'react'
import { fetchSnapshot, formatRel } from './lib/api'
import RegimePanel from './components/RegimePanel'
import EarlyWarningPanel from './components/EarlyWarningPanel'
import MicrostructurePanel from './components/MicrostructurePanel'
import MarketPanel from './components/MarketPanel'
import StablesPanel from './components/StablesPanel'
import DexPanel from './components/DexPanel'
import NewsPanel from './components/NewsPanel'

const REFRESH_MS = 60_000

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  const load = useCallback(async () => {
    try {
      const d = await fetchSnapshot()
      setData(d)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const i = setInterval(load, REFRESH_MS)
    const t = setInterval(() => setTick((x) => x + 1), 5000)
    return () => { clearInterval(i); clearInterval(t) }
  }, [load])

  return (
    <div className="min-h-full">
      <header className="border-b border-border bg-panel/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="font-semibold tracking-tight">ChainWatch Terminal</div>
              <div className="text-xs text-muted">
                fractal regime · microstructure · intel
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="pill">
              <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${error ? 'bg-red' : 'bg-green animate-pulse'}`} />
              {error ? 'OFFLINE' : 'LIVE'}
            </span>
            {data && (
              <span className="text-muted num">
                updated {formatRel(data.generated_at)} <span className="opacity-50">· {tick}</span>
              </span>
            )}
            <button
              onClick={load}
              className="pill hover:bg-border transition-colors"
            >
              ↻ refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="panel p-4 border-red/40 bg-red/5">
            <div className="text-red font-medium mb-1">Data fetch failed</div>
            <div className="text-sm text-muted">{error}</div>
            <div className="text-xs text-muted mt-2">
              Backend exporter pushes every 5 min. If this persists, the VPS cron may be down.
            </div>
          </div>
        )}

        {loading && !data && <Skeleton />}

        {data && (
          <>
            {/* Hero row: regime + market */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <RegimePanel regime={data.regime} />
              </div>
              <MarketPanel market={data.market} />
            </div>

            {/* Mid row: early-warning + microstructure */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <EarlyWarningPanel earlyWarning={data.early_warning} />
              <MicrostructurePanel microstructure={data.microstructure} />
            </div>

            {/* Stables row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StablesPanel stables={data.stables} />
              <DexPanel dex={data.dex} />
            </div>

            {/* Bottom row: news full-width */}
            <div className="grid grid-cols-1 gap-4">
              <NewsPanel news={data.news} />
            </div>
          </>
        )}

        <footer className="pt-6 pb-12 text-xs text-muted text-center">
          <div>
            Data via{' '}
            <a className="text-accent hover:underline"
               href="https://github.com/Elfastsasa1/chainwatch-data"
               target="_blank" rel="noreferrer">
              chainwatch-data
            </a>
            {' '} · Engine in private VPS · Refresh every 60s
          </div>
          <div className="mt-1 opacity-60">
            built by Elfast · powered by Hermes
          </div>
        </footer>
      </main>
    </div>
  )
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
      <rect width="32" height="32" rx="6" fill="#10131a" />
      <path d="M5 22 L11 14 L15 18 L21 9 L27 22"
            stroke="#7dd3fc" strokeWidth="2.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="11" cy="14" r="1.5" fill="#7dd3fc" />
      <circle cx="21" cy="9" r="1.5" fill="#4ade80" />
    </svg>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="panel h-64 lg:col-span-2" />
        <div className="panel h-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel h-56" />
        <div className="panel h-56" />
      </div>
    </div>
  )
}
