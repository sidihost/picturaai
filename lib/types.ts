export type GeneratedMediaType = 'text-to-image' | 'image-to-image' | 'text-to-video'

export interface GeneratedMedia {
  url: string
  prompt: string
  type: GeneratedMediaType
  mediaKind?: 'image' | 'video'
  sourceImageUrl?: string
  requestId?: string
  createdAt: string
}

// Backward-compatible alias for existing image-only usage sites.
export type GeneratedImage = GeneratedMedia

export interface RateLimitInfo {
  limit: number
  remaining: number
  used: number
  resetAt: string
}
