'use client'
import { Contract } from '@/lib/types'
import { v4 as uuid } from 'uuid'

interface Props {
  contracts: Contract[]
  onChange: (contracts: Contract[]) => void
}

export default function ContractsTable({ contracts, onChange }: Props) {
  function update(id: string, patch: Partial<Contract>) {
    onChange(contracts.map(c => c.id === id ? { ...c, ...patch } : c))
  }

  function addRow() {
    onChange([...contracts, { id: uuid(), customer: '', hasLTC: false, endDate: '', tcv: '' }])
  }

  function remove(id: string) {
    onChange(contracts.filter(c => c.id !== id))
  }

  const inputCls = 'w-full bg-transparent border border-transparent rounded px-2 py-1 text-sm focus:border-[var(--border)] focus:bg-white transition-colors'

  return (
    <div className="card" style={{ borderTop: '2px solid var(--green)' }}>
      <div className="px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-base font-700 text-ink">Contracts</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ color: 'var(--ink-soft)', borderBottom: '1px solid var(--border)' }}>
              <th className="px-6 py-3 font-600">Customer</th>
              <th className="px-4 py-3 font-600 text-center">Has Contract?</th>
              <th className="px-4 py-3 font-600">End Date</th>
              <th className="px-4 py-3 font-600">Total Contract Value ($m)</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < contracts.length - 1 ? '1px solid var(--border)' : undefined }}>
                <td className="px-4 py-2">
                  <input
                    className={inputCls}
                    value={c.customer}
                    placeholder="Customer name"
                    onChange={e => update(c.id, { customer: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={c.hasLTC}
                    onChange={e => update(c.id, { hasLTC: e.target.checked })}
                    className="w-4 h-4 rounded cursor-pointer accent-[var(--green)]"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    className={inputCls}
                    value={c.endDate}
                    onChange={e => update(c.id, { endDate: e.target.value })}
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    className={inputCls}
                    value={c.tcv}
                    placeholder="0"
                    min={0}
                    step={0.1}
                    onChange={e => update(c.id, { tcv: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-2">
                  <button
                    onClick={() => remove(c.id)}
                    aria-label="Delete row"
                    className="text-[var(--ink-soft)] hover:text-[var(--red)] transition-colors text-lg leading-none"
                  >×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4">
        <button
          onClick={addRow}
          className="text-sm font-600 px-4 py-2 rounded-lg border border-dashed border-[var(--border)] text-[var(--ink-soft)] hover:border-[var(--green)] hover:text-[var(--green)] transition-colors"
        >
          + Add Customer
        </button>
      </div>
    </div>
  )
}
