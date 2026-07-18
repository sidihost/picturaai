import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const developerCookie = cookieStore.get('developer_session')
    
    if (!developerCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const developerId = developerCookie.value
    const { searchParams } = new URL(request.url)
    const model = searchParams.get('model')
    const style = searchParams.get('style')
    const favorites = searchParams.get('favorites') === 'true'

    let query = `
      SELECT * FROM image_history 
      WHERE developer_id = $1
    `
    const params: (string | boolean)[] = [developerId]
    let paramIndex = 2

    if (model && model !== 'all') {
      query += ` AND model = $${paramIndex}`
      params.push(model)
      paramIndex++
    }

    if (style && style !== 'all') {
      query += ` AND style_preset = $${paramIndex}`
      params.push(style)
      paramIndex++
    }

    if (favorites) {
      query += ` AND is_favorite = true`
    }

    query += ` ORDER BY created_at DESC LIMIT 100`

    const images = await sql(query, params)

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Images fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
