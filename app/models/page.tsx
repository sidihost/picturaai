'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronRight, Cpu, ImageIcon, Layers, Brush, Camera, Palette, Users, Building2, Wand2, Download, ExternalLink, Clock, Maximize, FileImage, Ratio } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function ModelsPage() {
  const [activeModel, setActiveModel] = useState<'pi-1.0' | 'pi-1.5-turbo'>('pi-1.5-turbo')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-5xl px-4 pt-28 pb-16 sm:pt-36 sm:pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card px-4 py-1.5 mb-8">
              <Cpu className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">AI Models</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance leading-tight">
              Image Generation Models
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 text-balance">
              State-of-the-art diffusion models designed for creative professionals. 
              From rapid prototyping to production-ready assets.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Try in Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-card transition-colors"
              >
                API Documentation
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Model Selector Tabs */}
      <section className="sticky top-16 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex gap-1 py-2 overflow-x-auto">
            {[
              { id: 'pi-1.5-turbo', name: 'pi-1.5-turbo', badge: 'Latest' },
              { id: 'pi-1.0', name: 'pi-1.0', badge: null },
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => setActiveModel(model.id as 'pi-1.0' | 'pi-1.5-turbo')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeModel === model.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <PicturaIcon size={16} className={activeModel === model.id ? 'text-primary' : 'text-muted-foreground'} />
                {model.name}
                {model.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded">
                    {model.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Model Details - pi-1.5-turbo */}
      {activeModel === 'pi-1.5-turbo' && (
        <div>
          {/* Model Intro */}
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-5xl px-4">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PicturaIcon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Pictura pi-1.5-turbo</h2>
                      <p className="text-xs text-muted-foreground">Our fastest and most capable model</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    pi-1.5-turbo delivers frontier performance for image generation with 2x faster inference, 
                    higher fidelity outputs, and improved prompt understanding. Built on an optimized diffusion 
                    backbone with enhanced attention mechanisms for better compositional understanding.
                  </p>

                  <div className="space-y-2 mb-5">
                    {[
                      'Up to 2048x2048 resolution output',
                      '2x faster generation than pi-1.0',
                      'Enhanced detail and texture quality',
                      'Improved prompt adherence and accuracy',
                      'Better handling of complex compositions',
                      'Consistent style across generations',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-xs text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/studio"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    Try pi-1.5-turbo now
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="relative aspect-square rounded-xl overflow-hidden border border-border/50">
                  <Image
                    src="/images/model-sample-turbo.jpg"
                    alt="pi-1.5-turbo sample output"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] text-white/70 mb-0.5">Generated with pi-1.5-turbo</p>
                    <p className="text-xs text-white font-medium">&quot;Hyperrealistic mountain landscape at golden hour&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-12 sm:py-16 border-t border-border/40 bg-card/30">
            <div className="mx-auto max-w-5xl px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-3">Use Cases</h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  pi-1.5-turbo excels across a wide range of creative and commercial applications
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: Brush,
                    title: 'Creative Design',
                    description: 'Generate concept art, illustrations, and creative assets with precise control over style and composition.',
                  },
                  {
                    icon: Camera,
                    title: 'Product Photography',
                    description: 'Create photorealistic product shots, lifestyle imagery, and commercial photography at scale.',
                  },
                  {
                    icon: Palette,
                    title: 'Brand Assets',
                    description: 'Produce consistent brand imagery, social media content, and marketing materials.',
                  },
                  {
                    icon: Layers,
                    title: 'Rapid Prototyping',
                    description: 'Quickly iterate on visual concepts and ideas before committing to full production.',
                  },
                  {
                    icon: Users,
                    title: 'Personalization',
                    description: 'Generate personalized visuals for user experiences and targeted content.',
                  },
                  {
                    icon: Building2,
                    title: 'Enterprise Workflows',
                    description: 'Integrate into existing pipelines with our API for automated content generation.',
                  },
                ].map((useCase, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors"
                  >
                    <useCase.icon className="h-5 w-5 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1.5">{useCase.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{useCase.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="py-12 sm:py-16 border-t border-border/40">
            <div className="mx-auto max-w-5xl px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-3">Technical Specifications</h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  Detailed specifications for developers and technical teams
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Maximize, label: 'Max Resolution', value: '2048 x 2048', sublabel: 'pixels' },
                  { icon: Clock, label: 'Generation Time', value: '~3-5s', sublabel: 'average' },
                  { icon: FileImage, label: 'Output Formats', value: 'PNG, JPG', sublabel: 'supported' },
                  { icon: Ratio, label: 'Aspect Ratios', value: '1:1, 16:9, 9:16', sublabel: 'available' },
                ].map((spec, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/50 bg-card/50 text-center">
                    <spec.icon className="h-4 w-4 text-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">{spec.label}</p>
                    <p className="text-sm sm:text-base font-bold text-foreground">{spec.value}</p>
                    <p className="text-[10px] text-muted-foreground">{spec.sublabel}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-5 rounded-xl border border-border/50 bg-card/50">
                <h3 className="font-semibold text-foreground mb-4">API Integration</h3>
                <div className="bg-secondary/50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-foreground whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
{`curl -X POST https://api.pictura.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "pi-1.5-turbo",
    "prompt": "A serene Japanese garden at dawn",
    "size": "1024x1024"
  }'`}
                  </pre>
                </div>
                <Link
                  href="/api-docs"
                  className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  View full API documentation
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* Availability & Pricing */}
          <section className="py-12 sm:py-16 border-t border-border/40 bg-card/30">
            <div className="mx-auto max-w-5xl px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-foreground mb-3">Availability & Pricing</h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  Flexible options for individuals and teams
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                <div className="p-5 rounded-xl border border-border/50 bg-background">
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Studio Access</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Use pi-1.5-turbo directly in our web studio with an intuitive interface.
                  </p>
                  <p className="text-2xl font-bold text-foreground mb-1">Free</p>
                  <p className="text-xs text-muted-foreground mb-4">Unlimited image generations during beta</p>
                  <Link
                    href="/studio"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Open Studio
                  </Link>
                </div>

                <div className="p-5 rounded-xl border border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-2 mb-3">
                    <Cpu className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">API Access</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    Integrate pi-1.5-turbo into your applications with our REST API.
                  </p>
                  <p className="text-2xl font-bold text-foreground mb-1">$0.02</p>
                  <p className="text-xs text-muted-foreground mb-4">per generation</p>
                  <Link
                    href="/api-docs"
                    className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold hover:bg-primary/10 transition-colors"
                  >
                    Get API Key
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Model Details - pi-1.0 */}
      {activeModel === 'pi-1.0' && (
        <div>
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-5xl px-4">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <PicturaIcon size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Pictura pi-1.0</h2>
                      <p className="text-xs text-muted-foreground">Our foundational model</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    pi-1.0 is our original release model, offering reliable image generation with good 
                    quality outputs. While pi-1.5-turbo offers improved performance, pi-1.0 remains 
                    available for users who prefer consistency with existing workflows.
                  </p>

                  <div className="space-y-2 mb-5">
                    {[
                      'Up to 1024x1024 resolution output',
                      'Stable and reliable generation',
                      'Good for general-purpose imagery',
                      'Consistent results across runs',
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-xs text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Recommendation:</strong> For best results, we recommend 
                      using pi-1.5-turbo which offers significant improvements in quality and speed.
                    </p>
                  </div>
                </div>

                <div className="relative aspect-square rounded-xl overflow-hidden border border-border/50">
                  <Image
                    src="/images/model-sample-pi10.jpg"
                    alt="pi-1.0 sample output"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-[10px] text-white/70 mb-0.5">Generated with pi-1.0</p>
                    <p className="text-xs text-white font-medium">&quot;Mountain landscape at golden hour&quot;</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Specifications for pi-1.0 */}
          <section className="py-12 sm:py-16 border-t border-border/40 bg-card/30">
            <div className="mx-auto max-w-5xl px-4">
              <h2 className="text-2xl font-bold text-foreground mb-8 text-center">Technical Specifications</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {[
                  { icon: Maximize, label: 'Max Resolution', value: '1024 x 1024', sublabel: 'pixels' },
                  { icon: Clock, label: 'Generation Time', value: '~5-8s', sublabel: 'average' },
                  { icon: FileImage, label: 'Output Formats', value: 'PNG, JPG', sublabel: 'supported' },
                  { icon: Ratio, label: 'Aspect Ratios', value: '1:1', sublabel: 'available' },
                ].map((spec, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/50 bg-background text-center">
                    <spec.icon className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">{spec.label}</p>
                    <p className="text-sm sm:text-base font-bold text-foreground">{spec.value}</p>
                    <p className="text-[10px] text-muted-foreground">{spec.sublabel}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Comparison Table */}
      <section className="py-12 sm:py-16 border-t border-border/40">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">Model Comparison</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Choose the right model for your needs
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">pi-1.0</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">pi-1.5-turbo</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Max Resolution', pi10: '1024px', pi15: '2048px' },
                  { feature: 'Generation Speed', pi10: '5-8 seconds', pi15: '3-5 seconds' },
                  { feature: 'Detail Quality', pi10: 'Good', pi15: 'Excellent' },
                  { feature: 'Prompt Adherence', pi10: 'Good', pi15: 'Excellent' },
                  { feature: 'Complex Compositions', pi10: 'Basic', pi15: 'Advanced' },
                  { feature: 'Aspect Ratios', pi10: '1:1 only', pi15: 'Multiple' },
                  { feature: 'API Access', pi10: 'Yes', pi15: 'Yes' },
                  { feature: 'Studio Access', pi10: 'Yes', pi15: 'Yes' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-3 px-4 text-foreground">{row.feature}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{row.pi10}</td>
                    <td className="py-3 px-4 text-center text-foreground font-medium">{row.pi15}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Coming Soon - pi-2.0 */}
      <section className="py-12 sm:py-16 border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center p-8 rounded-xl border border-dashed border-border/50">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <PicturaIcon size={24} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">pi-2.0 In Development</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Our next-generation model coming soon with breakthrough capabilities 
              in understanding, composition, and photorealism. Be first to know.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Follow our blog for updates
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 border-t border-border/40">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to create?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Start generating images with Pictura today. Free during beta.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Open Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/api-docs"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold hover:bg-card transition-colors"
              >
                <Download className="h-4 w-4" />
                API Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
