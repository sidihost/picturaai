export interface LogoFormat {
  format: 'svg' | 'png' | 'jpeg' | 'webp'
  size: 256 | 512 | 1024
  name: string
  description: string
}

// Base SVG logo data
export const PICTURA_SVG_LOGO = (size: number = 256) => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="url(#pictura-bg)" />
  <path
    d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4"
    stroke="url(#pictura-stroke)"
    strokeWidth="4.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    fill="none"
  />
  <circle cx="44" cy="20" r="3" fill="url(#pictura-accent)" />
  <defs>
    <linearGradient id="pictura-bg" x1="0" y1="0" x2="64" y2="64">
      <stop stopColor="#C87941" />
      <stop offset="1" stopColor="#A0522D" />
    </linearGradient>
    <linearGradient id="pictura-stroke" x1="22" y1="18" x2="44" y2="46">
      <stop stopColor="#FFFFFF" />
      <stop offset="1" stopColor="#F5E6D3" />
    </linearGradient>
    <linearGradient id="pictura-accent" x1="41" y1="17" x2="47" y2="23">
      <stop stopColor="#FFD700" />
      <stop offset="1" stopColor="#FFA500" />
    </linearGradient>
  </defs>
</svg>
`

export const LOGO_FORMATS: LogoFormat[] = [
  {
    format: 'svg',
    size: 256,
    name: 'pictura-logo-256.svg',
    description: 'Scalable Vector Graphics - Best for web and responsive design',
  },
  {
    format: 'png',
    size: 512,
    name: 'pictura-logo-512.png',
    description: 'PNG - Best for transparency and quality (512x512)',
  },
  {
    format: 'png',
    size: 1024,
    name: 'pictura-logo-1024.png',
    description: 'PNG - High resolution for print (1024x1024)',
  },
  {
    format: 'jpeg',
    size: 512,
    name: 'pictura-logo-512.jpeg',
    description: 'JPEG - Compressed format for web (512x512)',
  },
  {
    format: 'webp',
    size: 512,
    name: 'pictura-logo-512.webp',
    description: 'WebP - Modern compressed format (512x512)',
  },
]

export async function generateLogoBlob(format: 'svg' | 'png' | 'jpeg' | 'webp', size: number): Promise<Blob> {
  if (format === 'svg') {
    const svg = PICTURA_SVG_LOGO(size)
    return new Blob([svg], { type: 'image/svg+xml' })
  }

  // For raster formats, we need to use Canvas API to render the SVG
  if (typeof window === 'undefined') {
    throw new Error('Canvas-based format conversion only works in the browser')
  }

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  // Create image from SVG
  const svg = PICTURA_SVG_LOGO(size)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      canvas.toBlob(
        (resultBlob) => {
          if (resultBlob) {
            resolve(resultBlob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        `image/${format}`,
        format === 'jpeg' ? 0.95 : undefined,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load SVG image'))
    }
    img.src = url
  })
}

export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
