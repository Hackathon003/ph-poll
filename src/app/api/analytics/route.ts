import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const db = supabaseAdmin()

    // Total votes by position — count directly in DB
    const { count: presidentTotal } = await db
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('position', 'president')

    const { count: senatorTotal } = await db
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('position', 'senator')

    const { count: vpTotal } = await db
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('position', 'vice_president')

    // Hourly vote trend (last 48 hours)
    const { data: hourly } = await db
      .from('hourly_votes')
      .select('*')
      .limit(48)

    // Top candidates
    const { data: presidents } = await db
  .from('vote_counts')
  .select('*')
  .eq('position', 'president')
  .order('vote_count', { ascending: false })
  .order('sort_order', { ascending: true })
  .limit(6)

    const { data: vps } = await db
  .from('vote_counts')
  .select('*')
  .eq('position', 'vice_president')
  .order('vote_count', { ascending: false })
  .order('sort_order', { ascending: true })
  .limit(6)
    const { data: senators } = await db
  .from('vote_counts')
  .select('*')
  .eq('position', 'senator')
  .order('vote_count', { ascending: false })
  .order('sort_order', { ascending: true })
  .limit(12)
    // Votes in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentVotes } = await db
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday)

    return NextResponse.json({
      totals: {
        president: presidentTotal ?? 0,
        senator: senatorTotal ?? 0,
        vp: vpTotal ?? 0,
      },
      hourly: hourly ?? [],
      presidents: presidents ?? [],
      vps: vps ?? [],
      senators: senators ?? [],
      recentVotes: recentVotes ?? 0,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}