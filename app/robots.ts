import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://picturaai.sbs/sitemap.xml',
    host: 'https://picturaai.sbs',
  }
}
