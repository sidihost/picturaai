import type { Metadata } from 'next'
import { Studio } from '@/components/pictura/studio'

export const metadata: Metadata = {
  title: 'Pictura Studio - AI Image Generation',
  description: 'Create stunning images with Pictura Studio by Imoogle. Free AI image generation with text-to-image and image-to-image capabilities.',
}

export default function StudioPage() {
  return <Studio />
}
