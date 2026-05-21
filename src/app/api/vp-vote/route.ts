import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getRateLimiter, hashIP, getRealIP, getVoterCookieId } from '@/lib/ratelimit'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateId } = body

    if (!candidateId) {
      return NextResponse.json({ error: 'Missing candidateId' }, { status: 400 })
    }

    const ip = getRealIP(request)
    const ipHash = hashIP(ip)

    const limiter = getRateLimiter()
    const { success } = await limiter.limit(`vp:${ipHash}`)
    if (!success) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }

    const cookieHeader = request.headers.get('cookie')
    let cookieId = getVoterCookieId(cookieHeader)
    const isNewCookie = !cookieId
    if (!cookieId) cookieId = uuidv4()

    const db = supabaseAdmin()

    const { data: candidate, error: candidateError } = await db
      .from('candidates')
      .select('id, position')
      .eq('id', candidateId)
      .eq('position', 'vice_president')
      .eq('active', true)
      .single()

    if (candidateError || !candidate) {
      return NextResponse.json({ error: 'Invalid candidate' }, { status: 404 })
    }

    const { error: voteError } = await db.from('votes').insert({
      candidate_id: candidateId,
      position: 'vice_president',
      ip_hash: ipHash,
      cookie_id: `vp:${cookieId}`,
    })

    if (voteError) {
      if (voteError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted for Vice President from this device.' },
          { status: 409 }
        )
      }
      throw voteError
    }

    const response = NextResponse.json({ success: true, message: 'VP vote counted!' })

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
    console.error('VP vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('vote_counts')
      .select('*')
      .eq('position', 'vice_president')
      .order('vote_count', { ascending: false })

    if (error) throw error
    return NextResponse.json({ candidates: data })
  } catch (error) {
    console.error('Fetch VP error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
