import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import { SecurityGuard } from '@/components/security-guard'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Pictura - AI Image Generation | Create Stunning Images Free',
    template: '%s | Pictura',
  },
  description: 'Create stunning AI-generated images and videos with Pictura. Fast text-to-image, image-to-image, and video generation with powerful AI models.',
  keywords: ['AI image generation', 'text to image', 'image to image', 'AI video generation', 'AI art generator', 'Pictura', 'creative AI tools'],
  authors: [{ name: 'Pictura', url: 'https://picturaai.sbs' }],
  creator: 'Pictura',
  publisher: 'Pictura',
  metadataBase: new URL('https://picturaai.sbs'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://picturaai.sbs',
    siteName: 'Pictura',
    title: 'Pictura - AI Image Generation | Create Stunning Images Free',
    description: 'Create stunning AI-generated images and videos with Pictura. Fast text-to-image, image-to-image, and video generation with powerful AI models.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pictura - AI-Powered Image Generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pictura - AI Image Generation | Create Stunning Images Free',
    description: 'Create stunning AI-generated images and videos with Pictura.',
    images: ['/og-image.jpg'],
    creator: '@imoogle',
  },
  category: 'technology',
  other: {
    'theme-color': '#c87941',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#c87941',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SecurityGuard>
          {children}
        </SecurityGuard>
        <Toaster
          position="top-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'flex items-center gap-3 w-full rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-lg backdrop-blur-sm font-sans',
              title: 'text-sm font-medium text-foreground',
              description: 'text-xs text-muted-foreground mt-0.5',
              success: 'border-primary/30 bg-primary/5',
              error: 'border-destructive/30 bg-destructive/5',
              actionButton: 'bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-1.5',
            },
          }}
        />

      </body>
    </html>
  )
}
