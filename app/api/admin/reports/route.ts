import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { listSupportReports, updateSupportReport } from '@/lib/admin-data'

export async function GET(request: Request) {
  const session = await requireAdminSession('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const reports = await listSupportReports(search)
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('[AdminReports] GET error:', error)
    return NextResponse.json({ error: 'Failed to load reports' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await requireAdminSession('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const id = Number(body.id)
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const updated = await updateSupportReport(id, {
      status: body.status,
      assignedTo: body.assignedTo,
      internalNote: body.internalNote,
    })

    if (!updated) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    return NextResponse.json({ success: true, report: updated })
  } catch (error) {
    console.error('[AdminReports] PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}
