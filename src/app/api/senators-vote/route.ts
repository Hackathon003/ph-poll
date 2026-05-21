import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashIP, getRealIP, getVoterCookieId } from '@/lib/ratelimit'
import { v4 as uuidv4 } from 'uuid'

const MAX_SENATOR_VOTES = 12

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateId, candidateIds } = body

    const ids: string[] = candidateIds ?? (candidateId ? [candidateId] : [])

    if (ids.length === 0) {
      return NextResponse.json({ error: 'Missing candidateId(s)' }, { status: 400 })
    }

    if (ids.length > MAX_SENATOR_VOTES) {
      return NextResponse.json({ error: 'Too many candidates selected.' }, { status: 400 })
    }

    const ip = getRealIP(request)
    const ipHash = hashIP(ip)

    const cookieHeader = request.headers.get('cookie')
    let cookieId = getVoterCookieId(cookieHeader)
    const isNewCookie = !cookieId
    if (!cookieId) cookieId = uuidv4()

    const db = supabaseAdmin()

    // Verify all candidates are active senators
    const { data: validCandidates, error: candidateError } = await db
      .from('candidates')
      .select('id, position')
      .in('id', ids)
      .eq('position', 'senator')
      .eq('active', true)

    if (candidateError || !validCandidates || validCandidates.length !== ids.length) {
      return NextResponse.json({ error: 'One or more invalid candidates.' }, { status: 404 })
    }

    // Count how many senator votes this IP already has
    const { count, error: countError } = await db
      .from('votes')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .eq('position', 'senator')

    if (countError) throw countError

    if ((count ?? 0) + ids.length > MAX_SENATOR_VOTES) {
      return NextResponse.json(
        { error: `You can only vote for up to ${MAX_SENATOR_VOTES} senators total. You have ${count} votes already.` },
        { status: 409 }
      )
    }

    // Insert votes one by one, log any errors
    let insertedCount = 0
    for (const id of ids) {
      const { error: voteError } = await db.from('votes').insert({
        candidate_id: id,
        position: 'senator',
        ip_hash: ipHash,
        cookie_id: `${cookieId}:${id}`,
      })
      if (!voteError) {
        insertedCount++
      } else {
        console.error(`Failed insert for ${id}:`, JSON.stringify(voteError))
      }
    }

    console.log(`Inserted ${insertedCount} of ${ids.length} senator votes`)

    const response = NextResponse.json({
      success: true,
      message: `${insertedCount} senator vote${insertedCount !== 1 ? 's' : ''} counted!`,
      votesRemaining: MAX_SENATOR_VOTES - (count ?? 0) - insertedCount,
    })

    if (isNewCookie) {
      response.cookies.set('ph_voter_id', cookieId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Senator vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('vote_counts')
      .select('*')
      .eq('position', 'senator')
      .order('vote_count', { ascending: false })

    if (error) throw error

    return NextResponse.json({ candidates: data })
  } catch (error) {
    console.error('Fetch senators error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}