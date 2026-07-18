import { NextResponse } from 'next/server'
import { getAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth'

export async function GET() {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ authenticated: false, error: 'Admin auth is not configured on server.' }, { status: 500 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true, session })
}
