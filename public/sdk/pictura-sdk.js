/**
 * Pictura AI SDK
 * Client library for integrating Pictura AI image generation
 * 
 * Usage:
 * const pictura = new PicturaAI({
 *   apiKey: 'pk_your_api_key_here',
 *   baseURL: 'https://picturaai.sbs'
 * })
 * 
 * pictura.generate({
 *   prompt: 'A beautiful sunset over mountains',
 *   width: 1024,
 *   height: 1024,
 *   model: 'pi-1.5-turbo'
 * }).then(result => {
 *   console.log(result.image_url)
 * })
 */

class PicturaAI {
  constructor(config = {}) {
    this.apiKey = config.apiKey
    this.baseURL = config.baseURL || 'https://picturaai.sbs'
    this.timeout = config.timeout || 30000

    if (!this.apiKey) {
      throw new Error('API key is required. Get one at https://picturaai.sbs/developers/dashboard')
    }

    if (!this.apiKey.startsWith('pk_')) {
      console.warn('Warning: API key should start with "pk_"')
    }
  }

  async generate(options = {}) {
    const { prompt, model = 'pi-1.5-turbo', width = 1024, height = 1024 } = options

    if (!prompt) {
      throw new Error('prompt parameter is required')
    }

    if (typeof prompt !== 'string') {
      throw new Error('prompt must be a string')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}/api/v1/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'PicturaAI-SDK/1.0',
        },
        body: JSON.stringify({
          prompt,
          model,
          width,
          height,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new PicturaError(
          data.error || 'Unknown error',
          response.status,
          data
        )
      }

      return {
        success: true,
        imageUrl: data.image_url,
        creditsUsed: data.credits_used,
        creditsRemaining: data.credits_remaining,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeout}ms`)
      }

      if (error instanceof PicturaError) {
        throw error
      }

      throw new Error(`Network error: ${error.message}`)
    }
  }

  async getAccountInfo() {
    try {
      const response = await fetch(`${this.baseURL}/api/developers/dashboard`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new PicturaError(data.error || 'Failed to fetch account info', response.status, data)
      }

      return data
    } catch (error) {
      if (error instanceof PicturaError) {
        throw error
      }
      throw new Error(`Failed to fetch account info: ${error.message}`)
    }
  }
}

class PicturaError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'PicturaError'
    this.status = status
    this.data = data
  }
}

// For CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PicturaAI
  module.exports.PicturaError = PicturaError
}
