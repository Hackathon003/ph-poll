'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import { CandidateCard } from '@/components/CandidateCard'
import { useToast } from '@/components/Toast'
import type { Candidate } from '@/lib/supabase'

type TabType = 'president' | 'vice_president' | 'senator'

const TAB_LABELS: Record<TabType, string> = {
  president: 'President',
  vice_president: 'VP',
  senator: 'Senators',
}

const TAB_API: Record<TabType, string> = {
  president: '/api/vote',
  vice_president: '/api/vp-vote',
  senator: '/api/senators-vote',
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center flex-1" style={{ minWidth: 0 }}>
      <div className="font-headline text-xl font-black" style={{ color: 'var(--ink)' }}>
        {value.toLocaleString()}
      </div>
      <div className="font-mono uppercase tracking-widest mt-0.5" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
        {label}
      </div>
    </div>
  )
}

function StatDivider() {
  return <div className="w-px self-stretch" style={{ background: 'var(--border)' }} />
}

function SkeletonCard() {
  return (
    <div className="rounded-sm border overflow-hidden" style={{ background: '#fff', borderColor: 'var(--border)' }}>
      <div className="p-4 space-y-3">
        <div className="h-3 w-12 rounded" style={{ background: 'var(--paper-dark)' }} />
        <div className="flex gap-3">
          <div className="w-16 h-20 rounded-sm" style={{ background: 'var(--paper-dark)' }} />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 w-3/4 rounded" style={{ background: 'var(--paper-dark)' }} />
            <div className="h-3 w-1/2 rounded" style={{ background: 'var(--paper-dark)' }} />
            <div className="h-1 w-full rounded mt-4" style={{ background: 'var(--paper-dark)' }} />
          </div>
        </div>
        <div className="h-8 w-full rounded-sm" style={{ background: 'var(--paper-dark)' }} />
      </div>
    </div>
  )
}

