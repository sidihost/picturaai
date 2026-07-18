'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PicturaLogo } from '@/components/pictura/pictura-logo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return setMessage(data.error || 'Failed to login')
      router.push(data.role === 'staff' ? '/staff/dashboard' : '/admin')
    } catch {
      setMessage('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <PicturaLogo size="sm" />
          <Link href="/studio" className="text-xs text-muted-foreground hover:underline">Back to Studio</Link>
        </div>
        <h1 className="text-lg font-semibold">Admin / Staff Login</h1>
        <p className="text-xs text-muted-foreground mt-1">Use configured email and password credentials.</p>
        <div className="mt-4 grid gap-2">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="h-10 rounded-lg border border-border/60 bg-background px-3 text-sm" />
          <button disabled={loading} className="h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-70">{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
        {message ? <p className="mt-3 text-xs text-destructive">{message}</p> : null}
      </form>
    </main>
  )
}
