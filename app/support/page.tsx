import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SupportContent } from '@/components/pictura/support-content'

export const metadata: Metadata = {
  title: 'Support Us',
  description: 'Support Pictura\'s development and help us build the best AI image generation tool. Your donations help us improve features and scale infrastructure.',
  openGraph: {
    title: 'Support Us | Pictura - AI Image Generation',
    description: 'Support Pictura\'s development and help us build the best AI image generation tool.',
    images: ['/og-image.jpg'],
  },
}

export default function SupportPage() {
  return (
    <Suspense fallback={null}>
      <SupportContent />
    </Suspense>
  )
}
