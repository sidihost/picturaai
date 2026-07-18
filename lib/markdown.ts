/**
 * Simple markdown to HTML parser
 * Handles common markdown syntax for blog posts
 */
export function parseMarkdown(markdown: string): string {
  let html = markdown

  // Escape HTML entities first (but not in code blocks)
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Code blocks (```code```)
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-secondary/50 rounded-xl p-4 overflow-x-auto my-4"><code class="text-sm">${code.trim()}</code></pre>`
  })

  // Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-secondary/50 px-1.5 py-0.5 rounded text-sm">$1</code>')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-semibold text-foreground mt-8 mb-4">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold text-foreground mt-10 mb-4">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold text-foreground mt-12 mb-6">$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-muted-foreground">$1</li>')

  // Paragraphs (double newlines)
  html = html.replace(/\n\n(?!<)/g, '</p><p class="text-muted-foreground leading-relaxed my-4">')
  
  // Wrap in paragraph if starts with text
  if (!html.startsWith('<')) {
    html = `<p class="text-muted-foreground leading-relaxed my-4">${html}</p>`
  }

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/g, '')
  
  // Fix nested lists
  html = html.replace(/<\/ul>\s*<ul[^>]*>/g, '')

  return html
}
