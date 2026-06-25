'use client'
import type { Contract } from '@/lib/types'

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}b`
  return `$${n}m`
}

export default function KpiStrip({ contracts }: { contracts: Contract[] }) {
  const total   = contracts.length
  const active  = contracts.filter(c => c.hasLTC).length
  const pct     = total === 0 ? 0 : Math.round((active / total) * 100)
  const tcvSum  = contracts.filter(c => c.hasLTC).reduce((s, c) => s + (Number(c.tcv) || 0), 0)
  const today   = new Date()
  const in60    = new Date(today); in60.setDate(today.getDate() + 60)
  const renewing = contracts.filter(c => {
    if (!c.hasLTC || !c.endDate) return false
    const d = new Date(c.endDate)
    return d >= today && d <= in60
  }).length

  const cards = [
    { label: 'Active Contracts',                value: `${active} / ${total}`, accent: 'var(--green)' },
    { label: '% Active',                        value: `${pct}%`,              accent: 'var(--green)' },
    { label: 'Total Contract Value (Active)',   value: fmt(tcvSum),            accent: 'var(--indigo)' },
    {
      label: 'Renewing in 60 Days',
      value: String(renewing),
      accent: renewing > 0 ? 'var(--red)' : 'var(--ink-soft)',
      valueColor: renewing > 0 ? 'var(--red)' : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(c => (
        <div key={c.label} className="card p-5" style={{ borderTop: `2px solid ${c.accent}` }}>
          <p className="text-sm font-500" style={{ color: 'var(--ink-soft)' }}>{c.label}</p>
          <p className="text-3xl font-800 mt-1" style={{ color: c.valueColor ?? 'var(--ink)' }}>{c.value}</p>
        </div>
      ))}
    </div>
  )
}
