'use client'

import { use, useState, useRef } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Upload, X, FileText, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const jobTitles: Record<string, { title: string; department: string }> = {
  'software-engineer': { title: 'Software Engineer', department: 'Engineering' },
  'data-analyst': { title: 'Data Analyst', department: 'Engineering' },
  'graphic-designer': { title: 'Graphic Designer', department: 'Design' },
  'video-animator': { title: 'Video Animator', department: 'Design' },
  'social-media-manager': { title: 'Social Media Manager', department: 'Growth' },
  'content-writer': { title: 'Content Writer', department: 'Content' },
  'partner-growth-manager': { title: 'Partner Growth Manager', department: 'Growth' },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const job = jobTitles[id]

  if (!job) {
    notFound()
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    experience: '',
    startDate: '',
    heardFrom: '',
    coverLetter: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'portfolio') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File must be less than 10MB')
        return
      }
      if (type === 'resume') {
        setResumeFile(file)
      } else {
        setPortfolioFile(file)
      }
    }
  }

  const removeFile = (type: 'resume' | 'portfolio') => {
    if (type === 'resume') {
      setResumeFile(null)
      if (resumeInputRef.current) resumeInputRef.current.value = ''
    } else {
      setPortfolioFile(null)
      if (portfolioInputRef.current) portfolioInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.location || !formData.experience || !resumeFile) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('jobId', id)
      submitData.append('jobTitle', job.title)
      submitData.append('department', job.department)
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      if (resumeFile) submitData.append('resume', resumeFile)
      if (portfolioFile) submitData.append('portfolioFile', portfolioFile)

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: submitData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit application')
      }

      setIsSuccess(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-lg px-6 pt-32 pb-20 sm:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Application Submitted
            </h1>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto leading-relaxed">
              Thank you for your interest in the <span className="font-medium text-foreground">{job.title}</span> position. We&apos;ve received your application and will review it carefully. Expect to hear from us within 5-7 business days.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/careers"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                View other positions
              </Link>
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Try Pictura Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-xl px-6 pt-32 pb-8 sm:pt-40 sm:pb-10">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Link
              href={`/careers/${id}`}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to job details
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <PicturaIcon size={32} />
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {job.department}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Apply for {job.title}
                </h1>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto max-w-xl px-6 py-10 sm:py-14">
        <motion.form
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="space-y-10"
        >
          {/* Personal Information */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-5">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                    First name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                    Last name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email address <span className="text-destructive">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  placeholder="+234 800 000 0000"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  placeholder="Lagos, Nigeria"
                />
              </div>
            </div>
          </section>

          {/* Online Presence */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-5">Online Presence</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  placeholder="https://linkedin.com/in/johndoe"
                />
              </div>

              <div>
                <label htmlFor="portfolio" className="block text-sm font-medium text-foreground mb-2">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </section>

          {/* Experience */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-5">Experience</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-foreground mb-2">
                  Years of relevant experience <span className="text-destructive">*</span>
                </label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-10">5-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
                  Earliest start date
                </label>
                <select
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                >
                  <option value="">Select availability</option>
                  <option value="Immediately">Immediately</option>
                  <option value="2 weeks">2 weeks notice</option>
                  <option value="1 month">1 month notice</option>
                  <option value="2 months">2 months notice</option>
                  <option value="3+ months">3+ months</option>
                </select>
              </div>

              <div>
                <label htmlFor="heardFrom" className="block text-sm font-medium text-foreground mb-2">
                  How did you hear about us?
                </label>
                <select
                  id="heardFrom"
                  name="heardFrom"
                  value={formData.heardFrom}
                  onChange={handleChange}
                  className="w-full h-11 px-4 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                >
                  <option value="">Select an option</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="Friend/Referral">Friend / Referral</option>
                  <option value="Job Board">Job Board</option>
                  <option value="Search Engine">Search Engine</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Documents */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-5">Documents</h2>
            <div className="space-y-4">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Resume / CV <span className="text-destructive">*</span>
                </label>
                {resumeFile ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('resume')}
                      className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => resumeInputRef.current?.click()}
                    className="w-full p-8 rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all text-center group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/15 transition-colors">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">Click to upload your resume</p>
                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                  </button>
                )}
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, 'resume')}
                  className="hidden"
                />
              </div>

              {/* Portfolio Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Portfolio / Work samples <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                {portfolioFile ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-secondary/30">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{portfolioFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(portfolioFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('portfolio')}
                      className="h-9 w-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => portfolioInputRef.current?.click()}
                    className="w-full p-5 rounded-xl border-2 border-dashed border-border/50 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all text-center"
                  >
                    <p className="text-sm text-muted-foreground">Click to upload work samples (PDF, DOC, ZIP)</p>
                  </button>
                )}
                <input
                  ref={portfolioInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  onChange={(e) => handleFileChange(e, 'portfolio')}
                  className="hidden"
                />
              </div>
            </div>
          </section>

          {/* Cover Letter */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-5">Cover Letter</h2>
            <div>
              <label htmlFor="coverLetter" className="block text-sm font-medium text-foreground mb-2">
                Tell us about yourself <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all resize-none leading-relaxed"
                placeholder="Share why you're interested in this role, what excites you about Pictura, and what unique perspective you'd bring to the team..."
              />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
            <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
              By submitting, you agree to our privacy policy and consent to Pictura processing your application data.
            </p>
          </div>
        </motion.form>
      </main>

      <Footer />
    </div>
  )
}
