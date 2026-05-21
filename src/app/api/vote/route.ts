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

    // Get IP and hash it
    const ip = getRealIP(request)
    const ipHash = hashIP(ip)

    // Rate limiting
    const limiter = getRateLimiter()
    const { success, limit, remaining } = await limiter.limit(ipHash)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait before voting again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
          },
        }
      )
    }

    // Get or generate cookie ID
    const cookieHeader = request.headers.get('cookie')
    let cookieId = getVoterCookieId(cookieHeader)
    const isNewCookie = !cookieId
    if (!cookieId) {
      cookieId = uuidv4()
    }

    const db = supabaseAdmin()

    // Verify candidate exists and is a president
    const { data: candidate, error: candidateError } = await db
      .from('candidates')
      .select('id, position')
      .eq('id', candidateId)
      .eq('position', 'president')
      .eq('active', true)
      .single()

    if (candidateError || !candidate) {
      return NextResponse.json({ error: 'Invalid candidate' }, { status: 404 })
    }

    // Try to insert vote (unique constraints handle duplicates)
    const { error: voteError } = await db.from('votes').insert({
      candidate_id: candidateId,
      position: 'president',
      ip_hash: ipHash,
      cookie_id: cookieId,
    })

    if (voteError) {
      // Unique constraint violation = already voted
      if (voteError.code === '23505') {
        return NextResponse.json(
          { error: 'You have already voted for president from this device.' },
          { status: 409 }
        )
      }
      throw voteError
    }

    // Success response — set cookie if new
    const response = NextResponse.json({
      success: true,
      message: 'Your vote has been counted!',
    })

    if (isNewCookie) {
      response.cookies.set('ph_voter_id', cookieId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
      })
    }

    return response
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('vote_counts')
      .select('*')
      .eq('position', 'president')
      .order('vote_count', { ascending: false })

    if (error) throw error

    return NextResponse.json({ candidates: data })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
