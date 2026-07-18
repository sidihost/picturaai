'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Clock, ImageIcon, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const showcaseImages = [
  {
    src: '/images/turbo-showcase-1.jpg',
    prompt: 'Cyberpunk woman with neon blue hair and chrome implants',
    category: 'Portrait',
  },
  {
    src: '/images/turbo-showcase-2.jpg',
    prompt: 'Crystalline ice dragon on snowy mountain peak',
    category: 'Fantasy',
  },
  {
    src: '/images/turbo-showcase-3.jpg',
    prompt: 'Luxury perfume bottle product photography',
    category: 'Product',
  },
  {
    src: '/images/turbo-showcase-4.jpg',
    prompt: 'Cozy anime cafe interior at sunset',
    category: 'Anime',
  },
]

const features = [
  {
    icon: Zap,
    title: '2x Faster',
    description: 'Generate images in under 5 seconds with our optimized inference pipeline.',
  },
  {
    icon: ImageIcon,
    title: 'Higher Resolution',
    description: 'Support for up to 2048x2048 pixel outputs with crystal clear details.',
  },
  {
    icon: Sparkles,
    title: 'Better Quality',
    description: 'Enhanced prompt adherence and photorealistic details in every generation.',
  },
  {
    icon: Check,
    title: 'Same Free Tier',
    description: 'Still free during beta with unlimited image generations. No credit card required.',
  },
]

const improvements = [
  { label: 'Prompt Adherence', before: '78%', after: '94%' },
  { label: 'Generation Speed', before: '12s', after: '5s' },
  { label: 'Detail Quality', before: 'Good', after: 'Excellent' },
  { label: 'Style Consistency', before: '82%', after: '96%' },
]

export default function Pi15TurboPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Back to Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <PicturaIcon size={18} className="text-primary" />
            </div>
            <span className="font-semibold text-foreground">Pictura</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium text-primary">Product Announcement</span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Introducing{' '}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              pi-1.5-turbo
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Our fastest and most capable image generation model yet. 2x faster inference, higher resolution support, and dramatically improved quality.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2">
              <Link href="/studio">
                Try it Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/#models">View All Models</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            <Clock className="mr-1 inline-block h-3 w-3" />
            Released March 1, 2026
          </p>
        </motion.div>

        {/* Showcase Gallery */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 sm:mt-20"
        >
          <h2 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
            Generated with pi-1.5-turbo
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            See what our latest model can create
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            {showcaseImages.map((img, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border/40 bg-secondary/30"
              >
                <Image
                  src={img.src}
                  alt={img.prompt}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, 300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="mb-1 inline-block rounded-md bg-primary/80 px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
                    {img.category}
                  </span>
                  <p className="text-xs text-white line-clamp-2">{img.prompt}</p>
                </div>
                {/* Watermark */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/30 px-1.5 py-0.5 backdrop-blur-sm">
                  <PicturaIcon size={10} className="text-white/80" />
                  <span className="text-[8px] text-white/80">pi-1.5</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 sm:mt-20"
        >
          <h2 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
            What&apos;s New
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Major improvements across the board
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                className="rounded-xl border border-border/40 bg-card p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Improvements Comparison */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 sm:mt-20"
        >
          <h2 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
            pi-1.0 vs pi-1.5-turbo
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Side-by-side comparison of key metrics
          </p>

          <div className="mt-8 overflow-hidden rounded-xl border border-border/40 bg-card">
            <div className="grid grid-cols-3 border-b border-border/40 bg-secondary/30 px-4 py-3 text-xs font-medium text-muted-foreground sm:text-sm">
              <div>Metric</div>
              <div className="text-center">pi-1.0</div>
              <div className="text-center text-primary">pi-1.5-turbo</div>
            </div>
            {improvements.map((item, i) => (
              <div
                key={item.label}
                className={`grid grid-cols-3 px-4 py-3.5 ${i !== improvements.length - 1 ? 'border-b border-border/30' : ''}`}
              >
                <div className="text-sm font-medium text-foreground">{item.label}</div>
                <div className="text-center text-sm text-muted-foreground">{item.before}</div>
                <div className="text-center text-sm font-semibold text-primary">{item.after}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 sm:mt-20"
        >
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center sm:p-12">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Ready to create with pi-1.5-turbo?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Start generating stunning images today. No credit card required.
            </p>
            <Button asChild size="lg" className="mt-6 gap-2">
              <Link href="/studio">
                Open Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <PicturaIcon size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">Pictura AI</span>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  )
}
