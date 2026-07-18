# Developer Documentation

This guide provides detailed information for developers integrating with Pictura AI through the API.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [SDK Usage](#sdk-usage)
- [Authentication](#authentication)
- [Rate Limits](#rate-limits)
- [Pricing](#pricing)
- [Webhooks](#webhooks)
- [Code Examples](#code-examples)
- [Error Handling](#error-handling)

---

## Overview

Pictura AI provides a REST API for programmatic access to AI image generation. The API allows developers to:

- Generate images from text prompts
- Transform images using AI
- Monitor usage and credits
- Manage API keys

### API Base URL

```
https://picturaai.sbs
```

### API Version

Current version: **v1**

---

## Getting Started

### 1. Create a Developer Account

1. Visit [https://picturaai.sbs/developers/signup](https://picturaai.sbs/developers/signup)
2. Enter your email and create an account
3. Verify your email with the OTP sent to your inbox

### 2. Get Your API Key

1. Log in to the [Developer Dashboard](https://picturaai.sbs/developers/dashboard)
2. Navigate to "API Keys" section
3. Click "Create New API Key"
4. Copy your key (starts with `pk_`)

### 3. Add Credits

Before using the API, you need credits:

1. Go to the [Pricing](https://picturaai.sbs/pricing) page
2. Select a credit package
3. Complete payment

---

## API Reference

### Core Endpoints

#### Generate Image

Generate an image from a text prompt.

```http
POST /api/v1/generate
Authorization: Bearer pk_your_api_key
Content-Type: application/json

{
  "prompt": "A beautiful sunset over mountains",
  "model": "pi-1.5-turbo",
  "size": "1024x1024"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "img_1703001234567",
    "url": "https://cdn.picturaai.sbs/generated/image_abc123.png",
    "prompt": "A beautiful sunset over mountains",
    "model": "pi-1.5-turbo",
    "size": "1024x1024",
    "created_at": "2024-12-19T12:00:00.000Z"
  },
  "usage": {
    "credits_used": 5,
    "credits_remaining": 995,
    "currency": "NGN"
  }
}
```

#### Available Models

| Model ID | Name | Description |
|----------|------|-------------|
| `pi-1.5-turbo` | Pictura 1.5 Turbo | Fast, high-quality generation (recommended) |
| `pi-1.0` | Pictura 1.0 | Balanced quality and speed |
| `qwen-image-2.0-pro` | Qwen Image 2.0 Pro | Advanced generation with Qwen 2.0 |
| `alibaba` | Alibaba Cloud | Alibaba Model Studio generation |

#### Image Sizes

| Size | Dimensions | Description |
|------|------------|-------------|
| `1024x1024` | Square | Default, works well for most use cases |
| `1024x1792` | Portrait | Good for social media posts |
| `1792x1024` | Landscape | Good for banners and headers |

### Other Endpoints

#### Check API Status

```http
GET /api/v1/generate
```

Returns API status and available models.

#### Enhance Prompt

Improve your prompts for better results.

```http
POST /api/improve-prompt
Authorization: Bearer pk_your_api_key
Content-Type: application/json

{
  "prompt": "cat in a hat"
}
```

---

## SDK Usage

### JavaScript/TypeScript SDK

#### Option 1: Include via Script Tag

```html
<script src="https://picturaai.sbs/sdk/pictura-sdk.js"></script>
```

#### Option 2: Install via npm

```bash
npm install @pictura/captcha
```

#### Basic Usage

```javascript
// Initialize the SDK
const pictura = new PicturaAI({
  apiKey: 'pk_your_api_key',
  baseURL: 'https://picturaai.sbs',
  timeout: 30000  // Optional, default 30 seconds
})

// Generate an image
async function generateImage() {
  try {
    const result = await pictura.generate({
      prompt: 'A red apple on a wooden table',
      model: 'pi-1.5-turbo',
      width: 1024,
      height: 1024
    })
    
    console.log('Image URL:', result.imageUrl)
    console.log('Credits used:', result.creditsUsed)
    console.log('Credits remaining:', result.creditsRemaining)
    
    // Display the image
    document.getElementById('output').src = result.imageUrl
  } catch (error) {
    console.error('Error:', error.message)
  }
}

generateImage()
```

#### Get Account Info

```javascript
async function getAccountInfo() {
  try {
    const info = await pictura.getAccountInfo()
    console.log('Balance:', info.credits_balance)
    console.log('Currency:', info.currency)
    console.log('Member since:', info.created_at)
  } catch (error) {
    console.error('Error:', error.message)
  }
}
```

---

## Authentication

### API Key Authentication

All API requests require authentication using an API key:

```http
Authorization: Bearer pk_your_api_key
```

### API Key Format

- Prefix: `pk_` (public key)
- Format: `pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Example: `pk_a1b2c3d4e5f6g7h8i9j0`

### Security Best Practices

1. **Never expose API keys in client-side code** (except for frontend-only integrations)
2. **Use environment variables** to store API keys
3. **Rotate keys regularly** via the dashboard
4. **Use separate keys** for development and production
5. **Monitor usage** for unauthorized access

---

## Rate Limits

### Default Limits

| Endpoint | Limit |
|----------|-------|
| `/api/v1/generate` | 100 requests/minute |
| `/api/improve-prompt` | 30 requests/minute |
| Other endpoints | 60 requests/minute |

### Rate Limit Headers

When you exceed the limit, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1703001240
```

### Handling Rate Limits

```javascript
async function generateWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await pictura.generate({ prompt })
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const retryAfter = error.headers?.['retry-after'] || 60
        console.log(`Rate limited. Retrying in ${retryAfter} seconds...`)
        await new Promise(r => setTimeout(r, retryAfter * 1000))
        continue
      }
      throw error
    }
  }
}
```

---

## Pricing

### Credit System

Pictura uses a credit-based system:

- **1 credit** = 1 Naira (NGN) for Nigerian customers
- **1 credit** = $0.01 USD equivalent for international customers
- **1 image generation** = **5 credits** (pi-1.5-turbo)
- **1 image generation** = **8 credits** (pi-1.0, higher quality)

### Available Packages

| Credits | Price (NGN) | Price (USD) |
|---------|-------------|-------------|
| 100 | ₦500 | $1.00 |
| 500 | ₦2,250 | $5.00 |
| 1,000 | ₦4,000 | $10.00 |
| 5,000 | ₦18,000 | $40.00 |

### Local Currency Support

The API supports pricing in multiple currencies:

- Nigerian Naira (NGN)
- US Dollar (USD)
- British Pound (GBP)
- Euro (EUR)
- And more...

Your currency is determined by your account settings.

---

## Webhooks

Receive real-time notifications when images are generated.

### Setting Up Webhooks

1. Go to Developer Dashboard → Webhooks
2. Add your webhook URL
3. Select events to receive
4. Save

### Available Events

| Event | Description |
|-------|-------------|
| `image.generated` | Image generation completed |
| `image.failed` | Image generation failed |
| `credits.low` | Credits below threshold |
| `credits.depleted` | All credits exhausted |

### Webhook Payload

```json
{
  "event": "image.generated",
  "timestamp": "2024-12-19T12:00:00.000Z",
  "data": {
    "id": "img_abc123",
    "url": "https://cdn.picturaai.sbs/image.png",
    "prompt": "A beautiful sunset",
    "model": "pi-1.5-turbo",
    "credits_used": 5
  }
}
```

### Verifying Webhooks

```javascript
const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return signature === expectedSignature
}
```

---

## Code Examples

### Node.js

```javascript
const pictura = new PicturaAI({
  apiKey: process.env.PICTURA_API_KEY
})

// Generate image
const result = await pictura.generate({
  prompt: 'A futuristic cityscape',
  model: 'pi-1.5-turbo',
  width: 1024,
  height: 1024
})

console.log(result.imageUrl)
```

### Python

```python
import requests

API_KEY = 'pk_your_api_key'
BASE_URL = 'https://picturaai.sbs'

def generate_image(prompt, model='pi-1.5-turbo', size='1024x1024'):
    response = requests.post(
        f'{BASE_URL}/api/v1/generate',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'prompt': prompt,
            'model': model,
            'size': size
        }
    )
    
    if response.ok:
        data = response.json()
        return data['data']['url']
    else:
        raise Exception(f"Error: {response.json()['error']}")

# Usage
image_url = generate_image('A cat wearing sunglasses')
print(image_url)
```

### cURL

```bash
curl -X POST https://picturaai.sbs/api/v1/generate \
  -H "Authorization: Bearer pk_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "model": "pi-1.5-turbo",
    "size": "1024x1024"
  }'
```

### React

```tsx
import { useState } from 'react'
import PicturaAI from '@pictura/captcha'

const pictura = new PicturaAI({
  apiKey: process.env.NEXT_PUBLIC_PICTURA_API_KEY
})

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await pictura.generate({ prompt })
      setImageUrl(result.imageUrl)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Generated" />}
    </div>
  )
}
```

### Batch Generation

```javascript
async function generateBatch(prompts) {
  const results = []
  
  for (const prompt of prompts) {
    try {
      const result = await pictura.generate({ prompt })
      results.push({ prompt, success: true, url: result.imageUrl })
    } catch (error) {
      results.push({ prompt, success: false, error: error.message })
    }
    
    // Rate limit delay
    await new Promise(r => setTimeout(r, 1000))
  }
  
  return results
}

// Usage
const batchResults = await generateBatch([
  'A red apple',
  'A blue sky',
  'A green forest'
])
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Insufficient credits",
  "code": "insufficient_credits",
  "required": 5,
  "available": 2
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `unauthorized` | 401 | Missing or invalid API key |
| `invalid_key` | 401 | API key not found or inactive |
| `missing_prompt` | 400 | Prompt parameter required |
| `invalid_model` | 400 | Unknown model specified |
| `invalid_size` | 400 | Invalid image size |
| `insufficient_credits` | 402 | Not enough credits |
| `rate_limited` | 429 | Too many requests |
| `generation_failed` | 500 | AI generation failed |
| `internal_error` | 500 | Server error |

### Error Handling Example

```javascript
async function safeGenerate(prompt) {
  try {
    return await pictura.generate({ prompt })
  } catch (error) {
    switch (error.code) {
      case 'insufficient_credits':
        console.error('Please add more credits')
        // Redirect to pricing page
        break
      case 'rate_limited':
        console.error('Too many requests. Please wait.')
        break
      case 'generation_failed':
        console.error('Generation failed. Please try again.')
        break
      default:
        console.error('Unexpected error:', error.message)
    }
    throw error
  }
}
```

---

## Support

### Getting Help

- **Documentation**: [https://picturaai.sbs/developers](https://picturaai.sbs/developers)
- **API Status**: [https://status.picturaai.sbs](https://status.picturaai.sbs)
- **Email**: support@picturaai.sbs

### Reporting Issues

When reporting API issues, include:

1. API endpoint and method
2. Full request headers and body
3. Full response (including headers)
4. Timestamps
5. Your developer account email

---

*Last updated: 2025*
