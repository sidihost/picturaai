'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ArrowLeft, Sparkles, Loader2, Clock, Download, 
  RefreshCw, Zap, ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

interface ModelResult {
  model: string
  displayName: string
  url: string | null
  error: string | null
  generationTime: number | null
  loading: boolean
}

const AVAILABLE_MODELS = [
  { id: 'pi-1.5-turbo', name: 'Pictura 1.5 Turbo', description: 'Highest quality, Mistral-powered' },
  { id: 'pi-1.0', name: 'Pictura 1.0', description: 'Fast and efficient' },
  { id: 'stability-sd3', name: 'Stability SD3', description: 'Stable Diffusion 3' },
  { id: 'leonardo', name: 'Leonardo Phoenix', description: 'Creative and artistic' },
  { id: 'dalle-3', name: 'DALL-E 3', description: 'OpenAI image generation' },
  { id: 'flux-schnell', name: 'Flux Schnell', description: 'Black Forest Labs fast' },
]

export default function ModelComparisonPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>(['pi-1.5-turbo', 'pi-1.0'])
  const [results, setResults] = useState<ModelResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(m => m !== modelId)
        : [...prev, modelId]
    )
  }

  const generateComparison = async () => {
    if (!prompt.trim() || selectedModels.length === 0) return

    setIsGenerating(true)
    
    // Initialize results with loading state
    const initialResults: ModelResult[] = selectedModels.map(modelId => {
      const model = AVAILABLE_MODELS.find(m => m.id === modelId)!
      return {
        model: modelId,
        displayName: model.name,
        url: null,
        error: null,
        generationTime: null,
        loading: true
      }
    })
    setResults(initialResults)

    // Generate for each model in parallel
    const promises = selectedModels.map(async (modelId) => {
      const startTime = Date.now()
      try {
        const res = await fetch('/api/developers/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, model: modelId })
        })
        
        const data = await res.json()
        const generationTime = Date.now() - startTime
        
        if (res.ok && data.url) {
          return { model: modelId, url: data.url, error: null, generationTime }
        } else {
          return { model: modelId, url: null, error: data.error || 'Generation failed', generationTime }
        }
      } catch {
        return { model: modelId, url: null, error: 'Network error', generationTime: Date.now() - startTime }
      }
    })

    // Update results as they complete
    promises.forEach(async (promise, index) => {
      const result = await promise
      setResults(prev => prev.map((r, i) => 
        i === index 
          ? { ...r, ...result, loading: false }
          : r
      ))
    })

    await Promise.all(promises)
    setIsGenerating(false)
  }

  const downloadImage = async (url: string, model: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `comparison-${model}-${Date.now()}.png`
      link.click()
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/developers/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <PicturaIcon size={24} />
              <h1 className="text-xl font-semibold">Model Comparison</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Compare Image Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Enter your image prompt to compare across different models..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-1.5 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="mb-3 block">Select Models to Compare</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedModels.includes(model.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleModel(model.id)}
                  >
                    <Checkbox
                      checked={selectedModels.includes(model.id)}
                      onCheckedChange={() => toggleModel(model.id)}
                    />
                    <div>
                      <p className="font-medium text-sm">{model.name}</p>
                      <p className="text-xs text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={generateComparison}
              disabled={!prompt.trim() || selectedModels.length === 0 || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Comparison ({selectedModels.length} models)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {results.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Comparison Results</h2>
            <div className={`grid gap-4 ${
              results.length === 2 ? 'md:grid-cols-2' :
              results.length === 3 ? 'md:grid-cols-3' :
              results.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
              'md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {results.map((result) => (
                <Card key={result.model} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{result.displayName}</CardTitle>
                      {result.generationTime && !result.loading && (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {(result.generationTime / 1000).toFixed(1)}s
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                      {result.loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Generating...</p>
                        </div>
                      ) : result.url ? (
                        <>
                          <img
                            src={result.url}
                            alt={`${result.displayName} result`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8"
                            onClick={() => downloadImage(result.url!, result.model)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground text-center">
                            {result.error || 'Generation failed'}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && (
          <Card className="p-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Compare AI Image Models</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter a prompt and select multiple models to see how each one interprets 
              your description. Compare quality, style, and generation time side by side.
            </p>
          </Card>
        )}
      </main>
    </div>
  )
}
