'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointer2, Square, Circle, Triangle, Type, Pencil, 
  Minus, ArrowUpRight, Hand, ZoomIn, ZoomOut, Undo2, Redo2,
  Trash2, Copy, Clipboard, Layers, Eye, EyeOff, Lock, Unlock,
  ChevronDown, ChevronRight, Plus, Download, Upload, Save,
  Palette, AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter, FlipHorizontal, FlipVertical,
  RotateCcw, RotateCw, BringToFront, SendToBack, Group, Ungroup,
  Grid3X3, Magnet, Move, Maximize2, X, Check, Bold, Italic, Underline
} from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

// Types
type Tool = 'select' | 'rectangle' | 'ellipse' | 'triangle' | 'line' | 'arrow' | 'pen' | 'text' | 'hand'
type ShapeType = 'rectangle' | 'ellipse' | 'triangle' | 'line' | 'arrow' | 'path' | 'text'

interface Point {
  x: number
  y: number
}

interface Shape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  points?: Point[] // For path/pen tool
  text?: string // For text
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: 'left' | 'center' | 'right'
}

interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  shapes: Shape[]
}

interface HistoryState {
  layers: Layer[]
  selectedIds: string[]
}

// Color presets
const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#78716C', '#737373', '#A3A3A3', '#D4D4D4', '#FAFAFA'
]

