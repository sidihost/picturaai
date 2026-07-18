'use client'

import { cn } from '@/lib/utils'

interface ImageSkeletonProps {
  className?: string
  aspectRatio?: 'square' | '4:3' | '16:9' | 'auto'
}

export function ImageSkeleton({ className, aspectRatio = 'square' }: ImageSkeletonProps) {
  const aspectClasses = {
    square: 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    auto: '',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-muted',
        aspectClasses[aspectRatio],
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* Placeholder content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="h-10 w-10 text-muted-foreground/20"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  )
}

// Add shimmer animation to globals.css or use this inline style
// @keyframes shimmer { 100% { transform: translateX(100%); } }
