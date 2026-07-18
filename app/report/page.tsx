'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2, AlertCircle, ThumbsDown, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'

const reportTypes = [
  { id: 'bug', label: 'Bug Report', icon: AlertCircle, desc: 'Something is not working' },
  { id: 'complaint', label: 'Complaint', icon: ThumbsDown, desc: 'Issue or problem' },
  { id: 'feedback', label: 'Feedback', icon: Lightbulb, desc: 'Suggestions or ideas' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
}

export default function ReportPage() {
  const [reportType, setReportType] = useState<'bug' | 'complaint' | 'feedback'>('bug')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [ticketId, setTicketId] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !subject.trim() || !description.trim()) {
      toast.error('Please fill in all fields.')
      return
    }

    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA verification.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/submit-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          type: reportType,
          subject,
          description,
          captchaToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setTicketId(data.ticketId)
        setSubmitted(true)
        toast.success('Report submitted! Check your email for confirmation.')
      } else {
        toast.error(data.error || 'Failed to submit report. Please try again.')
      }
    } catch (error) {
      console.error('Submission error:', error)
      toast.error('Failed to submit report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setTicketId('')
    setReportType('bug')
    setName('')
    setEmail('')
    setSubject('')
    setDescription('')
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Support</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Send us your feedback</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Help us improve Pictura by reporting bugs, sharing complaints, or suggesting features. We read every message and will get back to you via email.
            </p>
          </motion.div>

          <div className="my-10 h-px bg-border/50" />

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center rounded-2xl border border-border/50 bg-card px-6 py-14 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">Report Submitted!</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                We received your {reportType === 'bug' ? 'bug report' : reportType === 'complaint' ? 'complaint' : 'feedback'}. A confirmation email has been sent to <strong>{email}</strong>.
              </p>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 w-full max-w-xs">
                <p className="text-xs text-muted-foreground mb-1">Ticket Number</p>
                <p className="font-mono text-sm font-semibold text-primary">{ticketId}</p>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Keep this for reference when following up.
              </p>
              <button
                onClick={handleReset}
                className="mt-6 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Submit another report
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="flex flex-col gap-6"
            >
              {/* Report Type */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-foreground">Report Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {reportTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setReportType(type.id as 'bug' | 'complaint' | 'feedback')}
                      className={`group flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        reportType === type.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border/60 bg-card hover:border-border'
                      }`}
                    >
                      <type.icon className={`h-5 w-5 ${reportType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-semibold ${reportType === type.id ? 'text-primary' : 'text-muted-foreground'}`}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-2.5 block text-sm font-semibold text-foreground">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:bg-card/50"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2.5 block text-sm font-semibold text-foreground">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:bg-card/50"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                  We'll send you a confirmation and updates about your report.
                </p>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="mb-2.5 block text-sm font-semibold text-foreground">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your issue"
                  className="w-full rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:bg-card/50"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2.5 block text-sm font-semibold text-foreground">
                  Details
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about what happened or what you'd like to suggest..."
                  rows={5}
                  className="w-full resize-none rounded-lg border border-border/60 bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40 focus:bg-card/50"
                />
              </div>

              {/* PicturaCAPTCHA */}
              <div>
                <label className="mb-2.5 block text-sm font-semibold text-foreground">Security Check</label>
                <SmartCaptcha 
                  onVerify={(token) => setCaptchaToken(token)} 
                  siteKey="pictura-report"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </motion.form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
