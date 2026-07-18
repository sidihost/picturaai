'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { ArrowRight, Shield, Copyright, FileText } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const sections = [
  {
    id: 'ownership',
    title: 'Your Generated Content Ownership',
    icon: Copyright,
    content: [
      'All images, content, and creative works generated through Pictura belong entirely to you. You own all rights to the generated images and can use them for any personal or commercial purpose.',
      'You may download, modify, distribute, share, and commercialize any content created using Pictura without attribution or permission.',
      'This includes use on social media, websites, print materials, commercial products, and any other medium.',
    ],
  },
  {
    id: 'plagiarism',
    title: 'Anti-Plagiarism & Originality',
    icon: FileText,
    content: [
      'Pictura does not plagiarize, copy, or directly reproduce existing copyrighted works. Our AI models generate original content based on your text descriptions.',
      'The content created is a unique synthesis of learned patterns and transformations, not a copy of existing materials.',
      'We do not use copyrighted images or works without permission. Our models are trained responsibly on licensed and public domain content.',
      'Each generated image is original and unique. The same prompt may generate variations, but the output is newly created each time.',
    ],
  },
  {
    id: 'rights-usage',
    title: 'Your Rights & Usage',
    icon: Shield,
    content: [
      'You retain complete ownership of all generated images and can use them without any restrictions.',
      'Commercial use is permitted - you can sell, license, or monetize content created with Pictura.',
      'You can modify, edit, or enhance generated images and claim ownership of the modifications.',
      'Attribution to Pictura is optional but appreciated. You are never required to provide credit.',
      'You may use generated content for branding, logos, marketing materials, or any business purpose.',
    ],
  },
]

const legalItems = [
  {
    title: 'Privacy Protection',
    description: 'We do not store your prompts or use them to train models. Your privacy is protected.',
  },
  {
    title: 'Content Safety',
    description: 'Hateful, adult, or illegal content is prohibited. Our safety filters ensure responsible use.',
  },
  {
    title: 'No Warranties',
    description: 'Pictura is provided as-is. We do not guarantee uptime, accuracy, or specific results.',
  },
  {
    title: 'Limitation of Liability',
    description: 'We are not responsible for any damages, losses, or claims arising from use of the service.',
  },
  {
    title: 'Third-Party Rights',
    description: 'Users agree not to infringe on third-party rights when using generated content.',
  },
  {
    title: 'Modification Rights',
    description: 'Pictura reserves the right to modify terms and conditions at any time.',
  },
]

export default function LegalPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-6">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center mb-12">
            <PicturaIcon size={48} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Legal Terms & Policies
            </h1>
            <p className="mt-3 text-muted-foreground">
              Your rights, your content, our commitment to transparency
            </p>
          </motion.div>

          <div className="my-8 h-px bg-border/50" />

          {/* Main Content Sections */}
          {sections.map((section, idx) => (
            <motion.section
              key={section.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx + 1}
              variants={fadeUp}
              className="mb-12"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-1">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground mb-4">{section.title}</h2>
                  <div className="space-y-3">
                    {section.content.map((paragraph, i) => (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          ))}

          <div className="my-12 h-px bg-border/50" />

          {/* General Legal Terms */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={4}
            variants={fadeUp}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">General Terms & Conditions</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {legalItems.map((item, i) => (
                <div key={i} className="rounded-lg border border-border/50 bg-card p-5 hover:border-primary/20 transition-colors">
                  <h3 className="font-semibold text-foreground text-sm mb-2">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Privacy Information */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={5}
            variants={fadeUp}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Privacy & Data</h2>
            <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                We collect minimal personal data. Your prompts are never used to train models or sold to third parties.
              </p>
              <p>
                We use cookies and analytics to improve the service. You can opt-out at any time. We comply with applicable privacy laws and regulations.
              </p>
              <p>
                Account information is encrypted and stored securely. We do not share your data with advertisers or marketers.
              </p>
            </div>
          </motion.section>

          {/* Acceptable Use */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={6}
            variants={fadeUp}
            className="mb-12"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Acceptable Use Policy</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You agree not to use Pictura to generate:
              </p>
              <ul className="space-y-2 ml-4">
                <li>• Hateful, discriminatory, or abusive content</li>
                <li>• Adult or sexually explicit material</li>
                <li>• Illegal or malicious content</li>
                <li>• Content that infringes on third-party rights</li>
                <li>• Deepfakes or fraudulent impersonations</li>
                <li>• Spam or misleading content</li>
              </ul>
              <p className="mt-4">
                Violations may result in account suspension or permanent ban without refund.
              </p>
            </div>
          </motion.section>

          {/* Disclaimer */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={7}
            variants={fadeUp}
            className="mb-12 rounded-lg border border-border/50 bg-card/50 p-6"
          >
            <h2 className="text-lg font-semibold text-foreground mb-3">Disclaimer</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Pictura is provided "as-is" without warranty of any kind. We do not guarantee accuracy, availability, or fitness for a particular purpose. We are not liable for any indirect, incidental, or consequential damages arising from use of the service. Your use of Pictura indicates acceptance of these terms. We reserve the right to modify these terms at any time with notice to users.
            </p>
          </motion.section>

          {/* Contact */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={8}
            variants={fadeUp}
            className="text-center pt-6"
          >
            <p className="text-sm text-muted-foreground mb-6">
              Questions about our legal terms? We're here to help.
            </p>
            <Link
              href="/report"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
