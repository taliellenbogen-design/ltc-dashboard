'use client'
import type { Contract } from '@/lib/types'

export default function DonutChart({ contracts }: { contracts: Contract[] }) {
  const total  = contracts.length
  const active = contracts.filter(c => c.hasLTC).length
  const none   = total - active
  const pct    = total === 0 ? 0 : Math.round((active / total) * 100)

  const R = 70, cx = 100, cy = 100, strokeW = 22
  const circ = 2 * Math.PI * R
  const activeDash = total === 0 ? 0 : (active / total) * circ
  const noneDash   = circ - activeDash

  return (
    <div className="card h-full" style={{ borderTop: '2px solid var(--green)' }}>
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-700 text-ink">Commitment Coverage</h2>
      </div>
      <div className="flex flex-col items-center py-6 gap-6">
        <svg viewBox="0 0 200 200" width={180} height={180} role="img" aria-label={`${pct}% of customers have an active commitment`}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border)" strokeWidth={strokeW} />
          {total > 0 && (
            <>
              <circle
                cx={cx} cy={cy} r={R} fill="none"
                stroke="var(--gray-chip)" strokeWidth={strokeW}
                strokeDasharray={`${noneDash} ${circ}`}
                strokeDashoffset={0}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
              <circle
                cx={cx} cy={cy} r={R} fill="none"
                stroke="var(--green)" strokeWidth={strokeW}
                strokeDasharray={`${activeDash} ${circ}`}
                strokeDashoffset={0}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </>
          )}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize={28} fontWeight={800} fontFamily="Rubik" fill="var(--ink)">{pct}%</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fontFamily="Rubik" fill="var(--ink-soft)">with LTC</text>
        </svg>
        <div className="flex flex-col gap-2 w-full px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'var(--green)' }} />
              <span className="text-sm text-ink">Has commitment</span>
            </div>
            <span className="text-sm font-700 text-ink">{active}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full inline-block" style={{ background: 'var(--gray-chip)' }} />
              <span className="text-sm text-ink">No commitment</span>
            </div>
            <span className="text-sm font-700 text-ink">{none}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
