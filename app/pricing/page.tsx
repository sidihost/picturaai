'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check, Zap, Layers, Download, Globe, Shield, Clock } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
}

const included = [
  { icon: Zap, label: 'Text to Image generation' },
  { icon: Layers, label: 'Image to Image transformation' },
  { icon: Download, label: 'Full resolution downloads' },
  { icon: Globe, label: 'No sign-up required' },
  { icon: Shield, label: 'Safe and moderated content' },
  { icon: Clock, label: 'Unlimited image generations' },
]

const faq = [
  {
    q: 'Why is Pictura free?',
    a: 'Imoogle is a non-profit organization. We believe AI creativity tools should be accessible to everyone, regardless of their financial situation. We are funded by grants and donations.',
  },
  {
    q: 'Will there be a paid plan?',
    a: 'We are exploring sustainable models for the future, but our core offering will always remain free. Any future paid plans would be for heavy API usage and enterprise features.',
  },
  {
    q: 'Why is there a daily limit?',
    a: 'Image generation is currently unlimited during beta. Video generation still has fair-use limits while we scale infrastructure.',
  },
  {
    q: 'When will the API be available?',
    a: 'The Pictura API is currently in development. It will also be free during beta with generous rate limits for developers.',
  },
]

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pricing</h1>
            <p className="mt-3 text-base text-muted-foreground">
              Pictura is free. No tricks, no hidden costs.
            </p>
          </motion.div>

          {/* Pricing card */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mx-auto mt-12 max-w-lg rounded-2xl border border-primary/20 bg-card p-8 sm:p-10"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold text-foreground">$0</span>
              <span className="text-base text-muted-foreground">/ forever</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Full access to Pictura during beta. No credit card needed.
            </p>

            <div className="my-8 h-px bg-border/50" />

            <div className="flex flex-col gap-4">
              {included.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/studio"
              className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Start Creating
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* FAQ */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mt-20">
            <h2 className="text-center text-lg font-semibold text-foreground">Frequently Asked Questions</h2>
            <div className="mt-8 flex flex-col gap-4">
              {faq.map((item) => (
                <div key={item.q} className="rounded-xl border border-border/50 bg-card px-6 py-5">
                  <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
