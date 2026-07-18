'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Clock, Search, Mail, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  read_time: number
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = ['All', 'Announcement', 'Tutorial', 'Guide']

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const router = useRouter()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }
    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        router.push('/newsletter/success')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to subscribe')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setSubscribing(false)
    }
  }

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blog')
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'All' || post.category.toLowerCase() === activeCategory.toLowerCase()
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPost = filteredPosts.find(p => p.featured)
  const regularPosts = filteredPosts.filter(p => !p.featured)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateShort = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header - Clean Vercel/Anthropic style */}
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 pt-28 pb-12 sm:pt-36 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Blog</h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
              Product updates, engineering insights, and tips for getting the most out of Pictura.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Categories */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-9 pr-3 rounded-md bg-secondary/50 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-md bg-secondary/50 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-xs text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">
              {searchQuery ? `No results for "${searchQuery}"` : 'No articles yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Featured Post - Full width like Vercel blog */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <Link href={`/blog/${featuredPost.slug}`}>
                  <article className="group">
                    <div className="relative aspect-[2.2/1] rounded-xl overflow-hidden mb-5">
                      <Image
                        src={featuredPost.cover_image}
                        alt={featuredPost.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 960px"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <div className="absolute bottom-5 left-5">
                        <span className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider">
                          Featured
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="text-[11px] font-medium text-primary uppercase tracking-wider">
                        {featuredPost.category}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(featuredPost.created_at)}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-[11px] text-muted-foreground">
                        {featuredPost.read_time} min read
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl line-clamp-2">
                      {featuredPost.excerpt}
                    </p>
                  </article>
                </Link>
              </motion.div>
            )}

            {/* Divider */}
            {featuredPost && regularPosts.length > 0 && (
              <div className="border-t border-border/40" />
            )}

            {/* Posts List - Vercel / Anthropic style rows */}
            {regularPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-semibold text-foreground">
                    {activeCategory === 'All' ? 'Latest' : activeCategory + 's'}
                  </h2>
                  <span className="text-[11px] text-muted-foreground">
                    {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-border/40">
                  {regularPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.03 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <article className="group flex gap-5 py-6 first:pt-0">
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-2">
                              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                                {post.category}
                              </span>
                              <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                              <span className="text-[11px] text-muted-foreground">
                                {formatDateShort(post.created_at)}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                              {post.title}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed max-w-xl">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {post.read_time} min read
                            </div>
                          </div>

                          {/* Thumbnail */}
                          <div className="relative w-28 h-20 sm:w-40 sm:h-24 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={post.cover_image}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="160px"
                            />
                          </div>
                        </article>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Newsletter - Minimal like Vercel */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 max-w-2xl">
            <div>
              <h2 className="text-base font-semibold text-foreground mb-1">
                Stay up to date
              </h2>
              <p className="text-xs text-muted-foreground">
                Get notified when we publish new articles. No spam.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-2 shrink-0">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="h-9 w-52 px-3 rounded-md bg-secondary/50 border border-border/50 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {subscribing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
