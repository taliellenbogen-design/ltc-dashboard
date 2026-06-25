'use client'
import type { Contract } from '@/lib/types'
import { useRef, useEffect, useState } from 'react'

function pad2(n: number) { return String(n).padStart(2, '0') }
function fmtDate(d: Date) { return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}` }
function fmtTcv(n: number, unit: 'm' | 'k') { return `$${n}${unit}` }

function urgencyColor(endDate: string): string {
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(endDate); d.setHours(0,0,0,0)
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
  if (diff <= 30) return 'var(--red)'
  if (diff <= 90) return '#F5A623'
  return 'var(--green)'
}

const CHART_HEIGHT = 380
const MARGIN = { top: 50, bottom: 90, left: 24, right: 40 }
const MIN_STEM = 60
const MAX_STEM = 230

export default function TimelineChart({ contracts, unit }: { contracts: Contract[]; unit: 'm' | 'k' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)

  useEffect(() => {
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const active = contracts.filter(c => c.hasLTC && c.endDate)
  if (active.length === 0) {
    return (
      <div className="card" style={{ borderTop: '2px solid var(--teal)', minHeight: CHART_HEIGHT }}>
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-700 text-ink">Contract Timeline</h2>
        </div>
        <div className="flex items-center justify-center" style={{ height: CHART_HEIGHT - 60 }}>
          <p className="text-[var(--ink-soft)] text-sm">No active contracts with end dates yet. Add one above to see the timeline.</p>
        </div>
      </div>
    )
  }

  const dates     = active.map(c => new Date(c.endDate).getTime())
  const minTime   = Math.min(...dates)
  const maxTime   = Math.max(...dates)
  const padding   = (maxTime - minTime) * 0.12 || 30 * 86400000
  const rangeStart = new Date(minTime - padding)
  const rangeEnd   = new Date(maxTime + padding)
  const totalMs    = rangeEnd.getTime() - rangeStart.getTime()

  const drawW = width - MARGIN.left - MARGIN.right
  const axisY = CHART_HEIGHT - MARGIN.bottom

  function xOf(d: Date) {
    return MARGIN.left + ((d.getTime() - rangeStart.getTime()) / totalMs) * drawW
  }

  // Monthly ticks
  const ticks: Date[] = []
  const cursor = new Date(rangeStart)
  cursor.setDate(1)
  while (cursor <= rangeEnd) {
    if (cursor >= rangeStart) ticks.push(new Date(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  // Today
  const today = new Date(); today.setHours(0,0,0,0)
  const showToday = today >= rangeStart && today <= rangeEnd

  // TCV scale
  const tcvValues = active.map(c => Number(c.tcv) || 0)
  const maxTcv = Math.max(...tcvValues, 1)
  function stemOf(tcv: number) {
    return MIN_STEM + ((Number(tcv) || 0) / maxTcv) * (MAX_STEM - MIN_STEM)
  }

  // Compute label positions with nudging to avoid overlap
  type Point = { x: number; stem: number; c: Contract }
  const points: Point[] = active.map(c => ({
    x: xOf(new Date(c.endDate)),
    stem: stemOf(Number(c.tcv) || 0),
    c,
  }))

  // Sort points left to right for layout
  const sorted = [...points].sort((a, b) => a.x - b.x)

  return (
    <div className="card" style={{ borderTop: '2px solid var(--teal)' }}>
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-700 text-ink">Contract Timeline</h2>
      </div>
      <div ref={containerRef} style={{ width: '100%' }}>
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          style={{ display: 'block', overflow: 'visible' }}
          role="img"
          aria-label="Timeline of commitment end dates"
        >
          {/* Axis line */}
          <line
            x1={MARGIN.left} y1={axisY}
            x2={width - MARGIN.right - 8} y2={axisY}
            stroke="var(--ink)" strokeWidth={1.5}
          />
          {/* Arrowhead */}
          <polygon
            points={`${width - MARGIN.right},${axisY} ${width - MARGIN.right - 10},${axisY - 5} ${width - MARGIN.right - 10},${axisY + 5}`}
            fill="var(--ink)"
          />

          {/* Month ticks */}
          {ticks.map((t, i) => {
            const tx = xOf(t)
            return (
              <g key={i}>
                <line x1={tx} y1={axisY} x2={tx} y2={axisY + 6} stroke="var(--ink-soft)" strokeWidth={1} />
                <text
                  x={tx} y={axisY + 14}
                  fontSize={11}
                  fontFamily="Rubik"
                  fill="var(--ink-soft)"
                  textAnchor="start"
                  transform={`rotate(35, ${tx}, ${axisY + 14})`}
                >{fmtDate(t)}</text>
              </g>
            )
          })}

          {/* Today marker */}
          {showToday && (
            <g>
              <line
                x1={xOf(today)} y1={axisY - MAX_STEM - 20}
                x2={xOf(today)} y2={axisY}
                stroke="var(--ink)" strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.5}
              />
              <text
                x={xOf(today)} y={axisY - MAX_STEM - 26}
                fontSize={11} fontFamily="Rubik" fill="var(--ink)" textAnchor="middle" fontWeight={600}
              >Today</text>
            </g>
          )}

          {/* Deal stems + dots + labels */}
          {sorted.map(({ x, stem, c }) => {
            const dotY = axisY - stem
            const color = urgencyColor(c.endDate)
            return (
              <g key={c.id}>
                {/* Stem */}
                <line x1={x} y1={axisY} x2={x} y2={dotY} stroke="var(--border)" strokeWidth={1.5} />
                {/* Dot */}
                <circle cx={x} cy={dotY} r={7} fill={color} />
                {/* TCV label (bold, above dot) */}
                <text
                  x={x} y={dotY - 18}
                  fontSize={16} fontWeight={800} fontFamily="Rubik"
                  fill="var(--ink)" textAnchor="middle"
                >{fmtTcv(Number(c.tcv) || 0, unit)}</text>
                {/* Customer name */}
                <text
                  x={x} y={dotY - 36}
                  fontSize={13} fontWeight={700} fontFamily="Rubik"
                  fill={color} textAnchor="middle"
                >{c.customer}</text>
                {/* End date below axis dot */}
                <text
                  x={x} y={axisY - stem + 20}
                  fontSize={11} fontFamily="Rubik"
                  fill="var(--ink-soft)" textAnchor="middle"
                >{fmtDate(new Date(c.endDate))}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-5 px-6 pb-5 flex-wrap">
        {[
          { color: 'var(--red)',  label: '≤ 30 days' },
          { color: '#F5A623',    label: '31–90 days' },
          { color: 'var(--green)',label: '> 90 days' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: l.color }} />
            <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
