export type RequestContext = {
  ip: string | null
  userAgent: string | null
  country: string | null
  city: string | null
  region: string | null
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'bot' | 'unknown'
}

function parseDeviceType(userAgent: string | null): RequestContext['deviceType'] {
  if (!userAgent) return 'unknown'
  const ua = userAgent.toLowerCase()
  if (/(bot|spider|crawler|slurp|curl|wget)/i.test(ua)) return 'bot'
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(ua)) return 'tablet'
  if (/(mobi|iphone|ipod|blackberry|phone|windows phone|opera mini|mobile)/i.test(ua)) return 'mobile'
  return 'desktop'
}

function firstHeader(headers: Headers, names: string[]): string | null {
  for (const name of names) {
    const value = headers.get(name)
    if (value) return value
  }
  return null
}

export function getRequestContext(request: Request): RequestContext {
  const forwardedFor = firstHeader(request.headers, ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'])
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null
  const userAgent = request.headers.get('user-agent') || null
  const country = firstHeader(request.headers, ['x-vercel-ip-country', 'cf-ipcountry'])
  const city = firstHeader(request.headers, ['x-vercel-ip-city', 'cf-ipcity'])
  const region = firstHeader(request.headers, ['x-vercel-ip-country-region', 'cf-region'])

  return {
    ip,
    userAgent,
    country,
    city,
    region,
    deviceType: parseDeviceType(userAgent),
  }
}
