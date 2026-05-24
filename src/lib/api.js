const REPO = 'Elfastsasa1/chainwatch-data'
const BASE = `https://raw.githubusercontent.com/${REPO}/main/public`

// Cache-bust at module load. Each browser session pulls fresh once,
// then GitHub CDN handles staleness (~5min cache header).
const cb = () => `?t=${Math.floor(Date.now() / 30000)}`

export async function fetchSnapshot() {
  const res = await fetch(`${BASE}/snapshot.json${cb()}`)
  if (!res.ok) throw new Error(`snapshot fetch ${res.status}`)
  return res.json()
}

export async function fetchOne(name) {
  const res = await fetch(`${BASE}/${name}.json${cb()}`)
  if (!res.ok) throw new Error(`${name} fetch ${res.status}`)
  return res.json()
}

export const formatNum = (n, opts = {}) => {
  if (n === null || n === undefined) return '—'
  const { digits = 2, suffix = '' } = opts
  const abs = Math.abs(n)
  if (abs >= 1e12) return `${(n / 1e12).toFixed(digits)}T${suffix}`
  if (abs >= 1e9) return `${(n / 1e9).toFixed(digits)}B${suffix}`
  if (abs >= 1e6) return `${(n / 1e6).toFixed(digits)}M${suffix}`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(digits)}K${suffix}`
  return `${n.toFixed(digits)}${suffix}`
}

export const formatPct = (n, digits = 2) => {
  if (n === null || n === undefined) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(digits)}%`
}

export const formatRel = (iso) => {
  if (!iso) return '—'
  const ts = new Date(iso).getTime()
  const diff = (Date.now() - ts) / 1000
  if (diff < 60) return `${Math.floor(diff)}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
