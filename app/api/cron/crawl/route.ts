import { NextResponse } from 'next/server'
import { runCrawler } from '../../../../crawler'

export const maxDuration = 300 // 5 minutes — Vercel Pro max for cron

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runCrawler()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[cron] crawler failed:', err)
    return NextResponse.json({ error: 'Crawler failed' }, { status: 500 })
  }
}
