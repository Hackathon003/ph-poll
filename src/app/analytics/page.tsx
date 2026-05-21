'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type AnalyticsData = {
  totals: { president: number; senator: number; vp: number }
  hourly: Array<{ hour: string; position: string; vote_count: number }>
  presidents: Array<{ id: string; name: string; party: string; vote_count: number }>
  vps: Array<{ id: string; name: string; party: string; vote_count: number }>
  senators: Array<{ id: string; name: string; party: string; vote_count: number }>
  recentVotes: number
  generatedAt: string
}

const POSITION_LABELS: Record<string, string> = {
  president: 'President',
  vice_president: 'Vice President',
  senator: 'Senator',
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalVotes = data
    ? data.totals.president + data.totals.senator + data.totals.vp
    : 0

  const presidentMax = data?.presidents[0]?.vote_count || 1
  const vpMax = data?.vps[0]?.vote_count || 1
  const senatorMax = data?.senators[0]?.vote_count || 1

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <header className="border-b-2 border-ink">
        <div className="flex h-1.5">
          <div className="flex-1" style={{ background: 'var(--ph-blue)' }} />
          <div className="flex-1" style={{ background: 'var(--ph-red)' }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="font-mono text-xs text-muted hover:text-ink transition-colors">
              ← Back to Poll
            </Link>
            <h1 className="font-headline text-3xl font-bold text-ink mt-1">
              Analytics Dashboard
            </h1>
            <p className="font-mono text-xs text-muted mt-0.5">
              {data?.generatedAt
                ? `Last updated: ${new Date(data.generatedAt).toLocaleString('en-PH')}`
                : 'Loading...'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted">
            <span className="live-dot" />
            Live Data
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-sm h-24 animate-pulse" />
            ))}
          </div>
        ) : !data ? (
          <div className="text-center py-20 font-mono text-muted">
            Failed to load analytics. Please try again.
          </div>
        ) : (
          <>
            {/* STAT CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Votes', value: totalVotes.toLocaleString(), accent: 'var(--ink)' },
                { label: 'Presidential', value: data.totals.president.toLocaleString(), accent: 'var(--ph-blue)' },
                { label: 'Vice President', value: data.totals.vp.toLocaleString(), accent: 'var(--ph-yellow)' },
                { label: 'Senatorial', value: data.totals.senator.toLocaleString(), accent: 'var(--ph-red)' },
                { label: 'Votes (Last 24h)', value: data.recentVotes.toLocaleString(), accent: 'var(--muted)' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white border border-border rounded-sm p-4"
                  style={{ borderTop: `3px solid ${stat.accent}` }}
                >
                  <div className="font-headline text-3xl font-bold text-ink">{stat.value}</div>
                  <div className="font-mono text-xs text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* PRESIDENTIAL + VP side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Presidential */}
              <section>
                <div className="rule-thick mb-4">
                  <h2 className="font-headline text-xl font-bold text-ink px-1">Presidential Results</h2>
                </div>
                <div className="space-y-3">
                  {data.presidents.map((c, i) => {
                    const pct = data.totals.president > 0
                      ? (c.vote_count / data.totals.president) * 100
                      : 0
                    const barWidth = presidentMax > 0 ? (c.vote_count / presidentMax) * 100 : 0
                    return (
                      <div key={c.id} className="bg-white border border-border rounded-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted w-5">#{i + 1}</span>
                            <div>
                              <div className="font-headline font-bold text-sm text-ink">{c.name}</div>
                              <div className="font-mono text-xs text-muted">{c.party}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm font-bold text-ink">{pct.toFixed(1)}%</div>
                            <div className="font-mono text-xs text-muted">{c.vote_count.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="h-2 bg-paper-dark rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${barWidth}%`,
                              background: i === 0 ? 'var(--ph-blue)' : i === 1 ? 'var(--ph-red)' : 'var(--muted)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {data.presidents.length === 0 && (
                    <p className="text-center font-mono text-sm text-muted py-8">No votes yet</p>
                  )}
                </div>
              </section>

              {/* VP */}
              <section>
                <div className="rule-thick mb-4">
                  <h2 className="font-headline text-xl font-bold text-ink px-1">Vice Presidential Results</h2>
                </div>
                <div className="space-y-3">
                  {data.vps.map((c, i) => {
                    const pct = data.totals.vp > 0
                      ? (c.vote_count / data.totals.vp) * 100
                      : 0
                    const barWidth = vpMax > 0 ? (c.vote_count / vpMax) * 100 : 0
                    return (
                      <div key={c.id} className="bg-white border border-border rounded-sm p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted w-5">#{i + 1}</span>
                            <div>
                              <div className="font-headline font-bold text-sm text-ink">{c.name}</div>
                              <div className="font-mono text-xs text-muted">{c.party}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm font-bold text-ink">{pct.toFixed(1)}%</div>
                            <div className="font-mono text-xs text-muted">{c.vote_count.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="h-2 bg-paper-dark rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${barWidth}%`,
                              background: i === 0 ? 'var(--ph-blue)' : i === 1 ? 'var(--ph-red)' : 'var(--muted)',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {data.vps.length === 0 && (
                    <p className="text-center font-mono text-sm text-muted py-8">No votes yet</p>
                  )}
                </div>
              </section>
            </div>

            {/* SENATOR RESULTS */}
            <section className="mb-8">
              <div className="rule-thick mb-4">
                <h2 className="font-headline text-xl font-bold text-ink px-1">
                  Senator Results (Top 12)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {data.senators.slice(0, 12).map((c, i) => {
                  const barWidth = senatorMax > 0 ? (c.vote_count / senatorMax) * 100 : 0
                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-border rounded-sm p-2.5"
                      style={{ borderLeft: i < 12 ? '2px solid var(--ph-blue)' : undefined }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-xs w-6 text-center flex-shrink-0" style={{ color: 'var(--ph-blue)' }}>
                            #{i + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="font-headline font-bold text-xs text-ink leading-tight truncate">{c.name}</div>
                            <div className="font-mono text-xs text-muted truncate">{c.party}</div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-ink ml-2 flex-shrink-0">
                          {c.vote_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1 bg-paper-dark rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${barWidth}%`, background: 'var(--ph-blue)', transition: 'width 1s ease' }}
                        />
                      </div>
                    </div>
                  )
                })}
                {data.senators.length === 0 && (
                  <p className="text-center font-mono text-sm text-muted py-8 col-span-2">No votes yet</p>
                )}
              </div>
            </section>

            {/* HOURLY TREND TABLE */}
            {data.hourly.length > 0 && (
              <section className="mb-8">
                <div className="rule-thick mb-4">
                  <h2 className="font-headline text-xl font-bold text-ink px-1">
                    Voting Activity (Last 48 Hours)
                  </h2>
                </div>
                <div className="bg-white border border-border rounded-sm overflow-x-auto">
                  <table className="w-full text-sm font-mono min-w-[400px]">
                    <thead>
                      <tr className="border-b border-border bg-paper-dark">
                        <th className="text-left px-4 py-2 text-xs text-muted font-normal">Hour</th>
                        <th className="text-left px-4 py-2 text-xs text-muted font-normal">Position</th>
                        <th className="text-right px-4 py-2 text-xs text-muted font-normal">Votes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.hourly.slice(0, 20).map((row, i) => (
                        <tr key={i} className="border-b border-border last:border-0 hover:bg-paper transition-colors">
                          <td className="px-4 py-2 text-xs text-muted">
                           {new Date(row.hour).toLocaleString('en-PH', {
  month: 'short', day: 'numeric',
})}
                          
                          </td>
                          <td className="px-4 py-2 text-xs">
                            <span
                              className="px-1.5 py-0.5 rounded-sm text-white text-xs"
                              style={{
                                background:
                                  row.position === 'president'
                                    ? 'var(--ph-blue)'
                                    : row.position === 'vice_president'
                                    ? '#8B6914'
                                    : 'var(--ph-red)',
                              }}
                            >
                              {POSITION_LABELS[row.position] ?? row.position}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right text-xs font-bold text-ink">
                            {Number(row.vote_count).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* DISCLAIMER */}
            <div className="border border-border rounded-sm p-4 bg-white">
              <p className="font-mono text-xs text-muted text-center">
                This is an unofficial, non-scientific online survey for informational purposes only.
                Results do not represent actual election outcomes and are not affiliated with COMELEC.
                Anti-duplicate voting uses anonymous IP hashing and browser cookies — no personal data is stored.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-6 text-center">
        <div className="flex h-0.5 max-w-xs mx-auto rounded overflow-hidden mb-4">
          <div className="flex-1" style={{ background: 'var(--ph-blue)' }} />
          <div className="flex-1" style={{ background: 'var(--ph-red)' }} />
          <div className="flex-1" style={{ background: 'var(--ph-yellow)' }} />
        </div>
        <p className="font-mono text-xs text-muted">
          PH Poll 2025 · For educational purposes only · Not affiliated with COMELEC
        </p>
      </footer>
    </div>
  )
}