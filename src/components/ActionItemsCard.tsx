'use client'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import type { ActionItem } from '@/lib/types'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--red)',
  medium: 'var(--green)',
  low: 'var(--gray-chip)',
}

interface Props { items: ActionItem[]; onChange: (items: ActionItem[]) => void }

export default function ActionItemsCard({ items, onChange }: Props) {
  const [text, setText] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')

  const sorted = [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  })

  function add() {
    if (!text.trim()) return
    onChange([...items, { id: uuid(), text: text.trim(), priority, done: false }])
    setText('')
  }

  function toggle(id: string) {
    onChange(items.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function remove(id: string) {
    onChange(items.filter(i => i.id !== id))
  }

  return (
    <div className="card flex flex-col" style={{ borderTop: '2px solid var(--indigo)' }}>
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-700 text-ink">Action Items</h2>
      </div>
      <div className="px-6 py-4 flex gap-2 border-b border-[var(--border)]">
        <select
          value={priority}
          onChange={e => setPriority(e.target.value as 'high' | 'medium' | 'low')}
          className="text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add an action item…"
          className="flex-1 text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-white"
        />
        <button
          onClick={add}
          className="text-sm font-600 px-4 py-2 rounded-lg text-white"
          style={{ background: 'var(--indigo)' }}
        >Add</button>
      </div>
      <ul className="flex-1 divide-y divide-[var(--border)]">
        {sorted.length === 0 && (
          <li className="px-6 py-8 text-center text-sm" style={{ color: 'var(--ink-soft)' }}>
            No action items yet. Add one above.
          </li>
        )}
        {sorted.map(it => (
          <li key={it.id} className="flex items-center gap-3 px-6 py-3" style={{ opacity: it.done ? 0.45 : 1 }}>
            <input
              type="checkbox"
              checked={it.done}
              onChange={() => toggle(it.id)}
              className="w-4 h-4 rounded cursor-pointer accent-[var(--indigo)] shrink-0"
            />
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PRIORITY_COLOR[it.priority] }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-ink truncate" style={{ textDecoration: it.done ? 'line-through' : 'none' }}>{it.text}</p>
              <p className="text-xs capitalize" style={{ color: 'var(--ink-soft)' }}>Priority: {it.priority}</p>
            </div>
            <button onClick={() => remove(it.id)} aria-label="Delete action item"
              className="text-[var(--ink-soft)] hover:text-[var(--red)] transition-colors shrink-0">×</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
