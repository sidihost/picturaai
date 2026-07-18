'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  ArrowLeft, Search, Heart, Download, Trash2, Copy, 
  Grid3X3, LayoutGrid, Clock, Sparkles, ImageIcon, Filter
} from 'lucide-react'
import Link from 'next/link'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

interface ImageItem {
  id: number
  prompt: string
  full_prompt: string | null
  model: string
  style_preset: string | null
  width: number
  height: number
  image_url: string
  generation_time_ms: number | null
  provider: string | null
  credits_used: number
  is_favorite: boolean
  created_at: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modelFilter, setModelFilter] = useState('all')
  const [styleFilter, setStyleFilter] = useState('all')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid')
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)

  useEffect(() => {
    fetchImages()
  }, [modelFilter, styleFilter, favoritesOnly])

  const fetchImages = async () => {
    try {
      const params = new URLSearchParams()
      if (modelFilter !== 'all') params.set('model', modelFilter)
      if (styleFilter !== 'all') params.set('style', styleFilter)
      if (favoritesOnly) params.set('favorites', 'true')

      const res = await fetch(`/api/developers/images?${params}`)
      if (res.ok) {
        const data = await res.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (id: number) => {
    try {
      const res = await fetch(`/api/developers/images/${id}/favorite`, { method: 'POST' })
      if (res.ok) {
        setImages(prev => prev.map(img => 
          img.id === id ? { ...img, is_favorite: !img.is_favorite } : img
        ))
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const deleteImage = async (id: number) => {
    if (!confirm('Delete this image from your history?')) return
    try {
      const res = await fetch(`/api/developers/images/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id))
        setSelectedImage(null)
      }
    } catch (error) {
      console.error('Failed to delete image:', error)
    }
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
  }

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `pictura-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`
      link.click()
    } catch (error) {
      console.error('Failed to download:', error)
    }
  }

  const filteredImages = images.filter(img => 
    search === '' || img.prompt.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/developers/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <PicturaIcon size={24} />
                <h1 className="text-xl font-semibold">Image Gallery</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'large' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('large')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="pi-1.5-turbo">Pictura 1.5</SelectItem>
                <SelectItem value="pi-1.0">Pictura 1.0</SelectItem>
              </SelectContent>
            </Select>
            <Select value={styleFilter} onValueChange={setStyleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                <SelectItem value="photorealistic">Photorealistic</SelectItem>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="oil-painting">Oil Painting</SelectItem>
                <SelectItem value="3d-render">3D Render</SelectItem>
                <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={favoritesOnly ? 'default' : 'outline'}
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className="gap-2"
            >
              <Heart className={`h-4 w-4 ${favoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ImageIcon className="h-4 w-4" />
            {filteredImages.length} images
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {images.filter(i => i.is_favorite).length} favorites
          </span>
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredImages.length === 0 ? (
          <Card className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate some images using the API or playground to see them here.
            </p>
            <Link href="/developers/playground">
              <Button>Open Playground</Button>
            </Link>
          </Card>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {filteredImages.map((image) => (
              <Card 
                key={image.id} 
                className="group overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                onClick={() => setSelectedImage(image)}
              >
                <div className={`relative ${viewMode === 'grid' ? 'aspect-square' : 'aspect-video'}`}>
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm line-clamp-2">{image.prompt}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(image.id)
                    }}
                  >
                    <Heart className={`h-4 w-4 ${image.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  {image.style_preset && (
                    <Badge className="absolute top-2 left-2 bg-black/40 text-white border-0">
                      {image.style_preset}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Image Detail Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Prompt</h4>
                  <p className="text-sm">{selectedImage.prompt}</p>
                  {selectedImage.full_prompt && selectedImage.full_prompt !== selectedImage.prompt && (
                    <>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1 mt-3">Enhanced Prompt</h4>
                      <p className="text-sm text-muted-foreground">{selectedImage.full_prompt}</p>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Model:</span>
                    <p className="font-medium">{selectedImage.model}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Size:</span>
                    <p className="font-medium">{selectedImage.width}x{selectedImage.height}</p>
                  </div>
                  {selectedImage.style_preset && (
                    <div>
                      <span className="text-muted-foreground">Style:</span>
                      <p className="font-medium capitalize">{selectedImage.style_preset.replace('-', ' ')}</p>
                    </div>
                  )}
                  {selectedImage.generation_time_ms && (
                    <div>
                      <span className="text-muted-foreground">Generation Time:</span>
                      <p className="font-medium">{(selectedImage.generation_time_ms / 1000).toFixed(1)}s</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Credits Used:</span>
                    <p className="font-medium">{selectedImage.credits_used}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">{new Date(selectedImage.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyPrompt(selectedImage.prompt)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" /> Copy Prompt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadImage(selectedImage.image_url, selectedImage.prompt)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFavorite(selectedImage.id)}
                    className="gap-2"
                  >
                    <Heart className={`h-4 w-4 ${selectedImage.is_favorite ? 'fill-red-500 text-red-500' : ''}`} />
                    {selectedImage.is_favorite ? 'Unfavorite' : 'Favorite'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteImage(selectedImage.id)}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
