'use client'

import { useMemo } from 'react'

interface PatternAvatarProps {
  name: string
  email?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

// Generate a unique pattern based on name/email hash
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

// Beautiful color palettes
const COLOR_PALETTES = [
  ['#C87941', '#E5A869', '#F4D4B0'], // Pictura brand brown
  ['#B86A36', '#D5894F', '#EDBC84'], // Caramel
  ['#A75A2E', '#C97944', '#E2A374'], // Copper
  ['#9C6238', '#C98A57', '#E8BE93'], // Warm chestnut
  ['#A86A3D', '#D79A62', '#ECC7A0'], // Sandstone
  ['#8F4E2A', '#B86D3F', '#D79A6C'], // Deep terracotta
  ['#B27443', '#D49863', '#E9BE94'], // Honey brown
  ['#7E4A2D', '#A96B45', '#CEA07B'], // Walnut
]



const PATTERNS = ['circles', 'squares', 'triangles', 'waves', 'dots', 'lines', 'hexagons', 'diamonds']

export function PatternAvatar({ name, email, size = 'md', className = '' }: PatternAvatarProps) {
  const seed = useMemo(() => hashString(name + (email || '')), [name, email])
  const palette = COLOR_PALETTES[seed % COLOR_PALETTES.length]
  const pattern = PATTERNS[seed % PATTERNS.length]
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20'
  }
  
  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl'
  }
  
  const patternElement = useMemo(() => {
    const id = `pattern-${seed}`
    switch (pattern) {
      case 'circles':
        return (
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="8" fill={palette[1]} opacity="0.3"/>
            <circle cx="10" cy="10" r="4" fill={palette[2]} opacity="0.5"/>
          </pattern>
        )
      case 'squares':
        return (
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <rect x="2" y="2" width="12" height="12" fill={palette[1]} opacity="0.3" rx="2"/>
            <rect x="5" y="5" width="6" height="6" fill={palette[2]} opacity="0.5" rx="1"/>
          </pattern>
        )
      case 'triangles':
        return (
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <polygon points="10,2 18,18 2,18" fill={palette[1]} opacity="0.3"/>
            <polygon points="10,6 14,14 6,14" fill={palette[2]} opacity="0.5"/>
          </pattern>
        )
      case 'waves':
        return (
          <pattern id={id} width="30" height="15" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q7.5 5, 15 10 T30 10" stroke={palette[1]} strokeWidth="2" fill="none" opacity="0.4"/>
            <path d="M0 5 Q7.5 0, 15 5 T30 5" stroke={palette[2]} strokeWidth="1.5" fill="none" opacity="0.3"/>
          </pattern>
        )
      case 'dots':
        return (
          <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="2" fill={palette[1]} opacity="0.4"/>
            <circle cx="9" cy="9" r="2" fill={palette[2]} opacity="0.4"/>
            <circle cx="3" cy="9" r="1.5" fill={palette[1]} opacity="0.3"/>
            <circle cx="9" cy="3" r="1.5" fill={palette[2]} opacity="0.3"/>
          </pattern>
        )
      case 'lines':
        return (
          <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform={`rotate(${(seed % 4) * 45})`}>
            <line x1="0" y1="0" x2="10" y2="0" stroke={palette[1]} strokeWidth="2" opacity="0.3"/>
            <line x1="0" y1="5" x2="10" y2="5" stroke={palette[2]} strokeWidth="1" opacity="0.4"/>
          </pattern>
        )
      case 'hexagons':
        return (
          <pattern id={id} width="24" height="20" patternUnits="userSpaceOnUse">
            <polygon points="12,2 20,6 20,14 12,18 4,14 4,6" fill="none" stroke={palette[1]} strokeWidth="1.5" opacity="0.4"/>
            <polygon points="12,5 17,8 17,13 12,16 7,13 7,8" fill={palette[2]} opacity="0.2"/>
          </pattern>
        )
      case 'diamonds':
        return (
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <polygon points="8,1 15,8 8,15 1,8" fill={palette[1]} opacity="0.3"/>
            <polygon points="8,4 12,8 8,12 4,8" fill={palette[2]} opacity="0.4"/>
          </pattern>
        )
      default:
        return (
          <pattern id={id} width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="8" fill={palette[1]} opacity="0.3"/>
          </pattern>
        )
    }
  }, [pattern, palette, seed])
  
  const initials = name?.charAt(0).toUpperCase() || 'D'
  
  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden relative shrink-0 ${className}`}
      style={{ background: `linear-gradient(135deg, ${palette[0]} 0%, ${palette[0]}dd 100%)` }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          {patternElement}
        </defs>
        <rect width="100" height="100" fill={`url(#pattern-${seed})`}/>
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center ${fontSizes[size]} font-semibold text-white`}>
        {initials}
      </div>
    </div>
  )
}
