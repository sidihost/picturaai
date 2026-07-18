import { createHash, createHmac } from 'crypto'
import { list, put } from '@vercel/blob'

const EMPTY_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

type R2Config = {
  bucket: string
  endpoint: URL
  publicDomain?: string
  accessKeyId: string
  secretAccessKey: string
}

function getR2Config(): R2Config | null {
  const bucket = process.env.CF_R2_BUCKET_NAME
  const endpointRaw = process.env.CF_R2_ENDPOINT
  const accessKeyId = process.env.CF_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CF_R2_SECRET_ACCESS_KEY

  if (!bucket || !endpointRaw || !accessKeyId || !secretAccessKey) return null

  const endpoint = new URL(endpointRaw.startsWith('http') ? endpointRaw : `https://${endpointRaw}`)
  const publicDomainRaw = process.env.CF_R2_PUBLIC_DOMAIN

  return {
    bucket,
    endpoint,
    accessKeyId,
    secretAccessKey,
    publicDomain: publicDomainRaw?.replace(/\/$/, ''),
  }
}

function encodePath(key: string): string {
  return key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

function resolveBucketPath(config: R2Config, key: string): string {
  const basePath = config.endpoint.pathname.replace(/\/$/, '')
  const encodedKey = encodePath(key)
  if (basePath.endsWith(`/${config.bucket}`)) return `${basePath}/${encodedKey}`
  if (basePath.length > 0) return `${basePath}/${config.bucket}/${encodedKey}`
  return `/${config.bucket}/${encodedKey}`
}

function resolveListPath(config: R2Config): string {
  const basePath = config.endpoint.pathname.replace(/\/$/, '')
  if (basePath.endsWith(`/${config.bucket}`)) return basePath
  if (basePath.length > 0) return `${basePath}/${config.bucket}`
  return `/${config.bucket}`
}

function toAmzDate(date: Date): string {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function sha256Hex(input: Buffer | string): string {
  return createHash('sha256').update(input).digest('hex')
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function getSigningKey(secret: string, yyyymmdd: string): Buffer {
  const kDate = hmac(`AWS4${secret}`, yyyymmdd)
  const kRegion = hmac(kDate, 'auto')
  const kService = hmac(kRegion, 's3')
  return hmac(kService, 'aws4_request')
}

async function r2Request(method: 'PUT' | 'GET', key: string, body?: Buffer, contentType?: string): Promise<Response> {
  const config = getR2Config()
  if (!config) throw new Error('R2 is not configured')

  const now = new Date()
  const amzDate = toAmzDate(now)
  const dateStamp = amzDate.slice(0, 8)

  const canonicalUri = resolveBucketPath(config, key)
  const host = config.endpoint.host
  const payloadHash = body ? sha256Hex(body) : EMPTY_SHA256

  const headers: Record<string, string> = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  }
  if (contentType) headers['content-type'] = contentType

  const signedHeaderKeys = Object.keys(headers).sort()
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('')
  const signedHeaders = signedHeaderKeys.join(';')

  const canonicalRequest = [
    method,
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const signingKey = getSigningKey(config.secretAccessKey, dateStamp)
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const requestHeaders = new Headers({
    Authorization: authorization,
    'x-amz-date': amzDate,
    'x-amz-content-sha256': payloadHash,
  })
  if (contentType) requestHeaders.set('Content-Type', contentType)

  return fetch(`${config.endpoint.origin}${canonicalUri}`, {
    method,
    headers: requestHeaders,
    body,
  })
}

async function r2ListByPrefix(prefix: string): Promise<string[]> {
  const config = getR2Config()
  if (!config) throw new Error('R2 is not configured')

  const now = new Date()
  const amzDate = toAmzDate(now)
  const dateStamp = amzDate.slice(0, 8)
  const host = config.endpoint.host

  const canonicalUri = resolveListPath(config)
  const query = `list-type=2&prefix=${encodeURIComponent(prefix)}`

  const headers: Record<string, string> = {
    host,
    'x-amz-content-sha256': EMPTY_SHA256,
    'x-amz-date': amzDate,
  }

  const signedHeaderKeys = Object.keys(headers).sort()
  const canonicalHeaders = signedHeaderKeys.map((k) => `${k}:${headers[k]}\n`).join('')
  const signedHeaders = signedHeaderKeys.join(';')

  const canonicalRequest = [
    'GET',
    canonicalUri,
    query,
    canonicalHeaders,
    signedHeaders,
    EMPTY_SHA256,
  ].join('\n')

  const credentialScope = `${dateStamp}/auto/s3/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const signingKey = getSigningKey(config.secretAccessKey, dateStamp)
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`${config.endpoint.origin}${canonicalUri}?${query}`, {
    method: 'GET',
    headers: {
      Authorization: authorization,
      'x-amz-date': amzDate,
      'x-amz-content-sha256': EMPTY_SHA256,
    },
  })

  if (!res.ok) return []
  const xml = await res.text()
  const matches = [...xml.matchAll(/<Key>(.*?)<\/Key>/g)]
  return matches.map((m) => m[1])
}

function getPublicUrl(key: string): string {
  const config = getR2Config()
  if (config?.publicDomain) return `${config.publicDomain}/${key}`
  if (config) return `${config.endpoint.origin}${resolveBucketPath(config, key)}`
  return ''
}

export function isR2Enabled(): boolean {
  return Boolean(getR2Config())
}

export async function uploadObject(
  key: string,
  data: ArrayBuffer | Uint8Array | Buffer | string | Blob,
  contentType: string
): Promise<{ url: string }> {
  const r2 = getR2Config()

  if (!r2) {
    const blob = await put(key, data as BodyInit, { access: 'public', contentType })
    return { url: blob.url }
  }

  let body: Buffer
  if (typeof data === 'string') body = Buffer.from(data)
  else if (data instanceof ArrayBuffer) body = Buffer.from(data)
  else if (Buffer.isBuffer(data)) body = data
  else if (data instanceof Uint8Array) body = Buffer.from(data)
  else body = Buffer.from(await data.arrayBuffer())

  const res = await r2Request('PUT', key, body, contentType)
  if (!res.ok) {
    const errorText = await res.text().catch(() => '')
    throw new Error(`R2 upload failed: ${res.status} ${errorText}`)
  }

  return { url: getPublicUrl(key) }
}

export async function readJsonObject<T>(key: string): Promise<T | null> {
  if (!getR2Config()) {
    const { blobs } = await list({ prefix: key })
    if (blobs.length === 0) return null
    const res = await fetch(blobs[0].url)
    if (!res.ok) return null
    return res.json()
  }

  const res = await r2Request('GET', key)
  if (res.status === 404) return null
  if (!res.ok) return null
  return res.json()
}

export async function listObjectKeys(prefix: string): Promise<string[]> {
  if (!getR2Config()) {
    const { blobs } = await list({ prefix })
    return blobs.map((b) => b.pathname)
  }
  return r2ListByPrefix(prefix)
}
