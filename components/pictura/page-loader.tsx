'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PicturaIcon } from './pictura-logo'

interface PageLoaderProps {
  minDuration?: number // Minimum time to show loader in ms
}

export function PageLoader({ minDuration = 500 }: PageLoaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p
        return p + Math.random() * 15
      })
    }, 100)

    // Hide after content is ready
    const timer = setTimeout(() => {
      setProgress(100)
      setTimeout(() => setIsVisible(false), 200)
    }, minDuration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(timer)
    }
  }, [minDuration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mb-8"
          >
            <PicturaIcon size={48} />
          </motion.div>

          {/* Progress bar */}
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>

          {/* Loading text */}
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-4 text-xs text-muted-foreground"
          >
            Loading...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Inline loader for components
export function InlineLoader({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
    </div>
  )
}