// Toolbar button component
function ToolButton({ 
  active, 
  onClick, 
  children, 
  title,
  disabled = false 
}: { 
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  title: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-foreground hover:bg-muted'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}

// Color picker component
function ColorPicker({ 
  color, 
  onChange, 
  label 
}: { 
  color: string
  onChange: (color: string) => void
  label: string
}) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
      >
        <div 
          className="w-5 h-5 rounded border border-border"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-muted-foreground">{label}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-0 mt-1 p-2 rounded-xl border border-border bg-card shadow-lg z-50"
            >
              <div className="grid grid-cols-6 gap-1 mb-2">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { onChange(c); setOpen(false) }}
                    className={`w-6 h-6 rounded border transition-all ${
                      color === c ? 'ring-2 ring-primary ring-offset-1' : 'border-border hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export function VectorEditor() {
  // Canvas state
  const [tool, setTool] = useState<Tool>('select')
  const [zoom, setZoom] = useState(100)
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 })
  const [gridVisible, setGridVisible] = useState(true)
  const [snapToGrid, setSnapToGrid] = useState(true)
  
  // Layers and shapes
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'Layer 1', visible: true, locked: false, shapes: [] }
  ])
  const [activeLayerId, setActiveLayerId] = useState('layer-1')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // History for undo/redo
  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [pathPoints, setPathPoints] = useState<Point[]>([])
  
  // Properties
  const [fillColor, setFillColor] = useState('#3B82F6')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [fontSize, setFontSize] = useState(24)
  const [fontFamily, setFontFamily] = useState('Inter')
  
  // UI state
  const [layersPanelOpen, setLayersPanelOpen] = useState(true)
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(true)
  const [textInput, setTextInput] = useState('')
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  
  // Get active layer
  const activeLayer = layers.find(l => l.id === activeLayerId)
  const allShapes = layers.flatMap(l => l.visible ? l.shapes : [])
  const selectedShapes = allShapes.filter(s => selectedIds.includes(s.id))
  
  // Save to history
  const saveHistory = useCallback(() => {
    const newState: HistoryState = {
      layers: JSON.parse(JSON.stringify(layers)),
      selectedIds: [...selectedIds]
    }
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState])
    setHistoryIndex(prev => prev + 1)
  }, [layers, selectedIds, historyIndex])
  
  // Undo
  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const prevState = history[historyIndex - 1]
    setLayers(prevState.layers)
    setSelectedIds(prevState.selectedIds)
    setHistoryIndex(prev => prev - 1)
  }, [history, historyIndex])
  
  // Redo
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const nextState = history[historyIndex + 1]
    setLayers(nextState.layers)
    setSelectedIds(nextState.selectedIds)
    setHistoryIndex(prev => prev + 1)
  }, [history, historyIndex])
  
  // Generate unique ID
  const generateId = () => `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  // Snap to grid
  const snapPoint = (point: Point): Point => {
    if (!snapToGrid) return point
    const gridSize = 10
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    }
  }
  
  // Get mouse position relative to canvas
  const getCanvasPoint = (e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 }
    const rect = svgRef.current.getBoundingClientRect()
    return snapPoint({
      x: (e.clientX - rect.left - pan.x) / (zoom / 100),
      y: (e.clientY - rect.top - pan.y) / (zoom / 100)
    })
  }
  
  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    const point = getCanvasPoint(e)
    
    if (tool === 'hand') {
      setIsDrawing(true)
      setDrawStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      return
    }
    
    if (tool === 'select') {
      // Check if clicking on a shape
      const clickedShape = [...allShapes].reverse().find(shape => {
        if (shape.type === 'line' || shape.type === 'arrow') {
          // Line hit test
          return false // Simplified
        }
        return (
          point.x >= shape.x &&
          point.x <= shape.x + shape.width &&
          point.y >= shape.y &&
          point.y <= shape.y + shape.height
        )
      })
      
      if (clickedShape) {
        if (e.shiftKey) {
          setSelectedIds(prev => 
            prev.includes(clickedShape.id) 
              ? prev.filter(id => id !== clickedShape.id)
              : [...prev, clickedShape.id]
          )
        } else {
          setSelectedIds([clickedShape.id])
        }
        setIsDrawing(true)
        setDrawStart(point)
      } else {
        setSelectedIds([])
      }
      return
    }
    
    if (tool === 'pen') {
      setPathPoints(prev => [...prev, point])
      return
    }
    
    if (tool === 'text') {
      const newShape: Shape = {
        id: generateId(),
        type: 'text',
        x: point.x,
        y: point.y,
        width: 200,
        height: fontSize * 1.5,
        rotation: 0,
        fill: fillColor,
        stroke: 'transparent',
        strokeWidth: 0,
        opacity: 1,
        text: 'Double-click to edit',
        fontSize,
        fontFamily,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left'
      }
      
      setLayers(prev => prev.map(l => 
        l.id === activeLayerId 
          ? { ...l, shapes: [...l.shapes, newShape] }
          : l
      ))
      setSelectedIds([newShape.id])
      saveHistory()
      return
    }
    
    // Start drawing a shape
    setIsDrawing(true)
    setDrawStart(point)
    
    const shapeType: ShapeType = 
      tool === 'rectangle' ? 'rectangle' :
      tool === 'ellipse' ? 'ellipse' :
      tool === 'triangle' ? 'triangle' :
      tool === 'line' ? 'line' :
      tool === 'arrow' ? 'arrow' : 'rectangle'
    
    setCurrentShape({
      id: generateId(),
      type: shapeType,
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      rotation: 0,
      fill: tool === 'line' || tool === 'arrow' ? 'transparent' : fillColor,
      stroke: strokeColor,
      strokeWidth,
      opacity: 1
    })
  }
  
  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    
    const point = getCanvasPoint(e)
    
    if (tool === 'hand' && drawStart) {
      setPan({
        x: e.clientX - drawStart.x,
        y: e.clientY - drawStart.y
      })
      return
    }
    
    if (tool === 'select' && drawStart && selectedIds.length > 0) {
      // Move selected shapes
      const dx = point.x - drawStart.x
      const dy = point.y - drawStart.y
      
      setLayers(prev => prev.map(layer => ({
        ...layer,
        shapes: layer.shapes.map(shape => 
          selectedIds.includes(shape.id)
            ? { ...shape, x: shape.x + dx, y: shape.y + dy }
            : shape
        )
      })))
      setDrawStart(point)
      return
    }
    
    if (currentShape && drawStart) {
      const width = point.x - drawStart.x
      const height = point.y - drawStart.y
      
      setCurrentShape(prev => prev ? {
        ...prev,
        x: width < 0 ? point.x : drawStart.x,
        y: height < 0 ? point.y : drawStart.y,
        width: Math.abs(width),
        height: Math.abs(height)
      } : null)
    }
  }
  
  // Mouse up handler
  const handleMouseUp = () => {
    if (currentShape && currentShape.width > 5 && currentShape.height > 5) {
      setLayers(prev => prev.map(l => 
        l.id === activeLayerId 
          ? { ...l, shapes: [...l.shapes, currentShape] }
          : l
      ))
      setSelectedIds([currentShape.id])
      saveHistory()
    }
    
    setIsDrawing(false)
    setDrawStart(null)
    setCurrentShape(null)
  }
  
  // Finish pen path
  const finishPenPath = () => {
    if (pathPoints.length < 2) {
      setPathPoints([])
      return
    }
    
    const bounds = pathPoints.reduce(
      (acc, p) => ({
        minX: Math.min(acc.minX, p.x),
        minY: Math.min(acc.minY, p.y),
        maxX: Math.max(acc.maxX, p.x),
        maxY: Math.max(acc.maxY, p.y)
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    )
    
    const newShape: Shape = {
      id: generateId(),
      type: 'path',
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
      rotation: 0,
      fill: 'transparent',
      stroke: strokeColor,
      strokeWidth,
      opacity: 1,
      points: pathPoints.map(p => ({ x: p.x - bounds.minX, y: p.y - bounds.minY }))
    }
    
    setLayers(prev => prev.map(l => 
      l.id === activeLayerId 
        ? { ...l, shapes: [...l.shapes, newShape] }
        : l
    ))
    setSelectedIds([newShape.id])
    setPathPoints([])
    saveHistory()
  }
  
  // Delete selected shapes
  const deleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return
    setLayers(prev => prev.map(layer => ({
      ...layer,
      shapes: layer.shapes.filter(s => !selectedIds.includes(s.id))
    })))
    setSelectedIds([])
    saveHistory()
  }, [selectedIds, saveHistory])
  
  // Copy selected shapes
  const copySelected = useCallback(() => {
    const shapes = allShapes.filter(s => selectedIds.includes(s.id))
    localStorage.setItem('pictura_clipboard', JSON.stringify(shapes))
  }, [allShapes, selectedIds])
  
  // Paste shapes
  const pasteShapes = useCallback(() => {
    try {
      const shapes: Shape[] = JSON.parse(localStorage.getItem('pictura_clipboard') || '[]')
      if (shapes.length === 0) return
      
      const newShapes = shapes.map(s => ({
        ...s,
        id: generateId(),
        x: s.x + 20,
        y: s.y + 20
      }))
      
      setLayers(prev => prev.map(l => 
        l.id === activeLayerId 
          ? { ...l, shapes: [...l.shapes, ...newShapes] }
          : l
      ))
      setSelectedIds(newShapes.map(s => s.id))
      saveHistory()
    } catch { /* ignore */ }
  }, [activeLayerId, saveHistory])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      // Tool shortcuts
      if (e.key === 'v' || e.key === 'V') setTool('select')
      if (e.key === 'r' || e.key === 'R') setTool('rectangle')
      if (e.key === 'e' || e.key === 'E') setTool('ellipse')
      if (e.key === 'l' || e.key === 'L') setTool('line')
      if (e.key === 'p' || e.key === 'P') setTool('pen')
      if (e.key === 't' || e.key === 'T') setTool('text')
      if (e.key === 'h' || e.key === 'H') setTool('hand')
      
      // Actions
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected()
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copySelected() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') { e.preventDefault(); pasteShapes() }
      
      // Escape to finish pen path
      if (e.key === 'Escape') {
        if (pathPoints.length > 0) finishPenPath()
        setSelectedIds([])
      }
      
      // Zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); setZoom(z => Math.min(z + 10, 400)) }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(z - 10, 10)) }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleteSelected, undo, redo, copySelected, pasteShapes, pathPoints])
  
  // Add new layer
  const addLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      shapes: []
    }
    setLayers(prev => [...prev, newLayer])
    setActiveLayerId(newLayer.id)
  }
  
  // Delete layer
  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return
    setLayers(prev => prev.filter(l => l.id !== id))
    if (activeLayerId === id) {
      setActiveLayerId(layers.find(l => l.id !== id)?.id || '')
    }
  }
  
  // Render shape
  const renderShape = (shape: Shape, isPreview = false) => {
    const isSelected = selectedIds.includes(shape.id) && !isPreview
    const commonProps = {
      key: shape.id,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      opacity: shape.opacity,
      transform: `rotate(${shape.rotation} ${shape.x + shape.width/2} ${shape.y + shape.height/2})`,
      className: isSelected ? 'cursor-move' : 'cursor-pointer'
    }
    
    switch (shape.type) {
      case 'rectangle':
        return <rect {...commonProps} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={4} />
      case 'ellipse':
        return <ellipse {...commonProps} cx={shape.x + shape.width/2} cy={shape.y + shape.height/2} rx={shape.width/2} ry={shape.height/2} />
      case 'triangle':
        const points = `${shape.x + shape.width/2},${shape.y} ${shape.x},${shape.y + shape.height} ${shape.x + shape.width},${shape.y + shape.height}`
        return <polygon {...commonProps} points={points} />
      case 'line':
        return <line {...commonProps} x1={shape.x} y1={shape.y} x2={shape.x + shape.width} y2={shape.y + shape.height} />
      case 'arrow':
        const arrowHead = `M${shape.x + shape.width},${shape.y + shape.height} l-10,-5 l0,10 z`
        return (
          <g key={shape.id}>
            <line {...commonProps} x1={shape.x} y1={shape.y} x2={shape.x + shape.width} y2={shape.y + shape.height} />
            <path d={arrowHead} fill={shape.stroke} />
          </g>
        )
      case 'path':
        if (!shape.points || shape.points.length < 2) return null
        const pathD = shape.points.map((p, i) => 
          `${i === 0 ? 'M' : 'L'} ${shape.x + p.x} ${shape.y + p.y}`
        ).join(' ')
        return <path {...commonProps} d={pathD} fill="none" />
      case 'text':
        return (
          <text
            key={shape.id}
            x={shape.x}
            y={shape.y + (shape.fontSize || 24)}
            fill={shape.fill}
            fontSize={shape.fontSize}
            fontFamily={shape.fontFamily}
            fontWeight={shape.fontWeight}
            fontStyle={shape.fontStyle}
            textAnchor={shape.textAlign === 'center' ? 'middle' : shape.textAlign === 'right' ? 'end' : 'start'}
            className={isSelected ? 'cursor-move' : 'cursor-pointer'}
            onDoubleClick={() => setEditingTextId(shape.id)}
          >
            {shape.text}
          </text>
        )
      default:
        return null
    }
  }
  
  // Export SVG
  const exportSVG = () => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'pictura-design.svg'
    a.click()
    URL.revokeObjectURL(url)
  }
  
  // Export PNG
  const exportPNG = () => {
    if (!svgRef.current) return
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const canvas = document.createElement('canvas')
    canvas.width = 1920
    canvas.height = 1080
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const img = new window.Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = 'pictura-design.png'
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top toolbar */}
      <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <PicturaIcon size={24} />
            <span className="font-semibold text-sm hidden sm:inline">
              <span className="text-primary">Pictura</span> Editor
            </span>
          </div>
          
          <div className="h-4 w-px bg-border" />
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolButton onClick={undo} title="Undo (Ctrl+Z)" disabled={historyIndex <= 0}>
              <Undo2 className="h-4 w-4" />
            </ToolButton>
            <ToolButton onClick={redo} title="Redo (Ctrl+Y)" disabled={historyIndex >= history.length - 1}>
              <Redo2 className="h-4 w-4" />
            </ToolButton>
          </div>
          
          <div className="h-4 w-px bg-border" />
          
          {/* Zoom */}
          <div className="flex items-center gap-1">
            <ToolButton onClick={() => setZoom(z => Math.max(z - 10, 10))} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </ToolButton>
            <span className="text-xs text-muted-foreground w-10 text-center">{zoom}%</span>
            <ToolButton onClick={() => setZoom(z => Math.min(z + 10, 400))} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </ToolButton>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Grid toggle */}
          <ToolButton onClick={() => setGridVisible(!gridVisible)} title="Toggle Grid" active={gridVisible}>
            <Grid3X3 className="h-4 w-4" />
          </ToolButton>
          
          {/* Snap toggle */}
          <ToolButton onClick={() => setSnapToGrid(!snapToGrid)} title="Snap to Grid" active={snapToGrid}>
            <Magnet className="h-4 w-4" />
          </ToolButton>
          
          <div className="h-4 w-px bg-border" />
          
          {/* Export */}
          <button onClick={exportSVG} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" />
            SVG
          </button>
          <button onClick={exportPNG} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Download className="h-3.5 w-3.5" />
            PNG
          </button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <div className="w-12 border-r border-border bg-card flex flex-col items-center py-2 gap-1">
          <ToolButton active={tool === 'select'} onClick={() => setTool('select')} title="Select (V)">
            <MousePointer2 className="h-4 w-4" />
          </ToolButton>
          <ToolButton active={tool === 'hand'} onClick={() => setTool('hand')} title="Hand (H)">
            <Hand className="h-4 w-4" />
          </ToolButton>
          
          <div className="h-px w-6 bg-border my-1" />
          
          <ToolButton active={tool === 'rectangle'} onClick={() => setTool('rectangle')} title="Rectangle (R)">
            <Square className="h-4 w-4" />
          </ToolButton>
          <ToolButton active={tool === 'ellipse'} onClick={() => setTool('ellipse')} title="Ellipse (E)">
            <Circle className="h-4 w-4" />
          </ToolButton>
          <ToolButton active={tool === 'triangle'} onClick={() => setTool('triangle')} title="Triangle">
            <Triangle className="h-4 w-4" />
          </ToolButton>
          <ToolButton active={tool === 'line'} onClick={() => setTool('line')} title="Line (L)">
            <Minus className="h-4 w-4" />
          </ToolButton>
          <ToolButton active={tool === 'arrow'} onClick={() => setTool('arrow')} title="Arrow">
            <ArrowUpRight className="h-4 w-4" />
          </ToolButton>
          
          <div className="h-px w-6 bg-border my-1" />
          
          <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} title="Pen (P)">
            <Pencil className="h-4 w-4" />
          </ToolButton>
          <ToolButton active={tool === 'text'} onClick={() => setTool('text')} title="Text (T)">
            <Type className="h-4 w-4" />
          </ToolButton>
          
          <div className="flex-1" />
          
          {/* Color swatches at bottom */}
          <div className="flex flex-col gap-1 items-center">
            <button
              onClick={() => {/* TODO: open fill picker */}}
              className="w-6 h-6 rounded border-2 border-white shadow-sm"
              style={{ backgroundColor: fillColor }}
              title="Fill Color"
            />
            <button
              onClick={() => {/* TODO: open stroke picker */}}
              className="w-5 h-5 rounded border border-border"
              style={{ backgroundColor: strokeColor }}
              title="Stroke Color"
            />
          </div>
        </div>
        
        {/* Canvas area */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-muted/30"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            ref={svgRef}
            className="absolute"
            style={{
              left: pan.x,
              top: pan.y,
              width: `${1920 * zoom / 100}px`,
              height: `${1080 * zoom / 100}px`,
              cursor: tool === 'hand' ? 'grab' : tool === 'select' ? 'default' : 'crosshair'
            }}
            viewBox="0 0 1920 1080"
          >
            {/* Background */}
            <rect x="0" y="0" width="1920" height="1080" fill="white" />
            
            {/* Grid */}
            {gridVisible && (
              <g opacity="0.15">
                {Array.from({ length: 193 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="1080" stroke="#000" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 109 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 10} x2="1920" y2={i * 10} stroke="#000" strokeWidth="0.5" />
                ))}
              </g>
            )}
            
            {/* Render all shapes from visible layers */}
            {layers.filter(l => l.visible).map(layer => (
              <g key={layer.id} opacity={layer.locked ? 0.5 : 1}>
                {layer.shapes.map(shape => renderShape(shape))}
              </g>
            ))}
            
            {/* Current drawing shape preview */}
            {currentShape && renderShape(currentShape, true)}
            
            {/* Pen path preview */}
            {pathPoints.length > 0 && (
              <polyline
                points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray="4"
              />
            )}
            
            {/* Selection handles */}
            {selectedShapes.map(shape => (
              <g key={`selection-${shape.id}`}>
                <rect
                  x={shape.x - 2}
                  y={shape.y - 2}
                  width={shape.width + 4}
                  height={shape.height + 4}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="1"
                  strokeDasharray="4"
                />
                {/* Corner handles */}
                {[
                  { x: shape.x - 4, y: shape.y - 4 },
                  { x: shape.x + shape.width, y: shape.y - 4 },
                  { x: shape.x - 4, y: shape.y + shape.height },
                  { x: shape.x + shape.width, y: shape.y + shape.height }
                ].map((pos, i) => (
                  <rect key={i} x={pos.x} y={pos.y} width="8" height="8" fill="white" stroke="#3B82F6" strokeWidth="1" className="cursor-nwse-resize" />
                ))}
              </g>
            ))}
          </svg>
          
          {/* Tool hint */}
          <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-card/90 border border-border text-xs text-muted-foreground">
            {tool === 'pen' && pathPoints.length > 0 
              ? 'Click to add points, press Escape to finish' 
              : `Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)}`}
          </div>
        </div>
        
        {/* Right panel - Properties & Layers */}
        <div className="w-64 border-l border-border bg-card flex flex-col">
          {/* Properties panel */}
          <div className="border-b border-border">
            <button
              onClick={() => setPropertiesPanelOpen(!propertiesPanelOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                Properties
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${propertiesPanelOpen ? '' : '-rotate-90'}`} />
            </button>
            
            <AnimatePresence>
              {propertiesPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <ColorPicker color={fillColor} onChange={setFillColor} label="Fill" />
                      <ColorPicker color={strokeColor} onChange={setStrokeColor} label="Stroke" />
                    </div>
                    
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Stroke Width</label>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                      />
                      <span className="text-xs text-muted-foreground">{strokeWidth}px</span>
                    </div>
                    
                    {tool === 'text' && (
                      <>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Font Size</label>
                          <input
                            type="number"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                            className="w-full h-8 px-2 rounded border border-border bg-background text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <ToolButton onClick={() => {}} title="Bold">
                            <Bold className="h-3.5 w-3.5" />
                          </ToolButton>
                          <ToolButton onClick={() => {}} title="Italic">
                            <Italic className="h-3.5 w-3.5" />
                          </ToolButton>
                          <ToolButton onClick={() => {}} title="Underline">
                            <Underline className="h-3.5 w-3.5" />
                          </ToolButton>
                        </div>
                      </>
                    )}
                    
                    {selectedIds.length > 0 && (
                      <div className="pt-2 border-t border-border space-y-2">
                        <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <ToolButton onClick={deleteSelected} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </ToolButton>
                          <ToolButton onClick={copySelected} title="Copy">
                            <Copy className="h-3.5 w-3.5" />
                          </ToolButton>
                          <ToolButton onClick={pasteShapes} title="Paste">
                            <Clipboard className="h-3.5 w-3.5" />
                          </ToolButton>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Layers panel */}
          <div className="flex-1 flex flex-col min-h-0">
            <button
              onClick={() => setLayersPanelOpen(!layersPanelOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Layers
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); addLayer() }}
                  className="p-1 rounded hover:bg-muted"
                  title="Add Layer"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${layersPanelOpen ? '' : '-rotate-90'}`} />
              </div>
            </button>
            
            <AnimatePresence>
              {layersPanelOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-auto flex-1"
                >
                  <div className="p-2 space-y-1">
                    {[...layers].reverse().map(layer => (
                      <div
                        key={layer.id}
                        onClick={() => setActiveLayerId(layer.id)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                          activeLayerId === layer.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setLayers(prev => prev.map(l => 
                              l.id === layer.id ? { ...l, visible: !l.visible } : l
                            ))
                          }}
                          className="p-0.5"
                        >
                          {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setLayers(prev => prev.map(l => 
                              l.id === layer.id ? { ...l, locked: !l.locked } : l
                            ))
                          }}
                          className="p-0.5"
                        >
                          {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5 text-muted-foreground" />}
                        </button>
                        <span className="text-xs flex-1 truncate">{layer.name}</span>
                        <span className="text-[10px] text-muted-foreground">{layer.shapes.length}</span>
                        {layers.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id) }}
                            className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
