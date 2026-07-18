'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Loader2, CheckCircle, X, FileImage, FileCode, Sparkles } from 'lucide-react'
import { FORMAT_OPTIONS, convertImageFormat, downloadFile, formatFileSize } from '@/lib/image-formats'
import { toast } from 'sonner'

interface DownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  imageName?: string
}

export function DownloadModal({
  open,
  onOpenChange,
  imageUrl,
  imageName = 'pictura-image',
}: DownloadModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadedFormats, setDownloadedFormats] = useState<Set<string>>(new Set())

  const handleDownload = async (formatId: string) => {
    setDownloading(formatId)
    try {
      const format = FORMAT_OPTIONS.find((f) => f.id === formatId)
      if (!format) throw new Error('Format not found')

      if (formatId === 'svg') {
        const blob = await convertImageFormat(imageUrl, 'png', 100)
        const objectUrl = URL.createObjectURL(blob)

        try {
          const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new window.Image()
            img.onload = () => resolve({ width: img.width, height: img.height })
            img.onerror = () => reject(new Error('Failed to load image for SVG export'))
            img.src = objectUrl
          })

          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
            reader.onerror = () => reject(new Error('Failed to prepare SVG export'))
            reader.readAsDataURL(blob)
          })

          const svg = `
            <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <image width="${dimensions.width}" height="${dimensions.height}" xlink:href="${dataUrl}" />
            </svg>
          `.trim()

          const svgBlob = new Blob([svg], { type: 'image/svg+xml' })
          downloadFile(svgBlob, `${imageName}.${format.ext}`)
          setDownloadedFormats((prev) => new Set(prev).add(formatId))
          toast.success(`Downloaded as ${format.label}`)
        } finally {
          URL.revokeObjectURL(objectUrl)
        }
      } else {
        const quality = format.quality || 90
        const blob = await convertImageFormat(imageUrl, formatId, quality)
        downloadFile(blob, `${imageName}.${format.ext}`)
        setDownloadedFormats((prev) => new Set(prev).add(formatId))
        toast.success(`Downloaded as ${format.label} (${formatFileSize(blob.size)})`)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download ${formatId.toUpperCase()}`)
    } finally {
      setDownloading(null)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md mx-0 sm:mx-4 rounded-t-2xl sm:rounded-2xl bg-background border border-border shadow-2xl overflow-hidden"
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header with Image Preview */}
            <div className="p-4 sm:p-5 pb-0">
              <div className="flex items-start gap-4">
                {/* Small Preview */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-md">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Download</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Select format below</p>
                </div>
              </div>
            </div>

            {/* Format Options */}
            <div className="p-4 sm:p-5 space-y-2">
              {FORMAT_OPTIONS.map((format) => {
                const isDownloading = downloading === format.id
                const isDownloaded = downloadedFormats.has(format.id)
                const Icon = format.id === 'svg' ? FileCode : FileImage

                return (
                  <motion.button
                    key={format.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDownload(format.id)}
                    disabled={downloading !== null}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 sm:p-3.5 text-left transition-all ${
                      isDownloaded
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center ${isDownloaded ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isDownloaded ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{format.label}</span>
                        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-muted">.{format.ext}</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 truncate">{format.description}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {isDownloading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      ) : isDownloaded ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <Download className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {/* Pro tip */}
            <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/10 p-3">
              <Sparkles className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
              <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Tip:</span> PNG for transparency, JPEG for photos, WebP for web.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
