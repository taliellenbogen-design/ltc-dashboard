'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import type { AppData } from '@/lib/types'
import KpiStrip from '@/components/KpiStrip'
import ContractsTable from '@/components/ContractsTable'
import DonutChart from '@/components/DonutChart'
import TimelineChart from '@/components/TimelineChart'
import RemindersCard from '@/components/RemindersCard'
import ActionItemsCard from '@/components/ActionItemsCard'

export default function Page() {
  const [data, setData] = useState<AppData | null>(null)
  const [saving, setSaving] = useState(false)
  const [unit, setUnit] = useState<'m' | 'k'>('m')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirst = useRef(true)

  // Load on mount
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])

  // Debounced save whenever data changes
  const save = useCallback((d: AppData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      })
      setSaving(false)
    }, 600)
  }, [])

  function update(patch: Partial<AppData>) {
    setData(prev => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      if (isFirst.current) { isFirst.current = false; return next }
      save(next)
      return next
    })
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--ink-soft)', fontFamily: 'Rubik, sans-serif' }}>Loading…</p>
      </div>
    )
  }

  return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh', padding: '24px 28px 48px' }}>
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-800 text-ink leading-tight">Contract & Renewals Status</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
              Track customer contracts, renewal timelines, and team actions
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {saving && (
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}>
                Saving…
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 1. KPI strip */}
      <section className="mb-5">
        <KpiStrip contracts={data.contracts} unit={unit} />
      </section>

      {/* 2. Table + Donut */}
      <section className="mb-5 flex flex-col gap-5 items-stretch"
        style={{ display: 'grid', gridTemplateColumns: '58fr 42fr', gap: '20px' }}
      >
        <ContractsTable
          contracts={data.contracts}
          onChange={contracts => update({ contracts })}
          unit={unit}
          onUnitChange={setUnit}
        />
        <DonutChart contracts={data.contracts} />
      </section>

      {/* 3. Timeline – full width */}
      <section className="mb-5">
        <TimelineChart contracts={data.contracts} unit={unit} />
      </section>

      {/* 4. Reminders + Action Items */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <RemindersCard
          reminders={data.reminders}
          onChange={reminders => update({ reminders })}
        />
        <ActionItemsCard
          items={data.actionItems}
          onChange={actionItems => update({ actionItems })}
        />
      </section>

      {/* Responsive: collapse columns on narrow viewports */}
      <style>{`
        @media (max-width: 1040px) {
          section[style*="58fr"] { grid-template-columns: 1fr !important; }
          section[style*="1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  )
}
