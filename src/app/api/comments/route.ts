import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getCommentRateLimiter, hashIP, getRealIP } from '@/lib/ratelimit'

const MAX_COMMENT_LENGTH = 500

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateId, content } = body

    if (!candidateId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be under ${MAX_COMMENT_LENGTH} characters.` },
        { status: 400 }
      )
    }

    // Basic spam filter
    const trimmed = content.trim()
    if (trimmed.length < 5) {
      return NextResponse.json({ error: 'Comment is too short.' }, { status: 400 })
    }

    const ip = getRealIP(request)
    const ipHash = hashIP(ip)

    // Rate limit comments
    const limiter = getCommentRateLimiter()
    const { success } = await limiter.limit(ipHash)
    if (!success) {
      return NextResponse.json(
        { error: 'Too many comments. Please wait 10 minutes.' },
        { status: 429 }
      )
    }

    const db = supabaseAdmin()

    // Verify candidate exists
    const { data: candidate } = await db
      .from('candidates')
      .select('id')
      .eq('id', candidateId)
      .single()

    if (!candidate) {
      return NextResponse.json({ error: 'Invalid candidate' }, { status: 404 })
    }

    const { data, error } = await db
      .from('comments')
      .insert({ candidate_id: candidateId, content: trimmed, ip_hash: ipHash })
      .select('id, content, created_at')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, comment: data })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const candidateId = searchParams.get('candidateId')

    if (!candidateId) {
      return NextResponse.json({ error: 'Missing candidateId' }, { status: 400 })
    }

    const db = supabaseAdmin()
    const { data, error } = await db
      .from('comments')
      .select('id, content, created_at')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ comments: data })
  } catch (error) {
    console.error('Fetch comments error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}
