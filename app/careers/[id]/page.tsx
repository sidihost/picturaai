'use client'

import { use } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, MapPin, Clock, Briefcase, Check } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

type Job = {
  id: string
  title: string
  department: string
  type: string
  location: string
  description: string
  about: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
}

const jobs: Record<string, Job> = {
  'software-engineer': {
    id: 'software-engineer',
    title: 'Software Engineer',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build the core infrastructure powering Pictura AI.',
    about: 'We are looking for a Software Engineer to join our core platform team. You will work on building scalable infrastructure that powers millions of AI generations, develop new features for our creative suite, and help shape the technical direction of Pictura.\n\nThis role offers the opportunity to work with cutting-edge AI technologies while building products that empower creators worldwide. You will collaborate closely with ML engineers, product designers, and leadership to deliver exceptional experiences.',
    responsibilities: [
      'Design, build, and maintain scalable backend services and APIs',
      'Collaborate with ML engineers to deploy and optimize AI models in production',
      'Improve system reliability, performance, and developer experience',
      'Participate in architectural decisions and code reviews',
      'Mentor junior engineers and contribute to team growth',
    ],
    requirements: [
      '3+ years of professional software engineering experience',
      'Strong proficiency in TypeScript/JavaScript and Node.js',
      'Experience with cloud platforms (AWS, GCP, or Vercel)',
      'Familiarity with databases (PostgreSQL, Redis) and system design',
      'Excellent problem-solving and communication skills',
    ],
    niceToHave: [
      'Experience with AI/ML systems or computer vision',
      'Contributions to open-source projects',
      'Experience with real-time systems or streaming architectures',
      'Background in creative tools or media processing',
    ],
  },
  'data-analyst': {
    id: 'data-analyst',
    title: 'Data Analyst',
    department: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    description: 'Transform raw data into actionable insights.',
    about: 'As a Data Analyst at Pictura, you will be at the heart of our data-driven decision making. You will analyze user behavior, measure product performance, and uncover opportunities for growth.\n\nYour insights will directly influence product roadmaps, marketing strategies, and business operations. This is a high-impact role where your work will shape the future of Pictura.',
    responsibilities: [
      'Analyze product usage data to identify trends and opportunities',
      'Build dashboards and reports for stakeholders across the company',
      'Design and analyze A/B tests to measure feature impact',
      'Collaborate with product and engineering teams on metrics definition',
      'Present findings and recommendations to leadership',
    ],
    requirements: [
      '2+ years of experience in data analysis or related field',
      'Strong SQL skills and experience with data visualization tools',
      'Proficiency in Python or R for statistical analysis',
      'Experience with analytics platforms (Mixpanel, Amplitude, or similar)',
      'Excellent communication and storytelling with data',
    ],
    niceToHave: [
      'Experience with machine learning or predictive modeling',
      'Background in product analytics at a B2C tech company',
      'Knowledge of experimentation frameworks and statistical methods',
      'Familiarity with data warehouses (BigQuery, Snowflake)',
    ],
  },
  'graphic-designer': {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    department: 'Design',
    type: 'Full-time',
    location: 'Remote',
    description: 'Shape the visual identity of Pictura.',
    about: 'We are seeking a talented Graphic Designer to elevate Pictura\'s visual presence. You will create compelling designs for marketing campaigns, product interfaces, and brand communications.\n\nThis role combines strategic thinking with hands-on design execution, working closely with marketing, product, and leadership teams to create stunning visual experiences.',
    responsibilities: [
      'Create visual designs for marketing campaigns, social media, and web',
      'Develop and maintain brand guidelines and design systems',
      'Design product marketing materials, presentations, and collateral',
      'Collaborate with product designers on feature launches',
      'Experiment with AI-assisted design workflows',
    ],
    requirements: [
      '3+ years of professional graphic design experience',
      'Strong portfolio demonstrating range and creativity',
      'Expert proficiency in Figma, Adobe Creative Suite',
      'Understanding of typography, color theory, and layout principles',
      'Ability to work independently and meet deadlines',
    ],
    niceToHave: [
      'Experience with motion graphics or animation',
      'Interest in AI-generated art and emerging creative tools',
      'Background in tech or SaaS brand design',
      'Illustration or 3D design skills',
    ],
  },
  'video-animator': {
    id: 'video-animator',
    title: 'Video Animator',
    department: 'Design',
    type: 'Full-time',
    location: 'Remote',
    description: 'Create captivating animated content.',
    about: 'We are looking for a Video Animator to create stunning animated content that demonstrates the magic of AI-generated visuals. You will produce everything from short-form social content to detailed product walkthroughs.\n\nThis is a unique opportunity to work at the intersection of traditional animation and AI-powered creativity. Your work will be seen by millions of creators worldwide.',
    responsibilities: [
      'Create animated videos for product launches and marketing campaigns',
      'Develop motion graphics for social media and advertising',
      'Produce tutorial and explainer videos for users',
      'Establish animation guidelines and reusable templates',
      'Collaborate with the creative team on storytelling and concepts',
    ],
    requirements: [
      '3+ years of experience in motion design or video animation',
      'Expert proficiency in After Effects, Premiere Pro, or similar',
      'Strong understanding of animation principles and timing',
      'Experience with character animation or cartoon-style content',
      'Portfolio demonstrating range of animation styles',
    ],
    niceToHave: [
      'Experience with 3D animation (Cinema 4D, Blender)',
      'Knowledge of AI video generation tools',
      'Sound design and audio editing skills',
      'Background in YouTube content or viral social media',
    ],
  },
  'social-media-manager': {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build and engage our global community.',
    about: 'As Social Media Manager, you will own Pictura\'s presence across all social platforms. You will develop content strategies, engage with our community, and drive brand awareness.\n\nThis role combines creative content creation with analytical thinking to grow our audience and build lasting relationships with creators around the world.',
    responsibilities: [
      'Develop and execute social media strategy across all platforms',
      'Create engaging content that showcases user creations and product features',
      'Build and nurture our creator community through active engagement',
      'Analyze performance metrics and optimize content strategy',
      'Stay ahead of social trends and platform changes',
    ],
    requirements: [
      '2+ years of social media management experience',
      'Proven track record of growing engaged communities',
      'Excellent copywriting and content creation skills',
      'Experience with social media analytics and scheduling tools',
      'Deep understanding of Twitter/X, Instagram, TikTok, and YouTube',
    ],
    niceToHave: [
      'Experience in tech, creative tools, or AI industry',
      'Background in community management or creator relations',
      'Video editing and content creation skills',
      'Personal brand or creator experience',
    ],
  },
  'content-writer': {
    id: 'content-writer',
    title: 'Content Writer',
    department: 'Content',
    type: 'Full-time',
    location: 'Remote',
    description: 'Craft compelling narratives that educate and inspire.',
    about: 'We are seeking a Content Writer to tell Pictura\'s story and educate our growing user base. You will create content that spans the funnel—from awareness-building blog posts to detailed documentation and tutorials.\n\nThis role requires someone who can translate complex technical concepts into engaging, accessible content that resonates with creators of all skill levels.',
    responsibilities: [
      'Write blog posts, case studies, and thought leadership content',
      'Create product documentation, guides, and tutorials',
      'Develop email campaigns and lifecycle communications',
      'Collaborate with SEO team to optimize content for search',
      'Maintain consistent brand voice across all content',
    ],
    requirements: [
      '3+ years of professional writing experience',
      'Strong portfolio of published content',
      'Excellent research and interviewing skills',
      'Understanding of SEO principles and content marketing',
      'Ability to explain technical concepts clearly',
    ],
    niceToHave: [
      'Experience writing about AI, technology, or creative tools',
      'Background in technical writing or documentation',
      'Journalism or editorial experience',
      'Familiarity with AI image generation concepts',
    ],
  },
  'partner-growth-manager': {
    id: 'partner-growth-manager',
    title: 'Partner Growth Manager',
    department: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build strategic partnerships that expand our reach.',
    about: 'As Partner Growth Manager, you will identify, negotiate, and manage strategic partnerships that accelerate Pictura\'s growth. You will work with platforms, API customers, creator networks, and enterprise clients.\n\nThis is a high-impact role where you will build relationships that drive revenue and expand our ecosystem to new audiences and markets.',
    responsibilities: [
      'Identify and pursue strategic partnership opportunities',
      'Negotiate partnership agreements and manage ongoing relationships',
      'Develop go-to-market strategies for partner initiatives',
      'Build relationships with platforms, agencies, and enterprise clients',
      'Track partnership performance and report on growth metrics',
    ],
    requirements: [
      '4+ years in business development, partnerships, or sales',
      'Track record of closing and managing strategic partnerships',
      'Strong negotiation and relationship-building skills',
      'Experience with SaaS, API, or platform business models',
      'Excellent presentation and communication abilities',
    ],
    niceToHave: [
      'Network in the creative tools or AI industry',
      'Experience with enterprise sales or developer relations',
      'Background in creator economy or digital media',
      'Technical understanding of APIs and integrations',
    ],
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const job = jobs[id]

  if (!job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-2xl px-6 pt-32 pb-10 sm:pt-40 sm:pb-12">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <Link
              href="/careers"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All positions
            </Link>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {job.department}
              </span>
              <span className="h-1 w-1 rounded-full bg-border" />
              <span className="text-xs text-muted-foreground">{job.type}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-5">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {job.type}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Posted recently
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <div className="space-y-12">
          {/* About */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
            <h2 className="text-lg font-semibold text-foreground mb-4">About this role</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {job.about}
            </div>
          </motion.section>

          {/* Responsibilities */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp}>
            <h2 className="text-lg font-semibold text-foreground mb-4">What you&apos;ll do</h2>
            <ul className="space-y-3">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Requirements */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp}>
            <h2 className="text-lg font-semibold text-foreground mb-4">What we&apos;re looking for</h2>
            <ul className="space-y-3">
              {job.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Nice to have */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Nice to have</h2>
            <ul className="space-y-3">
              {job.niceToHave.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="h-2 w-2 rounded-full bg-border shrink-0 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Apply CTA - no card, clean */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={5} 
            variants={fadeUp}
            className="pt-6 border-t border-border/50"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Interested in this{' '}
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
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              We&apos;d love to hear from you. Submit your application and we&apos;ll review it carefully.
            </p>
            <Link
              href={`/careers/${job.id}/apply`}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Apply now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
