'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PicturaLogo } from '@/components/pictura/pictura-logo'
import { Loader2, RefreshCw, Search } from 'lucide-react'

type SessionRow = {
  session_id: string
  credits_used: number
  credits_reset_at: string | null
  video_used: number
  video_reset_at: string | null
  tour_completed: boolean
  last_ip: string | null
  last_country: string | null
  last_region: string | null
  last_city: string | null
  last_device: string | null
  last_seen_at: string | null
  created_at: string
}

type Limits = { image: number; video: number }

export default function AdminSessionsPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<SessionRow[]>([])
  const [limits, setLimits] = useState<Limits>({ image: 5, video: 2 })
  const [selectedSession, setSelectedSession] = useState('')
  const [imageDelta, setImageDelta] = useState('')
  const [videoDelta, setVideoDelta] = useState('')
  const [imageRemaining, setImageRemaining] = useState('')
  const [videoRemaining, setVideoRemaining] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const formatRelativeDate = (value: string | null) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const formatLocation = (row: SessionRow) => {
    return [row.last_city, row.last_region, row.last_country].filter(Boolean).join(', ') || 'Unknown location'
  }

  const selected = useMemo(
    () => rows.find((row) => row.session_id === selectedSession) || null,
    [rows, selectedSession]
  )

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/admin/auth/me', { credentials: 'include' })
      if (!res.ok) {
        router.replace('/admin/login')
        return
      }
      setAuthLoading(false)
      loadSessions()
    }

    run()
  }, [router])

  const loadSessions = async () => {
    setLoading(true)
    setMessage('')
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/sessions?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Failed to load sessions')
        return
      }

      const uniqueSessions = (data.sessions || []).filter((row: SessionRow, idx: number, all: SessionRow[]) => {
        const id = row.session_id?.trim()
        if (!id) return false
        return all.findIndex((candidate) => candidate.session_id?.trim() === id) === idx
      })

      setRows(uniqueSessions)
      setLimits(data.limits || { image: 5, video: 2 })
      if (!selectedSession && uniqueSessions[0]?.session_id) {
        setSelectedSession(uniqueSessions[0].session_id)
      }
    } catch {
      setMessage('Network error while loading sessions')
    } finally {
      setLoading(false)
    }
  }

  const updateSession = async (payload: Record<string, unknown>) => {
    if (!selectedSession.trim()) return setMessage('Select a session first.')

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: selectedSession, ...payload }),
      })
      const data = await res.json()
      if (!res.ok) return setMessage(data.error || 'Failed to update session')

      setRows((prev) => prev.map((row) => (row.session_id === selectedSession ? data.session : row)))
      setMessage('Session updated successfully.')
      setImageDelta('')
      setVideoDelta('')
      setImageRemaining('')
      setVideoRemaining('')
    } catch {
      setMessage('Network error while updating session')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const imageRemainingValue = selected ? Math.max(0, limits.image - selected.credits_used) : 0
  const videoRemainingValue = selected ? Math.max(0, limits.video - selected.video_used) : 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-card/60">
        <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Link href="/admin" className="transition-opacity hover:opacity-80">
                <PicturaLogo size="sm" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold leading-tight sm:text-lg">Anonymous User Sessions</h1>
                <p className="text-xs leading-relaxed text-muted-foreground">Real anonymous session activity, location, and device data.</p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-xs sm:justify-end">
              <Link href="/admin" className="rounded-md px-2 py-1 hover:bg-secondary hover:underline">Overview</Link>
              <Link href="/staff/dashboard" className="rounded-md px-2 py-1 hover:bg-secondary hover:underline">Staff</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-4 sm:grid-cols-12 sm:px-6">
        <section className="rounded-2xl border border-border/60 bg-card p-4 sm:col-span-7">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by session id prefix"
                className="h-10 w-full rounded-lg border border-border/60 bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <button
              onClick={loadSessions}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Load
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <div className="hidden max-h-[420px] overflow-auto sm:block">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead className="sticky top-0 bg-secondary/60">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Session</th>
                    <th className="px-3 py-2 font-semibold">Last seen</th>
                    <th className="px-3 py-2 font-semibold">Location</th>
                    <th className="px-3 py-2 font-semibold">Image left</th>
                    <th className="px-3 py-2 font-semibold">Video left</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const imageLeft = Math.max(0, limits.image - row.credits_used)
                    const videoLeft = Math.max(0, limits.video - row.video_used)
                    const active = row.session_id === selectedSession
                    return (
                      <tr
                        key={row.session_id}
                        className={`cursor-pointer border-t border-border/40 ${active ? 'bg-primary/10' : 'hover:bg-secondary/40'}`}
                        onClick={() => setSelectedSession(row.session_id)}
                      >
                        <td className="px-3 py-2 font-mono text-[11px]">{row.session_id}</td>
                        <td className="px-3 py-2">{formatRelativeDate(row.last_seen_at || row.created_at)}</td>
                        <td className="px-3 py-2">{formatLocation(row)}</td>
                        <td className="px-3 py-2">{imageLeft}</td>
                        <td className="px-3 py-2">{videoLeft}</td>
                      </tr>
                    )
                  })}
                  {!rows.length ? (
                    <tr>
                      <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>No matching sessions found.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-auto p-2 sm:hidden">
              {rows.map((row) => {
                const imageLeft = Math.max(0, limits.image - row.credits_used)
                const videoLeft = Math.max(0, limits.video - row.video_used)
                const active = row.session_id === selectedSession
                return (
                  <button
                    key={row.session_id}
                    onClick={() => setSelectedSession(row.session_id)}
                    className={`w-full rounded-lg border p-2.5 text-left ${active ? 'border-primary/40 bg-primary/10' : 'border-border/40 bg-background'}`}
                  >
                    <p className="break-all font-mono text-[11px] leading-relaxed">{row.session_id}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Seen: {formatRelativeDate(row.last_seen_at || row.created_at)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatLocation(row)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Image left: {imageLeft} • Video left: {videoLeft}</p>
                  </button>
                )
              })}
              {!rows.length ? <p className="px-2 py-6 text-center text-xs text-muted-foreground">No matching sessions found.</p> : null}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 sm:col-span-5">
          <h2 className="text-sm font-semibold">Selected session</h2>
          <p className="mt-1 break-all rounded-lg bg-secondary/50 px-2 py-1 font-mono text-[11px]">{selectedSession || '—'}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border/60 bg-background p-2">
              <p className="text-muted-foreground">Image remaining</p>
              <p className="text-base font-semibold">{imageRemainingValue}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-2">
              <p className="text-muted-foreground">Video remaining</p>
              <p className="text-base font-semibold">{videoRemainingValue}</p>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border/60 bg-background p-2 text-xs">
            <p><span className="text-muted-foreground">Last seen:</span> {formatRelativeDate(selected?.last_seen_at || selected?.created_at || null)}</p>
            <p className="mt-1"><span className="text-muted-foreground">Location:</span> {selected ? formatLocation(selected) : '—'}</p>
            <p className="mt-1"><span className="text-muted-foreground">IP:</span> {selected?.last_ip || '—'}</p>
            <p className="mt-1"><span className="text-muted-foreground">Device:</span> {selected?.last_device || '—'}</p>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              onClick={() => updateSession({ reset: true })}
              disabled={loading || !selectedSession}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Reset daily usage
            </button>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={imageDelta}
                onChange={(e) => setImageDelta(e.target.value)}
                placeholder="Add image credits"
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => updateSession({ imageDelta: Number(imageDelta || 0) })}
                disabled={loading || !selectedSession}
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium hover:bg-secondary/60 disabled:opacity-60"
              >
                Apply
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={videoDelta}
                onChange={(e) => setVideoDelta(e.target.value)}
                placeholder="Add video credits"
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => updateSession({ videoDelta: Number(videoDelta || 0) })}
                disabled={loading || !selectedSession}
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium hover:bg-secondary/60 disabled:opacity-60"
              >
                Apply
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={imageRemaining}
                onChange={(e) => setImageRemaining(e.target.value)}
                placeholder="Set image remaining"
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => updateSession({ imageRemaining: Number(imageRemaining || 0) })}
                disabled={loading || !selectedSession}
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium hover:bg-secondary/60 disabled:opacity-60"
              >
                Set
              </button>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <input
                value={videoRemaining}
                onChange={(e) => setVideoRemaining(e.target.value)}
                placeholder="Set video remaining"
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => updateSession({ videoRemaining: Number(videoRemaining || 0) })}
                disabled={loading || !selectedSession}
                className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium hover:bg-secondary/60 disabled:opacity-60"
              >
                Set
              </button>
            </div>
          </div>

          {message ? <p className="mt-3 text-xs text-muted-foreground">{message}</p> : null}
        </section>
      </main>
    </div>
  )
}
