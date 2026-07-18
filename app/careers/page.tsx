'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Globe, Rocket, Heart, Users, ChevronDown, Image, Briefcase } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const DEPARTMENTS = ['All Departments', 'Engineering', 'Design', 'Growth', 'Content']

const jobs = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build the core infrastructure powering Pictura AI. Work on distributed systems, ML pipelines, and real-time image generation at scale.',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Transform raw data into actionable insights. Help us understand user behavior, model performance, and business metrics.',
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Shape the visual identity of Pictura. Create stunning marketing assets, product illustrations, and brand materials.',
  },
  {
    id: 'video-animator',
    title: 'Video Animator',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create compelling motion graphics and animations. Bring our AI-generated content to life through video storytelling.',
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    description: 'Own our social presence across all platforms. Build community, drive engagement, and amplify the Pictura brand globally.',
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    department: 'Content',
    location: 'Remote',
    type: 'Full-time',
    description: 'Write compelling content that educates and inspires. From blog posts to documentation, help users get the most from Pictura.',
  },
  {
    id: 'partner-growth-manager',
    title: 'Partner Growth Manager',
    department: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build strategic partnerships that expand our reach. Work with creators, brands, and platforms to grow the Pictura ecosystem.',
  },
]

const perks = [
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world' },
  { icon: Rocket, title: 'Ownership', desc: 'Take real ownership of your work' },
  { icon: Heart, title: 'Growth', desc: 'Learn alongside talented people' },
  { icon: Users, title: 'Impact', desc: 'Build something meaningful' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function CareersPage() {
  const [activeDepartment, setActiveDepartment] = useState('All Departments')

  const filteredJobs = jobs.filter(
    job => activeDepartment === 'All Departments' || job.department === activeDepartment
  )

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-14 sm:pt-32 sm:pb-16">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/0.15,transparent_70%)]" />
          </div>

          <div className="mx-auto max-w-2xl px-6 text-center">
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
              <PicturaIcon size={40} className="mx-auto" />
              <p className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                We&apos;re hiring
              </p>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Join{' '}
                <span className="relative inline-block">
                  <span className="text-primary">Pictura</span>
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M0 6 Q25 0 50 4 T100 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-primary/40"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                Help us build the future of AI-powered creativity. We&apos;re a small, remote team based in Nigeria with big ambitions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats - Clean Infographic */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-6">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4"
            >
              {[
                { icon: Image, value: '10K+', label: 'Images Generated', color: 'from-primary/20 to-primary/5' },
                { icon: Users, value: '3K+', label: 'Active Creators', color: 'from-primary/20 to-primary/5' },
                { icon: Globe, value: '100%', label: 'Remote Team', color: 'from-primary/20 to-primary/5' },
                { icon: Briefcase, value: String(jobs.length), label: 'Open Roles', color: 'from-primary/20 to-primary/5' },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  custom={i} 
                  variants={fadeUp} 
                  className="relative group"
                >
                  <div className={`rounded-2xl bg-gradient-to-br ${stat.color} p-6 text-center transition-all hover:shadow-md`}>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mb-3">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-6">
          {/* Why Join */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={1} 
            variants={fadeUp} 
            className="py-16 sm:py-20 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Why join{' '}
              <span className="relative inline-block">
                <span className="text-primary">us</span>
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 30 6"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 5 Q7 0 15 3 T30 1"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-primary/50"
                  />
                </svg>
              </span>
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((perk, i) => (
                <motion.div 
                  key={perk.title}
                  custom={i + 1}
                  variants={fadeUp}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <perk.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-base text-muted-foreground">{perk.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <div className="h-px bg-border/50" />

          {/* Open Positions */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={2} 
            variants={fadeUp}
            className="py-14 sm:py-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Open{' '}
                <span className="relative inline-block">
                  <span className="text-primary">positions</span>
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 80 6"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M0 5 Q20 0 40 3 T80 1"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-primary/50"
                    />
                  </svg>
                </span>
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                {filteredJobs.length} role{filteredJobs.length !== 1 ? 's' : ''} available
              </p>
            </div>
              
            {/* Dropdown Filter */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <select 
                  value={activeDepartment}
                  onChange={(e) => setActiveDepartment(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-full border border-border bg-card text-foreground text-sm font-medium cursor-pointer hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link href={`/careers/${job.id}`}>
                    <article className="group rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-primary">{job.department}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="text-xs text-muted-foreground">{job.type}</span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {job.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-border/50 bg-card">
                <p className="text-sm text-muted-foreground">No open positions in this department right now.</p>
              </div>
            )}
          </motion.section>

          <div className="h-px bg-border/50" />

          {/* CTA */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={3} 
            variants={fadeUp} 
            className="py-14 sm:py-16 text-center"
          >
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Don&apos;t see your{' '}
              <span className="relative inline-block">
                <span className="text-primary">role</span>
                <svg
                  className="absolute -bottom-0.5 left-0 w-full"
                  viewBox="0 0 40 5"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 4 Q10 0 20 2.5 T40 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-primary/50"
                  />
                </svg>
              </span>
              ?
            </h2>
            <p className="mt-3 text-base text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.
            </p>
            <Link
              href="mailto:careers@picturaai.sbs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  )
}
