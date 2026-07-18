'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Mail, BookOpen, Cpu } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import Confetti from 'react-confetti'

export default function NewsletterSuccessPage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#C9A87C', '#B8956F', '#D4B896', '#A67C52', '#E5D4C0']}
        />
      )}

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.2 }}
            className="mx-auto mb-8"
          >
            <div className="relative inline-flex">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-1 -right-1 h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <PicturaIcon size={20} className="text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              You&apos;re In!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thanks for subscribing to the Pictura newsletter. We&apos;ll keep you updated with the latest features, tips, and AI image generation trends.
            </p>
          </motion.div>

          {/* What to expect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border/50 rounded-2xl p-6 mb-8 text-left"
          >
            <h3 className="font-semibold text-foreground mb-4">What to expect:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Weekly Updates</p>
                  <p className="text-xs text-muted-foreground">New features, model improvements, and tips</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Exclusive Tutorials</p>
                  <p className="text-xs text-muted-foreground">Learn advanced prompting techniques</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Early Access</p>
                  <p className="text-xs text-muted-foreground">Be the first to try new models and features</p>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              href="/studio"
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              Start Creating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/blog"
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-secondary/50 transition-colors"
            >
              Read Blog
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