function BallotCard({
  president,
  vp,
  senators,
  onClose,
}: {
  president: Candidate | null
  vp: Candidate | null
  senators: Candidate[]
  onClose: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f0e8',
      })
      const link = document.createElement('a')
      link.download = 'my-ph-ballot-2028.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch {
      alert('Download failed. Try screenshotting instead!')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div className="w-full max-w-sm">
        <div
          ref={cardRef}
          style={{
            background: '#f5f0e8',
            border: '2px solid #1a1a1a',
            borderRadius: '4px',
            padding: '24px',
            fontFamily: 'Georgia, serif',
          }}
        >
          <div style={{ display: 'flex', height: '6px', marginBottom: '16px', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ flex: 1, background: '#0038A8' }} />
            <div style={{ flex: 1, background: '#CE1126' }} />
            <div style={{ flex: 1, background: '#FCD116' }} />
          </div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase', marginBottom: '4px' }}>
              Unofficial Survey Ballot
            </p>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#1a1a1a', lineHeight: 1, margin: 0 }}>
              PH Poll <span style={{ color: '#CE1126' }}>2028</span>
            </h2>
            <p style={{ fontFamily: 'monospace', fontSize: '8px', color: '#aaa', marginTop: '4px' }}>
              My Survey Choices
            </p>
          </div>
          <div style={{ borderTop: '2px solid #1a1a1a', marginBottom: '16px' }} />
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '8px', letterSpacing: '2px', color: '#0038A8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
              ▸ President
            </p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              {president?.name ?? '—'}
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#888', margin: '2px 0 0 0' }}>
              {president?.party ?? ''}
            </p>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '8px', letterSpacing: '2px', color: '#0038A8', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
              ▸ Vice President
            </p>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
              {vp?.name ?? '—'}
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#888', margin: '2px 0 0 0' }}>
              {vp?.party ?? ''}
            </p>
          </div>
          <div>
            <p style={{ fontFamily: 'monospace', fontSize: '8px', letterSpacing: '2px', color: '#CE1126', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
              ▸ Senators ({senators.length}/12)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {senators.map((s, i) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '8px', color: '#CE1126', fontWeight: 700, minWidth: '14px' }}>
                    {i + 1}.
                  </span>
                  <span style={{ fontSize: '10px', color: '#1a1a1a', lineHeight: 1.3, fontWeight: 600 }}>
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid #ccc', marginTop: '16px', paddingTop: '12px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '8px', color: '#aaa', margin: 0 }}>
              ph-poll.vercel.app · Unofficial Survey Only
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 py-3 font-mono text-sm font-bold rounded-sm transition-all"
            style={{ background: '#0038A8', color: '#fff', opacity: downloading ? 0.7 : 1 }}
          >
            {downloading ? 'Saving...' : '⬇ Download Card'}
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 font-mono text-sm rounded-sm transition-all"
            style={{ background: '#fff', color: '#1a1a1a', border: '1px solid #ccc' }}
          >
            Close
          </button>
        </div>
        <p className="text-center font-mono mt-2" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
          Screenshot or download to share on social media!
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('president')
  const [candidates, setCandidates] = useState<Record<TabType, Candidate[]>>({
    president: [],
    vice_president: [],
    senator: [],
  })
  const [loading, setLoading] = useState(true)
  const [votingFor, setVotingFor] = useState<string | null>(null)
  const [votedPresident, setVotedPresident] = useState<string | null>(null)
  const [votedVP, setVotedVP] = useState<string | null>(null)
  const [votedSenators, setVotedSenators] = useState<Set<string>>(new Set())
  const [selectedSenators, setSelectedSenators] = useState<Set<string>>(new Set())
  const [submittingSenators, setSubmittingSenators] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [showBallot, setShowBallot] = useState(false)
  const [ballotShownOnce, setBallotShownOnce] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const MAX_SENATORS = 12

  useEffect(() => {
    const vp = localStorage.getItem('ph_voted_president')
    const vvp = localStorage.getItem('ph_voted_vp')
    const vs = localStorage.getItem('ph_voted_senators')
    const bs = localStorage.getItem('ph_ballot_shown')
    if (vp) setVotedPresident(vp)
    if (vvp) setVotedVP(vvp)
    if (vs) { try { setVotedSenators(new Set(JSON.parse(vs))) } catch {} }
    if (bs) setBallotShownOnce(true)
  }, [])

  const fetchResults = useCallback(async () => {
    try {
      const [presRes, vpRes, senRes] = await Promise.all([
        fetch('/api/vote'),
        fetch('/api/vp-vote'),
        fetch('/api/senators-vote'),
      ])
      const [presData, vpData, senData] = await Promise.all([
        presRes.json(), vpRes.json(), senRes.json(),
      ])
      setCandidates({
        president: presData.candidates || [],
        vice_president: vpData.candidates || [],
        senator: senData.candidates || [],
      })
      setLastUpdated(new Date())
    } catch {
      console.error('Failed to fetch results')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
    const interval = setInterval(fetchResults, 30000)
    return () => clearInterval(interval)
  }, [fetchResults])

  useEffect(() => {
    const allDone = votedPresident && votedVP && votedSenators.size >= MAX_SENATORS
    if (allDone && !ballotShownOnce) {
      setTimeout(() => {
        setShowBallot(true)
        setBallotShownOnce(true)
        localStorage.setItem('ph_ballot_shown', '1')
      }, 800)
    }
  }, [votedPresident, votedVP, votedSenators, ballotShownOnce])

  const totalVotes = (pos: TabType) =>
    candidates[pos].reduce((s, c) => s + c.vote_count, 0)

  const handleVote = async (candidateId: string) => {
    const tab = activeTab

    if (tab === 'president') {
      if (votedPresident) { showToast('You have already voted for President.', 'info'); return }
      setVotingFor(candidateId)
      try {
        const res = await fetch(TAB_API[tab], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId }),
        })
        const data = await res.json()
        if (res.ok) {
          setVotedPresident(candidateId)
          localStorage.setItem('ph_voted_president', candidateId)
          showToast('Presidential vote recorded.', 'success')
          fetchResults()
        } else {
          showToast(data.error || 'Failed to cast vote.', 'error')
        }
      } catch {
        showToast('Network error. Please try again.', 'error')
      } finally {
        setVotingFor(null)
      }
      return
    }

    if (tab === 'vice_president') {
      if (votedVP) { showToast('You have already voted for Vice President.', 'info'); return }
      setVotingFor(candidateId)
      try {
        const res = await fetch(TAB_API[tab], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ candidateId }),
        })
        const data = await res.json()
        if (res.ok) {
          setVotedVP(candidateId)
          localStorage.setItem('ph_voted_vp', candidateId)
          showToast('VP vote recorded.', 'success')
          fetchResults()
        } else {
          showToast(data.error || 'Failed to cast vote.', 'error')
        }
      } catch {
        showToast('Network error. Please try again.', 'error')
      } finally {
        setVotingFor(null)
      }
      return
    }

    if (tab === 'senator') {
      if (votedSenators.has(candidateId)) {
        showToast('You already submitted a vote for this senator.', 'info')
        return
      }
      setSelectedSenators(prev => {
        const next = new Set(prev)
        if (next.has(candidateId)) {
          next.delete(candidateId)
        } else {
          if (next.size + votedSenators.size >= MAX_SENATORS) {
            showToast(`You can only select up to ${MAX_SENATORS} senators total.`, 'info')
            return prev
          }
          next.add(candidateId)
        }
        return next
      })
    }
  }

  const handleSubmitSenators = async () => {
    if (selectedSenators.size === 0) return
    setSubmittingSenators(true)
    const ids = Array.from(selectedSenators)
    try {
      const res = await fetch('/api/senators-vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: ids }),
      })
      const data = await res.json()
      if (res.ok) {
        const finalVoted = new Set([...Array.from(votedSenators), ...ids])
        setVotedSenators(finalVoted)
        localStorage.setItem('ph_voted_senators', JSON.stringify(Array.from(finalVoted)))
        setSelectedSenators(new Set())
        const remaining = MAX_SENATORS - finalVoted.size
        showToast(
          remaining > 0
            ? `${ids.length} senator vote${ids.length !== 1 ? 's' : ''} recorded. ${remaining} remaining.`
            : 'All 12 senator votes cast.',
          'success'
        )
        fetchResults()
      } else {
        showToast(data.error || 'Failed to cast votes. Please try again.', 'error')
      }
    } catch {
      showToast('Network error. Please try again.', 'error')
    } finally {
      setSubmittingSenators(false)
    }
  }

  const isSenatorSelected = (candidateId: string) => selectedSenators.has(candidateId)
  const isSenatorVoted = (candidateId: string) => votedSenators.has(candidateId)

  const hasVoted = (candidateId: string): boolean => {
    if (activeTab === 'president') return votedPresident === candidateId
    if (activeTab === 'vice_president') return votedVP === candidateId
    return votedSenators.has(candidateId)
  }

  const totalPresidentVotes = totalVotes('president')
  const totalVPVotes = totalVotes('vice_president')
  const totalSenatorVotes = totalVotes('senator')
  const grandTotal = totalPresidentVotes + totalVPVotes + totalSenatorVotes

  const presGrid = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
  const senGrid = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'

  const totalSelected = selectedSenators.size
  const totalAlreadyVoted = votedSenators.size
  const canSelectMore = totalSelected + totalAlreadyVoted < MAX_SENATORS
  const allSenatorsDone = totalAlreadyVoted >= MAX_SENATORS
  const allVotingDone = votedPresident && votedVP && allSenatorsDone

  const votedPresidentObj = candidates.president.find(c => c.id === votedPresident) ?? null
  const votedVPObj = candidates.vice_president.find(c => c.id === votedVP) ?? null
  const votedSenatorObjs = candidates.senator.filter(c => votedSenators.has(c.id))

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>

      {/* ADSTERRA SCRIPT */}
      <Script
        async
        data-cfasync="false"
        src="https://pl29511566.effectivecpmnetwork.com/453d7cec6c5db3458f5c8097965ec6bf/invoke.js"
        strategy="afterInteractive"
      />

      {/* BALLOT CARD MODAL */}
      {showBallot && (
        <BallotCard
          president={votedPresidentObj}
          vp={votedVPObj}
          senators={votedSenatorObjs}
          onClose={() => setShowBallot(false)}
        />
      )}

      {/* FLAG STRIPE */}
      <div className="flex h-1.5">
        <div className="flex-1" style={{ background: 'var(--ph-blue)' }} />
        <div className="flex-1" style={{ background: 'var(--ph-red)' }} />
        <div className="flex-1" style={{ background: 'var(--ph-yellow)' }} />
      </div>

      {/* MASTHEAD */}
      <header style={{ borderBottom: '2px solid var(--ink)' }}>
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5" style={{ color: 'var(--muted)' }}>
            <span className="font-mono text-xs hidden sm:block">
              {new Date().toLocaleDateString('en-PH', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
            <span className="font-mono text-xs sm:hidden">
              {new Date().toLocaleDateString('en-PH', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </span>
            <div className="flex items-center gap-4 font-mono text-xs">
              <span className="flex items-center gap-1.5">
                <span className="live-dot" />
                Live
              </span>
              <Link href="/analytics" className="transition-colors hover:underline" style={{ color: 'var(--muted)' }}>
                Analytics
              </Link>
            </div>
          </div>

          <div
            className="text-center py-5"
            style={{ borderTop: '3px solid var(--ink)', borderBottom: '1px solid var(--ink)' }}
          >
            <p className="font-mono text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
              Unofficial Online Survey · Halalan 2028
            </p>
            <h1
              className="font-headline font-black leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.4rem, 8vw, 5rem)', color: 'var(--ink)' }}
            >
              PH Poll <span style={{ color: 'var(--ph-red)' }}>2028</span>
            </h1>
            <p className="font-body text-sm italic mt-2" style={{ color: 'var(--muted)' }}>
              Who do you think should lead the Philippines?
            </p>
          </div>

          <div className="flex items-center justify-center mt-5 gap-0">
            <StatBox value={grandTotal} label="Total" />
            <StatDivider />
            <StatBox value={totalPresidentVotes} label="President" />
            <StatDivider />
            <StatBox value={totalVPVotes} label="VP" />
            <StatDivider />
            <StatBox value={totalSenatorVotes} label="Senate" />
          </div>
        </div>
      </header>

      {/* DISCLAIMER BAND */}
      <div
        className="py-2 px-4 text-center font-mono text-xs"
        style={{ background: 'var(--ph-yellow)', color: 'var(--ink)' }}
      >
        Unofficial survey only. Not affiliated with COMELEC. One response per household.
      </div>

      {/* ALL DONE BANNER */}
      {allVotingDone && (
        <div
          className="py-3 px-4 text-center font-mono text-xs flex items-center justify-center gap-3"
          style={{ background: 'var(--ph-blue)', color: '#fff' }}
        >
          <span>🗳️ All votes submitted!</span>
          <button
            onClick={() => setShowBallot(true)}
            className="underline font-bold"
            style={{ color: '#fff' }}
          >
            View My Ballot Card
          </button>
        </div>
      )}

      {/* TABS */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
          {(Object.keys(TAB_LABELS) as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-3 font-mono text-xs tracking-wider uppercase transition-colors"
              style={
                activeTab === tab
                  ? { borderBottom: '2px solid var(--ink)', color: 'var(--ink)', fontWeight: 700, marginBottom: '-1px' }
                  : { color: 'var(--muted)' }
              }
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {lastUpdated && (
          <p className="font-mono text-right mt-1" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
            Updated {lastUpdated.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {/* PRESIDENT */}
        {activeTab === 'president' && (
          <section className="py-7">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-headline text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  Who should be President?
                </h2>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Choose 1 candidate
                </p>
              </div>
              {votedPresident && <span className="voted-badge">Voted</span>}
            </div>
            <div className={presGrid}>
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                : candidates.president.map((c, i) => (
                    <CandidateCard
                      key={c.id} candidate={c} totalVotes={totalPresidentVotes}
                      onVote={handleVote} hasVoted={hasVoted(c.id)}
                      isVoting={votingFor === c.id} rank={i + 1} position="president"
                    />
                  ))}
            </div>
          </section>
        )}

        {/* VICE PRESIDENT */}
        {activeTab === 'vice_president' && (
          <section className="py-7">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="font-headline text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  Who should be Vice President?
                </h2>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Choose 1 candidate
                </p>
              </div>
              {votedVP && <span className="voted-badge">Voted</span>}
            </div>
            <div className={presGrid}>
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
                : candidates.vice_president.map((c, i) => (
                    <CandidateCard
                      key={c.id} candidate={c} totalVotes={totalVPVotes}
                      onVote={handleVote} hasVoted={hasVoted(c.id)}
                      isVoting={votingFor === c.id} rank={i + 1} position="president"
                    />
                  ))}
            </div>
          </section>
        )}

        {/* SENATORS */}
        {activeTab === 'senator' && (
          <section className="py-7">
            <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="font-headline text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                  Who should be Senators?
                </h2>
                <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {allSenatorsDone
                    ? 'All 12 votes submitted.'
                    : `Select up to ${MAX_SENATORS - totalAlreadyVoted} more — ${totalSelected} selected`}
                </p>
              </div>
              {totalAlreadyVoted > 0 && (
                <span className="voted-badge">{totalAlreadyVoted} / 12 Voted</span>
              )}
            </div>

            <div className="mb-5 rounded-sm p-3" style={{ background: '#fff', border: '1px solid var(--border)' }}>
              <div className="flex justify-between font-mono text-xs mb-2" style={{ color: 'var(--muted)' }}>
                <span>Ballot progress</span>
                <span>{totalAlreadyVoted + totalSelected} / 12</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--paper-dark)' }}>
                <div className="h-full flex">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${(totalAlreadyVoted / 12) * 100}%`, background: 'var(--ph-blue)' }}
                  />
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${(totalSelected / 12) * 100}%`, background: 'var(--ph-yellow)' }}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-2 font-mono text-xs" style={{ color: 'var(--muted)' }}>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: 'var(--ph-blue)' }} />
                  Voted
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: 'var(--ph-yellow)' }} />
                  Selected
                </span>
              </div>
            </div>

            <div className={senGrid}>
              {loading
                ? [...Array(12)].map((_, i) => <SkeletonCard key={i} />)
                : candidates.senator.map((c, i) => {
                    const alreadyVoted = isSenatorVoted(c.id)
                    const selected = isSenatorSelected(c.id)
                    const disabled = !alreadyVoted && !selected && !canSelectMore
                    return (
                      <div
                        key={c.id}
                        className="relative"
                        style={selected ? { outline: '2px solid var(--ph-blue)', borderRadius: '2px' } : {}}
                      >
                        {selected && (
                          <div
                            className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center text-white font-mono text-xs"
                            style={{ background: 'var(--ph-blue)', fontSize: '10px' }}
                          >
                            ✓
                          </div>
                        )}
                        <div style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
                          <CandidateCard
                            candidate={c} totalVotes={totalSenatorVotes}
                            onVote={handleVote} hasVoted={alreadyVoted}
                            isVoting={false} rank={i + 1} position="senator"
                          />
                        </div>
                      </div>
                    )
                  })}
            </div>

            {!allSenatorsDone && totalSelected > 0 && (
              <div
                className="sticky bottom-4 mt-6 rounded-sm p-4 flex items-center justify-between gap-4"
                style={{ background: 'var(--ink)', color: '#fff' }}
              >
                <div>
                  <div className="font-headline font-bold text-sm">
                    {totalSelected} senator{totalSelected !== 1 ? 's' : ''} selected
                  </div>
                  <div className="font-mono text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    {MAX_SENATORS - totalAlreadyVoted - totalSelected} slot{MAX_SENATORS - totalAlreadyVoted - totalSelected !== 1 ? 's' : ''} remaining
                  </div>
                </div>
                <button
                  onClick={handleSubmitSenators}
                  disabled={submittingSenators}
                  className="font-mono text-sm px-5 py-2 rounded-sm transition-all"
                  style={{
                    background: submittingSenators ? 'rgba(255,255,255,0.2)' : 'var(--ph-blue)',
                    color: '#fff',
                    cursor: submittingSenators ? 'wait' : 'pointer',
                  }}
                >
                  {submittingSenators ? 'Submitting...' : `Submit ${totalSelected} Vote${totalSelected !== 1 ? 's' : ''}`}
                </button>
              </div>
            )}

            {allSenatorsDone && (
              <div
                className="mt-6 rounded-sm p-4 text-center font-mono text-sm"
                style={{ background: '#fff', border: '1px solid var(--ph-blue)', color: 'var(--ph-blue)' }}
              >
                All 12 senator votes submitted.
              </div>
            )}
          </section>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-16" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center">
          <div className="flex h-1 max-w-[120px] mx-auto rounded overflow-hidden mb-5">
            <div className="flex-1" style={{ background: 'var(--ph-blue)' }} />
            <div className="flex-1" style={{ background: 'var(--ph-red)' }} />
            <div className="flex-1" style={{ background: 'var(--ph-yellow)' }} />
          </div>
          <p className="font-body text-sm italic mb-2" style={{ color: 'var(--muted)' }}>
            "Ang bayan nating Pilipinas" — For research and educational purposes only.
          </p>
          <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
            IP + cookie protection · No personal data collected · Not affiliated with COMELEC
          </p>
          <div className="mt-5">
            <Link href="/analytics" className="font-mono text-xs transition-colors hover:underline" style={{ color: 'var(--muted)' }}>
              Analytics Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {ToastComponent}
    </div>
  )
}