import Link from 'next/link'
import { PicturaIcon } from './pictura-logo'

// Social Icons as components
const XIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TelegramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
)

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <span className="flex items-center gap-2.5">
              <PicturaIcon size={28} />
              <span className="text-lg font-bold tracking-tight text-foreground">Pictura</span>
            </span>
            <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
              Non-profit AI image generation by Imoogle Labs. Free and accessible to everyone.
            </p>
            
            {/* Social Links */}
            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground mb-3">Follow us on social media</p>
              <div className="flex items-center gap-3">
                <a 
                  href="https://x.com/GetPicturaAI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Follow us on X"
                >
                  <XIcon className="h-4 w-4" />
                </a>
                <a 
                  href="https://t.me/picturaai_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label="Join our Telegram"
                >
                  <TelegramIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div className="mt-5 flex items-center gap-2">
              <span className="flex h-3.5 w-5 overflow-hidden rounded-sm" aria-label="Nigerian flag">
                <span className="w-1/3 bg-[#008751]" />
                <span className="w-1/3 bg-[#FFFFFF] border-y border-border/30" />
                <span className="w-1/3 bg-[#008751]" />
              </span>
              <span className="text-xs text-muted-foreground">Built in Nigeria</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Product</span>
            <Link href="/studio" className="text-sm text-foreground/70 transition-colors hover:text-primary">Studio</Link>
            <Link href="/features" className="text-sm text-foreground/70 transition-colors hover:text-primary">Features</Link>
            <Link href="/models" className="text-sm text-foreground/70 transition-colors hover:text-primary">Models</Link>
            <Link href="/api-docs" className="flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary">
              API
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">BETA</span>
            </Link>
            <Link href="/pricing" className="flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary">
              Pricing
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">FREE</span>
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Services</span>
            <Link href="/captcha" className="flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary">
              PicturaCAPTCHA
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary font-semibold">NEW</span>
            </Link>
            <Link href="/captcha/docs" className="text-sm text-foreground/70 transition-colors hover:text-primary">CAPTCHA Docs</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Company</span>
            <Link href="/about" className="text-sm text-foreground/70 transition-colors hover:text-primary">About Imoogle</Link>
            <Link href="/blog" className="text-sm text-foreground/70 transition-colors hover:text-primary">Blog</Link>
            <Link href="/careers" className="flex items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary">
              Careers
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary font-semibold">HIRING</span>
            </Link>
            <Link href="/support" className="text-sm text-foreground/70 transition-colors hover:text-primary">Support Us</Link>
            <Link href="/report" className="text-sm text-foreground/70 transition-colors hover:text-primary">Report a Bug</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Legal</span>
            <Link href="/legal" className="text-sm text-foreground/70 transition-colors hover:text-primary">Privacy & Terms</Link>
            <Link href="/captcha/privacy" className="text-sm text-foreground/70 transition-colors hover:text-primary">CAPTCHA Privacy</Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Imoogle Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              All systems operational
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/50">
              IMOOGLE LABS
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
