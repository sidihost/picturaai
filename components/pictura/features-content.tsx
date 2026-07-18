'use client'

import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Zap, Sparkles, Wand2, Download, Share2, Palette, ImageIcon } from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'AI-Powered Generation',
    desc: 'Generate stunning images using advanced AI models. Describe what you want and watch Pictura bring it to life in seconds.',
  },
  {
    icon: Palette,
    title: 'Multiple Styles',
    desc: 'Choose from various artistic styles - realistic, abstract, anime, oil painting, and more. Every creation is unique.',
  },
  {
    icon: ImageIcon,
    title: 'Image to Image',
    desc: 'Upload your own images and let AI transform them. Remix, enhance, or completely reimagine your photos.',
  },
  {
    icon: Sparkles,
    title: 'Instant Improvements',
    desc: 'Our AI prompt improver instantly enhances your descriptions for better image quality and more accurate results.',
  },
  {
    icon: Download,
    title: 'Easy Downloads',
    desc: 'Download your creations in high resolution. Perfect for social media, design projects, or personal use.',
  },
  {
    icon: Share2,
    title: 'Share Your Art',
    desc: 'Build a gallery of your creations. Access all your images anytime, anywhere. Never lose your masterpieces.',
  },
]

export function FeaturesContent() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Why Pictura</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground">Powerful Features for Creators</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to generate, edit, and share stunning AI-powered images. Fast, intuitive, and completely free.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 hover:bg-card/60 transition-all group"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-primary/20 bg-primary/5 p-12 text-center"
          >
            <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Always Free, Always Fast</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              No subscriptions, no hidden fees. Generate as many images as you want. Pictura is completely free and runs blazingly fast.
            </p>
            <a
              href="/studio"
              className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all hover:opacity-90"
            >
              Start Creating Now
            </a>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
