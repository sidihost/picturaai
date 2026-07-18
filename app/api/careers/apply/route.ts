import { NextRequest, NextResponse } from 'next/server'
import { uploadObject } from '@/lib/storage'
import { sendEmail } from '@/lib/email'
import { emailTemplates } from '@/lib/email-templates'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form fields
    const jobId = formData.get('jobId') as string
    const jobTitle = formData.get('jobTitle') as string
    const department = formData.get('department') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const location = formData.get('location') as string
    const linkedin = formData.get('linkedin') as string || ''
    const portfolioLink = formData.get('portfolio') as string || ''
    const experience = formData.get('experience') as string
    const startDate = formData.get('startDate') as string || 'Not specified'
    const coverLetter = formData.get('coverLetter') as string || ''
    const heardFrom = formData.get('heardFrom') as string || 'Not specified'

    // Extract files
    const resumeFile = formData.get('resume') as File | null
    const portfolioFile = formData.get('portfolioFile') as File | null

    if (!jobId || !jobTitle || !firstName || !lastName || !email || !phone || !location || !experience || !resumeFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload resume
    const timestamp = Date.now()
    const sanitizedName = `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '')
    
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer())
    const resumeExt = resumeFile.name.split('.').pop() || 'pdf'
    const resumeKey = `pictura/careers/${jobId}/${sanitizedName}-${timestamp}-resume.${resumeExt}`
    const { url: resumeUrl } = await uploadObject(resumeKey, resumeBuffer, resumeFile.type || 'application/pdf')

    // Upload portfolio if provided
    let portfolioUrl = ''
    if (portfolioFile && portfolioFile instanceof File) {
      const portfolioBuffer = Buffer.from(await portfolioFile.arrayBuffer())
      const portfolioExt = portfolioFile.name.split('.').pop() || 'pdf'
      const portfolioKey = `pictura/careers/${jobId}/${sanitizedName}-${timestamp}-portfolio.${portfolioExt}`
      const result = await uploadObject(portfolioKey, portfolioBuffer, portfolioFile.type || 'application/pdf')
      portfolioUrl = result.url
    }

    const fullName = `${firstName} ${lastName}`
    const applicationDate = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC'

    // Send email to admin
    const adminHtml = emailTemplates.jobApplicationAdmin({
      jobTitle,
      department,
      fullName,
      email,
      phone,
      location,
      linkedin,
      portfolio: portfolioLink,
      experience,
      startDate,
      coverLetter,
      heardFrom,
      resumeUrl,
      portfolioUrl,
      applicationDate
    })

    await sendEmail({
      to: 'admin@picturaai.sbs',
      subject: `New Application: ${jobTitle} - ${fullName}`,
      html: adminHtml,
      from: 'Pictura Careers <careers@picturaai.sbs>'
    })

    // Send confirmation email to applicant
    const applicantHtml = emailTemplates.jobApplicationConfirmation({
      firstName,
      jobTitle,
      department
    })

    await sendEmail({
      to: email,
      subject: `Application Received: ${jobTitle} at Pictura`,
      html: applicantHtml,
      from: 'Pictura Careers <careers@picturaai.sbs>'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Career application error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
