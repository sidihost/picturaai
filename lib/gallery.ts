import { readJsonObject, uploadObject } from '@/lib/storage'
import type { GeneratedMedia } from '@/lib/types'

function isSameMediaEntry(a: GeneratedMedia, b: GeneratedMedia): boolean {
  const sameUrl = a.url === b.url
  const sameType = a.type === b.type
  const samePrompt = a.prompt.trim() === b.prompt.trim()
  return sameUrl && sameType && samePrompt
}

export async function appendMediaToGallery(sessionId: string, mediaItem: GeneratedMedia): Promise<void> {
  const galleryPath = `pictura/galleries/${sessionId}.json`

  let media: GeneratedMedia[] = []
  try {
    const existing = await readJsonObject<GeneratedMedia[]>(galleryPath)
    if (existing) media = existing
  } catch {
    media = []
  }

  const normalizedMedia: GeneratedMedia = {
    ...mediaItem,
    mediaKind: mediaItem.mediaKind ?? (mediaItem.type === 'text-to-video' ? 'video' : 'image'),
  }

  const alreadyExists = media.some((item) => isSameMediaEntry(item, normalizedMedia))
  media = alreadyExists ? media : [normalizedMedia, ...media]
  await uploadObject(galleryPath, JSON.stringify(media), 'application/json')
}

