'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Shield, Globe, Code2, ArrowRight, Copy, CheckCircle2, X, Lock, Eye, Fingerprint } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
}

export default function CaptchaPage() {
  const [copied, setCopied] = useState(false)
  const [demoVerified, setDemoVerified] = useState(false)
  
  const codeSnippet = `<!-- 1. Add the script -->
<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/captcha/widget.js" async defer></script>

<!-- 2. Add the CAPTCHA container -->
<div id="pictura-captcha" data-sitekey="YOUR_SITE_KEY"></div>

<!-- 3. Handle verification -->
<script>
  function onCaptchaVerify(token) {
    // Send token to your server for verification
    fetch('/your-api/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }
</script>`

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative border-b border-border/40 pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Check className="h-3 w-3" />
                  100% Free Forever
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                <span className="text-primary">Pictura</span>CAPTCHA
              </h1>
              <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                A free, privacy-first CAPTCHA service that protects your website from bots without annoying your users.
              </p>
              
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                <Link
                  href="/captcha/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Free Site Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/captcha/docs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Documentation
                </Link>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  No limits
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  No tracking
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  No ads
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="flex justify-center"
            >
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xl">
                  <p className="text-sm font-medium text-foreground mb-4">Try it yourself:</p>
                  <SmartCaptcha 
                    onVerify={() => setDemoVerified(true)} 
                    size="normal"
                  />
                  {demoVerified && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-sm text-primary flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Verified! See how easy that was?
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Why <span className="text-primary">Pictura</span>CAPTCHA?</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. No corporate surveillance, no paywalls, just protection.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'No tracking cookies, no data selling.' },
              { icon: Lock, title: 'Secure', desc: 'Strong bot detection algorithms.' },
              { icon: Globe, title: 'Global CDN', desc: 'Served from edge locations.' },
              { icon: Code2, title: 'Easy Integration', desc: '3 lines of code to integrate.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{feature.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works - Interactive Flow Diagram */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">How <span className="text-primary">Pictura</span>CAPTCHA Works</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Advanced bot detection powered by behavioral analysis and multiple challenge types
            </p>
          </motion.div>
          
          {/* Flow Diagram */}
          <div className="relative">
            {/* Connection lines - Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0" />
            
            <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
              {[
                {
                  step: '1',
                  title: 'User Arrives',
                  desc: 'Silent behavioral analysis begins immediately. Mouse movements, scroll patterns, and timing are tracked.',
                  icon: Eye,
                  wireframe: (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="aspect-video bg-background rounded border border-border/50 p-2 relative overflow-hidden">
                        <div className="absolute top-2 left-2 right-2 h-1.5 bg-border/50 rounded" />
                        <div className="absolute top-5 left-2 w-12 h-1 bg-border/30 rounded" />
                        <div className="absolute top-7 left-2 w-8 h-1 bg-border/30 rounded" />
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60">
                          <path d="M10,50 Q30,20 50,35 T90,15" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeDasharray="3,2" opacity="0.5" />
                          <circle cx="90" cy="15" r="3" fill="hsl(var(--primary))" opacity="0.7" />
                        </svg>
                        <div className="absolute bottom-2 right-2 text-[8px] text-muted-foreground">tracking...</div>
                      </div>
                    </div>
                  )
                },
                {
                  step: '2', 
                  title: 'Risk Score',
                  desc: 'AI calculates threat level based on 50+ behavioral signals. Humans pass silently, bots get challenged.',
                  icon: Shield,
                  wireframe: (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="aspect-video bg-background rounded border border-border/50 p-3 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-[10px] text-muted-foreground">Risk:</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-1/4 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
                          </div>
                          <div className="text-[10px] font-medium text-primary">Low</div>
                        </div>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                          <div className="h-1 bg-primary/30 rounded" />
                          <div className="h-1 bg-primary/30 rounded" />
                          <div className="h-1 bg-border/30 rounded" />
                        </div>
                        <div className="text-[8px] text-center text-muted-foreground mt-2">Human: 94%</div>
                      </div>
                    </div>
                  )
                },
                {
                  step: '3',
                  title: 'Verification',
                  desc: 'If needed, one of 9 challenge types is randomly selected. Users must pass 2-3 challenges based on risk.',
                  icon: Lock,
                  wireframe: (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <div className="aspect-video bg-background rounded border border-border/50 p-2">
                        <div className="h-full flex flex-col">
                          <div className="flex gap-1 mb-1">
                            <div className="w-4 h-1 bg-primary rounded-full" />
                            <div className="w-4 h-1 bg-primary/30 rounded-full" />
                            <div className="w-1 h-1 bg-border rounded-full" />
                          </div>
                          <div className="text-[8px] text-muted-foreground mb-1">Select all vehicles:</div>
                          <div className="flex-1 grid grid-cols-3 gap-0.5">
                            {[1,2,3,4,5,6].map(i => (
                              <div key={i} className={`rounded ${i === 1 || i === 3 ? 'bg-primary/20 ring-1 ring-primary' : 'bg-muted/50'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className="relative"
                >
                  <div className="rounded-xl border border-border bg-card p-5 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {item.step}
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      {i < 2 && (
                        <div className="hidden md:flex flex-1 justify-end">
                          <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                    {item.wireframe}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={3}
            variants={fadeUp}
            className="mt-10 rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">Security Features</h3>
                <ul className="mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" /> Cooldown after 3 failed attempts</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" /> Token expiration (5 minutes)</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" /> Domain verification</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" /> Rate limiting per IP</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" /> Mouse velocity analysis</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary flex-shrink-0" /> Keystroke timing detection</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Our Technology */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-10 sm:mb-12"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
              Advanced Technology
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Powered by Cutting-Edge Detection</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Our multi-layer security system combines behavioral biometrics, machine learning, and cryptographic verification
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Biometric Detection */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Biometric Presence Detection</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Our patent-pending touch analysis technology detects human presence through:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Touch pressure variance</strong> - Humans naturally vary pressure; bots are consistent</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Micro-movement analysis</strong> - Detecting natural hand tremors and adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Temporal patterns</strong> - Human touch has characteristic timing signatures</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Behavioral Analysis */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Behavioral Fingerprinting</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Before any challenge is shown, we silently analyze user behavior:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Mouse velocity curves</strong> - Humans have natural acceleration patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Keystroke dynamics</strong> - Typing rhythm is unique to each person</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Scroll behavior</strong> - Reading patterns and scroll velocity analysis</span>
                </li>
              </ul>
            </motion.div>
            
            {/* Challenge Variety */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">9 Challenge Types</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Randomized challenges prevent bots from learning patterns:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {['Math Problems', 'Pattern Sequences', 'Word Scrambles', 'Image Selection', 'Text Recognition', 'Slider Puzzles', 'Biometric Hold', 'Number Ordering', 'Sequence Completion'].map((type) => (
                  <div key={type} className="rounded-lg bg-muted/50 px-2 py-1.5 text-center text-muted-foreground">
                    {type}
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Cryptographic Security */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              variants={fadeUp}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">Cryptographic Verification</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Every verification is secured with industry-standard cryptography:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">HMAC-SHA256 tokens</strong> - Tamper-proof verification tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">5-minute expiration</strong> - Tokens cannot be reused or delayed</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-foreground">Domain binding</strong> - Tokens only valid for your registered domains</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Comparison Table */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Compare CAPTCHA Solutions</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">See how we stack up against the competition</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="w-full overflow-hidden"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-[500px]">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-3 sm:px-4 font-semibold text-foreground">Feature</th>
                      <th className="py-3 px-2 sm:px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <PicturaIcon size={16} />
                          <span className="font-semibold text-primary">Pictura</span>
                        </div>
                      </th>
                      <th className="py-3 px-2 sm:px-3 text-center font-semibold text-muted-foreground">reCAPTCHA</th>
                      <th className="py-3 px-2 sm:px-3 text-center font-semibold text-muted-foreground">hCaptcha</th>
                      <th className="py-3 px-2 sm:px-3 text-center font-semibold text-muted-foreground">Turnstile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { feature: 'Price', pictura: 'Free Forever', recaptcha: 'Free/Paid', hcaptcha: 'Free/Paid', turnstile: 'Free/Paid' },
                      { feature: 'Request Limit', pictura: 'Unlimited', recaptcha: '1M/mo', hcaptcha: '1M/mo', turnstile: '1M/mo' },
                      { feature: 'Privacy Focused', pictura: true, recaptcha: false, hcaptcha: 'Partial', turnstile: 'Partial' },
                      { feature: 'No Tracking', pictura: true, recaptcha: false, hcaptcha: false, turnstile: 'Partial' },
                      { feature: 'Invisible Mode', pictura: true, recaptcha: true, hcaptcha: true, turnstile: true },
                      { feature: 'Accessibility', pictura: 'AAA', recaptcha: 'AA', hcaptcha: 'AA', turnstile: 'AA' },
                    ].map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <td className="py-3 px-3 sm:px-4 font-medium text-foreground">{row.feature}</td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.pictura === 'boolean' ? (
                            row.pictura ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-primary font-medium text-xs sm:text-sm">{row.pictura}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.recaptcha === 'boolean' ? (
                            row.recaptcha ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">{row.recaptcha}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.hcaptcha === 'boolean' ? (
                            row.hcaptcha ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">{row.hcaptcha}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.turnstile === 'boolean' ? (
                            row.turnstile ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">{row.turnstile}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
              Swipe to see all providers
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Code Example */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="order-2 lg:order-1"
            >
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Integration in minutes</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Add PicturaCAPTCHA to your website with just a few lines of code. Works with React, Vue, Angular, and vanilla JS.
              </p>
              
              <div className="mt-6 space-y-3">
                {[
                  'Get your free site key',
                  'Add the script to your page',
                  'Add the CAPTCHA container',
                  'Handle the verification callback'
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm sm:text-base text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/captcha/docs"
                className="mt-6 inline-flex items-center gap-2 text-sm sm:text-base text-primary hover:underline"
              >
                Read full documentation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="order-1 lg:order-2"
            >
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary/60" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">index.html</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto bg-background">
                  <code className="text-foreground font-mono leading-relaxed whitespace-pre">
{`<!-- 1. Add the script -->
<script src="https://picturaai.sbs/api/captcha/widget.js" async defer></script>

<!-- 2. Add the CAPTCHA container -->
<div id="pictura-captcha" data-sitekey="YOUR_SITE_KEY"></div>

<!-- 3. Handle verification -->
<script>
  function onCaptchaVerify(token) {
    fetch('https://picturaai.sbs/api/captcha/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }
</script>`}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Ready to protect your website?</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Get started in minutes with our free CAPTCHA service and npm package support.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/captcha/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get Free Site Key
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/captcha/docs"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Read Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
