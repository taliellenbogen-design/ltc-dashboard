import { NextResponse } from 'next/server'
import { readData, writeData } from '@/lib/store'
import type { AppData } from '@/lib/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = await readData()
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const body = await req.json() as AppData
  await writeData(body)
  return NextResponse.json({ ok: true })
}
