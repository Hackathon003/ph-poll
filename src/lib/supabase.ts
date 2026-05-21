import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client for browser usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client with service role (bypasses RLS — use only in API routes)
export const supabaseAdmin = () =>
  createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

export type Candidate = {
  id: string
  name: string
  party: string
  position: 'president' | 'senator'
  photo_url: string | null
  bio: string | null
  platform: string | null
  sort_order: number
  vote_count: number
}

export type Comment = {
  id: string
  candidate_id: string
  content: string
  created_at: string
}
