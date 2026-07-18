'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search, ImageIcon } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full text-center">
          {/* Animated 404 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              {/* 4 */}
              <motion.span
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="text-8xl sm:text-9xl font-bold text-primary/20"
              >
                4
              </motion.span>
              
              {/* Logo as 0 */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring', damping: 12 }}
                className="mx-2"
              >
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <PicturaIcon size={40} className="text-primary" />
                </div>
              </motion.div>
              
              {/* 4 */}
              <motion.span
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                className="text-8xl sm:text-9xl font-bold text-primary/20"
              >
                4
              </motion.span>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Page Not Found
            </h1>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
            </p>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card border border-border/50 rounded-2xl p-6 mb-8"
          >
            <h3 className="font-semibold text-foreground mb-4 text-sm">Try these instead:</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/studio"
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Studio</p>
                  <p className="text-xs text-muted-foreground">Create images</p>
                </div>
              </Link>
              <Link
                href="/models"
                className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground text-sm group-hover:text-primary transition-colors">Models</p>
                  <p className="text-xs text-muted-foreground">Explore AI models</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* CTA Buttons - Made bigger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-primary text-primary-foreground text-base font-semibold hover:bg-primary/90 transition-colors"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl border border-border bg-card text-foreground text-base font-semibold hover:bg-secondary/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
