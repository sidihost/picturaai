'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Wand2, Loader2, Undo2, Redo2, Download,
  Eraser, ZoomIn, ZoomOut, RotateCcw,
  ScanLine, Layers, Sun, Contrast, Palette,
  ArrowLeft, Check, Send, History
} from 'lucide-react'
import { toast } from 'sonner'

interface EditHistory {
  url: string
  instruction: string
  timestamp: Date
}

interface AIImageEditorProps {
  imageUrl: string
  onClose: () => void
  onSave?: (newUrl: string) => void
}

const QUICK_ACTIONS = [
  { icon: Eraser, label: 'Remove BG', instruction: 'Remove the background and make it transparent' },
  { icon: Sun, label: 'Enhance', instruction: 'Enhance the image quality, improve lighting and colors' },
  { icon: ScanLine, label: 'Upscale', instruction: 'Upscale and enhance resolution while keeping details sharp' },
  { icon: Palette, label: 'Colors', instruction: 'Auto color correct and balance the image' },
  { icon: Contrast, label: 'Contrast', instruction: 'Increase contrast to make the image more vibrant' },
  { icon: Layers, label: 'Depth', instruction: 'Add depth of field effect, blur background slightly' },
]

const STYLE_PRESETS = [
  { label: 'Cinematic', instruction: 'Apply cinematic color grading with film-like tones' },
  { label: 'Vintage', instruction: 'Apply vintage film effect with warm tones and grain' },
  { label: 'Noir', instruction: 'Convert to black and white with high contrast noir style' },
  { label: 'Vibrant', instruction: 'Make colors more vibrant and saturated' },
  { label: 'Soft', instruction: 'Apply soft, dreamy filter with reduced contrast' },
  { label: 'HDR', instruction: 'Apply HDR effect to bring out details in shadows and highlights' },
]

export function AIImageEditor({ imageUrl, onClose, onSave }: AIImageEditorProps) {
  const [currentImage, setCurrentImage] = useState(imageUrl)
  const [instruction, setInstruction] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [history, setHistory] = useState<EditHistory[]>([{ url: imageUrl, instruction: 'Original', timestamp: new Date() }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [showHistory, setShowHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const handleEdit = async (editInstruction: string) => {
    if (!editInstruction.trim() || isProcessing) return

    setIsProcessing(true)
    try {
      console.log('Calling edit API with instruction:', editInstruction)
      
      const res = await fetch('/api/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: currentImage,
          instruction: editInstruction.trim(),
        }),
      })

      const data = await res.json()
      console.log('Edit API response:', res.status, data)

      if (!res.ok) {
        throw new Error(data.error || `Edit failed with status ${res.status}`)
      }

      const newUrl = data.url

      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({ url: newUrl, instruction: editInstruction, timestamp: new Date() })
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      setCurrentImage(newUrl)
      setInstruction('')
      toast.success('Edit applied!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to apply edit')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUndo = () => {
    if (!canUndo) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setCurrentImage(history[newIndex].url)
  }

  const handleRedo = () => {
    if (!canRedo) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setCurrentImage(history[newIndex].url)
  }

  const handleReset = () => {
    setHistoryIndex(0)
    setCurrentImage(history[0].url)
    setHistory([history[0]])
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pictura-edited-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Image downloaded!')
    } catch {
      toast.error('Failed to download')
    }
  }

  const handleSave = () => {
    onSave?.(currentImage)
    toast.success('Changes saved!')
    onClose()
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo() }
        if (e.key === 'z' && e.shiftKey) { e.preventDefault(); handleRedo() }
        if (e.key === 'y') { e.preventDefault(); handleRedo() }
        if (e.key === 's') { e.preventDefault(); handleSave() }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, currentImage])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header - Mobile Responsive */}
      <header className="flex items-center justify-between border-b border-border px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-foreground">AI Editor</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Edit with natural language</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Undo/Redo - compact on mobile */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            >
              <Undo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            >
              <Redo2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors hidden sm:flex ${showHistory ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
            >
              <History className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom - hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 border-l border-border pl-2 ml-1">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 rounded-lg hover:bg-muted">
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 rounded-lg hover:bg-muted">
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
            <button onClick={handleReset} className="p-1.5 sm:p-2 rounded-lg hover:bg-muted">
              <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button onClick={handleDownload} className="p-1.5 sm:p-2 rounded-lg hover:bg-muted">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-primary-foreground font-medium text-xs sm:text-sm"
            >
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Canvas */}
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto bg-muted/30">
          <div className="relative transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
            <img
              src={currentImage}
              alt="Editing"
              className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-xl shadow-xl"
              loading="eager"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                toast.error('Could not render this image in editor.')
              }}
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-spin mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm font-medium">Applying edit...</p>
              </div>
            )}
          </div>
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border bg-card overflow-hidden hidden sm:block"
            >
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-3">History</h3>
                <div className="space-y-2 max-h-[60vh] overflow-auto">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => { setHistoryIndex(i); setCurrentImage(item.url) }}
                      className={`w-full p-2 rounded-lg border text-left transition-colors ${
                        i === historyIndex ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded overflow-hidden bg-muted flex-shrink-0">
                          <img src={item.url} alt="History item" className="h-full w-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.instruction}</p>
                          <p className="text-[10px] text-muted-foreground">{item.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Panel - Fully Responsive */}
      <div className="border-t border-border bg-card px-3 sm:px-4 py-3 sm:py-4 space-y-3">
        {/* Quick Actions - Wrapped Grid on Mobile */}
        <div className="space-y-2">
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Quick Actions</span>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleEdit(action.instruction)}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center gap-1 p-2 sm:p-2.5 rounded-xl border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all disabled:opacity-50"
              >
                <action.icon className="h-4 w-4 text-primary" />
                <span className="text-[9px] sm:text-[10px] font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Style Presets - Wrapped Grid */}
        <div className="space-y-2">
          <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Styles</span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.label}
                onClick={() => handleEdit(style.instruction)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-full border border-border bg-background hover:bg-primary/5 hover:border-primary/30 text-[10px] sm:text-xs font-medium transition-all disabled:opacity-50"
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit(instruction)}
              placeholder="Describe changes..."
              className="w-full h-10 sm:h-11 pl-9 sm:pl-10 pr-3 sm:pr-4 rounded-xl border border-border bg-background text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              disabled={isProcessing}
            />
          </div>
          <button
            onClick={() => handleEdit(instruction)}
            disabled={!instruction.trim() || isProcessing}
            className="h-10 sm:h-11 px-4 sm:px-6 rounded-xl bg-primary text-primary-foreground font-medium text-xs sm:text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="hidden sm:inline">Apply</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
