import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const posts = await sql`
      SELECT * FROM blog_posts 
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `
    
    if (posts.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json({ post: posts[0] })
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
