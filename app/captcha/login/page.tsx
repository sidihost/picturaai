'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'
import { toast } from 'sonner'

export default function CaptchaLoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'choose' | 'email'>('choose')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [captchaKey, setCaptchaKey] = useState(0)
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
          window.location.href = '/captcha/dashboard'
          return
        }
      } catch {
        // Not authenticated, show login form
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])

  const handlePicturaLogin = () => {
    // Redirect to verification flow which checks for existing account
    router.push('/captcha/auth/verify?from=login')
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaVerified) {
      toast.error('Please complete the CAPTCHA')
      return
    }

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok && data.token) {
        // Store session for fallback
        localStorage.setItem('pictura_session', data.token)
        localStorage.setItem('pictura_developer', JSON.stringify(data.developer))
        toast.success('Welcome back!')
        // Small delay then redirect
        setTimeout(() => {
          window.location.href = '/captcha/dashboard'
        }, 100)
      } else {
        toast.error(data.error || 'Invalid credentials')
        // Reset CAPTCHA on failed login
        setCaptchaVerified(false)
        setCaptchaKey(prev => prev + 1)
      }
    } catch {
      toast.error('Something went wrong')
      setCaptchaVerified(false)
      setCaptchaKey(prev => prev + 1)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Header - Centered */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Sign in to <span className="text-primary">CAPTCHA</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your sites and view analytics
            </p>
          </div>

          {mode === 'choose' ? (
            <div className="space-y-4">
              {/* Sign in with Pictura Button - Social login style */}
              <button
                onClick={handlePicturaLogin}
                className="w-full h-12 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-foreground font-medium flex items-center justify-center gap-3 transition-colors"
              >
                <PicturaIcon size={20} />
                <span>Continue with <span className="text-primary font-semibold">Pictura</span></span>
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-background px-3 text-muted-foreground">or</span>
                </div>
              </div>

              <button
                onClick={() => setMode('email')}
                className="w-full h-12 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium flex items-center justify-center gap-2 transition-colors"
              >
                Continue with Email
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-xs text-center text-muted-foreground mt-6">
                Don't have an account?{' '}
                <Link href="/developers/signup" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
            </div>
          ) : (
            <div>
              <button
                onClick={() => setMode('choose')}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
              >
                <ArrowRight className="h-3 w-3 rotate-180" />
                Back
              </button>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="pt-2">
                  <SmartCaptcha 
                    key={captchaKey}
                    onVerify={() => setCaptchaVerified(true)} 
                    size="compact"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !captchaVerified}
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          )}

          <Link 
            href="/captcha" 
            className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors mt-6"
          >
            Back to PicturaCAPTCHA
          </Link>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  )
}
