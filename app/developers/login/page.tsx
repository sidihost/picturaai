'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'

const LOGIN_EMAIL_KEY = 'pictura_login_email'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0) // Used to reset CAPTCHA
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if already logged in and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const localToken = localStorage.getItem('pictura_session')
        if (!localToken) {
          setCheckingAuth(false)
          return
        }

        const res = await fetch('/api/developers/auth/session', {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localToken}` }
        })
        const data = await res.json()

        if (data.authenticated && data.developer) {
          toast.success('Already logged in! Redirecting...')
          window.location.href = '/developers/dashboard'
          return
        }
      } catch {
        // Not authenticated, show login form
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])
  
  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(LOGIN_EMAIL_KEY)
    if (savedEmail) setEmail(savedEmail)
  }, [])
  
  // Auto-save email (not password)
  useEffect(() => {
    if (email) {
      localStorage.setItem(LOGIN_EMAIL_KEY, email)
    }
  }, [email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!captchaToken) {
      toast.error('Please verify you are not a robot')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          password,
          captchaToken 
        }),
      })

      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('pictura_session', data.token)
        localStorage.setItem('pictura_developer', JSON.stringify(data.developer))
        localStorage.removeItem(LOGIN_EMAIL_KEY)
        toast.success('Welcome back!')
        setTimeout(() => {
          window.location.href = '/developers/dashboard'
        }, 100)
      } else {
        toast.error(data.error || 'Login failed. Please try again.')
        // Reset CAPTCHA on failed login
        setCaptchaToken(null)
        setCaptchaKey(prev => prev + 1)
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="mx-auto max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-foreground mb-1.5">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your developer account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Smart CAPTCHA - resets on failed login */}
              <SmartCaptcha 
                key={captchaKey}
                onVerify={(token) => setCaptchaToken(token)} 
              />

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/developers/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
