import type { Metadata } from 'next'
import { VectorEditor } from '@/components/pictura/vector-editor'

export const metadata: Metadata = {
  title: 'Pictura Editor - Vector Design Tool',
  description: 'Professional vector editing tool by Pictura. Create stunning designs with shapes, paths, text and more. Export to SVG or PNG.',
}

export default function EditorPage() {
  return <VectorEditor />
}
