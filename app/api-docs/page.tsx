'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, Code2, Shield, Globe, Terminal, Copy, Check, 
  ChevronRight, Zap, Send, Box, Layers, Sparkles, FileCode
} from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const PRICING_BY_COUNTRY: Record<string, { currency: string; symbol: string; perImage: number; freeCredits: number; pro: number }> = {
  NG: { currency: 'NGN', symbol: '₦', perImage: 5, freeCredits: 1000, pro: 5000 },
  US: { currency: 'USD', symbol: '$', perImage: 0.01, freeCredits: 2, pro: 10 },
  GB: { currency: 'GBP', symbol: '£', perImage: 0.008, freeCredits: 1.60, pro: 8 },
  DEFAULT: { currency: 'USD', symbol: '$', perImage: 0.01, freeCredits: 2, pro: 10 },
}

// How It Works Step Wireframe Components
function WireframeRequest() {
  return (
    <div className="bg-background rounded-lg border border-border/50 p-3 h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <div className="h-1 w-8 bg-muted-foreground/20 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-1">
          <span className="text-[8px] text-primary font-mono">POST</span>
          <div className="h-0.5 flex-1 bg-border rounded" />
        </div>
        <div className="bg-muted/50 rounded p-1.5">
          <div className="h-0.5 w-full bg-muted-foreground/15 rounded mb-1" />
          <div className="h-0.5 w-3/4 bg-muted-foreground/15 rounded mb-1" />
          <div className="h-0.5 w-1/2 bg-muted-foreground/15 rounded" />
        </div>
        <div className="flex justify-end">
          <div className="h-4 w-10 bg-primary/20 rounded flex items-center justify-center">
            <Send className="h-2 w-2 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

function WireframeProcess() {
  return (
    <div className="bg-background rounded-lg border border-border/50 p-3 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Box className="h-2.5 w-2.5 text-primary/60" />
          <div className="h-1 w-6 bg-muted-foreground/20 rounded" />
        </div>
        <div className="h-3 w-3 rounded-full border border-primary/30 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 mb-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className={`aspect-square rounded ${i <= 2 ? 'bg-primary/20' : 'bg-muted/50'}`} />
        ))}
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '66%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        />
      </div>
    </div>
  )
}

