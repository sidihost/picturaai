'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, Check, Circle, Users, Lightbulb, Globe, Cpu, Shield, Zap, Eye,
} from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const roadmap = [
  { label: 'Pictura Beta Launch', status: 'Live' as const },
  { label: 'Text-to-Image Generation', status: 'Live' as const },
  { label: 'Image-to-Image Transformation', status: 'Live' as const },
  { label: 'Pictura Public API', status: 'Live' as const },
  { label: 'Developer SDKs', status: 'Live' as const },
  { label: 'Higher Resolution Outputs', status: 'In Progress' as const },
  { label: 'Increased Daily Limits', status: 'In Progress' as const },
]

const values = [
  { icon: Globe, title: 'Accessibility', description: 'AI creativity should be free and open to everyone, regardless of location or resources.' },
  { icon: Users, title: 'Community', description: 'We build in public and value feedback from every user who touches Pictura.' },
  { icon: Lightbulb, title: 'Innovation', description: 'We push boundaries from Nigeria, proving world-class AI can come from anywhere.' },
]

const archNodes = [
  { icon: Zap, label: 'Prompt Analysis', angle: 0 },
  { icon: Cpu, label: 'Model Router', angle: 60 },
  { icon: Eye, label: 'Diffusion Engine', angle: 120 },
  { icon: Shield, label: 'Safety Filter', angle: 180 },
  { icon: Lightbulb, label: 'Enhancement', angle: 240 },
  { icon: Globe, label: 'CDN Delivery', angle: 300 },
]

/* Pre-compute all node positions to avoid floating-point hydration mismatches */
const R = 110
const CX = 160
const CY = 160
const nodePositions = archNodes.map((node) => {
  const rad = (node.angle * Math.PI) / 180
  return {
    ...node,
    svgX: Math.round(CX + R * Math.cos(rad)),
    svgY: Math.round(CY + R * Math.sin(rad)),
    divLeft: Math.round(CX + R * Math.cos(rad) - 24),
    divTop: Math.round(CY + R * Math.sin(rad) - 24),
  }
})

