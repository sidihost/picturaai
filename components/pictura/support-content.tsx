'use client'

import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'
import { motion } from 'framer-motion'
import { Heart, Coffee, Rocket, Star, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const supportTiers = [
  {
    icon: Coffee,
    title: 'Coffee',
    amount: 1000,
    description: 'Support the dev team with a coffee',
  },
  {
    icon: Heart,
    title: 'Supporter',
    amount: 5000,
    description: 'Help us keep the servers running',
  },
  {
    icon: Rocket,
    title: 'Booster',
    amount: 10000,
    description: 'Help us build faster and better',
  },
  {
    icon: Star,
    title: 'Champion',
    amount: 25000,
    description: 'Become a founding supporter',
  },
]

export function SupportContent() {
  const [loading, setLoading] = useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    if (status === 'success') {
      setPaymentStatus('success')
    } else if (status === 'cancelled') {
      setPaymentStatus('cancelled')
    }
  }, [searchParams])

  const clearStatus = () => {
    setPaymentStatus(null)
    window.history.replaceState({}, '', '/support')
  }

  const openDonateModal = (amount: number) => {
    setSelectedAmount(amount)
    setShowModal(true)
  }

  const handleDonate = async () => {
    if (!selectedAmount) return
    if (selectedAmount < 1000) {
      alert('Minimum donation is ₦1000. Please select a higher tier.')
      return
    }
    if (!donorEmail.trim()) {
      alert('Please enter your email address')
      return
    }
    if (!captchaToken) {
      alert('Please verify you are not a robot')
      return
    }

    setLoading(selectedAmount)
    try {
      const response = await fetch('/api/donate/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedAmount,
          name: donorName.trim() || 'Pictura Supporter',
          email: donorEmail.trim(),
          captchaToken,
        }),
      })

      const data = await response.json()
      if (data.success && data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      } else {
        alert(data.error || 'Payment initialization failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
      setShowModal(false)
      setCaptchaToken(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Support</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground">Help Us Grow</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Pictura is free and always will be. Your support helps us improve features, scale infrastructure, and build amazing tools for creators worldwide.
            </p>
          </motion.div>

          {paymentStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-6 rounded-xl border border-primary/30 bg-primary/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground text-lg">Thank you for your support!</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Your generous contribution helps us build better tools for creators worldwide. A confirmation email has been sent to you.</p>
                </div>
                <button onClick={clearStatus} className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </motion.div>
          )}

          {paymentStatus === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <p className="font-semibold text-foreground text-lg">Payment Cancelled</p>
                  </div>
                  <p className="text-sm text-muted-foreground">No worries! Your payment was cancelled. You can try again anytime or explore other ways to support us below.</p>
                </div>
                <button onClick={clearStatus} className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {supportTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group rounded-xl border border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 hover:bg-card/60 transition-all overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-primary/80 to-primary" />
                <div className="p-6">
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <tier.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{tier.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">&#8358;{tier.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mb-4">{tier.description}</p>
                  <button
                    onClick={() => openDonateModal(tier.amount)}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                  >
                    Donate
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border/50 bg-card/40 p-8 md:p-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">What We Use Your Support For</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Better AI Models</h3>
                <p className="text-sm text-muted-foreground">Upgrading to more powerful AI models for better image quality and faster generation.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Server Infrastructure</h3>
                <p className="text-sm text-muted-foreground">Scaling our servers to handle more users and provide faster, more reliable service.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">New Features</h3>
                <p className="text-sm text-muted-foreground">Building exciting new tools and capabilities based on community feedback.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Team Growth</h3>
                <p className="text-sm text-muted-foreground">Hiring talented developers and designers to accelerate our roadmap.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mt-12 p-8 rounded-xl border border-primary/20 bg-primary/5 text-center"
          >
            <h3 className="text-xl font-semibold text-foreground mb-3">Donations Available in Nigeria</h3>
            <p className="text-muted-foreground mb-4">
              We currently accept donations from Nigerian supporters. Minimum donation is ₦1000. Other ways to help:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Sharing Pictura with friends and family</li>
              <li>Leaving feedback and suggestions</li>
              <li>Reporting bugs to help us improve</li>
              <li>Following us on social media</li>
            </ul>
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Donation Modal */}
      {showModal && selectedAmount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 z-10"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Complete Your Donation</h3>
              <p className="text-2xl font-bold text-primary mt-2">&#8358;{selectedAmount.toLocaleString()}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Your Name <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary/50 placeholder:text-muted-foreground/50"
                />
                <p className="text-xs text-muted-foreground mt-1.5">We'll send your receipt to this email</p>
              </div>

              {/* PicturaCAPTCHA */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Security Check <span className="text-destructive">*</span>
                </label>
                <SmartCaptcha 
                  onVerify={(token) => setCaptchaToken(token)} 
                  siteKey="pictura-donate"
                />
              </div>
            </div>

            <button
              onClick={handleDonate}
              disabled={loading === selectedAmount || !donorEmail.trim() || !captchaToken}
              className="w-full mt-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading === selectedAmount ? (
                'Redirecting to payment...'
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Proceed to Payment
                </>
              )}
            </button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Secure payment powered by Paystack
            </p>
          </motion.div>
        </div>
      )}
    </>
  )
}
