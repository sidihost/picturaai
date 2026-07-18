import { Metadata } from 'next'
import { BrandAssets } from '@/components/pictura/brand-assets'

export const metadata: Metadata = {
  title: 'Brand Assets',
  description: 'Download official Pictura logos and brand assets for press, social media, and marketing use.',
}

export default function BrandPage() {
  return <BrandAssets />
}
