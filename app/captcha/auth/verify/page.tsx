'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, UserPlus, LogIn, Shield, Mail, User } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type VerifyStatus = 'checking' | 'approval' | 'syncing' | 'success' | 'no-account' | 'error'

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || 'login'
  
  const [status, setStatus] = useState<VerifyStatus>('checking')
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [developerId, setDeveloperId] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isApproving, setIsApproving] = useState(false)

  useEffect(() => {
    const checkAccount = async () => {
      try {
        setStatus('checking')
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const localToken = localStorage.getItem('pictura_session')
        const headers: HeadersInit = {}
        if (localToken) {
          headers['Authorization'] = `Bearer ${localToken}`
        }
        
        const sessionRes = await fetch('/api/developers/auth/session', {
          credentials: 'include',
          headers
        })
        const sessionData = await sessionRes.json()

        if (!sessionData.authenticated || !sessionData.developer) {
          setStatus('no-account')
          return
        }

        // Account found - show approval screen
        setUserName(sessionData.developer.name || '')
        setUserEmail(sessionData.developer.email || '')
        setDeveloperId(sessionData.developer.id || sessionData.developer.developer_id)
        setStatus('approval')

      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage('Something went wrong. Please try again.')
      }
    }

    checkAccount()
  }, [])

  const handleApprove = async () => {
    if (!developerId) return
    
    setIsApproving(true)
    try {
      setStatus('syncing')
      
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (localToken) {
        headers['Authorization'] = `Bearer ${localToken}`
      }
      
      const syncRes = await fetch('/api/captcha/auth/sync', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ developerId })
      })

      if (!syncRes.ok) {
        throw new Error('Failed to link account')
      }

      await new Promise(resolve => setTimeout(resolve, 800))
      
      setStatus('success')
      await new Promise(resolve => setTimeout(resolve, 1200))
      window.location.href = '/captcha/dashboard'

    } catch (error) {
      console.error('Linking error:', error)
      setStatus('error')
      setErrorMessage('Failed to link your account. Please try again.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleDecline = () => {
    router.push('/captcha')
  }

  const handleNoAccount = () => {
    if (from === 'signup') {
      router.push('/developers/signup?redirect=/captcha/auth/verify')
    } else {
      router.push('/captcha/login')
    }
  }

  const getStatusContent = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-spin" />,
          title: 'Checking Account',
          subtitle: 'Looking for your Pictura developer account...'
        }
      case 'approval':
        return {
          icon: <PicturaIcon size={24} />,
          title: 'Link Your Account',
          subtitle: 'Approve access to use PicturaCAPTCHA'
        }
      case 'syncing':
        return {
          icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" />,
          title: 'Linking Account',
          subtitle: 'Setting up your CAPTCHA dashboard...'
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#C87941]" />,
          title: 'Successfully Linked!',
          subtitle: 'Welcome email sent. Redirecting...'
        }
      case 'no-account':
        return {
          icon: <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />,
          title: 'No Account Found',
          subtitle: 'We couldn\'t find a Pictura developer account'
        }
      case 'error':
        return {
          icon: <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />,
          title: 'Linking Failed',
          subtitle: errorMessage
        }
    }
  }

  const content = getStatusContent()
  const progressSteps = ['checking', 'approval', 'syncing', 'success']
  const currentIndex = progressSteps.indexOf(status)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px] sm:max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="h-12 w-12 sm:h-14 sm:w-14 mx-auto rounded-xl bg-muted/50 flex items-center justify-center mb-4 sm:mb-5">
                  {content.icon}
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                  {content.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
                  {content.subtitle}
                </p>

                {/* Approval Screen with User Info */}
                {status === 'approval' && userEmail && (
                  <div className="space-y-4">
                    {/* User Card */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#C87941]/10 to-[#C87941]/5 border border-[#C87941]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#C87941] text-white flex items-center justify-center text-sm font-semibold">
                          {userName?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{userName || 'Developer'}</p>
                          <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#C87941]/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Shield className="h-3.5 w-3.5 text-[#C87941]" />
                          <span>Access to PicturaCAPTCHA dashboard</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 text-[#C87941]" />
                          <span>Welcome email will be sent</span>
                        </div>
                      </div>
                    </div>

                    {/* Approval Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="w-full h-10 sm:h-11 rounded-xl bg-[#C87941] text-white text-sm font-medium hover:bg-[#B86D35] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isApproving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Approve & Continue
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDecline}
                        disabled={isApproving}
                        className="w-full h-10 sm:h-11 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Progress indicator for loading states */}
                {currentIndex >= 0 && status !== 'no-account' && status !== 'error' && status !== 'approval' && (
                  <div className="flex justify-center gap-1.5 mb-2">
                    {progressSteps.map((step, i) => (
                      <div
                        key={step}
                        className={`h-1 w-6 sm:w-8 rounded-full transition-colors ${
                          currentIndex >= i ? 'bg-[#C87941]' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* No Account Actions */}
                {status === 'no-account' && (
                  <div className="space-y-3 mt-5 sm:mt-6">
                    <button
                      onClick={() => router.push('/developers/signup?redirect=/captcha/auth/verify')}
                      className="w-full h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Free Account
                    </button>
                    <button
                      onClick={() => router.push('/developers/login?redirect=/captcha/auth/verify')}
                      className="w-full h-10 sm:h-11 rounded-xl border-2 border-primary/20 bg-primary/5 text-foreground text-sm font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In Instead
                    </button>
                    <button
                      onClick={handleNoAccount}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
                    >
                      Back to {from === 'signup' ? 'signup' : 'login'}
                    </button>
                  </div>
                )}

                {/* Error Actions */}
                {status === 'error' && (
                  <div className="space-y-3 mt-5 sm:mt-6">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push('/captcha')}
                      className="w-full h-10 sm:h-11 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      Back to CAPTCHA
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] sm:text-xs text-muted-foreground mt-4">
            <span className="text-primary">Pictura</span>CAPTCHA is free forever
          </p>
        </motion.div>
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function VerifyLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-xs sm:max-w-sm text-center">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4">
            <PicturaIcon size={24} className="text-primary-foreground" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Loading...</p>
        </div>
      </div>
    </div>
  )
}

export default function CaptchaAuthVerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  )
}
