import type { AppData } from './types'

const SEED: AppData = {
  contracts: [
    { id: 'c1', customer: 'Sample Client 1', hasLTC: true,  endDate: '2026-12-31', tcv: 15 },
    { id: 'c2', customer: 'Sample Client 2', hasLTC: true,  endDate: '2026-09-30', tcv: 8  },
    { id: 'c3', customer: 'Sample Client 3', hasLTC: false, endDate: '',           tcv: 5  },
    { id: 'c4', customer: 'Sample Client 4', hasLTC: true,  endDate: '2026-10-31', tcv: 20 },
    { id: 'c5', customer: 'Sample Client 5', hasLTC: true,  endDate: '2026-11-15', tcv: 11 },
  ],
  reminders: [
    { id: 'r1', date: '2026-09-15', text: 'Follow up with Sample Client 2 on renewal terms', done: false },
    { id: 'r2', date: '2026-10-01', text: 'Send updated contract to Sample Client 4',         done: false },
    { id: 'r3', date: '2026-11-01', text: 'Schedule QBR with Sample Client 1',                done: false },
  ],
  actionItems: [
    { id: 'a1', text: 'Prepare renewal proposal for top accounts', priority: 'high',   done: false },
    { id: 'a2', text: 'Update contract end dates in CRM',          priority: 'medium', done: false },
    { id: 'a3', text: 'Send NPS survey to all active clients',     priority: 'low',    done: false },
  ],
}

function kvKey(userId: string) {
  return `ltc_data:${userId}`
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis')
  // Try all possible env var names that Upstash/Vercel integration might use
  const url   = process.env.KV_REST_API_URL
             ?? process.env.UPSTASH_REDIS_REST_URL
             ?? process.env.STORAGE_URL
             ?? ''
  const token = process.env.KV_REST_API_TOKEN
             ?? process.env.UPSTASH_REDIS_REST_TOKEN
             ?? process.env.STORAGE_TOKEN
             ?? ''
  return new Redis({ url, token })
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

  const redis = await getRedis()
  const data  = await redis.get<AppData>(kvKey(userId))
  if (!data) {
    await redis.set(kvKey(userId), SEED)
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
  const redis = await getRedis()
  await redis.set(kvKey(userId), data)
}
