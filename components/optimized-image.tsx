'use client'

import Image, { ImageProps } from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad'> {
  wrapperClassName?: string
}

export function OptimizedImage({ 
  className, 
  wrapperClassName,
  alt,
  ...props 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden', wrapperClassName)}>
      {/* Skeleton placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-secondary/50 animate-pulse" />
      )}
      <Image
        {...props}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  )
}