/* Animated hub-and-spoke wire architecture diagram */
function ArchDiagram() {
  const [mounted, setMounted] = useState(false)
  const [pulseIndex, setPulseIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
    const id = setInterval(() => setPulseIndex((p) => (p + 1) % archNodes.length), 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative mx-auto flex h-[340px] w-[340px] items-center justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 320" aria-hidden="true">
        {/* Wires from center to each node */}
        {nodePositions.map((node) => (
          <line key={node.label} x1={CX} y1={CY} x2={node.svgX} y2={node.svgY} stroke="currentColor" strokeWidth="1" className="text-border" />
        ))}
        {/* Animated pulse dot - only on client */}
        {mounted && nodePositions[pulseIndex] && (
          <circle r="3" className="text-primary" fill="currentColor" opacity="0.7" key={`pulse-${pulseIndex}`}>
            <animate attributeName="cx" from={CX} to={nodePositions[pulseIndex].svgX} dur="0.8s" fill="freeze" />
            <animate attributeName="cy" from={CY} to={nodePositions[pulseIndex].svgY} dur="0.8s" fill="freeze" />
            <animate attributeName="opacity" from="0.8" to="0" dur="0.8s" fill="freeze" />
          </circle>
        )}
        {/* Outer ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" className="text-border/50" />
      </svg>

      {/* Center hub */}
      <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-card shadow-sm">
        <PicturaIcon size={28} />
      </div>

      {/* Nodes - positions are pre-computed integers so server/client match */}
      {nodePositions.map((node, i) => {
        const isPulsing = mounted && i === pulseIndex
        return (
          <div
            key={node.label}
            className="absolute flex flex-col items-center gap-1.5"
            style={{ left: `${node.divLeft}px`, top: `${node.divTop}px`, width: '48px' }}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-card shadow-sm transition-all duration-500 ${
              isPulsing ? 'border-primary/40 scale-110' : 'border-border/50'
            }`}>
              <node.icon className={`h-4 w-4 transition-colors duration-500 ${isPulsing ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <span className="whitespace-nowrap text-[9px] font-medium text-muted-foreground">{node.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6">
          {/* Header - centered */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center">
            <PicturaIcon size={48} className="mx-auto" />
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Imoogle</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Non-profit AI Research &middot; Nigeria
            </p>
          </motion.div>

          <div className="my-12 h-px bg-border/50" />

          {/* Company */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mb-16">
            <h2 className="text-lg font-semibold text-foreground">Who We Are</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Imoogle Technology is a non-profit Nigerian artificial intelligence company.
                Through our research division, <strong className="text-foreground">Imoogle Labs</strong>, we build
                AI-powered creative tools for Africa and the world.
              </p>
              <p>
                We believe powerful AI should not be exclusive to a few companies in Silicon Valley.
                Africa has incredible talent, creativity, and ambition&mdash;and Imoogle exists to channel
                that energy into world-class products.
              </p>
            </div>
          </motion.section>

          {/* Pictura */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mb-16">
            <h2 className="text-lg font-semibold text-foreground">About Pictura</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Pictura is the <strong className="text-foreground">Imoogle Picture Model</strong>&mdash;an AI image
                generation system that creates images from text descriptions and transforms existing images based on prompts.
              </p>
              <p>
                Pictura is in <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Beta</span>.
                During this period, the model is completely free with unlimited image generations for users.
                No sign-up required.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Architecture - wider section for the diagram */}
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Model Architecture</h2>
              <p className="mt-2 text-sm text-muted-foreground">How Pictura processes your prompts into images.</p>
            </div>

            {/* Animated orbital diagram */}
            <div className="mt-8">
              <ArchDiagram />
            </div>

            {/* Architecture cards */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { icon: Cpu, title: 'Multi-Model Pipeline', description: 'Chains specialized models together, routing prompts to style-optimized pathways for the best visual quality.' },
                { icon: Shield, title: 'Safety Layer', description: 'Every generation passes through content moderation and safety filtering before delivery to users.' },
                { icon: Globe, title: 'Edge Delivery', description: 'Generated images are served via a global CDN for instant access anywhere in the world.' },
                { icon: Lightbulb, title: 'Prompt Intelligence', description: 'NLP-powered prompt analysis enhances your descriptions for significantly better visual output.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-3.5 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mx-auto max-w-2xl px-6">
          {/* Nigeria */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mb-16">
            <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-4 w-6 overflow-hidden rounded-sm" aria-label="Nigerian flag">
                  <span className="w-1/3 bg-[#008751]" />
                  <span className="w-1/3 bg-[#FFFFFF] border-y border-border/30" />
                  <span className="w-1/3 bg-[#008751]" />
                </span>
                <h2 className="text-lg font-semibold text-foreground">Built in Nigeria</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Nigeria is our home and Africa is our launchpad. We are committed to demonstrating that
                world-class AI innovation can come from anywhere. We are proudly Nigerian, and we are just getting started.
              </p>
            </div>
          </motion.section>

          {/* Values */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mb-16">
            <h2 className="text-lg font-semibold text-foreground">Our Values</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-primary/20">
                  <v.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Roadmap */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6} variants={fadeUp} className="mb-16">
            <h2 className="text-lg font-semibold text-foreground">Roadmap</h2>
            <div className="mt-5 flex flex-col gap-2.5">
              {roadmap.map((item) => {
                const isLive = item.status === 'Live'
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      {isLive ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center">
                          <Circle className="h-2 w-2 text-border" />
                        </div>
                      )}
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        item.status === 'Live'
                          ? 'bg-primary/10 text-primary'
                          : item.status === 'In Progress'
                            ? 'bg-accent/15 text-accent-foreground'
                            : item.status === 'Coming Soon'
                              ? 'bg-muted text-muted-foreground'
                              : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7} variants={fadeUp} className="text-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Try Pictura Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
