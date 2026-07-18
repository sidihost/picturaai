'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowLeft, Book, Code2, Server, Shield, Settings, Terminal, Fingerprint, Eye, Brain, Zap } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Book },
  { id: 'how-it-works', label: 'How It Works', icon: Brain },
  { id: 'installation', label: 'Installation', icon: Terminal },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'server-verification', label: 'Server Verification', icon: Server },
  { id: 'frameworks', label: 'Framework Guides', icon: Code2 },
  { id: 'security', label: 'Security', icon: Shield },
]

function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="h-2 w-2 rounded-full bg-primary/60" />
          </div>
          {filename && <span className="text-[10px] text-muted-foreground ml-2">{filename}</span>}
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-3 min-w-max">
          <code className="text-foreground font-mono text-[11px] leading-relaxed whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  )
}

export default function CaptchaDocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  // Use window.location.origin for the correct domain
  const BASE_URL = 'https://picturaai.sbs'

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="mx-auto max-w-5xl px-4 pt-20 pb-12">
        <Link href="/captcha" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to PicturaCAPTCHA
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Mobile dropdown */}
          <div className="lg:hidden">
            <select 
              value={activeSection}
              onChange={(e) => {
                setActiveSection(e.target.value)
                document.getElementById(e.target.value)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.label}</option>
              ))}
            </select>
          </div>
          
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-48 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              {/* Hero - Centered */}
              <div className="text-center mb-10 pb-8 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  <span className="text-primary">Pictura</span>CAPTCHA Documentation
                </h1>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Everything you need to integrate PicturaCAPTCHA into your website. Get started in under 5 minutes.
                </p>
              </div>
              
              {/* Getting Started */}
              <section id="getting-started" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Getting Started</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  PicturaCAPTCHA is completely free with no limits. Follow these steps:
                </p>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-foreground text-sm mb-3">Quick Start</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Get your free site key from <Link href="/captcha/dashboard" className="text-primary hover:underline">the dashboard</Link></li>
                    <li>Add the script tag to your HTML</li>
                    <li>Add the CAPTCHA container element</li>
                    <li>Verify tokens on your server</li>
                  </ol>
                </div>
              </section>
              
              {/* How It Works */}
              <section id="how-it-works" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">How It Works</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  PicturaCAPTCHA uses a multi-layered approach to distinguish humans from bots:
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">Behavioral Analysis</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tracks mouse movements, scroll velocity, typing patterns, and touch interactions. Humans have natural, varied patterns - bots move mechanically.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">Risk Scoring</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AI calculates a risk score (0-100). Low-risk users pass automatically. Higher risk triggers a challenge.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Fingerprint className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">Biometric Detection</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Our unique hold-to-verify feature detects human touch patterns and pressure variations - impossible for bots to replicate.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm">Smart Challenges</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      7 challenge types: math, patterns, image selection, text typing, word unscramble, slider, and biometric hold.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-muted/30 border border-border">
                  <h4 className="font-medium text-foreground text-sm mb-2">Auto-Verify Technology</h4>
                  <p className="text-xs text-muted-foreground">
                    When users answer correctly, PicturaCAPTCHA automatically verifies them - no need to click a submit button. Wrong answers show immediate feedback and load a new challenge. After 3 failed attempts, users must wait 60 seconds before trying again.
                  </p>
                </div>
              </section>
              
              {/* Installation */}
              <section id="installation" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Installation</h2>
                
                <h3 className="text-sm font-medium text-foreground mb-2">1. Add the Script</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Add this script tag to your HTML head or before the closing body tag:
                </p>
                <CodeBlock 
                  filename="index.html"
                  code={`<script src="${BASE_URL}/api/captcha/widget.js" async defer></script>`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">2. Add the Container</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  Place this where you want the CAPTCHA to appear:
                </p>
                <CodeBlock 
                  filename="form.html"
                  code={`<form id="myForm" method="POST" action="/submit">
  <input type="email" name="email" required />
  
  <!-- PicturaCAPTCHA Widget -->
  <div id="pictura-captcha" 
       data-sitekey="YOUR_SITE_KEY"
       data-callback="onCaptchaVerify">
  </div>
  
  <button type="submit">Submit</button>
</form>

<script>
  function onCaptchaVerify(token) {
    // Token is automatically added to form
    console.log('User verified! Token:', token);
  }
</script>`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">NPM Package</h3>
                <CodeBlock 
                  filename="terminal"
                  code={`npm install @pictura/captcha`}
                />
                <CodeBlock 
                  filename="react-example.tsx"
                  code={`import React from 'react'
import { createReactCaptcha } from '@pictura/captcha'

const PicturaCaptcha = createReactCaptcha(React)

export function ContactForm() {
  const [token, setToken] = React.useState('')

  return (
    <form>
      <PicturaCaptcha
        siteKey="YOUR_SITE_KEY"
        onVerify={setToken}
      />
      <button disabled={!token}>Submit</button>
    </form>
  )
}`}
                />
              </section>
              
              {/* Configuration */}
              <section id="configuration" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Configuration</h2>
                
                <div className="space-y-3">
                  {[
                    { attr: 'data-sitekey', default: 'required', desc: 'Your site key from the dashboard' },
                    { attr: 'data-callback', default: '-', desc: 'Function called on successful verification with token' },
                    { attr: 'data-expired-callback', default: '-', desc: 'Function called when token expires (after 5 min)' },
                    { attr: 'data-error-callback', default: '-', desc: 'Function called on error' },
                    { attr: 'data-size', default: 'normal', desc: 'Widget size: compact or normal' },
                    { attr: 'data-theme', default: 'auto', desc: 'Theme: light, dark, or auto' },
                  ].map((item) => (
                    <div key={item.attr} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="text-primary text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">{item.attr}</code>
                        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted">Default: {item.default}</span>
                      </div>
                      <span className="text-xs text-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Server Verification */}
              <section id="server-verification" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Server Verification</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-foreground">Always verify tokens on your server.</strong> Never trust client-side verification alone.
                </p>
                
                <CodeBlock 
                  filename="server.js"
                  code={`// POST to your server with the captcha token
const { captchaToken } = req.body;

// Verify with PicturaCAPTCHA API
const response = await fetch('${BASE_URL}/api/captcha/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret: process.env.PICTURA_CAPTCHA_SECRET, // Your secret key
    token: captchaToken,                         // Token from client
    ip: req.ip                                   // Optional: user IP
  })
});

const result = await response.json();

if (result.success) {
  // User is human - proceed with form submission
  console.log('Verification successful');
} else {
  // Verification failed
  console.log('Bot detected:', result.error);
  throw new Error('CAPTCHA verification failed');
}`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">Response Format</h3>
                <CodeBlock 
                  filename="response.json"
                  code={`// Success
{
  "success": true,
  "challenge_ts": "2024-01-15T12:00:00Z",
  "hostname": "yoursite.com"
}

// Failure
{
  "success": false,
  "error": "invalid-token" // or "expired-token", "already-used"
}`}
                />
              </section>
              
              {/* Frameworks */}
              <section id="frameworks" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Framework Guides</h2>
                
                <h3 className="text-sm font-medium text-foreground mb-2">React / Next.js</h3>
                <CodeBlock 
                  filename="ContactForm.tsx"
                  code={`'use client'
import { useState } from 'react';

export function ContactForm() {
  const [token, setToken] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please complete the CAPTCHA');
      return;
    }
    
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: e.target.email.value,
        captchaToken: token 
      })
    });
    
    if (res.ok) setSubmitted(true);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" required />
      
      {/* Import SmartCaptcha component */}
      <SmartCaptcha 
        siteKey="YOUR_SITE_KEY"
        onVerify={(t) => setToken(t)}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">Next.js API Route</h3>
                <CodeBlock 
                  filename="app/api/contact/route.ts"
                  code={`import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, captchaToken } = await req.json();
  
  // Verify CAPTCHA
  const captchaRes = await fetch(
    '${BASE_URL}/api/captcha/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.PICTURA_CAPTCHA_SECRET,
        token: captchaToken
      })
    }
  );
  
  const captchaData = await captchaRes.json();
  
  if (!captchaData.success) {
    return NextResponse.json(
      { error: 'CAPTCHA verification failed' },
      { status: 400 }
    );
  }
  
  // Process form...
  return NextResponse.json({ success: true });
}`}
                />


                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">Vue / Nuxt (Client)</h3>
                <CodeBlock 
                  filename="CaptchaForm.vue"
                  code={`<template>
  <form @submit.prevent="submitForm">
    <input v-model="email" type="email" required />
    <div id="pictura-captcha" data-sitekey="YOUR_SITE_KEY" data-callback="onCaptchaVerify"></div>
    <button type="submit">Submit</button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const email = ref('')
const captchaToken = ref('')

onMounted(() => {
  window.onCaptchaVerify = (token) => {
    captchaToken.value = token
  }
})

const submitForm = async () => {
  await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, captchaToken: captchaToken.value })
  })
}
</script>

