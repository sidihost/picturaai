import type { Metadata } from 'next'
import { FeaturesContent } from '@/components/pictura/features-content'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Discover Pictura\'s powerful AI image generation features. Text-to-image, image-to-image, multiple styles, instant improvements, and more. All free.',
  openGraph: {
    title: 'Features | Pictura - AI Image Generation',
    description: 'Discover Pictura\'s powerful AI image generation features. Text-to-image, image-to-image, multiple styles, and more.',
    images: ['/og-image.jpg'],
  },
}

export default function FeaturesPage() {
  return <FeaturesContent />
}
