'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Download, Copy, Check, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

type CardTemplate = 'clean' | 'minimal' | 'elegant' | 'bold'

const TEMPLATES: Record<CardTemplate, { name: string; titleSize: string; description: string }> = {
  clean: {
    name: 'Clean',
    titleSize: 'text-6xl md:text-7xl',
    description: 'Simple and refined',
  },
  minimal: {
    name: 'Minimal',
    titleSize: 'text-5xl md:text-6xl',
    description: 'Minimalist design',
  },
  elegant: {
    name: 'Elegant',
    titleSize: 'text-6xl md:text-7xl',
    description: 'Sophisticated style',
  },
  bold: {
    name: 'Bold',
    titleSize: 'text-7xl md:text-8xl',
    description: 'Strong presence',
  },
}

export function RamadanGenerator() {
  const [step, setStep] = useState<'template' | 'content' | 'preview'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('clean')
  const [contentType, setContentType] = useState<'greeting' | 'verse' | 'hadith' | 'custom'>('greeting')
  const [title, setTitle] = useState('Ramadan Kareem')
  const [subtitle, setSubtitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleGenerateContent = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ramadan/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, count: 1 }),
      })

      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      const content = Array.isArray(data.content) ? data.content[0]?.text || data.content[0] : data.content
      setSubtitle(content || '')
      toast.success('Content generated!')
    } catch {
      toast.error('Failed to generate content')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return

    try {
      setDownloaded(false)
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        logging: false,
        allowTaint: true,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `ramadan-card-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      setDownloaded(true)
      toast.success('Card downloaded!')
    } catch (err) {
      console.error(err)
      toast.error('Download failed')
    }
  }

  const cardContent = (
    <div
      ref={cardRef}
      className="w-full aspect-[5/7] bg-white flex flex-col items-center justify-center p-8 relative"
      style={{
        background: `linear-gradient(135deg, rgba(196, 121, 65, 0.02) 0%, rgba(196, 121, 65, 0.05) 100%)`,
      }}
    >
      {/* Pictura watermark */}
      <div className="absolute top-6 right-6 text-xs font-semibold tracking-widest text-primary/40">
        PICTURA
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-center">
          <h1 className={`${TEMPLATES[selectedTemplate].titleSize} font-bold text-primary leading-tight`}>
            {title}
          </h1>
        </div>

        {subtitle && (
          <div className="text-center max-w-xs">
            <p className="text-base md:text-lg leading-relaxed text-foreground/70">
              {subtitle}
            </p>
          </div>
        )}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-1 bg-primary/20" />
    </div>
  )

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-12">
        {['template', 'content', 'preview'].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <button
              onClick={() => setStep(s as any)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step === s
                  ? 'bg-primary text-white'
                  : 'bg-border text-foreground'
              }`}
            >
              {i + 1}
            </button>
            {i < 2 && (
              <div className={`flex-1 h-1 mx-2 ${step === s || (step === 'preview' && i < 1) ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {step === 'template' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">Choose Template</h2>
            <p className="text-muted-foreground">Select your card design</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(TEMPLATES) as [CardTemplate, any][]).map(([key, template]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTemplate(key)
                  setStep('content')
                }}
                className={`group relative p-6 rounded-xl border-2 transition-all ${
                  selectedTemplate === key
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="space-y-3">
                  <div className={`${template.titleSize.split(' ')[0]} font-bold text-primary line-clamp-2`}>
                    Ramadan
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 2: Content Customization */}
      {step === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">Customize Content</h2>
            <p className="text-muted-foreground">Add your message</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Panel */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none"
                  placeholder="Ramadan Kareem"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Subtitle or Message</label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card focus:border-primary focus:outline-none resize-none"
                  placeholder="Enter your message..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3">Generate Content</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['greeting', 'verse', 'hadith', 'custom'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setContentType(type)
                        if (type !== 'custom') handleGenerateContent()
                      }}
                      disabled={loading && contentType === type}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        loading && contentType === type
                          ? 'bg-primary/50 text-white'
                          : 'bg-primary/10 text-primary hover:bg-primary/20'
                      }`}
                    >
                      {type === 'greeting' && 'Greeting'}
                      {type === 'verse' && 'Verse'}
                      {type === 'hadith' && 'Hadith'}
                      {type === 'custom' && 'Custom'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center">
              {cardContent}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep('template')}
              className="px-6 py-2 rounded-lg border border-border hover:bg-muted"
            >
              Back
            </button>
            <button
              onClick={() => setStep('preview')}
              className="flex-1 px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              Preview <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Preview & Download */}
      {step === 'preview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-3xl font-bold mb-2">Preview & Download</h2>
            <p className="text-muted-foreground">Your beautiful Ramadan card is ready</p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="w-full lg:w-auto flex justify-center">
              {cardContent}
            </div>

            <div className="space-y-4 w-full lg:w-auto">
              <button
                onClick={handleDownload}
                disabled={loading}
                className="w-full lg:w-64 py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
              >
                {downloaded ? (
                  <>
                    <Check className="w-5 h-5" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Card
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`I created this beautiful Ramadan card with Pictura! 🌙 ramadan.pictura.app`)
                  toast.success('Copied to clipboard')
                }}
                className="w-full lg:w-64 py-3 px-6 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 flex items-center justify-center gap-2"
              >
                <Copy className="w-5 h-5" />
                Share
              </button>

              <button
                onClick={() => setStep('content')}
                className="w-full lg:w-64 py-3 px-6 rounded-lg border border-border hover:bg-muted"
              >
                Edit
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
