import { NextResponse } from 'next/server'
import { authenticateAdminUser, createAdminSession, isAdminAuthConfigured } from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: 'Admin auth is not configured on server.' }, { status: 500 })
  }

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email : ''
    const password = typeof body.password === 'string' ? body.password : ''

    const user = authenticateAdminUser(email, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    await createAdminSession(user.role, user.email)
    return NextResponse.json({ success: true, role: user.role, email: user.email })
  } catch (error) {
    console.error('[AdminAuth] login error:', error)
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
