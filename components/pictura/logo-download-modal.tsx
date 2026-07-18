'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, CheckCircle2, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { PicturaIcon } from './pictura-logo'
import { LOGO_FORMATS, generateLogoBlob, downloadFile } from '@/lib/logo-assets'

interface LogoDownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoDownloadModal({ open, onOpenChange }: LogoDownloadModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set())

  const handleDownload = async (format: string, size: number, name: string) => {
    setDownloading(name)
    try {
      const blob = await generateLogoBlob(format as 'svg' | 'png' | 'jpeg' | 'webp', size)
      downloadFile(blob, name)
      setDownloaded((prev) => new Set([...prev, name]))
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(null)
    }
  }

  const groupedFormats = LOGO_FORMATS.reduce(
    (acc, fmt) => {
      const key = fmt.format
      if (!acc[key]) acc[key] = []
      acc[key].push(fmt)
      return acc
    },
    {} as Record<string, typeof LOGO_FORMATS>,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <PicturaIcon size={32} />
            <div>
              <DialogTitle>Download Brand Assets</DialogTitle>
              <DialogDescription>Get the Pictura logo in multiple formats and sizes</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* SVG Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Vector Format (Recommended)</h3>
            <div className="space-y-2">
              {groupedFormats.svg?.map((fmt) => (
                <motion.div
                  key={fmt.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3 backdrop-blur-sm hover:bg-card/80 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{fmt.name}</p>
                    <p className="text-xs text-muted-foreground">{fmt.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={downloaded.has(fmt.name) ? 'outline' : 'default'}
                    disabled={downloading === fmt.name}
                    onClick={() => handleDownload(fmt.format, fmt.size, fmt.name)}
                    className="gap-2 min-w-max"
                  >
                    {downloading === fmt.name ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Downloading
                      </>
                    ) : downloaded.has(fmt.name) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        Download
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* PNG Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Raster Formats</h3>
            <div className="space-y-2">
              {groupedFormats.png?.map((fmt) => (
                <motion.div
                  key={fmt.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3 backdrop-blur-sm hover:bg-card/80 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{fmt.name}</p>
                    <p className="text-xs text-muted-foreground">{fmt.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={downloaded.has(fmt.name) ? 'outline' : 'default'}
                    disabled={downloading === fmt.name}
                    onClick={() => handleDownload(fmt.format, fmt.size, fmt.name)}
                    className="gap-2 min-w-max"
                  >
                    {downloading === fmt.name ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Downloading
                      </>
                    ) : downloaded.has(fmt.name) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        Download
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* JPEG and WebP Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Optimized Formats</h3>
            <div className="space-y-2">
              {[...groupedFormats.jpeg, ...groupedFormats.webp]?.map((fmt, idx) => (
                <motion.div
                  key={fmt.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-3 backdrop-blur-sm hover:bg-card/80 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{fmt.name}</p>
                    <p className="text-xs text-muted-foreground">{fmt.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={downloaded.has(fmt.name) ? 'outline' : 'default'}
                    disabled={downloading === fmt.name}
                    onClick={() => handleDownload(fmt.format, fmt.size, fmt.name)}
                    className="gap-2 min-w-max"
                  >
                    {downloading === fmt.name ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Downloading
                      </>
                    ) : downloaded.has(fmt.name) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Downloaded
                      </>
                    ) : (
                      <>
                        <Download className="h-3 w-3" />
                        Download
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Usage Guidelines */}
          <div className="rounded-lg bg-primary/5 p-3 border border-primary/10">
            <p className="text-xs font-medium text-foreground mb-1">Usage Guidelines:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>Use SVG for web and responsive designs</li>
              <li>Use PNG for transparency needs</li>
              <li>Use JPEG for smaller file sizes</li>
              <li>Use WebP for modern browsers</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
