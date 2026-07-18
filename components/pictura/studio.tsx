'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImageIcon, X, Download, ZoomIn,
  Upload, Loader2, ArrowRight, Info,
  Grid3X3, ChevronLeft,
  ChevronDown, Check, Wand2, RefreshCw, Pencil, Clapperboard, ThumbsUp, ThumbsDown, Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { PicturaIcon, PicturaLogo } from './pictura-logo'
import { DownloadModal } from './download-modal'
import { VideoDownloadModal } from './video-download-modal'
import { AIImageEditor } from './ai-image-editor'
import { playSuccessSound, playLimitSound } from '@/lib/sounds'
import type { GeneratedMedia, RateLimitInfo } from '@/lib/types'

type Mode = 'text' | 'image' | 'video'
type Feedback = 'up' | 'down' | null
type PendingFeedback = { url: string; type: Exclude<Feedback, null> } | null
type PendingGeneration = {
  requestId: string
  mode: Mode
  prompt: string
  startedAt: string
}

const PENDING_GENERATION_KEY = 'pictura_pending_generation'
const UNLIMITED_THRESHOLD = 900000


const VIDEO_LOADING_HINTS = [
  'Analyzing your prompt and setting the scene...',
  'Generating initial frames and establishing motion...',
  'Adding cinematic motion and camera movement...',
  'Enhancing visual quality and color grading...',
  'Refining details and scene continuity...',
  'Final rendering in progress — almost there...',
]
const TOUR_STEPS = [
  {
    title: 'Welcome to Pictura Studio',
    description: 'Create stunning AI-generated images in seconds. Let us give you a quick tour!',
    target: 'hero',
  },
  {
    title: 'Choose Your Model',
    description: 'Tap here to switch models. Try our new pi-1.5-turbo for faster, higher quality results!',
    target: 'model',
  },
  {
    title: 'Your Daily Credits',
    description: 'Image generation is unlimited. This shows your active generation availability.',
    target: 'credits',
  },
  {
    title: 'Type Your Prompt',
    description: 'Describe what you want to create. Be specific! Example: "A sunset over mountains with a lake reflection"',
    target: 'prompt',
  },
  {
    title: 'Switch Generation Mode',
    description: 'Use "Text to Image" to create from scratch, or "Image to Image" to transform an existing photo.',
    target: 'mode-tabs',
  },
  {
    title: 'Try Prompt Ideas',
    description: 'Stuck? Tap any suggestion to use it as your prompt. Great for inspiration!',
    target: 'suggestions',
  },
  {
    title: 'Video Result Area',
    description: 'When you use Text to Video, your generated video appears here in the same result feed.',
    target: 'video-result',
  },
  {
    title: 'Your Gallery',
    description: 'All your generated images appear here. Tap to view, download, or rate them.',
    target: 'gallery',
  },
  {
    title: 'AI Image Editor',
    description: 'Click "Edit" on any image to open our powerful AI editor. Remove backgrounds, enhance quality, or describe any change you want!',
    target: 'gallery',
  },
]

const MODELS = [
  { id: 'pi-1.0', name: 'Pictura pi-1.0', status: 'active' as const, description: 'General purpose image generation' },
  { id: 'pi-1.5-turbo', name: 'Pictura pi-1.5 Turbo', status: 'active' as const, description: 'Faster, higher quality output' },
  { id: 'picturagen', name: 'PicturaGen', status: 'beta' as const, description: 'Our AI video model for cinematic Text to Video generation.' },
  { id: 'pi-2.0', name: 'Pictura pi-2.0', status: 'coming' as const, description: 'Next-gen architecture' },
]



/* Custom Send Icon - clean arrow in circle */
function SendIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 12h12M13 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VideoSendIcon({ className = '' }: { className?: string }) {
  return <Clapperboard className={className} />
}

