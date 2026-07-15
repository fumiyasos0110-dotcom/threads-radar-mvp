import { NextResponse } from 'next/server'
import { z } from 'zod'
import { addMockCompetitor, listMockCompetitors } from '@/lib/mock-store'
import { createSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase-admin'

const schema = z.object({ username: z.string().trim().min(2).max(50).regex(/^[A-Za-z0-9._]+$/).transform(v => v.replace(/^@/, '')) })
const mockMode = () => process.env.MOCK_MODE !== 'false' || !hasSupabaseConfig()

export async function GET() {
  if (mockMode()) return NextResponse.json({ competitors: await listMockCompetitors(), mode: 'mock' })
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from('competitor_dashboard').select('*').order('radar_score', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const competitors = (data ?? []).map((row) => ({
    id: row.id, username: row.username, displayName: row.display_name, followers: row.follower_count ?? 0,
    posts7d: row.posts_7d ?? 0, avgEngagement: row.avg_engagement ?? 0, score: row.radar_score ?? 0,
    createdAt: row.created_at,
  }))
  return NextResponse.json({ competitors, mode: 'live' })
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ユーザー名は英数字・ピリオド・アンダースコアで入力してください' }, { status: 400 })
  if (mockMode()) return NextResponse.json({ ok: true, competitor: await addMockCompetitor(parsed.data.username), mode: 'mock' })
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from('competitors').upsert({ username: parsed.data.username, platform: 'threads', owner_id: null }, { onConflict: 'owner_id,platform,username' }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, competitor: data, mode: 'live' })
}
