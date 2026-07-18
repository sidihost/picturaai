'use client'

import { useEffect } from 'react'

export function SecurityGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    // Disable keyboard shortcuts for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+I (Dev Tools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        return false
      }
      // Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault()
        return false
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault()
        return false
      }
      // Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        return false
      }
    }

    // Disable text selection via JS
    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement
      // Allow selection in input and textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true
      }
      e.preventDefault()
      return false
    }

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement
      // Allow copy in input and textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return true
      }
      e.preventDefault()
      return false
    }

    // Dev tools detection
    const detectDevTools = () => {
      const threshold = 160
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        // Dev tools might be open - you could log this or take action
        console.clear()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('copy', handleCopy)
    
    // Check periodically for dev tools
    const interval = setInterval(detectDevTools, 1000)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('copy', handleCopy)
      clearInterval(interval)
    }
  }, [])

  return (
    <div 
      className="contents"
      style={{ 
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  )
}
