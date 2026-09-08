import type { AppData } from './types'

const SEED: AppData = {
  contracts: [
    { id: 'c1', customer: 'Sample Client 1', hasLTC: true,  endDate: '2026-12-31', tcv: 15 },
    { id: 'c2', customer: 'Sample Client 2', hasLTC: true,  endDate: '2026-09-30', tcv: 8  },
    { id: 'c3', customer: 'Sample Client 3', hasLTC: false, endDate: '',           tcv: 5  },
  ],
  reminders: [],
  actionItems: [],
}

async function getKv() {
  const { kv } = await import('@vercel/kv')
  return kv
}

function kvKey(userId: string) {
  return `ltc_data:${userId}`
}

export async function readData(userId: string): Promise<AppData> {
  if (process.env.NODE_ENV === 'development') {
    const fs   = await import('fs')
    const path = await import('path')
    const file = path.join(process.cwd(), `data_${userId.slice(0, 8)}.json`)
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(SEED, null, 2))
      return SEED
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as AppData
  }

  const kv   = await getKv()
  const data = await kv.get<AppData>(kvKey(userId))
  if (!data) {
    await kv.set(kvKey(userId), SEED)
    return SEED
  }
  return data
}

export async function writeData(userId: string, data: AppData): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    const fs   = await import('fs')
    const path = await import('path')
    fs.writeFileSync(path.join(process.cwd(), `data_${userId.slice(0, 8)}.json`), JSON.stringify(data, null, 2))
    return
  }
  const kv = await getKv()
  await kv.set(kvKey(userId), data)
}