/* ---- Tour Overlay: highlights real elements with positioned tooltip ---- */
function TourOverlay({
  step, steps, onNext, onSkip,
}: {
  step: number
  steps: typeof TOUR_STEPS
  onNext: () => void
  onSkip: () => void
}) {
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const [winSize, setWinSize] = useState({ w: 0, h: 0 })
  const current = steps[step]

  useEffect(() => {
    setWinSize({ w: window.innerWidth, h: window.innerHeight })
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (current.target === 'hero') { setRect(null); return }
    // Small delay to let DOM settle after mount animations
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-tour="${current.target}"]`)
      if (!el) { setRect(null); return }
      const r = el.getBoundingClientRect()
      setRect({ x: r.left, y: r.top, w: r.width, h: r.height })
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 150)
    return () => clearTimeout(timer)
  }, [step, current.target])

  const isMobile = winSize.w < 640
  const pad = 8
  // Position tooltip below or above target
  const showBelow = rect ? rect.y < winSize.h / 2 : true

  // Tooltip position - position near the highlighted element
  let tooltipStyle: React.CSSProperties
  if (!rect) {
    // No target - center on screen for hero step
    tooltipStyle = isMobile 
      ? { left: '1rem', right: '1rem', top: '30%' }
      : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  } else if (isMobile) {
    // Mobile: position above or below the element based on its position
    if (showBelow) {
      tooltipStyle = { left: '0.75rem', right: '0.75rem', top: rect.y + rect.h + pad + 16 }
    } else {
      tooltipStyle = { left: '0.75rem', right: '0.75rem', bottom: winSize.h - rect.y + pad + 16 }
    }
  } else {
    const tooltipW = 320
    const left = Math.min(Math.max(rect.x, 12), winSize.w - tooltipW - 12)
    tooltipStyle = showBelow
      ? { left, top: rect.y + rect.h + pad + 12 }
      : { left, bottom: winSize.h - rect.y + pad + 12 }
  }

  return (
    <motion.div
      key="tour-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70]"
      onClick={onSkip}
    >
      {/* SVG backdrop with cutout hole */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.x - pad}
                y={rect.y - pad}
                width={rect.w + pad * 2}
                height={rect.h + pad * 2}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#tour-mask)" />
      </svg>

      {/* Highlight ring around target */}
      {rect && (
        <motion.div
          layoutId="tour-ring"
          className="absolute z-[1] rounded-xl ring-2 ring-primary/80"
          style={{
            left: rect.x - pad,
            top: rect.y - pad,
            width: rect.w + pad * 2,
            height: rect.h + pad * 2,
            pointerEvents: 'none',
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        />
      )}

      {/* Tooltip card */}
      <motion.div
        key={`tour-${step}`}
        initial={{ opacity: 0, y: showBelow ? -10 : 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: showBelow ? -10 : 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350, delay: 0.1 }}
        className="absolute z-10 w-80 max-w-[calc(100%-1.5rem)] rounded-2xl border border-border/40 bg-background p-5 shadow-xl"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Arrow pointer */}
        {rect && (
          <div 
            className={`absolute h-3 w-3 rotate-45 border-border/40 bg-background ${
              showBelow 
                ? '-top-1.5 border-l border-t' 
                : '-bottom-1.5 border-b border-r'
            }`}
            style={{ 
              left: isMobile 
                ? Math.min(Math.max(rect.x + rect.w / 2 - 12, 24), winSize.w - 48)
                : Math.min(Math.max(rect.x + rect.w / 2 - (tooltipStyle.left as number || 0) - 6, 24), 280)
            }}
          />
        )}
        {/* Progress dots */}
        <div className="mb-4 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-5 bg-primary' : i < step ? 'w-1 bg-primary/40' : 'w-1 bg-border'
              }`}
            />
          ))}
        </div>

        <h3 className="text-sm font-bold text-foreground">{current.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{current.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/40">{step + 1}/{steps.length}</span>
            <button
              onClick={onNext}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const PROMPT_EXAMPLES = [
  'A serene Japanese garden at dawn with cherry blossoms falling',
  'Futuristic cyberpunk cityscape with neon lights reflecting on wet streets',
  'A cozy cabin in a snowy forest with warm light glowing from the windows',
  'An astronaut floating above Earth during a vibrant aurora borealis',
  'Watercolor painting of a Venice canal at sunset with gondolas',
  'A majestic dragon perched on a crystal mountain peak at twilight',
  'African savanna at golden hour with elephants silhouetted against the sky',
  'An underwater coral reef teeming with colorful tropical fish',
  'A steampunk inventor\'s workshop filled with brass gears and gadgets',
  'Misty mountain temple in ancient China surrounded by bamboo forests',
  'A whimsical treehouse village connected by rope bridges at sunset',
  'Portrait of a warrior queen in ornate golden armor, oil painting style',
  'A bustling Lagos market street with vibrant colors and energy',
  'Northern lights dancing over a frozen lake in Iceland',
  'A magical library with floating books and glowing shelves',
]

const IMG2IMG_EXAMPLES = [
  'Transform into a watercolor painting style',
  'Make it look like a Studio Ghibli animation',
  'Add a dramatic sunset sky in the background',
  'Convert to a pencil sketch with fine details',
  'Apply a cyberpunk neon aesthetic',
  'Transform into an oil painting by Monet',
  'Make it look like a vintage 1970s photograph',
  'Add snow and winter atmosphere',
]

const VIDEO_EXAMPLES = [
  'A cinematic drone shot of Lagos skyline at sunset, 6 seconds',
  'A claymation fox running through a snowy forest, 5 seconds',
  'Product showcase turntable animation of a sneaker, studio lighting',
  'Aerial view of neon cyberpunk city with rain, 8 seconds',
]


const VIDEO_EXAMPLES_BY_REGION: Record<string, string[]> = {
  NG: [
    'Cinematic aerial of Lagos Third Mainland Bridge at sunset, smooth camera move',
    'Bustling Abuja street market in golden hour, natural motion and color',
  ],
  US: [
    'Downtown skyline time-lapse feel with cinematic motion and warm sunset tones',
    'Cozy New York coffee shop scene with shallow depth and ambient movement',
  ],
  GB: [
    'Rainy London street at night with neon reflections and slow dolly movement',
    'Aerial sweep over historic architecture at blue hour with cinematic grading',
  ],
  IN: [
    'Colorful Jaipur street scene with lively motion and warm cinematic light',
    'Mumbai seafront evening atmosphere with gentle camera drift and crowd motion',
  ],
  CA: [
    'Toronto skyline twilight shot with smooth drone movement and soft haze',
    'Rocky mountain lake panorama with drifting clouds and cinematic color',
  ],
}

const IMAGE_EXAMPLES_BY_REGION: Record<string, string[]> = {
  NG: [
    'A vibrant Lagos street fashion portrait at golden hour with rich skin tones and cinematic depth',
    'A serene waterfront morning in Lekki with soft mist, palm trees, and realistic lighting',
  ],
  US: [
    'A cinematic portrait in downtown Manhattan at blue hour with neon reflections',
    'A warm desert road-trip scene in Arizona with dramatic sunset light and dust particles',
  ],
  GB: [
    'A rainy London alley at night with reflections, umbrellas, and moody film lighting',
    'A cozy countryside cottage in the Cotswolds at sunrise with soft fog and detailed textures',
  ],
  IN: [
    'A colorful Jaipur palace courtyard at sunrise with intricate architecture and flowing fabrics',
    'A bustling Mumbai evening street with cinematic bokeh lights and realistic atmosphere',
  ],
  CA: [
    'A peaceful Banff mountain lake with pine forests, mirror reflections, and crisp morning light',
    'A cozy Toronto winter street scene with warm storefront lights and light snowfall',
  ],
}

function getRegionCodeFromLocale(locale?: string): string {
  if (!locale) return 'GLOBAL'
  const normalized = locale.replace('_', '-')
  const parts = normalized.split('-')
  if (parts.length >= 2) return parts[1].toUpperCase()
  return 'GLOBAL'
}

function pickUniquePrompts(prompts: string[], count: number): string[] {
  const pool = [...new Set(prompts)]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}

function getPromptExamplesForMode(mode: Mode, imageExamples: string[], videoExamples: string[]): string[] {
  if (mode === 'text') return imageExamples
  if (mode === 'image') return IMG2IMG_EXAMPLES
  return videoExamples
}


function dedupeMedia(items: GeneratedMedia[]): GeneratedMedia[] {
  const seen = new Set<string>()
  const unique: GeneratedMedia[] = []

  for (const item of items) {
    const key = `${item.type}|${item.url}|${item.prompt.trim()}|${item.requestId || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(item)
  }

  return unique
}

export function Studio() {
  const [mode, setMode] = useState<Mode>('text')
  const [prompt, setPrompt] = useState('')
  const [imagePrompt, setImagePrompt] = useState('')
  const [videoPrompt, setVideoPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeGenerationMode, setActiveGenerationMode] = useState<Mode | null>(null)
  const [loadingPrompt, setLoadingPrompt] = useState('')
  const [pendingGeneration, setPendingGeneration] = useState<PendingGeneration | null>(null)
  const [images, setImages] = useState<GeneratedMedia[]>([])
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>({ limit: 999999, remaining: 999999, used: 0, resetAt: '' })
  const [videoRateLimit, setVideoRateLimit] = useState<RateLimitInfo>({ limit: 2, remaining: 2, used: 0, resetAt: '' })
  const [lightbox, setLightbox] = useState<GeneratedMedia | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [feedbackMap, setFeedbackMap] = useState<Record<string, Feedback>>({})
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback>(null)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [showExhausted, setShowExhausted] = useState(false)
  const [tourStep, setTourStep] = useState(-1) // -1 = not showing
  const [selectedModel, setSelectedModel] = useState('pi-1.0')
  const [modelOpen, setModelOpen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(8)
  const [isPoorNetwork, setIsPoorNetwork] = useState(false)

  // auto-switch model with mode
  useEffect(() => {
    if (mode === 'video' && selectedModel !== 'picturagen') {
      setSelectedModel('picturagen')
      return
    }

    if (mode !== 'video' && selectedModel === 'picturagen') {
      setSelectedModel('pi-1.5-turbo')
    }
  }, [mode, selectedModel])

  // Switch prompt based on mode
  const currentPrompt = mode === 'video' ? videoPrompt : mode === 'image' ? imagePrompt : prompt
  const setCurrentPrompt = (value: string) => {
    if (mode === 'video') {
      setVideoPrompt(value)
    } else if (mode === 'image') {
      setImagePrompt(value)
    } else {
      setPrompt(value)
    }
  }

  // Update the textarea input to use currentPrompt
  const handlePromptChange = (value: string) => {
    setCurrentPrompt(value)
  }

  // Update setPrompt calls to use setCurrentPrompt for suggestions
  const handleSetPrompt = (value: string) => {
    setCurrentPrompt(value)
  }

  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [improving, setImproving] = useState(false)
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [downloadImage, setDownloadImage] = useState<GeneratedMedia | null>(null)
  const [videoDownloadModalOpen, setVideoDownloadModalOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorImage, setEditorImage] = useState<string | null>(null)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [videoLoadingHintIndex, setVideoLoadingHintIndex] = useState(0)
  const [videoExamples, setVideoExamples] = useState<string[]>(VIDEO_EXAMPLES)
  const [visibleVideoExamples, setVisibleVideoExamples] = useState<string[]>(VIDEO_EXAMPLES.slice(0, 3))
  const [imageExamples, setImageExamples] = useState<string[]>(PROMPT_EXAMPLES)
  const [visibleImageExamples, setVisibleImageExamples] = useState<string[]>(PROMPT_EXAMPLES.slice(0, 3))
  const [ratingPromptOpen, setRatingPromptOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  const completeLoadingAndSettle = useCallback(async () => {
    setLoadingProgress(100)
    await new Promise((resolve) => setTimeout(resolve, 350))
  }, [])

  const clientFingerprint = useMemo(() => {
    if (typeof window === 'undefined') return ''

    const raw = [
      window.navigator.userAgent,
      window.navigator.language,
      window.navigator.platform,
      String(window.navigator.hardwareConcurrency || 0),
      String(window.navigator.maxTouchPoints || 0),
    ].join('|')

    let hash = 0
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i)
      hash |= 0
    }
    return `fp-${Math.abs(hash)}`
  }, [])

  const buildAuthHeaders = useCallback((headers?: HeadersInit) => {
    const nextHeaders = new Headers(headers || {})
    if (clientFingerprint) {
      nextHeaders.set('x-client-fingerprint', clientFingerprint)
    }
    return nextHeaders
  }, [clientFingerprint])

  useEffect(() => {
    if (!(loading && activeGenerationMode === 'video')) return
    setVideoLoadingHintIndex(0)
    const interval = setInterval(() => {
      setVideoLoadingHintIndex((prev) => (prev + 1) % VIDEO_LOADING_HINTS.length)
    }, 1600)
    return () => clearInterval(interval)
  }, [loading, activeGenerationMode])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const connection = (
      navigator as Navigator & {
        connection?: { effectiveType?: string; downlink?: number; addEventListener?: (type: string, listener: () => void) => void; removeEventListener?: (type: string, listener: () => void) => void }
      }
    ).connection

    if (!connection) return

    const syncNetworkQuality = () => {
      const type = connection.effectiveType || ''
      const poor = type === 'slow-2g' || type === '2g' || (typeof connection.downlink === 'number' && connection.downlink < 1)
      setIsPoorNetwork(poor)
    }

    syncNetworkQuality()
    connection.addEventListener?.('change', syncNetworkQuality)
    return () => connection.removeEventListener?.('change', syncNetworkQuality)
  }, [])


  useEffect(() => {
    if (!loading || !pendingGeneration) {
      setLoadingProgress(18)
      return
    }

    const ttlMs = pendingGeneration.mode === 'video' ? 12 * 60_000 : 3 * 60_000

    const syncProgress = () => {
      const elapsed = Date.now() - new Date(pendingGeneration.startedAt).getTime()
      const normalized = Math.max(0, Math.min(1, elapsed / ttlMs))
      const progress = pendingGeneration.mode === 'video'
        ? Math.min(96, Math.max(24, Math.round(24 + (1 - Math.exp(-normalized * 5.6)) * 72)))
        : Math.min(96, Math.max(24, Math.round(24 + (1 - Math.exp(-normalized * 4.8)) * 72)))
      setLoadingProgress(progress)
    }

    syncProgress()
    const interval = setInterval(syncProgress, 1000)
    return () => clearInterval(interval)
  }, [loading, pendingGeneration])

  useEffect(() => {
    const locale = typeof navigator !== 'undefined' ? navigator.language : undefined
    const region = getRegionCodeFromLocale(locale)

    const regionalVideo = VIDEO_EXAMPLES_BY_REGION[region] || []
    const mergedVideo = [...regionalVideo, ...VIDEO_EXAMPLES]
    setVideoExamples(mergedVideo)
    setVisibleVideoExamples(pickUniquePrompts(mergedVideo, 3))

    const regionalImage = IMAGE_EXAMPLES_BY_REGION[region] || []
    const mergedImage = [...regionalImage, ...PROMPT_EXAMPLES]
    setImageExamples(mergedImage)
    setVisibleImageExamples(pickUniquePrompts(mergedImage, 3))
  }, [])

  useEffect(() => {
    if (mode !== 'video') return
    const interval = setInterval(() => {
      setVisibleVideoExamples(pickUniquePrompts(videoExamples, 3))
    }, 5500)
    return () => clearInterval(interval)
  }, [mode, imageExamples, videoExamples])

  useEffect(() => {
    if (mode !== 'text') return
    const interval = setInterval(() => {
      setVisibleImageExamples(pickUniquePrompts(imageExamples, 3))
    }, 5500)
    return () => clearInterval(interval)
  }, [mode, imageExamples])

  const activePromptExamples = useMemo(
    () => getPromptExamplesForMode(mode, imageExamples, videoExamples),
    [mode, imageExamples, videoExamples],
  )

  const pickNextPlaceholderIndex = useCallback((prev: number) => {
    const total = activePromptExamples.length
    if (total <= 1) return 0

    let next = prev
    while (next === prev) {
      next = Math.floor(Math.random() * total)
    }
    return next
  }, [activePromptExamples])

  // Rotate prompt suggestions every 4s when input is empty
  useEffect(() => {
    if (prompt) return

    const interval = setInterval(() => {
      setPlaceholderIdx((prev) => pickNextPlaceholderIndex(prev))
    }, 4000)

    return () => clearInterval(interval)
  }, [currentPrompt, pickNextPlaceholderIndex])

  useEffect(() => {
    const total = activePromptExamples.length
    if (total === 0) return
    setPlaceholderIdx(Math.floor(Math.random() * total))
  }, [activePromptExamples])

  // Improve prompt using AI
  const handleImprovePrompt = async () => {
    if (!currentPrompt.trim() || improving) return
    setImproving(true)
    try {
      const res = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ prompt: currentPrompt.trim(), mode, force: true }),
      })
      if (!res.ok) throw new Error('Failed')
      const { improved, changed } = await res.json()
      if (improved) {
        setCurrentPrompt(improved)
        if (changed) {
          toast.success('Prompt improved')
        } else {
          toast.info('Your prompt is already strong')
        }
      }
    } catch {
      toast.error('Could not improve prompt')
    } finally {
      setImproving(false)
    }
  }

  const fetchRateLimit = useCallback(async () => {
    try {
      console.log('[Client] Fetching rate limit...')
      const res = await fetch('/api/rate-limit', { credentials: 'include', headers: buildAuthHeaders() })
      console.log('[Client] Rate limit response:', res.status, res.ok)
      if (res.ok) {
        const data = await res.json()
        console.log('[Client] Rate limit data:', data)
        setRateLimit(data)
      }
    } catch (e) { 
      console.error('[Client] Rate limit error:', e)
    }
  }, [buildAuthHeaders])

  const fetchVideoRateLimit = useCallback(async () => {
    try {
      const res = await fetch('/api/rate-limit/video', { credentials: 'include', headers: buildAuthHeaders() })
      if (res.ok) {
        const data = await res.json()
        setVideoRateLimit(data)
      }
    } catch { /* silent */ }
  }, [buildAuthHeaders])

  const clearPendingGeneration = useCallback(() => {
    setPendingGeneration(null)
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PENDING_GENERATION_KEY)
    }
  }, [])

  const persistPendingGeneration = useCallback((item: PendingGeneration) => {
    setPendingGeneration(item)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PENDING_GENERATION_KEY, JSON.stringify(item))
    }
  }, [])

  const getStoredPendingGeneration = useCallback((): PendingGeneration | null => {
    if (typeof window === 'undefined') return null
    try {
      const raw = window.localStorage.getItem(PENDING_GENERATION_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as PendingGeneration
      if (!parsed?.requestId || !parsed?.mode || !parsed?.prompt || !parsed?.startedAt) return null
      return parsed
    } catch {
      return null
    }
  }, [])

  const restorePendingGenerationUI = useCallback((pending: PendingGeneration) => {
    setLoading(true)
    setActiveGenerationMode(pending.mode)
    setLoadingPrompt(pending.prompt)
    setMode(pending.mode)

    if (pending.mode === 'video') {
      setVideoPrompt(pending.prompt)
    } else if (pending.mode === 'image') {
      setImagePrompt(pending.prompt)
    } else {
      setPrompt(pending.prompt)
    }

    setPendingGeneration(pending)
  }, [])

  // Load saved gallery on mount
  const loadGallery = useCallback(async () => {
    let allImages: GeneratedMedia[] = []
    
    // First try to load from server
    try {
      const res = await fetch('/api/gallery', { credentials: 'include', headers: buildAuthHeaders() })
      if (res.ok) {
        const { images: saved } = await res.json()
        if (saved && saved.length > 0) {
          allImages = [...saved]
        }
      }
    } catch { /* silent */ }
    
    // Also check localStorage as fallback
    try {
      const localStored = window.localStorage.getItem('pictura_images')
      if (localStored) {
        const localImages: GeneratedMedia[] = JSON.parse(localStored)
        if (localImages.length > 0) {
          // Merge with server images
          allImages = dedupeMedia([...allImages, ...localImages])
        }
      }
    } catch { /* silent */ }
    
    if (allImages.length > 0) {
      // Sort newest first by createdAt
      allImages = dedupeMedia(allImages)
      allImages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setImages(allImages)
      const latestVideo = allImages.find((item) => (item.mediaKind ?? (item.type === 'text-to-video' ? 'video' : 'image')) === 'video')
      if (latestVideo) setGeneratedVideoUrl(latestVideo.url)
    }
  }, [buildAuthHeaders])

  const findResolvedGeneration = useCallback((saved: GeneratedMedia[], pending: PendingGeneration) => {
    const byRequestId = saved.find((item) => item.requestId && item.requestId === pending.requestId)
    if (byRequestId) return byRequestId

    const pendingStartedAt = new Date(pending.startedAt).getTime()
    const targetKind = pending.mode === 'video' ? 'video' : 'image'

    return saved.find((item) => {
      const kind = item.mediaKind ?? (item.type === 'text-to-video' ? 'video' : 'image')
      const createdAt = new Date(item.createdAt).getTime()
      const similarPrompt = item.prompt.trim().toLowerCase() === pending.prompt.trim().toLowerCase()
      return kind === targetKind && createdAt >= pendingStartedAt && similarPrompt
    })
  }, [])

  // Restore pending generation on mount (runs immediately)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const rawPending = window.localStorage.getItem(PENDING_GENERATION_KEY)
    if (!rawPending) return
    
    try {
      const parsed = JSON.parse(rawPending) as PendingGeneration
      if (parsed?.requestId && parsed?.mode && parsed?.prompt && parsed?.startedAt) {
        // Set pending generation first - this will trigger the polling effect
        setPendingGeneration(parsed)
        setLoading(true)
        setLoadingPrompt(parsed.prompt)
        setActiveGenerationMode(parsed.mode)
        // Also set the mode and prompt to restore the UI state
        setMode(parsed.mode)
        if (parsed.mode === 'video') {
          setVideoPrompt(parsed.prompt)
        } else if (parsed.mode === 'image') {
          setImagePrompt(parsed.prompt)
        } else {
          setPrompt(parsed.prompt)
        }
        
        // Manually check for completed generation immediately
        // This ensures the UI updates even before the polling effect runs
        setTimeout(async () => {
          try {
            // Get buildAuthHeaders (we need to call it dynamically)
            const headers: HeadersInit = {}
            if (typeof window !== 'undefined') {
              const fpEl = document.querySelector('[data-fingerprint]') as HTMLElement & { dataset?: { fingerprint?: string } }
              if (fpEl?.dataset?.fingerprint) {
                headers['x-client-fingerprint'] = fpEl.dataset.fingerprint
              }
            }
            
            const res = await fetch('/api/gallery', { credentials: 'include', headers })
            let allImages: GeneratedMedia[] = []
            
            if (res.ok) {
              const { images: saved } = await res.json()
              if (saved && Array.isArray(saved)) {
                allImages = [...saved]
              }
            }
            
            // Also check localStorage fallback
            try {
              const localStored = window.localStorage.getItem('pictura_images')
              if (localStored) {
                const localImages: GeneratedMedia[] = JSON.parse(localStored)
                if (localImages.length > 0) {
                  allImages = dedupeMedia([...allImages, ...localImages])
                }
              }
            } catch { /* silent */ }
            
            if (allImages.length > 0) {
              const sorted = dedupeMedia(allImages).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              setImages(sorted)
              
              // Check if there's a matching result
              const resolved = findResolvedGeneration(sorted, parsed)
              
              if (resolved) {
                const resolvedKind = resolved.mediaKind ?? (resolved.type === 'text-to-video' ? 'video' : 'image')
                if (resolvedKind === 'video') {
                  setGeneratedVideoUrl(resolved.url)
                }
                await completeLoadingAndSettle()
                setLoading(false)
                setActiveGenerationMode(null)
                setLoadingPrompt('')
                if (parsed.mode === 'video') {
                  setVideoPrompt('')
                } else if (parsed.mode === 'image') {
                  setImagePrompt('')
                } else {
                  setPrompt('')
                }
                window.localStorage.removeItem(PENDING_GENERATION_KEY)
                setPendingGeneration(null)
                if (resolvedKind === 'video') {
                  void fetchVideoRateLimit()
                } else {
                  void fetchRateLimit()
                }
                // Note: We can't use toast here directly, but the UI will show the result
              }
            }
          } catch (e) {
            console.error('Error checking restored generation:', e)
          }
        }, 100)
      }
    } catch {
      window.localStorage.removeItem(PENDING_GENERATION_KEY)
    }
  }, [fetchRateLimit, fetchVideoRateLimit, findResolvedGeneration, completeLoadingAndSettle])

  useEffect(() => {
    setMounted(true)
    
    // Fetch rate limits and load gallery
    fetchRateLimit()
    fetchVideoRateLimit()
    loadGallery()

    const loadTourPreference = async () => {
      try {
        const res = await fetch('/api/studio/preferences', { credentials: 'include', headers: buildAuthHeaders() })
        const data = res.ok ? await res.json() : { completed: false }
        if (!data.completed) {
          setTimeout(() => setTourStep(0), 600)
        }
      } catch {
        setTimeout(() => setTourStep(0), 600)
      }
    }

    loadTourPreference()
  }, [fetchRateLimit, fetchVideoRateLimit, loadGallery, buildAuthHeaders])

  useEffect(() => {
    if (!pendingGeneration) return

    let cancelled = false

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/gallery', { credentials: 'include', headers: buildAuthHeaders() })
        if (!res.ok) return

        const { images: saved } = await res.json()
        if (!Array.isArray(saved)) return

        if (!cancelled) {
          const sortedSaved = dedupeMedia([...(saved as GeneratedMedia[])]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setImages(sortedSaved)
          
          // Check if the generation is complete by looking at the saved images
          const resolved = findResolvedGeneration(sortedSaved, pendingGeneration)
          if (resolved && !cancelled) {
            if ((resolved.mediaKind ?? (resolved.type === 'text-to-video' ? 'video' : 'image')) === 'video') {
              setGeneratedVideoUrl(resolved.url)
            }
            await completeLoadingAndSettle()
            setLoading(false)
            setActiveGenerationMode(null)
            setLoadingPrompt('')
            // Clear the prompt after successful generation restore
            if (pendingGeneration.mode === 'video') {
              setVideoPrompt('')
            } else if (pendingGeneration.mode === 'image') {
              setImagePrompt('')
            } else {
              setPrompt('')
            }
            clearPendingGeneration()
            if ((resolved.mediaKind ?? (resolved.type === 'text-to-video' ? 'video' : 'image')) === 'video') {
              void fetchVideoRateLimit()
            } else {
              void fetchRateLimit()
            }
            toast.success('Generation restored successfully.')
            return
          }
        }

        const startedAt = new Date(pendingGeneration.startedAt).getTime()
        const ttlMs = pendingGeneration.mode === 'video' ? 12 * 60_000 : 3 * 60_000
        if (!cancelled && Date.now() - startedAt > ttlMs) {
          setLoading(false)
          setActiveGenerationMode(null)
          setLoadingPrompt('')
          clearPendingGeneration()
          // Don't clear prompt on timeout so user can retry
          toast.info('Generation timed out. Please try again.')
        }
      } catch {
        // Silent polling failures
      }
    }

    // Check immediately on mount
    checkStatus()
    // Then poll every 3 seconds for faster completion detection
    const interval = setInterval(checkStatus, 3000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [pendingGeneration, buildAuthHeaders, clearPendingGeneration, findResolvedGeneration, fetchRateLimit, fetchVideoRateLimit, completeLoadingAndSettle])

  // Close model dropdown when clicking outside
  useEffect(() => {
    if (!modelOpen) return
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-tour="model"]')) setModelOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [modelOpen])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [prompt])

  const handleFileChange = (file: File | null) => {
    if (!file) { setUploadedFile(null); setUploadPreview(null); return }
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB.'); return }
    setUploadedFile(file)
    setUploadPreview(URL.createObjectURL(file))
    if (mode !== 'video') {
      setMode('image')
    }
  }

  const handleGenerate = async () => {
    const modeAtSubmit = mode
    const promptAtSubmit = currentPrompt.trim()
    const generationStartedAt = new Date().toISOString()
    const requestId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    if (!promptAtSubmit) return

    const activePending = pendingGeneration || getStoredPendingGeneration()
    if (activePending) {
      const startedAt = new Date(activePending.startedAt).getTime()
      const ttlMs = activePending.mode === 'video' ? 15 * 60_000 : 5 * 60_000
      if (Date.now() - startedAt < ttlMs) {
        restorePendingGenerationUI(activePending)
        toast.info('A generation is already in progress. We will continue that request instead of creating a new one.')
        return
      }
      clearPendingGeneration()
    }

    if ((modeAtSubmit === 'text' || modeAtSubmit === 'image') && rateLimit.remaining <= 0) {
      playLimitSound()
      setShowExhausted(true)
      return
    }

    if (modeAtSubmit === 'video' && videoRateLimit.remaining <= 0) {
      playLimitSound()
      setShowExhausted(true)
      return
    }

    if (modeAtSubmit === 'image' && !uploadedFile) {
      toast.error('Please upload an image first')
      return
    }

    setLoading(true)
    setActiveGenerationMode(modeAtSubmit)
    setLoadingPrompt(promptAtSubmit)
    setShowExhausted(false)

    try {
      let finalPrompt = promptAtSubmit

      // Auto-improve prompt before generation (silent fallback on failure)
      try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 6000)
        const improveRes = await fetch('/api/improve-prompt', {
          method: 'POST',
          headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ prompt: promptAtSubmit, mode: modeAtSubmit }),
          signal: controller.signal,
        })
        clearTimeout(timeout)

        if (improveRes.ok) {
          const improvedData = await improveRes.json()
          if (improvedData?.changed && typeof improvedData?.improved === 'string' && improvedData.improved.trim()) {
            finalPrompt = improvedData.improved.trim()
          }
        }
      } catch {
        // Do not block generation if prompt enhancement fails
      }

      setLoadingPrompt(finalPrompt)
      persistPendingGeneration({ requestId, mode: modeAtSubmit, prompt: finalPrompt, startedAt: generationStartedAt })

      let res: Response

      if (modeAtSubmit === 'text') {
        res = await fetch('/api/generate/text-to-image', {
          method: 'POST',
          credentials: 'include',
          headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ requestId, prompt: finalPrompt, model: selectedModel }),
        })
      } else if (modeAtSubmit === 'image') {
        const form = new FormData()
        form.append('prompt', finalPrompt)
        if (uploadedFile) {
          form.append('image', uploadedFile)
        } else if (uploadPreview && !uploadPreview.startsWith('blob:')) {
          form.append('imageUrl', uploadPreview)
        }
        form.append('model', selectedModel)
        form.append('requestId', requestId)

        res = await fetch('/api/generate/image-to-image', {
          method: 'POST',
          credentials: 'include',
          headers: buildAuthHeaders(),
          body: form,
        })
      } else {
        if (uploadedFile) {
          const form = new FormData()
          form.append('prompt', finalPrompt)
          form.append('model', selectedModel)
          form.append('requestId', requestId)
          form.append('image', uploadedFile)
          res = await fetch('/api/generate/video', {
            method: 'POST',
            credentials: 'include',
            headers: buildAuthHeaders(),
            body: form,
          })
        } else {
          res = await fetch('/api/generate/video', {
            method: 'POST',
            credentials: 'include',
            headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ requestId, prompt: finalPrompt, model: selectedModel, imageUrl: uploadPreview || undefined }),
          })
        }
      }

      const data = await res.json()
      console.log('[Client] Generate response:', res.status, data.rateLimitInfo)

      if (!res.ok) {
        if (data.rateLimitInfo && modeAtSubmit !== 'video') {
          console.log('[Client] Setting rate limit from error:', data.rateLimitInfo)
          setRateLimit(data.rateLimitInfo)
        }
        const details = typeof data.details === 'string' ? ` (${data.details})` : ''
        throw new Error((data.error || 'Failed to generate') + details)
      }

      if (modeAtSubmit === 'video') {
        await completeLoadingAndSettle()
        setGeneratedVideoUrl(data.url)
        const videoItem: GeneratedMedia = { ...data, mediaKind: 'video' }
        setImages((prev) => dedupeMedia([videoItem, ...prev]))
        if (data.rateLimitInfo) setVideoRateLimit(data.rateLimitInfo)
        playSuccessSound()
        toast.success('Video generated!')

      } else {
        await completeLoadingAndSettle()
        const imageItem: GeneratedMedia = { ...data, mediaKind: 'image' }
        setImages((prev) => dedupeMedia([imageItem, ...prev]))
        
        if (data.rateLimitInfo) {
          console.log('[Client] Setting rate limit from success:', data.rateLimitInfo)
          setRateLimit(data.rateLimitInfo)
        }
        playSuccessSound()
        toast.success('Image generated!')
      }

      // Clear prompt after successful generation for all modes
      setCurrentPrompt('')

      const updatedRemaining = modeAtSubmit === 'video'
        ? (data.rateLimitInfo?.remaining ?? videoRateLimit.remaining - 1)
        : (data.rateLimitInfo?.remaining ?? rateLimit.remaining - 1)

      if (updatedRemaining <= 2 && updatedRemaining > 1) {
        setTimeout(() => toast.info(`You have ${updatedRemaining} generations left today.`), 800)
      } else if (updatedRemaining === 1) {
        setTimeout(() => toast.info('You have 1 generation left today. Make it count!'), 800)
      }
      
      // Clear pending generation after successful generation
      clearPendingGeneration()
    } catch (err) {
      // Display the error message from the API if available
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(errorMessage)
      clearPendingGeneration()
      // Keep the prompt in the input so user can retry
    } finally {
      setLoading(false)
      setActiveGenerationMode(null)
      setLoadingPrompt('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() }
  }

  const handleDownload = (img: GeneratedMedia) => {
    setDownloadImage(img)
    setDownloadModalOpen(true)
  }

  const handleCopyPrompt = async (promptText?: string) => {
    if (!promptText?.trim()) return
    try {
      await navigator.clipboard.writeText(promptText)
      toast.success('Prompt copied to clipboard.')
    } catch {
      toast.error('Could not copy prompt. Please copy manually.')
    }
  }

  const handleFeedback = (url: string, type: Feedback) => {
    if (!type) return
    const nextType = feedbackMap[url] === type ? null : type
    setFeedbackMap((prev) => ({
      ...prev,
      [url]: nextType,
    }))

    if (!nextType) {
      setPendingFeedback(null)
      setFeedbackNote('')
      setRatingPromptOpen(false)
      return
    }

    if (nextType === 'up') {
      setPendingFeedback(null)
      setFeedbackNote('')
      setRatingPromptOpen(false)
      toast.success('Thanks for the feedback!')
      return
    }

    setPendingFeedback({ url, type: nextType })
    setFeedbackNote('')
    setRatingPromptOpen(true)
  }

  const handleModeSwitch = (nextMode: Mode) => {
    if (loading) {
      toast.info('Generation in progress. Please wait until it finishes.')
      return
    }

    if (nextMode === 'text') {
      setMode('text')
      handleFileChange(null)
      return
    }

    if (nextMode === 'image') {
      setMode('image')
      if (!uploadedFile) fileInputRef.current?.click()
      return
    }

    setSelectedModel('picturagen')
    setMode('video')
    handleFileChange(null)
  }

  const dismissTour = async () => {
    setTourStep(-1)
    try {
      await fetch('/api/studio/preferences', {
        method: 'POST',
        credentials: 'include',
        headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ completed: true }),
      })
    } catch { /* silent */ }
  }
  const nextTourStep = () => {
    if (tourStep >= TOUR_STEPS.length - 1) { dismissTour(); return }
    setTourStep((s) => s + 1)
  }

  const currentLimitInfo = mode === 'video' ? videoRateLimit : rateLimit
  const imageItems = images.filter((item) => (item.mediaKind ?? (item.type === 'text-to-video' ? 'video' : 'image')) === 'image')
  const videoItems = images.filter((item) => (item.mediaKind ?? (item.type === 'text-to-video' ? 'video' : 'image')) === 'video')
  const hasResults = mode === 'video' ? videoItems.length > 0 : imageItems.length > 0
  const hasUnlimited = currentLimitInfo.limit >= UNLIMITED_THRESHOLD
  const creditsUsed = currentLimitInfo.used
  const creditsTotal = currentLimitInfo.limit
  const creditsFraction = hasUnlimited ? 0 : (creditsTotal > 0 ? creditsUsed / creditsTotal : 0)

  if (!mounted) return null

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-2 border-b border-border/40 px-3 py-2.5 sm:px-4 md:px-6">
        {/* Left: logo + model switcher */}
        <div className="flex items-center gap-2 min-w-0 sm:gap-3">
          <Link href="/" className="flex-shrink-0 transition-opacity hover:opacity-70">
            <PicturaLogo size="sm" />
          </Link>
          <span className="hidden rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary sm:inline-block">
            BETA
          </span>
          
          {/* Editor link */}
          <Link
            href="/studio/editor"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/40 bg-card px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary/60"
          >
            <Pencil className="h-3 w-3" />
            <span>Editor</span>
          </Link>

          {/* Model switcher */}
          <div className="relative" data-tour="model">
            <button
              onClick={() => setModelOpen(!modelOpen)}
              className="flex items-center gap-1 rounded-lg border border-border/40 bg-card px-2 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary/60 sm:gap-1.5 sm:px-2.5"
            >
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="truncate max-w-[60px] sm:max-w-none">{selectedModel === 'picturagen' ? 'PicturaGen' : selectedModel}</span>
              <ChevronDown className={`h-3 w-3 flex-shrink-0 text-muted-foreground transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-x-3 top-14 z-30 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-1.5 sm:w-64"
                >
                  <div className="border-b border-border/30 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Model</p>
                  </div>
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      disabled={model.status === 'coming'}
                      onClick={() => { setSelectedModel(model.id); if (model.id === 'picturagen') setMode('video'); setModelOpen(false) }}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        model.status === 'coming'
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-secondary/60'
                      }`}
                    >
                      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${
                        selectedModel === model.id ? 'bg-primary/10' : 'bg-secondary'
                      }`}>
                        {model.id === 'picturagen' ? <Clapperboard className="h-3.5 w-3.5 text-primary" /> : <PicturaIcon size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">{model.name}</span>
                          {model.status === 'coming' ? (
                            <span className="rounded bg-muted px-1 py-px text-[9px] font-medium text-muted-foreground">Soon</span>
                          ) : model.status === 'beta' ? (
                            <span className="rounded bg-primary/10 px-1 py-px text-[9px] font-semibold text-primary">Beta</span>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{model.description}</p>
                      </div>
                      {selectedModel === model.id && <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary" />}
                    </button>
                  ))}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: credits + gallery + about */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Credits display */}
          <div data-tour="credits" className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-2 py-1 sm:gap-2 sm:px-3 sm:py-1.5">
            <div className="relative h-[18px] w-[18px] flex-shrink-0">
              <svg viewBox="0 0 36 36" className="h-[18px] w-[18px] -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                <circle
                  cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                  stroke="currentColor"
                  strokeDasharray={`${(1 - creditsFraction) * 94.25} 94.25`}
                  strokeLinecap="round"
                  className={creditsFraction >= 1 ? 'text-destructive' : 'text-primary'}
                  style={{ transition: 'stroke-dasharray 0.4s ease' }}
                />
              </svg>
            </div>
            {hasUnlimited ? (
              <>
                <span className="hidden text-[10px] font-semibold text-primary sm:inline">Unlimited</span>
                <span className="text-[10px] text-muted-foreground">∞</span>
              </>
            ) : (
              <>
                <span className="text-xs font-semibold text-foreground">{currentLimitInfo.remaining}</span>
                <span className="hidden text-[10px] text-muted-foreground sm:inline">left</span>
              </>
            )}
          </div>

          {/* Gallery button */}
          {images.length > 0 && (
            <button
              onClick={() => setGalleryOpen(!galleryOpen)}
              className="flex items-center gap-1 rounded-lg border border-border/40 px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:gap-1.5 sm:px-2.5"
              aria-label="Toggle gallery"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary">
                {images.length}
              </span>
            </button>
          )}

          {/* About - desktop only */}
          <Link
            href="/about"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground md:flex"
          >
            <Info className="h-3 w-3" />
            About
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <div ref={galleryRef} data-tour="gallery" className="flex-1 overflow-y-auto">
        {loading && !hasResults ? (
          /* First-time loading state - orbital rings */
          <div className="flex h-full flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative flex h-32 w-32 items-center justify-center">
                {/* Outer ring */}
                <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '4s' }} viewBox="0 0 128 128" aria-hidden="true">
                  <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12" className="text-border" />
                </svg>
                {/* Middle ring */}
                <svg className="absolute inset-3 h-[104px] w-[104px] animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} viewBox="0 0 104 104" aria-hidden="true">
                  <circle cx="52" cy="52" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" className="text-primary/30" />
                </svg>
                {/* Inner ring */}
                <svg className="absolute inset-6 h-20 w-20 animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 10" className="text-primary/50" />
                </svg>
                {/* Center icon */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <PicturaIcon size={24} />
                </div>
              </div>
<p className="mt-8 text-sm font-semibold text-foreground">{mode === 'video' ? 'Creating your video' : mode === 'image' ? 'Transforming your image' : 'Creating your image'}</p>
  <p className="mt-1.5 text-xs text-muted-foreground">{mode === 'video' ? VIDEO_LOADING_HINTS[videoLoadingHintIndex] : mode === 'image' ? 'Pictura is transforming, this may take a moment' : 'Pictura is generating, this may take a moment'}</p>
              {/* Thin progress bar */}
              <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground/80">{loadingProgress}% complete</p>
            </motion.div>
          </div>
        ) : !hasResults && !loading ? (
          /* Empty state */
          <div className={`flex h-full flex-col text-center ${mode === 'video' ? 'items-start justify-start overflow-y-auto px-3 py-4 sm:px-6 sm:py-8' : 'items-center justify-center px-4 sm:px-6'}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`flex flex-col ${mode === 'video' ? 'w-full max-w-2xl items-center rounded-3xl border border-border/40 bg-card/80 px-4 py-5 sm:px-8 sm:py-8' : 'w-full max-w-lg items-center'}`}
            >
              <div className={`${mode === 'video' ? 'rounded-2xl bg-primary/5 p-2.5 sm:p-3' : ''}`}>
                <PicturaIcon size={mode === 'video' ? 40 : 48} className="sm:h-14 sm:w-14" />
              </div>
              <h2 className="mt-4 sm:mt-5 text-lg sm:text-xl font-semibold text-foreground">{mode === 'video' ? 'What video will you create?' : 'What will you create?'}</h2>
              <p className="mt-2 max-w-xs sm:max-w-md text-sm leading-relaxed text-muted-foreground">
                {mode === 'video'
                  ? 'Describe your scene and PicturaGen will create an amazing cinematic video for you.'
                  : 'Describe your image. Pictura will generate it.'}
                <span className="block mt-1.5">
                  {hasUnlimited
                    ? <><strong className="text-foreground">Unlimited image generations</strong> are available today.</>
                    : <>You have <strong className="text-foreground">{currentLimitInfo.remaining} generation{currentLimitInfo.remaining !== 1 ? 's' : ''}</strong> remaining today.</>}
                </span>
              </p>

              {mode === 'video' ? (
                <div className="mt-5 sm:mt-7 w-full" data-tour="suggestions">
                  {/* Video Feature Highlights */}
                  <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-background/50 p-2.5 sm:p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Clapperboard className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-center text-[10px] sm:text-xs font-medium text-foreground">HD Quality</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">1280x720</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-background/50 p-2.5 sm:p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                      </div>
                      <span className="text-center text-[10px] sm:text-xs font-medium text-foreground">15 Seconds</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">Duration</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border/30 bg-background/50 p-2.5 sm:p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Wand2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-center text-[10px] sm:text-xs font-medium text-foreground">AI Motion</span>
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground/70">Smart movement</span>
                    </div>
                  </div>

                  {/* Prompt Suggestions */}
                  <p className="mb-2.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Try these prompts</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {visibleVideoExamples.map((suggestion, idx) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSetPrompt(suggestion)}
                        className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-background px-3 py-2.5 sm:px-4 sm:py-3 text-left text-xs sm:text-sm leading-relaxed text-muted-foreground transition-all hover:border-primary/30 hover:bg-card hover:text-foreground"
                      >
                        <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary opacity-60 group-hover:opacity-100 transition-opacity">{idx + 1}</span>
                        <span className="pl-6">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Tips */}
                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 sm:px-4 sm:py-3">
                    <p className="flex items-start gap-2 text-[11px] sm:text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5 flex-shrink-0 text-primary mt-0.5" />
                      <span>
                        <strong className="text-foreground">Pro tip:</strong> Include camera movements like &quot;slow pan&quot;, &quot;dolly shot&quot;, or &quot;aerial view&quot; for more cinematic results.
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 px-2" data-tour="suggestions">
                  {visibleImageExamples.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSetPrompt(suggestion)}
                      className="rounded-full border border-border/50 bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-card/80"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Gallery */
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6" data-tour="video-result">
            {/* Loading card at top when generating */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-2xl border border-border/40 bg-card p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
                        {/* Mini spinning ring */}
                        <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 56 56" aria-hidden="true">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 10" className="text-primary/40" />
                        </svg>
                        <PicturaIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {activeGenerationMode === 'video' ? 'Generating your video with PicturaGen...' : activeGenerationMode === 'image' ? 'Transforming image...' : 'Generating image...'}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {loadingPrompt || (activeGenerationMode === 'video' ? VIDEO_LOADING_HINTS[videoLoadingHintIndex] : activeGenerationMode === 'image' ? 'Transforming your image' : 'Processing your request')}
                        </p>
                        {activeGenerationMode === 'image' && uploadPreview && (
                          <div className="mt-2 inline-flex max-w-full items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-2.5 py-1.5">
                            <div className="relative h-7 w-7 overflow-hidden rounded-lg ring-1 ring-primary/20">
                              <Image src={uploadPreview} alt="Reference image" fill className="object-cover" sizes="28px" />
                            </div>
                            <span className="max-w-[220px] truncate text-[11px] text-foreground/80">Using uploaded image as reference</span>
                          </div>
                        )}
                        {isPoorNetwork && (
                          <div className="mt-2 inline-flex max-w-full items-start gap-1.5 rounded-lg border border-amber-300/40 bg-amber-50/70 px-2 py-1 text-[11px] text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                            <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                            <span>Network is slow. Your generation is safe in queue and will continue.</span>
                          </div>
                        )}
                        <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${loadingProgress}%` }} />
                        </div>
                        <p className="mt-1 text-[10px] text-muted-foreground/80">{loadingProgress}% complete</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'video' ? (
              <div className="space-y-6">
                {/* Featured Latest Video */}
                {videoItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    data-tour="video-result"
                    className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg"
                  >
                    <div className="relative aspect-video bg-black/5">
                      <video 
                        src={videoItems[0].url} 
                        controls 
                        className="h-full w-full"
                        poster=""
                      />
                      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-primary/90 px-2.5 py-1 backdrop-blur-sm">
                        <Clapperboard className="h-3.5 w-3.5 text-primary-foreground" />
                        <span className="text-[10px] font-semibold text-primary-foreground">Latest</span>
                      </div>
                      <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-black/40 p-1.5 backdrop-blur-sm">
                        <PicturaIcon size={16} />
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <p className="text-sm sm:text-base leading-relaxed text-foreground">{videoItems[0].prompt}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] sm:text-xs font-medium text-primary">
                          <Clapperboard className="h-3 w-3" />
                          PicturaGen
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] sm:text-xs font-medium text-muted-foreground">HD 1280x720</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground/60">{new Date(videoItems[0].createdAt).toLocaleString()}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFeedback(videoItems[0].url, 'up')}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                              feedbackMap[videoItems[0].url] === 'up'
                                ? 'bg-primary/15 text-primary'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                            aria-label="Like this video"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Like</span>
                          </button>
                          <button
                            onClick={() => handleFeedback(videoItems[0].url, 'down')}
                            className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all ${
                              feedbackMap[videoItems[0].url] === 'down'
                                ? 'bg-destructive/15 text-destructive'
                                : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                            aria-label="Dislike this video"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleCopyPrompt(videoItems[0].prompt)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-secondary px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                            aria-label="Copy prompt"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Copy</span>
                          </button>
                        </div>
                        <button
                          onClick={() => { setGeneratedVideoUrl(videoItems[0].url); setVideoDownloadModalOpen(true) }}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90"
                          aria-label="Download video"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Previous Videos Grid */}
                {videoItems.length > 1 && (
                  <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Previous Videos</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {videoItems.slice(1).map((video, i) => (
                        <motion.div
                          key={`${video.url}-${video.createdAt}-${i}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className="group overflow-hidden rounded-xl border border-border/40 bg-card transition-all hover:border-border/60 hover:shadow-md"
                        >
                          <div className="relative aspect-video bg-muted/30">
                            <video src={video.url} controls className="h-full w-full" />
                            <div className="pointer-events-none absolute right-2 top-2 rounded-md bg-black/40 p-1 backdrop-blur-sm">
                              <PicturaIcon size={12} />
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="line-clamp-2 text-xs leading-relaxed text-foreground">{video.prompt}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground/50">{new Date(video.createdAt).toLocaleDateString()}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleFeedback(video.url, 'up')}
                                  className={`h-6 w-6 rounded-md transition-all ${feedbackMap[video.url] === 'up' ? 'bg-primary/15 text-primary' : 'text-muted-foreground/50 hover:bg-secondary hover:text-foreground'}`}
                                  aria-label="Like"
                                >
                                  <ThumbsUp className="mx-auto h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleCopyPrompt(video.prompt)}
                                  className="h-6 w-6 rounded-md text-muted-foreground/50 transition-all hover:bg-secondary hover:text-foreground"
                                  aria-label="Copy prompt"
                                >
                                  <Copy className="mx-auto h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => { setGeneratedVideoUrl(video.url); setVideoDownloadModalOpen(true) }}
                                  className="h-6 w-6 rounded-md text-muted-foreground/50 transition-all hover:bg-secondary hover:text-foreground"
                                  aria-label="Download"
                                >
                                  <Download className="mx-auto h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {imageItems.map((img, i) => {
                const fb = feedbackMap[img.url] ?? null
                return (
                  <motion.div
                    key={`${img.url}-${img.createdAt}-${i}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="group"
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-card">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden bg-muted/30">
                        <button onClick={() => setLightbox(img)} className="relative block h-full w-full">
                          {img.url ? (
                            <img
                              src={img.url}
                              alt="Generated creation"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </button>
                        <div className="absolute top-2.5 right-2.5 rounded-lg bg-black/20 p-1.5 backdrop-blur-sm">
                          <PicturaIcon size={14} />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                          <div className="scale-0 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform duration-200 group-hover:scale-100">
                            <ZoomIn className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Card info */}
                      <div className="px-4 pb-4 pt-3">
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground">{img.prompt}</p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {img.type === 'text-to-image' ? 'Text' : 'Image'} to Image
                          </span>
                          <span className="text-[10px] text-muted-foreground/50 font-mono">1024px</span>
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleFeedback(img.url, 'up')}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-medium transition-all ${
                                fb === 'up'
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground/70 hover:bg-secondary hover:text-foreground'
                              }`}
                              aria-label="Like this image"
                              title="Like"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleFeedback(img.url, 'down')}
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-[10px] font-medium transition-all ${
                                fb === 'down'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'text-muted-foreground/70 hover:bg-secondary hover:text-foreground'
                              }`}
                              aria-label="Dislike this image"
                              title="Needs work"
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleCopyPrompt(img.prompt)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/70 transition-all hover:bg-secondary hover:text-foreground"
                              aria-label="Copy image prompt"
                              title="Copy prompt"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(img)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40 transition-all hover:bg-secondary hover:text-foreground"
                              aria-label="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
            )}

          </div>
        )}
      </div>

      {/* Input dock */}
      <div className="border-t border-border/30 bg-card/50 backdrop-blur-sm px-4 pb-4 pt-3 md:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Upload preview */}
          <AnimatePresence>
            {uploadPreview && !(loading && (activeGenerationMode === 'image' || activeGenerationMode === 'video')) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background p-2.5">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={uploadPreview} alt="Upload preview" fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{uploadedFile?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{mode === 'video' ? 'Reference image for image-to-video' : 'Reference for transformation'}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleFileChange(null)
                      if (mode !== 'video') setMode('text')
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt bar */}
          <div data-tour="prompt" className="flex items-end gap-2 rounded-2xl border border-border/50 bg-background p-2 transition-colors focus-within:border-primary/30">
            <div className="flex items-center gap-1 pb-0.5">
              <button
                onClick={() => {
                  if (mode === 'text' || mode === 'video') {
                    fileInputRef.current?.click()
                    return
                  }
                  setMode('text')
                  handleFileChange(null)
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  mode === 'image'
                    ? 'bg-primary/10 text-primary'
                    : mode === 'video'
                      ? 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={mode === 'video' ? 'Upload reference image for video' : mode === 'text' ? 'Upload reference image' : 'Remove reference'}
                aria-label={mode === 'video' ? 'Upload image reference for video' : 'Toggle image mode'}
              >
                {mode === 'image' ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={currentPrompt}
              onChange={(e) => handlePromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'text' ? 'Describe the image you want to create...' : mode === 'image' ? 'Describe how to transform this image...' : 'Create an amazing video: describe your scene, motion, and style...'}
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !currentPrompt.trim()}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              aria-label={mode === 'video' ? 'Generate video' : 'Generate image'}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                mode === 'video' ? <VideoSendIcon className="h-4 w-4" /> : <SendIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Rotating suggestion + improve button */}
          <div className="mt-2 flex items-center gap-2 px-1">
            {/* Clickable rotating suggestion */}
            <AnimatePresence mode="wait">
              <motion.button
                key={placeholderIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  if (activePromptExamples.length === 0) return
                  handleSetPrompt(activePromptExamples[placeholderIdx % activePromptExamples.length])
                  textareaRef.current?.focus()
                }}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-dashed border-border/50 px-3 py-1.5 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <RefreshCw className="h-3 w-3 flex-shrink-0 text-muted-foreground/50" />
                <span className="truncate text-[11px] text-muted-foreground/70">
                  {activePromptExamples.length > 0 ? activePromptExamples[placeholderIdx % activePromptExamples.length] : 'Try a creative prompt'}
                </span>
              </motion.button>
            </AnimatePresence>

            {/* Improve prompt button */}
            <button
              onClick={handleImprovePrompt}
              disabled={!currentPrompt.trim() || improving || loading}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-border/50 bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
              title="Improve your prompt with AI"
            >
              {improving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Wand2 className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">{improving ? 'Improving...' : 'Improve'}</span>
            </button>
          </div>


          {/* Mode switcher + status */}
          <div className="mt-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-0.5" data-tour="mode-tabs">
              <button
                onClick={() => handleModeSwitch('text')}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  mode === 'text'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Text to Image
              </button>
              <button
                onClick={() => handleModeSwitch('image')}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  mode === 'image'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Image to Image
              </button>
              <button
                onClick={() => handleModeSwitch('video')}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  mode === 'video'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Text to Video
              </button>
            </div>

            {mode === 'video' && (
              <div className="mr-3 hidden items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-[11px] text-primary sm:flex">
                <Clapperboard className="h-3.5 w-3.5" />
                <span className="font-medium">PicturaGen • Text to Video</span>
                <span className="rounded-full border border-primary/30 px-1.5 py-0.5 text-[10px]">Beta</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {!hasUnlimited && (mode === 'video' ? videoRateLimit.remaining : rateLimit.remaining) <= 2 && (mode === 'video' ? videoRateLimit.remaining : rateLimit.remaining) > 0 && (
                <span className="text-[11px] font-medium text-accent-foreground">
                  {mode === 'video' ? videoRateLimit.remaining : rateLimit.remaining} left today
                </span>
              )}
              {!hasUnlimited && (mode === 'video' ? videoRateLimit.remaining : rateLimit.remaining) <= 0 && (
                <span className="text-[11px] font-medium text-destructive">
                  Limit reached
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/40 font-mono">
                {mode === 'video' ? `${selectedModel} · video` : `${selectedModel} · 1024`}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Walkthrough Tour - highlights real elements */}
      <AnimatePresence>
        {tourStep >= 0 && tourStep < TOUR_STEPS.length && (
          <TourOverlay
            step={tourStep}
            steps={TOUR_STEPS}
            onNext={nextTourStep}
            onSkip={dismissTour}
          />
        )}
      </AnimatePresence>

      {/* Exhausted overlay */}
      <AnimatePresence>
        {showExhausted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
            onClick={() => setShowExhausted(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/30 bg-background p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative ring */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="relative flex h-full w-full items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive/20" />
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="226.19" strokeDashoffset="0" strokeLinecap="round" className="text-destructive/60" />
                  </svg>
                  <PicturaIcon size={28} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                {"Oops! You've used all your credits"}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {mode === 'video'
                  ? `You've exhausted your ${currentLimitInfo.limit} free video generation${currentLimitInfo.limit !== 1 ? 's' : ''} for today. We're working hard to increase limits as Pictura grows.`
                  : 'Image generation is unlimited during beta. If you are seeing this message, please refresh and try again.'}
              </p>

              <div className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2.5">
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-primary" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Resets daily at <strong>12:00 AM</strong>
                </span>
              </div>

              <p className="mt-4 text-xs text-muted-foreground/60">
                Pictura is in beta. Join the API beta and get more capacity instantly.
              </p>

              <button
                onClick={() => setShowExhausted(false)}
                className="mt-6 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery side panel */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {galleryOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border/40 bg-background"
          >
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Your Creations</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {images.length}
                </span>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close gallery"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {images.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No creations yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Your creations are saved permanently and accessible anytime</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => {
                    const isVideo = (img.mediaKind ?? (img.type === 'text-to-video' ? 'video' : 'image')) === 'video'
                    return (
                    <div key={`${img.url}-${img.createdAt}-${idx}`} className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          if (isVideo) {
                            setGeneratedVideoUrl(img.url)
                            setVideoDownloadModalOpen(true)
                          } else {
                            setLightbox(img)
                          }
                          setGalleryOpen(false)
                        }}
                        className="group relative aspect-square overflow-hidden rounded-xl border border-border/30 bg-card"
                      >
                        {isVideo ? (
                          <>
                            <video src={img.url} className="h-full w-full object-cover" muted />
                            <div className="pointer-events-none absolute right-1.5 top-1.5 rounded-md bg-black/35 p-1 backdrop-blur-sm">
                              <PicturaIcon size={10} />
                            </div>
                          </>
                        ) : (
                          <img
                            src={img.url}
                            alt="Saved creation"
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                        <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <p className="line-clamp-2 text-[10px] leading-snug text-white/90">{img.prompt}</p>
                        </div>
                        {isVideo && (
                          <div className="absolute left-1.5 top-1.5 rounded-md bg-black/40 px-1.5 py-0.5 text-[9px] font-semibold text-white">VIDEO</div>
                        )}
                        {!isVideo && feedbackMap[img.url] === 'up' && (
                          <div className="absolute top-1.5 right-1.5 rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary backdrop-blur-sm">
                            Liked
                          </div>
                        )}
                      </button>
                      {img.createdAt && (
                        <p className="text-center text-[9px] text-muted-foreground/50 font-mono">
                          {new Date(img.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-border/40 px-4 py-3">
              <p className="text-center text-[10px] text-muted-foreground/50">
                {images.length} creation{images.length !== 1 ? 's' : ''} saved to your collection
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-4xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden rounded-2xl bg-background border border-border shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image */}
              <div className="relative bg-muted/30">
                {lightbox.url ? (
                  <img
                    src={lightbox.url}
                    alt="Generated creation"
                    className="w-full h-auto max-h-[50vh] sm:max-h-[65vh] object-contain"
                    loading="eager"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <p className="text-sm">Image unavailable</p>
                  </div>
                )}
                
                {/* Action buttons overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditorImage(lightbox.url)
                        setEditorOpen(true)
                        setLightbox(null)
                      }}
                      className="flex h-8 items-center gap-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-lg"
                    >
<Wand2 className="h-3 w-3" />
  Edit
                    </button>
                    <button
                      onClick={() => handleDownload(lightbox)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-foreground shadow-lg"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFeedback(lightbox.url, 'up')}
                      aria-label="Like this generation"
                      title="Like"
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium shadow-lg transition-all ${
                        feedbackMap[lightbox.url] === 'up' ? 'bg-primary text-primary-foreground' : 'bg-white/90 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(lightbox.url, 'down')}
                      aria-label="Needs work"
                      title="Needs work"
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium shadow-lg transition-all ${
                        feedbackMap[lightbox.url] === 'down' ? 'bg-destructive text-destructive-foreground' : 'bg-white/90 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div className="p-4 sm:p-5 border-t border-border/50 max-h-[30vh] overflow-y-auto">
                <div className="flex items-start gap-3">
                  <PicturaIcon size={18} className="flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{lightbox.type === 'text-to-video' ? 'Generated Video' : 'Generated Image'}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {lightbox.type === 'text-to-image' ? 'Text to Image' : lightbox.type === 'image-to-image' ? 'Image to Image' : 'Text to Video'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <p className="text-sm text-muted-foreground leading-relaxed">{lightbox.prompt}</p>
                      <button
                        onClick={() => handleCopyPrompt(lightbox.prompt)}
                        className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md border border-border/50 bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        aria-label="Copy prompt"
                        title="Copy prompt"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-3">
                      {new Date(lightbox.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Feedback prompt card */}
      <AnimatePresence>
        {ratingPromptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[65] flex items-end justify-center bg-black/35 p-4 sm:items-center"
            onClick={() => setRatingPromptOpen(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="w-full max-w-sm rounded-2xl border border-border/40 bg-background p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-foreground">How can we improve the model?</h3>
              <p className="mt-1 text-xs text-muted-foreground">Tell us what went wrong so we can improve model quality and results.</p>

              {pendingFeedback && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-2.5 py-1.5 text-xs">
                  {pendingFeedback.type === 'up' ? <ThumbsUp className="h-3 w-3 text-primary" /> : <ThumbsDown className="h-3 w-3 text-destructive" />}
                  <span className="text-foreground">{pendingFeedback.type === 'up' ? 'Liked' : 'Needs work'}</span>
                </div>
              )}

              <div className="mt-3">
                <textarea
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  rows={3}
                  placeholder="Tell us what worked or what should improve..."
                  className="w-full resize-none rounded-xl border border-border/50 bg-card px-3 py-2 text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/40"
                />
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => { setRatingPromptOpen(false); setFeedbackNote(''); setPendingFeedback(null) }}
                  className="rounded-lg border border-border/50 bg-card px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setRatingPromptOpen(false); setFeedbackNote(''); setPendingFeedback(null); toast.success('Thank you — we will use this to improve the model.') }}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary hover:bg-primary/15"
                >
                  Submit feedback
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Download modal */}
      {downloadImage && (
        <DownloadModal
          open={downloadModalOpen}
          onOpenChange={setDownloadModalOpen}
          imageUrl={downloadImage.url}
          imageName={`pictura-${Date.now()}`}
        />
      )}

      {/* Video download modal */}
      {generatedVideoUrl && (
        <VideoDownloadModal
          open={videoDownloadModalOpen}
          onOpenChange={setVideoDownloadModalOpen}
          videoUrl={generatedVideoUrl}
        />
      )}

      {/* AI Image Editor */}
      <AnimatePresence>
        {editorOpen && editorImage && (
          <AIImageEditor
            imageUrl={editorImage}
            onClose={() => {
              setEditorOpen(false)
              setEditorImage(null)
            }}
            onSave={(newUrl) => {
              // Update the image in the gallery if it was edited
              setImages(prev => prev.map(img => 
                img.url === editorImage ? { ...img, url: newUrl } : img
              ))
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
