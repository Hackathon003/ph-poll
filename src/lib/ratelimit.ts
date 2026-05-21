import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createHash } from 'crypto'

let ratelimit: Ratelimit | null = null

export function getRateLimiter() {
  if (!ratelimit) {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })

    ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
      prefix: 'ph-poll',
    })
  }
  return ratelimit
}

export function getSenatorRateLimiter() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(15, '1 m'),
    analytics: true,
    prefix: 'ph-poll-senators',
  })
}

export function getCommentRateLimiter() {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '10 m'),
    prefix: 'ph-poll-comments',
  })
}

export function hashIP(ip: string): string {
  const secret = process.env.IP_HASH_SECRET || 'fallback-secret-change-this'
  return createHash('sha256')
    .update(`${ip}:${secret}`)
    .digest('hex')
    .substring(0, 32)
}

export function getRealIP(request: Request): string {
  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) return cfIP

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()

  const realIP = request.headers.get('x-real-ip')
  if (realIP) return realIP

  return '127.0.0.1'
}

export function getVoterCookieId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(/ph_voter_id=([^;]+)/)
  return match ? match[1] : null
}