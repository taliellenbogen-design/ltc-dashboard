import { NextRequest, NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/store'
import type { AppData } from '@/lib/types'
import { v4 as uuid } from 'uuid'

export const dynamic = 'force-dynamic'

const COOKIE = 'ltc_uid'
const ONE_YEAR = 60 * 60 * 24 * 365

function getUserId(req: NextRequest): { userId: string; isNew: boolean } {
  const existing = req.cookies.get(COOKIE)?.value
  if (existing) return { userId: existing, isNew: false }
  return { userId: uuid(), isNew: true }
}

export async function GET(req: NextRequest) {
  const { userId, isNew } = getUserId(req)
  try {
    const data = await readData(userId)
    const res = NextResponse.json(data)
    if (isNew) {
      res.cookies.set(COOKIE, userId, { maxAge: ONE_YEAR, httpOnly: true, sameSite: 'lax' })
    }
    return res
  } catch (e) {
    console.error('[GET /api/data] error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const { userId, isNew } = getUserId(req)
  try {
    const body = await req.json() as AppData
    await writeData(userId, body)
    const res = NextResponse.json({ ok: true })
    if (isNew) {
      res.cookies.set(COOKIE, userId, { maxAge: ONE_YEAR, httpOnly: true, sameSite: 'lax' })
    }
    return res
  } catch (e) {
    console.error('[POST /api/data] error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
