'use client'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { Reminder } from '@/lib/types'

function badge(r: Reminder) {
  if (r.done) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const d = new Date(r.date); d.setHours(0,0,0,0)
  const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
  if (diff < 0)  return { label: 'Overdue',     bg: 'var(--red-soft)',  text: 'var(--red)' }
  if (diff === 0) return { label: 'Today',       bg: 'var(--green-soft)',text: 'var(--green)' }
  if (diff <= 7)  return { label: `In ${diff}d`, bg: 'var(--teal-soft)', text: 'var(--teal)' }
  return null
}

function fmtDateLabel(s: string) {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

interface Props { reminders: Reminder[]; onChange: (r: Reminder[]) => void }

export default function RemindersCard({ reminders, onChange }: Props) {
  const [date, setDate] = useState('')
  const [text, setText] = useState('')

  const sorted = [...reminders].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return a.date.localeCompare(b.date)
  })

  function add() {
    if (!date || !text.trim()) return
    onChange([...reminders, { id: uuid(), date, text: text.trim(), done: false }])
    setDate(''); setText('')
  }

  function toggle(id: string) {
    onChange(reminders.map(r => r.id === id ? { ...r, done: !r.done } : r))
  }

  function remove(id: string) {
    onChange(reminders.filter(r => r.id !== id))
  }

  return (
    <div className="card flex flex-col" style={{ borderTop: '2px solid var(--teal)' }}>
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-700 text-ink">Reminders</h2>
      </div>
      <div className="px-6 py-4 flex gap-2 border-b border-[var(--border)]">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white"
        />
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a reminder…"
          className="flex-1 text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white"
        />
        <button
          onClick={add}
          className="text-sm font-600 px-4 py-2 rounded-lg text-white"
          style={{ background: 'var(--teal)' }}
        >Add</button>
      </div>
      <ul className="flex-1 divide-y divide-[var(--border)]">
        {sorted.length === 0 && (
          <li className="px-6 py-8 text-center text-sm" style={{ color: 'var(--ink-soft)' }}>
            No reminders yet. Add one above.
          </li>
        )}
        {sorted.map(r => {
          const b = badge(r)
          return (
            <li key={r.id} className="flex items-center gap-3 px-6 py-3" style={{ opacity: r.done ? 0.45 : 1 }}>
              <input
                type="checkbox"
                checked={r.done}
                onChange={() => toggle(r.id)}
                className="w-4 h-4 rounded cursor-pointer accent-[var(--teal)] shrink-0"
              />
              <span className="text-xs font-600 w-16 shrink-0" style={{ color: 'var(--ink-soft)' }}>
                {fmtDateLabel(r.date)}
              </span>
              <span className="flex-1 text-sm" style={{ textDecoration: r.done ? 'line-through' : 'none', color: 'var(--ink)' }}>
                {r.text}
              </span>
              {b && (
                <span className="text-xs font-600 px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: b.bg, color: b.text }}>
                  {b.label}
                </span>
              )}
              <button onClick={() => remove(r.id)} aria-label="Delete reminder"
                className="text-[var(--ink-soft)] hover:text-[var(--red)] transition-colors shrink-0">×</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
