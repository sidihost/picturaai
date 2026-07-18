'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  ArrowLeft,
  Play,
  Copy,
  Download,
  Loader2,
  Clock,
  Zap,
  ImageIcon,
  Wand2,
  Sparkles,
  Code,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { PicturaLogo, PicturaIcon } from '@/components/pictura/pictura-logo'

// Style presets
const STYLE_PRESETS = [
  { id: 'none', name: 'None', prompt: '' },
  { id: 'photorealistic', name: 'Photorealistic', prompt: 'photorealistic, highly detailed, 8k, sharp focus, professional photography' },
  { id: 'anime', name: 'Anime', prompt: 'anime style, vibrant colors, detailed illustration, studio ghibli inspired' },
  { id: 'oil-painting', name: 'Oil Painting', prompt: 'oil painting style, rich textures, classical art, museum quality' },
  { id: '3d-render', name: '3D Render', prompt: '3D render, octane render, highly detailed, cinematic lighting, unreal engine' },
  { id: 'watercolor', name: 'Watercolor', prompt: 'watercolor painting, soft edges, artistic, delicate brushstrokes' },
  { id: 'pixel-art', name: 'Pixel Art', prompt: 'pixel art, retro game style, 16-bit, nostalgic' },
  { id: 'sketch', name: 'Sketch', prompt: 'pencil sketch, hand drawn, artistic linework, detailed illustration' },
  { id: 'cyberpunk', name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic, dystopian, high tech' },
  { id: 'fantasy', name: 'Fantasy', prompt: 'fantasy art, magical, ethereal, detailed illustration, concept art' },
  { id: 'minimalist', name: 'Minimalist', prompt: 'minimalist design, clean lines, simple shapes, modern aesthetic' },
  { id: 'vintage', name: 'Vintage', prompt: 'vintage style, retro aesthetic, film grain, nostalgic colors' },
]

interface GenerationResult {
  success: boolean
  imageUrl?: string
  error?: string
  generationTime: number
  model: string
  prompt: string
  timestamp: Date
}

export default function APIPlayground() {
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('pi-1.5-turbo')
  const [stylePreset, setStylePreset] = useState('none')
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [history, setHistory] = useState<GenerationResult[]>([])
  const [copied, setCopied] = useState(false)

  // Load API key from local storage
  useEffect(() => {
    const savedKey = localStorage.getItem('pictura_playground_key')
    if (savedKey) setApiKey(savedKey)
  }, [])

  // Save API key to local storage
  const saveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem('pictura_playground_key', key)
  }

  const getFullPrompt = () => {
    const preset = STYLE_PRESETS.find(p => p.id === stylePreset)
    if (preset && preset.prompt) {
      return `${prompt}, ${preset.prompt}`
    }
    return prompt
  }

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your API key')
      return
    }
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGenerating(true)
    const startTime = Date.now()
    const fullPrompt = getFullPrompt()

    try {
      const res = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          model,
          width,
          height,
        }),
      })

      const data = await res.json()
      const generationTime = Date.now() - startTime

      const newResult: GenerationResult = {
        success: res.ok,
        imageUrl: data.url,
        error: data.error,
        generationTime,
        model,
        prompt: fullPrompt,
        timestamp: new Date(),
      }

      setResult(newResult)
      
      if (res.ok) {
        setHistory(prev => [newResult, ...prev].slice(0, 10))
        toast.success(`Image generated in ${(generationTime / 1000).toFixed(2)}s`)
      } else {
        toast.error(data.error || 'Generation failed')
      }
    } catch (error) {
      const generationTime = Date.now() - startTime
      setResult({
        success: false,
        error: 'Network error - please check your connection',
        generationTime,
        model,
        prompt: fullPrompt,
        timestamp: new Date(),
      })
      toast.error('Network error')
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = () => {
    const code = `const response = await fetch('https://pictura.ai/api/v1/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}',
  },
  body: JSON.stringify({
    prompt: "${getFullPrompt().replace(/"/g, '\\"')}",
    model: "${model}",
    width: ${width},
    height: ${height},
  }),
});

const data = await response.json();
console.log(data.url); // Generated image URL`

    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Code copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadImage = async () => {
    if (!result?.imageUrl) return
    
    try {
      const response = await fetch(result.imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pictura-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Image downloaded')
    } catch {
      toast.error('Failed to download image')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/developers/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <PicturaIcon size={24} />
                <span className="font-semibold">API Playground</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-[#C87941]/10 text-[#C87941] border-[#C87941]/20">
              <Zap className="h-3 w-3 mr-1" />
              Live Testing
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* API Key */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4 text-[#C87941]" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="pi_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={apiKey}
                    onChange={(e) => saveApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from the <Link href="/developers/dashboard" className="text-[#C87941] hover:underline">dashboard</Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prompt */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-[#C87941]" />
                  Prompt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="A majestic lion standing on a cliff at sunset, golden hour lighting..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                
                {/* Style Preset */}
                <div className="space-y-2">
                  <Label>Style Preset</Label>
                  <Select value={stylePreset} onValueChange={setStylePreset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_PRESETS.map((preset) => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Prompt Preview */}
                {stylePreset !== 'none' && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Full prompt preview:</p>
                    <p className="text-sm">{getFullPrompt()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Model & Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C87941]" />
                  Model & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pi-1.5-turbo">
                        <div className="flex items-center gap-2">
                          <span>Pictura 1.5 Turbo</span>
                          <Badge variant="secondary" className="text-xs">Best Quality</Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="pi-1.0">Pictura 1.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Width: {width}px</Label>
                    <Slider
                      value={[width]}
                      onValueChange={([v]) => setWidth(v)}
                      min={512}
                      max={1536}
                      step={64}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height: {height}px</Label>
                    <Slider
                      value={[height]}
                      onValueChange={([v]) => setHeight(v)}
                      min={512}
                      max={1536}
                      step={64}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Aspect Ratio:</span>
                  <Badge variant="outline">{width}x{height}</Badge>
                  <Badge variant="outline">{(width/height).toFixed(2)}:1</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerate} 
              disabled={generating || !apiKey || !prompt}
              className="w-full bg-[#C87941] hover:bg-[#B56A35] text-white h-12"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>

            {/* Code Snippet */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Code Snippet</CardTitle>
                  <Button variant="ghost" size="sm" onClick={copyCode}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="p-4 bg-[#1a1a2e] text-gray-300 rounded-lg text-xs overflow-x-auto">
                  <code>{`fetch('/api/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey ? '••••••••' : 'YOUR_API_KEY'}',
  },
  body: JSON.stringify({
    prompt: "${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}"
    model: "${model}",
    width: ${width}, height: ${height}
  })
})`}</code>
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Results */}
          <div className="space-y-6">
            {/* Result Card */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#C87941]" />
                    Result
                  </CardTitle>
                  {result && (
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(result.generationTime / 1000).toFixed(2)}s
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {generating ? (
                  <div className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-[#C87941]/20 border-t-[#C87941] animate-spin" />
                      <PicturaIcon size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-muted-foreground">Generating your image...</p>
                  </div>
                ) : result?.success && result.imageUrl ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={result.imageUrl}
                        alt="Generated image"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={downloadImage}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" className="flex-1" onClick={() => {
                        navigator.clipboard.writeText(result.imageUrl!)
                        toast.success('URL copied')
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                ) : result?.error ? (
                  <div className="aspect-square bg-red-50 rounded-lg flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <XCircle className="h-12 w-12 text-red-400" />
                    <div>
                      <p className="font-medium text-red-700">Generation Failed</p>
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    </div>
                    <Button variant="outline" onClick={handleGenerate}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-[#C87941]/5 to-[#C87941]/10 rounded-lg flex flex-col items-center justify-center gap-4 p-6 text-center border-2 border-dashed border-[#C87941]/20">
                    <div className="w-16 h-16 rounded-full bg-[#C87941]/10 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-[#C87941]" />
                    </div>
                    <div>
                      <p className="font-medium">Ready to Generate</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter a prompt and click generate to create an image
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History */}
            {history.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Generations</CardTitle>
                  <CardDescription>Your last {history.length} generations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {history.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setResult(item)}
                        className="relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 ring-[#C87941] transition-all"
                      >
                        {item.imageUrl && (
                          <Image
                            src={item.imageUrl}
                            alt={`Generation ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <p className="text-[10px] text-white truncate">{item.model}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
