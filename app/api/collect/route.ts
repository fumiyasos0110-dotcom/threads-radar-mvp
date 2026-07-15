import { NextResponse } from 'next/server'
import { collectMockPosts } from '@/lib/mock-store'
import { hasSupabaseConfig } from '@/lib/supabase-admin'

async function run(req: Request) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}` && req.method !== 'POST') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const isMock = process.env.MOCK_MODE !== 'false' || !hasSupabaseConfig() || !process.env.THREADS_ACCESS_TOKEN
  if (isMock) {
    const result = await collectMockPosts()
    return NextResponse.json({ ok: true, ...result, mode: 'mock' })
  }

  return NextResponse.json({
    ok: false,
    error: 'Live Threads collection needs the Meta app access token and approved profile-discovery permissions. Mock collection remains available.',
    mode: 'live',
  }, { status: 501 })
}

export const POST = run
export const GET = run
