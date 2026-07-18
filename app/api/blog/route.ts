import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const posts = await sql`
      SELECT * FROM blog_posts 
      WHERE published = true 
      ORDER BY featured DESC, created_at DESC
    `
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json({ posts: [] }, { status: 500 })
  }
}
