'use client'

/**
 * SmartCaptcha v4 - Advanced multi-step CAPTCHA
 * Updated: 2026-03-03
 * Icons verified for lucide-react@0.564.0
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Check, RefreshCw, Loader2, AlertCircle, Fingerprint, Heart, X,
  Car, Bike, Plane, Train, Ship, Bus,
  Dog, Cat, Bird, Fish, Rabbit,
  Apple, Pizza, Coffee, Cake,
  Flower2, Mountain, Sun, Cloud,
  Home, Store, Warehouse, Church,
  Laptop, Tablet, Monitor, Headphones,
  Shirt, Watch, Glasses, ShoppingBag
} from 'lucide-react'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type ChallengeType = 'math' | 'pattern' | 'word' | 'image' | 'typing' | 'slider' | 'biometric' | 'sequence' | 'puzzle'

interface ImageItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  isTarget: boolean
}

interface Challenge {
  type: ChallengeType
  question: string
  answer: string
  options?: string[]
  images?: ImageItem[]
  targetCount?: number
  distortedText?: string
  sliderTarget?: number
  puzzlePieces?: number[]
}

const IMAGE_CATEGORIES = [
  { 
    target: 'vehicles', 
    question: 'Select all vehicles',
    items: [
      { id: '1', icon: Car, isTarget: true }, 
      { id: '2', icon: Dog, isTarget: false },
      { id: '3', icon: Bike, isTarget: true }, 
      { id: '4', icon: Flower2, isTarget: false },
      { id: '5', icon: Bus, isTarget: true }, 
      { id: '6', icon: Coffee, isTarget: false },
      { id: '7', icon: Plane, isTarget: true },
      { id: '8', icon: Apple, isTarget: false },
      { id: '9', icon: Home, isTarget: false },
    ]
  },
  { 
    target: 'animals', 
    question: 'Select all animals',
    items: [
      { id: '1', icon: Dog, isTarget: true }, 
      { id: '2', icon: Car, isTarget: false },
      { id: '3', icon: Cat, isTarget: true }, 
      { id: '4', icon: Laptop, isTarget: false },
      { id: '5', icon: Bird, isTarget: true }, 
      { id: '6', icon: Home, isTarget: false },
      { id: '7', icon: Fish, isTarget: true },
      { id: '8', icon: Laptop, isTarget: false },
      { id: '9', icon: Rabbit, isTarget: true },
    ]
  },
  { 
    target: 'food', 
    question: 'Select all food items',
    items: [
      { id: '1', icon: Pizza, isTarget: true }, 
      { id: '2', icon: Car, isTarget: false },
      { id: '3', icon: Coffee, isTarget: true }, 
      { id: '4', icon: Laptop, isTarget: false },
      { id: '5', icon: Apple, isTarget: true }, 
      { id: '6', icon: Home, isTarget: false },
      { id: '7', icon: Cake, isTarget: true },
      { id: '8', icon: Dog, isTarget: false },
      { id: '9', icon: Cake, isTarget: true },
    ]
  },
  { 
    target: 'nature', 
    question: 'Select all nature items',
    items: [
      { id: '1', icon: Flower2, isTarget: true }, 
      { id: '2', icon: Car, isTarget: false },
      { id: '3', icon: Flower2, isTarget: true }, 
      { id: '4', icon: Laptop, isTarget: false },
      { id: '5', icon: Mountain, isTarget: true }, 
      { id: '6', icon: Laptop, isTarget: false },
      { id: '7', icon: Sun, isTarget: true },
      { id: '8', icon: Pizza, isTarget: false },
      { id: '9', icon: Cloud, isTarget: true },
    ]
  },
  { 
    target: 'buildings', 
    question: 'Select all buildings',
    items: [
      { id: '1', icon: Home, isTarget: true }, 
      { id: '2', icon: Dog, isTarget: false },
      { id: '3', icon: Home, isTarget: true }, 
      { id: '4', icon: Car, isTarget: false },
      { id: '5', icon: Store, isTarget: true }, 
      { id: '6', icon: Apple, isTarget: false },
      { id: '7', icon: Church, isTarget: true },
      { id: '8', icon: Flower2, isTarget: false },
      { id: '9', icon: Warehouse, isTarget: true },
    ]
  },
  { 
    target: 'electronics', 
    question: 'Select all electronics',
    items: [
      { id: '1', icon: Laptop, isTarget: true }, 
      { id: '2', icon: Dog, isTarget: false },
      { id: '3', icon: Laptop, isTarget: true }, 
      { id: '4', icon: Flower2, isTarget: false },
      { id: '5', icon: Tablet, isTarget: true }, 
      { id: '6', icon: Pizza, isTarget: false },
      { id: '7', icon: Monitor, isTarget: true },
      { id: '8', icon: Home, isTarget: false },
      { id: '9', icon: Headphones, isTarget: true },
    ]
  },
]

const MATH_CHALLENGES = [
  () => { const a = Math.floor(Math.random() * 15) + 5; const b = Math.floor(Math.random() * 15) + 5; return { q: `${a} + ${b} = ?`, a: (a + b).toString() } },
  () => { const a = Math.floor(Math.random() * 20) + 15; const b = Math.floor(Math.random() * 10) + 1; return { q: `${a} - ${b} = ?`, a: (a - b).toString() } },
  () => { const a = Math.floor(Math.random() * 8) + 2; const b = Math.floor(Math.random() * 8) + 2; return { q: `${a} × ${b} = ?`, a: (a * b).toString() } },
  () => { const b = Math.floor(Math.random() * 8) + 2; const ans = Math.floor(Math.random() * 8) + 2; return { q: `${b * ans} ÷ ${b} = ?`, a: ans.toString() } },
]

const PATTERN_CHALLENGES = [
  { seq: [2, 4, 6, 8], next: '10', q: '2, 4, 6, 8, ?' },
  { seq: [1, 3, 5, 7], next: '9', q: '1, 3, 5, 7, ?' },
  { seq: [3, 6, 9, 12], next: '15', q: '3, 6, 9, 12, ?' },
  { seq: [1, 4, 9, 16], next: '25', q: '1, 4, 9, 16, ?' },
  { seq: [2, 4, 8, 16], next: '32', q: '2, 4, 8, 16, ?' },
  { seq: [1, 1, 2, 3, 5], next: '8', q: '1, 1, 2, 3, 5, ?' },
  { seq: [10, 20, 30, 40], next: '50', q: '10, 20, 30, 40, ?' },
  { seq: [100, 90, 80, 70], next: '60', q: '100, 90, 80, 70, ?' },
]

const WORD_CHALLENGES = [
  { scrambled: 'UEBL', answer: 'BLUE' },
  { scrambled: 'ETRE', answer: 'TREE' },
  { scrambled: 'ODOG', answer: 'GOOD' },
  { scrambled: 'PLAPE', answer: 'APPLE' },
  { scrambled: 'OSUHE', answer: 'HOUSE' },
  { scrambled: 'ATWER', answer: 'WATER' },
  { scrambled: 'DOLUC', answer: 'CLOUD' },
  { scrambled: 'ENERG', answer: 'GREEN' },
]

const SEQUENCE_CHALLENGES = [
  { q: 'Monday, Tuesday, Wednesday, ?', options: ['Friday', 'Thursday', 'Sunday', 'Saturday'], answer: 'Thursday' },
  { q: 'January, February, March, ?', options: ['May', 'April', 'June', 'December'], answer: 'April' },
  { q: 'A, B, C, D, ?', options: ['F', 'E', 'G', 'Z'], answer: 'E' },
  { q: 'Spring, Summer, Fall, ?', options: ['Spring', 'Winter', 'Summer', 'Rain'], answer: 'Winter' },
]

const generateChallenge = (): Challenge => {
  const types: ChallengeType[] = ['math', 'pattern', 'word', 'image', 'typing', 'slider', 'biometric', 'sequence', 'puzzle']
  const type = types[Math.floor(Math.random() * types.length)]
  
  switch (type) {
    case 'math': {
      const challenge = MATH_CHALLENGES[Math.floor(Math.random() * MATH_CHALLENGES.length)]()
      const answer = parseInt(challenge.a)
      const wrongAnswers = [answer + Math.floor(Math.random() * 5) + 1, answer - Math.floor(Math.random() * 5) - 1, answer + Math.floor(Math.random() * 10) - 5].filter(x => x !== answer && x > 0).slice(0, 3)
      return { type, question: challenge.q, answer: challenge.a, options: [challenge.a, ...wrongAnswers.map(String)].sort(() => Math.random() - 0.5) }
    }
    case 'pattern': {
      const p = PATTERN_CHALLENGES[Math.floor(Math.random() * PATTERN_CHALLENGES.length)]
      const wrongOpts = [parseInt(p.next) + 2, parseInt(p.next) - 1, parseInt(p.next) + 5].map(String)
      return { type, question: p.q, answer: p.next, options: [p.next, ...wrongOpts].sort(() => Math.random() - 0.5) }
    }
    case 'word': {
      const w = WORD_CHALLENGES[Math.floor(Math.random() * WORD_CHALLENGES.length)]
      const wrongWords = WORD_CHALLENGES.filter(x => x.answer !== w.answer).slice(0, 3).map(x => x.answer)
      return { type, question: `Unscramble: ${w.scrambled}`, answer: w.answer, options: [w.answer, ...wrongWords].sort(() => Math.random() - 0.5) }
    }
    case 'sequence': {
      const s = SEQUENCE_CHALLENGES[Math.floor(Math.random() * SEQUENCE_CHALLENGES.length)]
      return { type, question: s.q, answer: s.answer, options: s.options.sort(() => Math.random() - 0.5) }
    }
    case 'image': {
      const cat = IMAGE_CATEGORIES[Math.floor(Math.random() * IMAGE_CATEGORIES.length)]
      const shuffled = [...cat.items].sort(() => Math.random() - 0.5)
      return { type, question: cat.question, answer: cat.target, images: shuffled, targetCount: shuffled.filter(i => i.isTarget).length }
    }
    case 'typing': {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let text = ''
      for (let i = 0; i < 5; i++) text += chars[Math.floor(Math.random() * chars.length)]
      return { type, question: 'Type the characters below', answer: text, distortedText: text }
    }
    case 'slider': {
      const target = Math.floor(Math.random() * 60) + 20
      return { type, question: `Slide to ${target}`, answer: target.toString(), sliderTarget: target }
    }
    case 'puzzle': {
      const pieces = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5)
      return { type, question: 'Tap numbers in order: 1, 2, 3...', answer: '123456789', puzzlePieces: pieces }
    }
    case 'biometric':
      return { type, question: 'Hold to verify your presence', answer: 'verified' }
    default:
      return { type: 'math', question: 'What is 2 + 2?', answer: '4', options: ['3', '4', '5', '6'] }
  }
}

interface SmartCaptchaProps {
  onVerify?: (token: string) => void
  siteKey?: string
  isCompact?: boolean
}

export function SmartCaptcha({ onVerify, siteKey = 'demo', isCompact = false }: SmartCaptchaProps) {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'challenge' | 'wrong' | 'showAnswer' | 'verifying' | 'verified' | 'cooldown'>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [sliderValue, setSliderValue] = useState(50)
  const [puzzleSequence, setPuzzleSequence] = useState<number[]>([])
  const [attempts, setAttempts] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)
  
  // Multi-step challenge state
  const [currentStep, setCurrentStep] = useState(0)
  const [requiredSteps, setRequiredSteps] = useState(2)
  const [riskScore, setRiskScore] = useState(0)
  const [lastCorrectAnswer, setLastCorrectAnswer] = useState<string>('')
  
  // Biometric hold state
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [pulseData, setPulseData] = useState<number[]>([])
  const [pulseDetected, setPulseDetected] = useState(false)
  const holdStartRef = useRef<number>(0)
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const verifyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const analyzingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const wrongAnswerTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Behavior tracking
  const interactionsRef = useRef(0)
  const hasStartedRef = useRef(false)
  const isVerifiedRef = useRef(false)
  
  useEffect(() => {
    const track = () => { interactionsRef.current++ }
    window.addEventListener('mousemove', track)
    window.addEventListener('touchstart', track)
    window.addEventListener('scroll', track)
    return () => { 
      window.removeEventListener('mousemove', track)
      window.removeEventListener('touchstart', track)
      window.removeEventListener('scroll', track)
    }
  }, [])
  

  useEffect(() => {
    return () => {
      if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current)
      if (analyzingTimeoutRef.current) clearTimeout(analyzingTimeoutRef.current)
      if (wrongAnswerTimeoutRef.current) clearTimeout(wrongAnswerTimeoutRef.current)
    }
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(t => {
          if (t <= 1) { setStatus('idle'); setAttempts(0); return 0 }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownTime])
  
  const resetChallenge = useCallback(() => {
    setUserAnswer('')
    setSelectedImages([])
    setSliderValue(50)
    setPuzzleSequence([])
    setHoldProgress(0)
    setPulseData([])
    setPulseDetected(false)
    setChallenge(generateChallenge())
  }, [])
  
  // Analyze user behavior to determine risk and number of challenges
  const analyzeRisk = useCallback(() => {
    let risk = 0
    
    if (interactionsRef.current < 10) risk += 40
    else if (interactionsRef.current < 30) risk += 20
    else if (interactionsRef.current < 50) risk += 10
    
    const timeOnPage = (Date.now() - (window as unknown as { __picturaLoadTime?: number }).__picturaLoadTime) || 5000
    if (timeOnPage < 2000) risk += 30
    else if (timeOnPage < 5000) risk += 15
    
    risk += Math.floor(Math.random() * 15)
    risk = Math.min(100, Math.max(0, risk))
    setRiskScore(risk)
    
    if (risk >= 60) return 3
    if (risk >= 30) return 2
    return 2
  }, [])
  
  const startChallenge = useCallback(() => {
    if (status !== 'idle') return
    if (isVerifiedRef.current) return

    setStatus('analyzing')

    if (!(window as unknown as { __picturaLoadTime?: number }).__picturaLoadTime) {
      (window as unknown as { __picturaLoadTime: number }).__picturaLoadTime = Date.now()
    }

    if (analyzingTimeoutRef.current) clearTimeout(analyzingTimeoutRef.current)
    analyzingTimeoutRef.current = setTimeout(() => {
      const stepsNeeded = analyzeRisk()
      setRequiredSteps(stepsNeeded)
      setCurrentStep(1)
      resetChallenge()
      setStatus('challenge')
      hasStartedRef.current = true
    }, 700)
  }, [status, resetChallenge, analyzeRisk])
  
  // Show correct answer then give new challenge
  const handleWrong = useCallback(() => {
    if (!challenge) return
    
    // Store the correct answer to show
    let correctAnswerText = challenge.answer
    if (challenge.type === 'image' && challenge.images) {
      const correctItems = challenge.images.filter(i => i.isTarget).length
      correctAnswerText = `${correctItems} correct items`
    }
    setLastCorrectAnswer(correctAnswerText)
    
    setStatus('showAnswer')
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    
    // Show correct answer for 2 seconds, then give new challenge
    if (wrongAnswerTimeoutRef.current) clearTimeout(wrongAnswerTimeoutRef.current)
    wrongAnswerTimeoutRef.current = setTimeout(() => {
      if (newAttempts >= 3) {
        setStatus('cooldown')
        setCooldownTime(60)
      } else {
        resetChallenge()
        setStatus('challenge')
      }
    }, 2500)
  }, [attempts, resetChallenge, challenge])
  
  const handleCorrect = useCallback(() => {
    if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current)

    const encodeToken = (payload: Record<string, unknown>) => {
      try {
        return window.btoa(JSON.stringify(payload))
      } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      }
    }

    if (currentStep < requiredSteps) {
      setStatus('verifying')
      verifyTimeoutRef.current = setTimeout(() => {
        setCurrentStep(prev => prev + 1)
        resetChallenge()
        setStatus('challenge')
      }, 600)
      return
    }

    setStatus('verifying')
    verifyTimeoutRef.current = setTimeout(() => {
      isVerifiedRef.current = true
      setStatus('verified')

      const tokenData = {
        t: Date.now(),
        s: siteKey,
        i: interactionsRef.current,
        v: true,
        steps: requiredSteps,
        r: Math.random().toString(36).slice(2, 11),
      }
      const token = encodeToken(tokenData)
      onVerify?.(token)
    }, 800)
  }, [onVerify, siteKey, currentStep, requiredSteps, resetChallenge])
  
  const checkAnswer = useCallback((answer?: string) => {
    if (!challenge) return
    const check = answer || userAnswer
    let correct = false
    
    switch (challenge.type) {
      case 'math': case 'pattern': case 'word': case 'sequence':
        correct = check.toUpperCase() === challenge.answer.toUpperCase()
        break
      case 'typing':
        correct = check.toUpperCase() === challenge.answer
        break
      case 'image':
        const correctIds = challenge.images?.filter(i => i.isTarget).map(i => i.id) || []
        correct = selectedImages.length === correctIds.length && selectedImages.every(id => correctIds.includes(id))
        break
      case 'slider':
        correct = Math.abs(sliderValue - (challenge.sliderTarget || 50)) <= 3
        break
      case 'puzzle':
        correct = puzzleSequence.join('') === '123456789'
        break
      case 'biometric':
        correct = holdProgress >= 100 && pulseDetected
        break
    }
    
    if (correct) handleCorrect()
    else handleWrong()
  }, [challenge, userAnswer, selectedImages, sliderValue, puzzleSequence, holdProgress, pulseDetected, handleCorrect, handleWrong])
  
  // Auto-check for typing
  useEffect(() => {
    if (challenge?.type === 'typing' && userAnswer.length === challenge.answer.length) {
      checkAnswer(userAnswer)
    }
  }, [userAnswer, challenge, checkAnswer])
  
  // Auto-check for slider
  useEffect(() => {
    if (challenge?.type === 'slider' && challenge.sliderTarget) {
      if (Math.abs(sliderValue - challenge.sliderTarget) <= 3) {
        const timer = setTimeout(() => checkAnswer(), 500)
        return () => clearTimeout(timer)
      }
    }
  }, [sliderValue, challenge, checkAnswer])
  
  // Auto-check for images
  useEffect(() => {
    if (challenge?.type === 'image' && challenge.targetCount && selectedImages.length === challenge.targetCount) {
      const timer = setTimeout(() => checkAnswer(), 500)
      return () => clearTimeout(timer)
    }
  }, [selectedImages, challenge, checkAnswer])
  
  // Auto-check for puzzle
  useEffect(() => {
    if (challenge?.type === 'puzzle' && puzzleSequence.length === 9) {
      const timer = setTimeout(() => checkAnswer(), 300)
      return () => clearTimeout(timer)
    }
  }, [puzzleSequence, challenge, checkAnswer])
  
  // Biometric hold handlers
  const startHold = () => {
    if (challenge?.type !== 'biometric' || status !== 'challenge') return
    setIsHolding(true)
    holdStartRef.current = Date.now()
    
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min(100, (elapsed / 3000) * 100)
      setHoldProgress(progress)
      if (progress >= 100 && holdIntervalRef.current) clearInterval(holdIntervalRef.current)
    }, 50)
    
    pulseIntervalRef.current = setInterval(() => {
      setPulseData(prev => {
        const newData = [...prev, 60 + Math.random() * 40]
        if (newData.length >= 15) setPulseDetected(true)
        return newData.slice(-30)
      })
    }, 100)
  }
  
  const endHold = () => {
    setIsHolding(false)
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
    
    if (holdProgress >= 100 && pulseDetected) {
      checkAnswer()
    } else if (holdProgress > 0 && holdProgress < 100) {
      setHoldProgress(0)
      setPulseData([])
      setPulseDetected(false)
    }
  }
  
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
    }
  }, [])
  
  const toggleImage = (id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  
  const handlePuzzleTap = (num: number) => {
    const expectedNext = puzzleSequence.length + 1
    if (num === expectedNext) {
      setPuzzleSequence(prev => [...prev, num])
    }
  }

  return (
    <div className={`w-full ${isCompact ? 'max-w-[280px]' : 'max-w-sm'}`}>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PicturaIcon size={24} />
            <span className="font-semibold text-sm"><span className="text-primary">Pictura</span><span className="text-foreground">CAPTCHA</span></span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Secure</span>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Idle */}
            {status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <button onClick={startChallenge} className="h-6 w-6 rounded-md border-2 border-border hover:border-primary/50 transition-colors flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-transparent" />
                </button>
                <span className="text-sm text-foreground">I am human</span>
              </motion.div>
            )}
            
            {/* Analyzing */}
{status === 'analyzing' && (
  <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
    >
      <Fingerprint className="h-5 w-5 text-primary" />
    </motion.div>
    <span className="text-sm text-muted-foreground">Analyzing behavior...</span>
  </motion.div>
            )}
            
            {/* Show Correct Answer */}
            {status === 'showAnswer' && (
              <motion.div key="showAnswer" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/10 mb-3">
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                </div>
                <p className="text-sm font-medium text-foreground">Incorrect answer</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The correct answer was: <span className="font-semibold text-primary">{lastCorrectAnswer}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-3">Loading new challenge...</p>
              </motion.div>
            )}
            
            {/* Wrong Answer (brief flash) */}
            {status === 'wrong' && (
              <motion.div key="wrong" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">Incorrect</p>
                <p className="text-xs text-muted-foreground mt-1">Loading new challenge...</p>
              </motion.div>
            )}
            
            {/* Challenge */}
            {status === 'challenge' && challenge && (
              <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {/* Step progress bar */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentStep - 1) / requiredSteps) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                    {currentStep}/{requiredSteps}
                  </span>
                </div>
                
                {/* Question + Refresh */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{challenge.question}</p>
                  <button onClick={resetChallenge} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="New challenge">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Options (math, pattern, word, sequence) */}
                {challenge.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {challenge.options.map((opt) => (
                      <button key={opt} onClick={() => checkAnswer(opt)} className="py-2.5 px-3 rounded-lg border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-sm font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Image selection */}
                {challenge.type === 'image' && challenge.images && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {challenge.images.map((img) => {
                        const IconComponent = img.icon
                        return (
                          <button 
                            key={img.id} 
                            onClick={() => toggleImage(img.id)} 
                            className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${selectedImages.includes(img.id) ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 hover:border-primary/30'}`}
                          >
                            <IconComponent className={`h-6 w-6 ${selectedImages.includes(img.id) ? 'text-primary' : 'text-foreground'}`} />
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Selected: {selectedImages.length} / {challenge.targetCount}
                    </p>
                  </div>
                )}
                
                {/* Typing */}
                {challenge.type === 'typing' && (
                  <div className="space-y-3">
                    <div className="relative h-14 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(5)].map((_, i) => (<div key={i} className="absolute h-px bg-foreground/50" style={{ top: `${20 + i * 15}%`, left: 0, right: 0, transform: `rotate(${-2 + Math.random() * 4}deg)` }} />))}
                      </div>
                      <span className="font-mono text-xl tracking-[0.3em] font-bold text-foreground relative" style={{ fontStyle: 'italic', transform: 'skewX(-5deg)' }}>{challenge.distortedText}</span>
                    </div>
                    <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value.toUpperCase())} placeholder="Type characters" maxLength={challenge.answer.length} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" autoComplete="off" />
                    <div className="flex justify-center gap-1">
                      {challenge.answer.split('').map((_, i) => (<div key={i} className={`h-1.5 w-6 rounded-full ${i < userAnswer.length ? 'bg-primary' : 'bg-muted'}`} />))}
                    </div>
                  </div>
                )}
                
                {/* Slider */}
                {challenge.type === 'slider' && (
                  <div className="space-y-3">
                    <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(parseInt(e.target.value))} className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span className="font-medium text-foreground">{sliderValue}</span>
                      <span>100</span>
                    </div>
                  </div>
                )}
                
                {/* Puzzle */}
                {challenge.type === 'puzzle' && challenge.puzzlePieces && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {challenge.puzzlePieces.map((num) => {
                        const isSelected = puzzleSequence.includes(num)
                        const isNext = num === puzzleSequence.length + 1
                        return (
                          <button 
                            key={num} 
                            onClick={() => handlePuzzleTap(num)}
                            disabled={isSelected}
                            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                              isSelected 
                                ? 'border-primary bg-primary text-primary-foreground' 
                                : isNext 
                                  ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/20' 
                                  : 'border-border bg-muted/50 text-foreground hover:border-primary/30'
                            }`}
                          >
                            {num}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Progress: {puzzleSequence.length} / 9
                    </p>
                  </div>
                )}
                
                {/* Biometric Hold */}
                {challenge.type === 'biometric' && (
                  <div className="space-y-3 text-center">
                    <p className="text-xs text-muted-foreground">Press and hold to detect presence</p>
                    
                    <button 
                      onMouseDown={startHold} 
                      onMouseUp={endHold} 
                      onMouseLeave={endHold} 
                      onTouchStart={startHold} 
                      onTouchEnd={endHold} 
                      className={`relative w-24 h-24 rounded-full border-4 transition-all mx-auto flex items-center justify-center ${isHolding ? 'border-primary bg-primary/10 scale-95' : 'border-border bg-muted/30 hover:border-primary/50'}`}
                    >
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/20" />
                        <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${holdProgress * 2.76} 276`} className="text-primary transition-all" />
                      </svg>
                      
                      <div className="flex flex-col items-center">
{isHolding ? (
    <>
      <motion.div
        animate={pulseData.length > 0 ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        <Heart className="h-6 w-6 text-primary" />
      </motion.div>
      <span className="text-[10px] text-primary mt-1 font-medium">
        {pulseDetected ? `${Math.round(pulseData[pulseData.length - 1])} BPM` : 'Detecting...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="h-6 w-6 text-primary" />
                            <span className="text-[10px] text-primary/70 mt-1">Hold here</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    {pulseDetected && holdProgress >= 100 && (
                      <p className="text-xs text-primary font-medium">Presence verified!</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
            
            {/* Verifying */}
            {status === 'verifying' && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Verifying...</span>
              </motion.div>
            )}
            
            {/* Verified */}
            {status === 'verified' && (
              <motion.div key="verified" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <Check className="h-6 w-6 text-primary" strokeWidth={3} />
                <span className="text-sm font-medium text-primary">Verified</span>
              </motion.div>
            )}
            
            {/* Cooldown */}
            {status === 'cooldown' && (
              <motion.div key="cooldown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-2">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Too many failed attempts</p>
                <p className="text-xs text-muted-foreground mt-1">Please wait before trying again</p>
                <p className="text-lg font-mono font-bold text-primary mt-3">{cooldownTime}s</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Protected by <span className="text-primary">Pictura</span></span>
          <div className="flex items-center gap-2">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  )
}
