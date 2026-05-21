'use client'
import { useState, useEffect } from 'react'
import { Candidate } from '@/lib/supabase'

type CandidateCardProps = {
  candidate: Candidate
  totalVotes: number
  onVote: (id: string) => void
  hasVoted: boolean
  isVoting: boolean
  rank: number
  position: 'president' | 'senator'
}

const WIKI_NAMES: Record<string, string> = {
  'Ferdinand "Bongbong" Marcos Jr.': 'Ferdinand_Marcos_Jr.',
  'Sara Duterte': 'Sara_Duterte',
  'Leni Robredo': 'Leni_Robredo',
  'Manny Pacquiao': 'Manny_Pacquiao',
  'Vico Sotto': 'Vico_Sotto',
  'Tito Sotto': 'Tito_Sotto',
  'Ping Lacson': 'Panfilo_Lacson',
  'Kiko Pangilinan': 'Francis_Pangilinan',
  'Chiz Escudero': 'Chiz_Escudero',
  'Alan Peter Cayetano': 'Alan_Peter_Cayetano',
  'Cynthia Villar': 'Cynthia_Villar',
  'Bong Go': 'Bong_Go',
  'Robin Padilla': 'Robin_Padilla',
  'Lito Lapid': 'Lito_Lapid',
  'Jinggoy Estrada': 'Jinggoy_Estrada',
  'Raffy Tulfo': 'Raffy_Tulfo',
  'Risa Hontiveros': 'Risa_Hontiveros',
  'Win Gatchalian': 'Win_Gatchalian',
  'Joel Villanueva': 'Joel_Villanueva',
  'Pia Cayetano': 'Pia_Cayetano',
  'Sherwin Gatchalian': 'Sherwin_Gatchalian',
  'Francis Tolentino': 'Francis_Tolentino',
  'Ronald dela Rosa': 'Ronald_dela_Rosa',
  'Imee Marcos': 'Imee_Marcos',
  'JV Ejercito': 'JV_Ejercito',
  'Leody de Guzman': 'Leody_de_Guzman',
  'Doc Willie Ong': 'Willie_Ong',
  'Neri Colmenares': 'Neri_Colmenares',
  'Luke Espiritu': 'Luke_Espiritu',
  'Samira Gutoc': 'Samira_Gutoc',
  'Erin Tañada': 'Erin_Tañada',
  'Chel Diokno': 'Chel_Diokno',
  'Erwin Tulfo': 'Erwin_Tulfo',
  'Ramon Tulfo': 'Ramon_Tulfo',
  'Herbert Bautista': 'Herbert_Bautista',
  'Bato dela Rosa': 'Ronald_dela_Rosa',
  'Willie Revillame': 'Willie_Revillame',
  'Rodante Marcoleta': 'Rodante_Marcoleta',
}

function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: '#0038A8', text: '#FFFFFF' },
    { bg: '#CE1126', text: '#FFFFFF' },
    { bg: '#1a3a6b', text: '#FFFFFF' },
    { bg: '#7B3F00', text: '#FFFFFF' },
    { bg: '#2D6A4F', text: '#FFFFFF' },
    { bg: '#4a0e8f', text: '#FFFFFF' },
    { bg: '#8B4513', text: '#FFFFFF' },
    { bg: '#1B4332', text: '#FFFFFF' },
    { bg: '#5C3317', text: '#FFFFFF' },
    { bg: '#003366', text: '#FFFFFF' },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  const cleaned = name.replace(/"[^"]*"/g, '').trim()
  return cleaned
    .split(' ')
    .filter((w) => w.length > 1)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function useWikiPhoto(name: string, photoUrl?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(photoUrl ?? null)

  useEffect(() => {
    if (photoUrl) { setUrl(photoUrl); return }
    const wikiTitle = WIKI_NAMES[name]
    if (!wikiTitle) return
    let cancelled = false
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled && data?.thumbnail?.source) setUrl(data.thumbnail.source)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [name, photoUrl])

  return url
}

export function CandidateCard({
  candidate,
  totalVotes,
  onVote,
  hasVoted,
  isVoting,
  rank,
  position,
}: CandidateCardProps) {
  const percentage = totalVotes > 0 ? (candidate.vote_count / totalVotes) * 100 : 0
  const isLeading = rank === 1 && candidate.vote_count > 0
  const avatarColor = getAvatarColor(candidate.name)
  const initials = getInitials(candidate.name)
  const photoUrl = useWikiPhoto(candidate.name, candidate.photo_url)

  const avatarW = position === 'president' ? 64 : 48
  const avatarH = position === 'president' ? 80 : 60

  return (
    <div
      className="candidate-card bg-white overflow-hidden rounded-sm flex flex-col"
      style={
        isLeading
          ? { borderLeft: '4px solid var(--ph-blue)', borderTop: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }
          : { border: '1px solid var(--border)' }
      }
    >
      {/* Rank + Leading — fixed height so all cards are equal */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2" style={{ minHeight: '2rem' }}>
        <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>No. {rank}</span>
        {isLeading ? (
          <span
            className="font-mono text-xs tracking-widest uppercase px-2 py-0.5 rounded-sm"
            style={{ background: 'var(--ph-blue)', color: '#fff' }}
          >
            Leading
          </span>
        ) : (
          <span className="font-mono text-xs px-2 py-0.5" style={{ opacity: 0, pointerEvents: 'none' }}>Leading</span>
        )}
      </div>

      {/* Photo + Info */}
      <div className="flex gap-3 px-4 pb-3 flex-1">
        <div className="flex-shrink-0">
          {photoUrl ? (
            <div style={{ width: avatarW, height: avatarH, overflow: 'hidden', borderRadius: 4 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={candidate.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }}
              />
            </div>
          ) : (
            <div
              style={{
                width: avatarW,
                height: avatarH,
                background: avatarColor.bg,
                color: avatarColor.text,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: position === 'president' ? '1.25rem' : '1rem',
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                userSelect: 'none',
              }}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="font-headline font-bold leading-tight"
            style={{ fontSize: position === 'president' ? '0.9375rem' : '0.875rem', color: 'var(--ink)' }}
          >
            {candidate.name}
          </h3>
          <p className="font-body text-xs mt-0.5 truncate" style={{ color: 'var(--muted)' }}>
            {candidate.party}
          </p>

          <div className="mt-3">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-mono text-xs font-medium" style={{ color: 'var(--ink)' }}>
                {percentage.toFixed(1)}%
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
                {candidate.vote_count.toLocaleString()}
              </span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--paper-dark)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%`, background: isLeading ? 'var(--ph-blue)' : 'var(--muted)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vote button — always pinned to bottom */}
      <div className="px-4 pb-4 mt-auto">
        <button
          onClick={() => !hasVoted && !isVoting && onVote(candidate.id)}
          disabled={hasVoted || isVoting}
          className="w-full py-2 text-sm font-mono tracking-wide rounded-sm transition-all duration-150 active:scale-95"
          style={
            hasVoted
              ? { background: 'var(--ph-blue)', color: '#fff', opacity: 0.85, cursor: 'default' }
              : isVoting
              ? { background: 'var(--paper-dark)', color: 'var(--muted)', cursor: 'wait' }
              : { background: 'var(--ink)', color: '#fff' }
          }
          onMouseEnter={(e) => {
            if (!hasVoted && !isVoting)
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ph-blue)'
          }}
          onMouseLeave={(e) => {
            if (!hasVoted && !isVoting)
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ink)'
          }}
        >
          {hasVoted ? 'Voted' : isVoting ? 'Casting vote...' : 'Cast Vote'}
        </button>
      </div>
    </div>
  )
}