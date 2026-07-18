export interface FormatOption {
  id: string
  label: string
  ext: string
  description: string
  useCase: string
  quality?: number
}

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'png',
    label: 'PNG',
    ext: 'png',
    description: 'Lossless, supports transparency. Best for logos with transparency.',
    useCase: 'Web design, social media, transparent backgrounds',
    quality: 100,
  },
  {
    id: 'jpeg',
    label: 'JPEG',
    ext: 'jpg',
    description: 'Compressed format with excellent quality. Smaller file sizes.',
    useCase: 'Print, photography, file sharing',
    quality: 90,
  },
  {
    id: 'svg',
    label: 'SVG',
    ext: 'svg',
    description: 'Vector format. Infinitely scalable without quality loss.',
    useCase: 'Logo files, responsive design, all screen sizes',
  },
  {
    id: 'webp',
    label: 'WebP',
    ext: 'webp',
    description: 'Modern format with best compression. Requires browser support.',
    useCase: 'Web optimization, fast loading, modern browsers',
    quality: 85,
  },
]

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = src
  })
}

async function loadImageWithProxyFallback(imageUrl: string): Promise<{ img: HTMLImageElement; cleanup?: () => void }> {
  try {
    const img = await loadImage(imageUrl)
    return { img }
  } catch {
    const proxyUrl = `/api/download-image?url=${encodeURIComponent(imageUrl)}`
    const response = await fetch(proxyUrl, { cache: 'no-store' })
    if (!response.ok) throw new Error('Failed to fetch image via proxy')

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const img = await loadImage(objectUrl)
    return { img, cleanup: () => URL.revokeObjectURL(objectUrl) }
  }
}

/**
 * Convert image to different formats
 */
export async function convertImageFormat(
  imageUrl: string,
  format: string,
  quality: number = 90
): Promise<Blob> {
  const { img, cleanup } = await loadImageWithProxyFallback(imageUrl)

  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get canvas context')

    ctx.drawImage(img, 0, 0)

    return await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error('Failed to convert image'))
          else resolve(blob)
        },
        `image/${format}`,
        quality / 100
      )
    })
  } finally {
    cleanup?.()
  }
}

/**
 * Create SVG wrapper for image (as data URI)
 */
export function createSVGWrapper(imageUrl: string, width: number, height: number): string {
  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <image width="${width}" height="${height}" xlink:href="${imageUrl}" />
    </svg>
  `.trim()

  return `data:image/svg+xml;base64,${btoa(svgContent)}`
}

/**
 * Download blob as file
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