<!-- Include once in app head -->
<!-- <script src="${BASE_URL}/api/captcha/widget.js" async defer></script> -->`}
                />

                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">Backend verification (Node, Python, PHP)</h3>
                <CodeBlock 
                  filename="verify-examples.txt"
                  code={`// Node.js (Express)
const verify = await fetch('${BASE_URL}/api/captcha/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ secret: process.env.PICTURA_CAPTCHA_SECRET, token: captchaToken })
}).then(r => r.json())

# Python (FastAPI / Flask style)
import requests
verify = requests.post('${BASE_URL}/api/captcha/verify', json={
  'secret': os.getenv('PICTURA_CAPTCHA_SECRET'),
  'token': captcha_token,
}).json()

// PHP
$verify = json_decode(file_get_contents('${BASE_URL}/api/captcha/verify', false, stream_context_create([
  'http' => [
    'method' => 'POST',
    'header' => "Content-Type: application/json\r\n",
    'content' => json_encode([
      'secret' => getenv('PICTURA_CAPTCHA_SECRET'),
      'token' => $captchaToken,
    ]),
  ]
])) , true);`}
                />
              </section>
              
              {/* Security */}
              <section id="security" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Security Best Practices</h2>
                
                <div className="grid gap-3">
                  {[
                    { title: 'Keep secrets secure', desc: 'Never expose your secret key in client-side code. Use environment variables.' },
                    { title: 'Verify every submission', desc: 'Always verify tokens server-side before processing any form.' },
                    { title: 'Tokens are single-use', desc: 'Each token can only be verified once to prevent replay attacks.' },
                    { title: 'Tokens expire quickly', desc: 'Tokens expire after 5 minutes. Users must re-verify if they wait too long.' },
                    { title: 'Domain validation', desc: 'Tokens are tied to your registered domain and cannot be used elsewhere.' },
                    { title: 'Rate limiting', desc: 'We rate limit verification requests to prevent abuse.' },
                  ].map((item) => (
                    <div key={item.title} className="bg-card border border-border rounded-xl p-4">
                      <h3 className="font-semibold text-foreground text-sm mb-1 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <h3 className="font-semibold text-foreground mb-2">Ready to get started?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your free account and get your API keys in seconds.
                </p>
                <Link 
                  href="/captcha/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
