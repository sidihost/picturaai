'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { parseMarkdown } from '@/lib/markdown'

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

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data.post)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Failed to fetch post:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchPost()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Blog</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <PicturaIcon size={18} className="text-primary" />
            </div>
            <span className="font-semibold text-foreground">Pictura</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Category & Meta */}
          <div className="mb-6">
            <span className="inline-block text-xs font-medium text-primary uppercase tracking-wider mb-3">
              {post.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.read_time} min read
              </span>
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative aspect-[2/1] rounded-2xl overflow-hidden mb-10">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
              priority
            />
            {/* Watermark */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-black/40 px-2.5 py-1.5 backdrop-blur-sm">
              <PicturaIcon size={14} className="text-white" />
              <span className="text-xs font-medium text-white/90">Pictura</span>
            </div>
          </div>

          {/* Content */}
          <div 
            className="max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: post.content.trim().startsWith('<') 
                ? post.content 
                : parseMarkdown(post.content) 
            }}
          />

          {/* CTA */}
          <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              Ready to create with Pictura?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start generating stunning AI images for free.
            </p>
            <Button asChild size="lg" className="mt-6 gap-2">
              <Link href="/studio">
                Open Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <PicturaIcon size={16} className="text-primary" />
            <span className="text-sm text-muted-foreground">Pictura AI</span>
          </div>
          <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            More Articles
          </Link>
        </div>
      </footer>
    </div>
  )
}
