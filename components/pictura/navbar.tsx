'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { PicturaLogo } from './pictura-logo'

const links = [
  { href: '/studio', label: 'Studio' },
  { href: '/models', label: 'Models' },
  { href: '/captcha', label: 'CAPTCHA' },
  { href: '/api-docs', label: 'API' },
  { href: '/pricing', label: 'Pricing' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          mounted && scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="Pictura home">
            <PicturaLogo size="sm" />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/studio"
              className="group ml-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Try Pictura
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile hamburger - CSS transitions only (no motion) */}
          <button
            onClick={() => setOpen(!open)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-secondary/60 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <div className="flex w-[18px] flex-col items-center gap-[5px]">
              <span
                className="block h-[1.5px] w-[18px] rounded-full bg-foreground origin-center transition-all duration-300"
                style={mounted && open ? { transform: 'translateY(3.25px) rotate(45deg)' } : {}}
              />
              <span
                className="block h-[1.5px] w-3 rounded-full bg-foreground transition-all duration-200"
                style={mounted && open ? { opacity: 0, transform: 'translateX(8px)' } : {}}
              />
              <span
                className="block h-[1.5px] w-[14px] rounded-full bg-foreground origin-center transition-all duration-300"
                style={mounted && open ? { width: '18px', transform: 'translateY(-3.25px) rotate(-45deg)' } : {}}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background md:hidden"
          >
            <nav className="flex h-full flex-col pt-20 pb-8 px-6">
              {/* Navigation links */}
              <div className="flex flex-col gap-0.5">
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.04 * i }}
                  >
                    <Link
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center rounded-xl px-4 py-3.5 text-[15px] font-medium transition-colors ${
                        pathname === l.href
                          ? 'bg-primary/8 text-primary'
                          : 'text-foreground active:bg-secondary/60'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* CTA button */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.25 }}
                className="mt-6 px-4"
              >
                <Link
                  href="/studio"
                  onClick={() => setOpen(false)}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-all active:scale-[0.98]"
                >
                  Open Studio
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              {/* Footer info - pushed to bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="mt-auto flex items-center gap-2 px-4 text-xs text-muted-foreground"
              >
                <FlaskConical className="h-3 w-3" />
                <span>Beta &middot; Built by Imoogle Labs, Nigeria</span>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
