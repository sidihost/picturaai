'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

export const GITHUB_REPO_URL = 'https://github.com/sidihost/picturaai'

export const GitHubIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
)

function formatStars(count: number): string {
  if (count >= 1000) {
    const k = count / 1000
    return `${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`
  }
  return String(count)
}

let cachedStars: number | null = null

export function useGitHubStars() {
  const [stars, setStars] = useState<number | null>(cachedStars)

  useEffect(() => {
    if (cachedStars !== null) return
    let cancelled = false
    fetch('https://api.github.com/repos/sidihost/picturaai', { cache: 'force-cache' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.stargazers_count === 'number') {
          cachedStars = data.stargazers_count
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return stars
}

export function GitHubStarButton({ className = '' }: { className?: string }) {
  const stars = useGitHubStars()

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Star Pictura on GitHub"
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary ${className}`}
    >
      <GitHubIcon className="h-4 w-4" />
      <span className="hidden sm:inline">Star on GitHub</span>
      <span className="sm:hidden">GitHub</span>
      {stars !== null && (
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          <Star className="h-3 w-3 fill-current" />
          {formatStars(stars)}
        </span>
      )}
    </a>
  )
}