function WireframeResponse() {
  return (
    <div className="bg-background rounded-lg border border-border/50 p-3 h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="text-[8px] text-primary font-mono">200 OK</span>
      </div>
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 rounded border border-border/30 mb-2 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary/40" />
      </div>
      <div className="flex items-center gap-1">
        <div className="h-0.5 flex-1 bg-muted-foreground/15 rounded" />
        <Check className="h-2 w-2 text-primary" />
      </div>
    </div>
  )
}

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'node' | 'python' | 'curl'>('node')
  const [pricing, setPricing] = useState(PRICING_BY_COUNTRY.DEFAULT)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/developers/dashboard', { credentials: 'include' })
        setIsLoggedIn(res.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
    
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country_code) {
          setPricing(PRICING_BY_COUNTRY[data.country_code.toUpperCase()] || PRICING_BY_COUNTRY.DEFAULT)
        }
      } catch { /* Use default */ }
    }
    detectLocation()
  }, [])

  const installCmd = 'npm install @pictura/sdk'

  const codeSnippets = {
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({ apiKey: 'pk_live_...' })

const image = await client.images.generate({
  prompt: 'A mountain at sunset',
  model: 'pi-1.5-turbo'
})

console.log(image.url)`,
    python: `import pictura

client = pictura.Client(api_key="pk_live_...")

image = client.images.generate(
    prompt="A mountain at sunset",
    model="pi-1.5-turbo"
)

print(image.url)`,
    curl: `curl -X POST https://api.picturaai.sbs/v1/generate \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A mountain at sunset", "model": "pi-1.5-turbo"}'`,
  }

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text)
    if (id) {
      setCopiedSnippet(id)
      setTimeout(() => setCopiedSnippet(null), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    toast.success('Copied to clipboard')
  }

  const endpoints = [
    { 
      method: 'POST', 
      path: '/v1/generate', 
      title: 'Generate Image', 
      desc: 'Create images from text prompts using Pictura AI models',
      params: [
        { name: 'prompt', type: 'string', required: true, desc: 'Text description of the image' },
        { name: 'model', type: 'string', required: false, desc: 'Model ID (pi-1.5-turbo, pi-1.0). Default: pi-1.5-turbo' },
        { name: 'style', type: 'string', required: false, desc: 'Style preset (photorealistic, anime, oil-painting, etc.)' },
        { name: 'width', type: 'number', required: false, desc: 'Image width (256-1536). Default: 1024' },
        { name: 'height', type: 'number', required: false, desc: 'Image height (256-1536). Default: 1024' },
      ],
      response: { imageUrl: 'string', id: 'string', model: 'string', creditsUsed: 'number' }
    },
    { 
      method: 'POST', 
      path: '/v1/batch', 
      title: 'Batch Generation', 
      desc: 'Generate multiple images in parallel (up to 10-50 based on tier)',
      params: [
        { name: 'prompts', type: 'string[]', required: true, desc: 'Array of text prompts' },
        { name: 'model', type: 'string', required: false, desc: 'Model ID for all images' },
        { name: 'style', type: 'string', required: false, desc: 'Style preset for all images' },
      ],
      response: { jobId: 'string', status: 'string', images: 'array' }
    },
    { 
      method: 'POST', 
      path: '/v1/enhance-prompt', 
      title: 'Enhance Prompt', 
      desc: 'AI-powered prompt enhancement for better results',
      params: [
        { name: 'prompt', type: 'string', required: true, desc: 'Original prompt to enhance' },
        { name: 'style', type: 'string', required: false, desc: 'Target style for enhancement' },
      ],
      response: { enhancedPrompt: 'string', suggestions: 'string[]' }
    },
    { 
      method: 'POST', 
      path: '/v1/remove-background', 
      title: 'Remove Background', 
      desc: 'Remove background from images using AI',
      params: [
        { name: 'image', type: 'string', required: true, desc: 'Image URL or base64 data' },
      ],
      response: { imageUrl: 'string', creditsUsed: 'number' }
    },
    { 
      method: 'POST', 
      path: '/v1/upscale', 
      title: 'Upscale Image', 
      desc: 'Upscale images 2x-4x using AI super-resolution',
      params: [
        { name: 'image', type: 'string', required: true, desc: 'Image URL or base64 data' },
        { name: 'scale', type: 'number', required: false, desc: 'Scale factor (2 or 4). Default: 2' },
      ],
      response: { imageUrl: 'string', width: 'number', height: 'number', creditsUsed: 'number' }
    },
    { 
      method: 'GET', 
      path: '/v1/models', 
      title: 'List Models', 
      desc: 'Get available AI models and their capabilities',
      params: [],
      response: { models: '[{ id, name, description, creditCost }]' }
    },
  ]

  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)

  const fadeUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-28 sm:pt-32 pb-10 sm:pb-12">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 mb-4">
                <Check className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">API v1 Beta</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4 text-balance leading-tight">
                Build with Pictura API
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl leading-relaxed">
                Add AI image generation to any app. Simple REST API with SDKs for Node.js and Python. 
                Start with <span className="font-semibold text-foreground">{pricing.symbol}{pricing.freeCredits}</span> free credits.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href={isLoggedIn ? "/developers/dashboard" : "/developers/signup"}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get API Key"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleCopy(installCmd)}
                  className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-muted/60 text-foreground font-mono text-xs hover:bg-muted transition-all group"
                >
                  <span className="text-muted-foreground">$</span>
                  <span>{installCmd}</span>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works - Wireframe Flow */}
        <section className="py-10 sm:py-14 bg-muted/20">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="flex items-center gap-2 mb-6">
                <Layers className="h-4 w-4 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">How It Works</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 relative">
                {/* Connection lines - desktop only */}
                <div className="hidden md:block absolute top-1/2 left-[33%] w-[34%] h-px bg-gradient-to-r from-border via-primary/30 to-border -translate-y-1/2 z-0" />
                
                {[
                  { 
                    step: '1', 
                    title: 'Send Request', 
                    desc: 'POST your prompt and parameters to our API endpoint',
                    wireframe: <WireframeRequest />
                  },
                  { 
                    step: '2', 
                    title: 'Pictura Engine', 
                    desc: 'Our proprietary AI engine processes your prompt',
                    wireframe: <WireframeProcess />
                  },
                  { 
                    step: '3', 
                    title: 'Get Response', 
                    desc: 'Receive your generated image URL and metadata',
                    wireframe: <WireframeResponse />
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.1 } }
                    }}
                    className="relative z-10"
                  >
                    <div className="rounded-xl border border-border/50 bg-card p-4 h-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {item.step}
                        </div>
                        <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
                      <div className="aspect-[4/3]">
                        {item.wireframe}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-4 w-4 text-primary" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Quick Start</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-5">Get up and running in under a minute</p>
              
              <div className="rounded-xl border border-border/50 overflow-hidden bg-card max-w-2xl">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-muted/30">
                  <div className="flex items-center gap-0.5">
                    {(['node', 'python', 'curl'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        {tab === 'node' ? 'Node.js' : tab === 'python' ? 'Python' : 'cURL'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopy(codeSnippets[activeTab], 'code')}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    {copiedSnippet === 'code' ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <pre className="p-4 text-xs leading-relaxed text-foreground overflow-x-auto">
                  <code>{codeSnippets[activeTab]}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-10 sm:py-14 border-y border-border/30 bg-muted/10">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-5">Built for developers</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: Zap, title: 'Fast', desc: 'Under 10 seconds' },
                  { icon: Shield, title: 'Secure', desc: 'API key auth' },
                  { icon: Globe, title: '99.9% Uptime', desc: 'Reliable' },
                  { icon: Code2, title: 'SDKs', desc: 'Node & Python' },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="p-4 rounded-lg border border-border/30 bg-card/50 hover:bg-card hover:border-border/50 transition-all"
                  >
                    <f.icon className="h-4 w-4 text-primary mb-2" />
                    <h3 className="text-sm font-medium text-foreground">{f.title}</h3>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-primary" />
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">API Reference</h2>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded">Base URL: https://api.picturaai.sbs</span>
              </div>
              
              <div className="space-y-2">
                {endpoints.map((ep, i) => (
                  <motion.div
                    key={ep.path}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="rounded-lg border border-border/40 bg-card/50 overflow-hidden"
                  >
                    {/* Endpoint Header */}
                    <button
                      onClick={() => setExpandedEndpoint(expandedEndpoint === ep.path ? null : ep.path)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-all"
                    >
                      <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'
                      }`}>
                        {ep.method}
                      </span>
                      <div className="flex-1 min-w-0 text-left">
                        <code className="text-xs text-foreground font-mono">{ep.path}</code>
                        <span className="text-[10px] text-muted-foreground ml-2">{ep.title}</span>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                        expandedEndpoint === ep.path ? 'rotate-90' : ''
                      }`} />
                    </button>
                    
                    {/* Expanded Details */}
                    {expandedEndpoint === ep.path && (
                      <div className="border-t border-border/30 bg-muted/20 p-4 space-y-4">
                        <p className="text-xs text-muted-foreground">{ep.desc}</p>
                        
                        {/* Parameters */}
                        {ep.params && ep.params.length > 0 && (
                          <div>
                            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Request Parameters</h4>
                            <div className="rounded-lg border border-border/30 overflow-hidden">
                              <table className="w-full text-xs">
                                <thead className="bg-muted/50">
                                  <tr>
                                    <th className="text-left p-2 font-medium text-foreground">Name</th>
                                    <th className="text-left p-2 font-medium text-foreground">Type</th>
                                    <th className="text-left p-2 font-medium text-foreground hidden sm:table-cell">Required</th>
                                    <th className="text-left p-2 font-medium text-foreground">Description</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                  {ep.params.map((param) => (
                                    <tr key={param.name} className="hover:bg-muted/30">
                                      <td className="p-2 font-mono text-primary">{param.name}</td>
                                      <td className="p-2 text-muted-foreground">{param.type}</td>
                                      <td className="p-2 hidden sm:table-cell">
                                        {param.required ? (
                                          <span className="text-[9px] bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded">required</span>
                                        ) : (
                                          <span className="text-[9px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">optional</span>
                                        )}
                                      </td>
                                      <td className="p-2 text-muted-foreground">{param.desc}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Response */}
                        {ep.response && (
                          <div>
                            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Response</h4>
                            <div className="rounded-lg bg-zinc-950 p-3 overflow-x-auto">
                              <pre className="text-[11px] text-green-400 font-mono">
{`{
  "success": true,
  "data": ${JSON.stringify(ep.response, null, 4).split('\n').join('\n  ')}
}`}
                              </pre>
                            </div>
                          </div>
                        )}
                        
                        {/* Example cURL */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Example Request</h4>
                            <button
                              onClick={() => {
                                const example = ep.method === 'GET' 
                                  ? `curl "https://api.picturaai.sbs${ep.path}" -H "Authorization: Bearer YOUR_API_KEY"`
                                  : `curl -X POST "https://api.picturaai.sbs${ep.path}" -H "Authorization: Bearer YOUR_API_KEY" -H "Content-Type: application/json" -d '${JSON.stringify(
                                      ep.params?.reduce((acc, p) => ({ ...acc, [p.name]: p.type === 'string' ? 'example' : p.type === 'number' ? 1024 : ['example'] }), {}) || {}
                                    )}'`
                                handleCopy(example, ep.path)
                              }}
                              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                              {copiedSnippet === ep.path ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                              Copy
                            </button>
                          </div>
                          <div className="rounded-lg bg-zinc-950 p-3 overflow-x-auto">
                            <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap break-all">
{ep.method === 'GET' 
  ? `curl "https://api.picturaai.sbs${ep.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`
  : `curl -X POST "https://api.picturaai.sbs${ep.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
      ep.params?.filter(p => p.required).reduce((acc, p) => ({ 
        ...acc, 
        [p.name]: p.type === 'string' ? (p.name === 'prompt' ? 'A beautiful sunset over mountains' : p.name === 'image' ? 'https://example.com/image.jpg' : 'example') : p.type === 'number' ? 1024 : p.type === 'string[]' ? ['prompt 1', 'prompt 2'] : 'value' 
      }), {}) || {},
      null, 2
    )}'`}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              {/* Authentication Note */}
              <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-1">Authentication</h4>
                    <p className="text-xs text-muted-foreground">
                      All API requests require authentication. Include your API key in the Authorization header:
                    </p>
                    <code className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-1 rounded mt-2 inline-block">
                      Authorization: Bearer pk_live_your_api_key
                    </code>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-10 sm:py-14 border-t border-border/30 bg-muted/10">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-5">Simple Pricing</h2>
              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
                {/* Free */}
                <div className="rounded-xl border border-border/50 bg-card p-5">
                  <div className="text-xs text-muted-foreground mb-1">Free Tier</div>
                  <div className="text-2xl font-bold text-foreground mb-3">
                    {pricing.symbol}0<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />{pricing.symbol}{pricing.freeCredits} free credits</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />All models included</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Community support</li>
                  </ul>
                  <Link
                    href={isLoggedIn ? "/developers/dashboard" : "/developers/signup"}
                    className="block text-center w-full py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-all"
                  >
                    {isLoggedIn ? "View Dashboard" : "Get Started"}
                  </Link>
                </div>
                
                {/* Pro */}
                <div className="rounded-xl border border-primary/50 bg-primary/5 p-5 relative">
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded">
                    Popular
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">Pro</div>
                  <div className="text-2xl font-bold text-foreground mb-3">
                    {pricing.symbol}{pricing.pro}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground mb-4">
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />1000 images/month</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Priority processing</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Priority support</li>
                  </ul>
                  <Link
                    href={isLoggedIn ? "/developers/dashboard" : "/developers/signup"}
                    className="block text-center w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                  >
                    {isLoggedIn ? "Upgrade Now" : "Start Pro"}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-5xl px-5">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center"
            >
              <PicturaIcon size={32} className="mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                {isLoggedIn ? "Continue building" : "Ready to build?"}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {isLoggedIn ? "Head to your dashboard to manage API keys and view usage." : "Get your API key and start generating images in minutes."}
              </p>
              <Link
                href={isLoggedIn ? "/developers/dashboard" : "/developers/signup"}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
              >
                {isLoggedIn ? "Go to Dashboard" : "Get API Key"}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
