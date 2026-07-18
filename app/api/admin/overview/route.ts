import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminOverview } from '@/lib/admin-data'

export async function GET() {
  const session = await requireAdminSession('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const overview = await getAdminOverview()
    return NextResponse.json({ overview, session })
  } catch (error) {
    console.error('[AdminOverview] GET error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
