import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://picturaai.sbs'
  const now = new Date()

  const routes = [
    '/',
    '/studio',
    '/pricing',
    '/features',
    '/about',
    '/models',
    '/blog',
    '/captcha',
    '/captcha/docs',
    '/developers',
  ]

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))
}
