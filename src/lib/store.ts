import type { AppData } from './types'

const SEED: AppData = {
  contracts: [
    { id: 'c1', customer: 'Client A', hasLTC: true,  endDate: '2026-11-15', tcv: 25 },
    { id: 'c2', customer: 'Client B', hasLTC: true,  endDate: '2026-08-30', tcv: 18 },
    { id: 'c3', customer: 'Client C', hasLTC: false, endDate: '',           tcv: 12 },
    { id: 'c4', customer: 'Client D', hasLTC: true,  endDate: '2026-07-20', tcv: 9  },
    { id: 'c5', customer: 'Client E', hasLTC: false, endDate: '2026-09-01', tcv: 6  },
  ],
  reminders: [
    { id: 'r1', date: '2026-07-01', text: 'Follow up with Client D on renewal terms', done: false },
    { id: 'r2', date: '2026-08-01', text: 'Send updated contract to Client B',         done: false },
  ],
  actionItems: [
    { id: 'a1', text: 'Prepare renewal proposal for Client A', priority: 'high',   done: false },
    { id: 'a2', text: 'Update CRM with new commitment dates',  priority: 'medium', done: false },
    { id: 'a3', text: 'Schedule QBR calls for Q3',             priority: 'low',    done: false },
  ],
}

const KV_KEY = 'ltc_data'

async function getKv() {
  const { kv } = await import('@vercel/kv')
  return kv
}

export async function readData(): Promise<AppData> {
  if (process.env.NODE_ENV === 'development') {
    // Local dev: use JSON file
    const fs  = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), 'data.json')
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(SEED, null, 2))
      return SEED
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as AppData
  }

  // Production: use Vercel KV
  const kv = await getKv()
  const data = await kv.get<AppData>(KV_KEY)
  if (!data) {
    await kv.set(KV_KEY, SEED)
    return SEED
  }
  return data
}

export async function writeData(data: AppData): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const fs   = await import('fs')
    const path = await import('path')
    fs.writeFileSync(path.join(process.cwd(), 'data.json'), JSON.stringify(data, null, 2))
    return
  }
  const kv = await getKv()
  await kv.set(KV_KEY, data)
}
