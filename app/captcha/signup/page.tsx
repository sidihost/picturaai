'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check, ExternalLink, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { toast } from 'sonner'

export default function CaptchaSignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<'choose' | 'form' | 'success'>('choose')
  const [loading, setLoading] = useState(false)
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
        // Not authenticated, show signup form
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])
  const [siteKey, setSiteKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [copiedSite, setCopiedSite] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    siteName: '',
    domain: ''
  })

  const handlePicturaSignup = () => {
    // First check if user already has an account via verify flow
    router.push('/captcha/auth/verify?from=signup')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.siteName || !formData.domain) {
      toast.error('Please fill in all fields')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/captcha/create-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSiteKey(data.siteKey)
        setSecretKey(data.secretKey)
        setStep('success')
        toast.success('Site keys generated!')
      } else {
        toast.error(data.error || 'Failed to create site')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const copyKey = (key: string, type: 'site' | 'secret') => {
    navigator.clipboard.writeText(key)
    if (type === 'site') {
      setCopiedSite(true)
      setTimeout(() => setCopiedSite(false), 2000)
    } else {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
    toast.success('Copied!')
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
          className="w-full max-w-sm"
        >
          {step === 'choose' && (
            <>
              {/* Header - Centered */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">
                  Get Started with <span className="text-primary">CAPTCHA</span>
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Free forever, unlimited usage
                </p>
              </div>

              <div className="space-y-4">
                {/* Sign up with Pictura Button - Social login style */}
                <button
                  onClick={handlePicturaSignup}
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
                    <span className="bg-background px-3 text-muted-foreground">or get keys instantly</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('form')}
                  className="w-full h-12 rounded-xl border border-border bg-card hover:bg-muted/50 text-foreground font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Quick Setup (No Account)
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  Already have an account?{' '}
                  <Link href="/captcha/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}

          {step === 'form' && (
            <>
              <button
                onClick={() => setStep('choose')}
                className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1"
              >
                <ArrowRight className="h-3 w-3 rotate-180" />
                Back
              </button>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Quick Setup</h2>
                <p className="text-sm text-muted-foreground mt-1">Get your keys instantly</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Site name
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    placeholder="My Website"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="example.com"
                    className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Your keys will only work on this domain</p>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Generate Site Keys'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="text-center mb-8">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Your keys are ready!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Save these keys - the secret won't be shown again
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Site Key</span>
                    <span className="text-xs text-muted-foreground">Frontend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-primary bg-primary/5 px-3 py-2 rounded truncate">
                      {siteKey}
                    </code>
                    <button
                      onClick={() => copyKey(siteKey, 'site')}
                      className="h-8 w-8 flex items-center justify-center rounded border border-border hover:bg-muted"
                    >
                      {copiedSite ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
                
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Secret Key</span>
                    <span className="text-xs text-red-500">Keep private!</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs font-mono text-foreground bg-muted px-3 py-2 rounded truncate">
                      {secretKey}
                    </code>
                    <button
                      onClick={() => copyKey(secretKey, 'secret')}
                      className="h-8 w-8 flex items-center justify-center rounded border border-border hover:bg-muted"
                    >
                      {copiedSecret ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 space-y-3">
                <Link
                  href="/captcha/docs"
                  className="flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
                >
                  View Documentation
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => { setStep('choose'); setFormData({ email: '', siteName: '', domain: '' }) }}
                  className="w-full h-11 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted"
                >
                  Create Another Site
                </button>
              </div>
            </>
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
