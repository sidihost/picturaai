const DEFAULT_BASE_URL = 'https://picturaai.sbs'

function getScriptSrc(baseUrl = DEFAULT_BASE_URL) {
  return `${String(baseUrl).replace(/\/$/, '')}/api/captcha/widget.js`
}

function ensureScript(baseUrl = DEFAULT_BASE_URL) {
  if (typeof document === 'undefined') return Promise.resolve()

  const src = getScriptSrc(baseUrl)
  const existing = document.querySelector(`script[data-pictura-captcha="${src}"]`)
  if (existing) {
    if (existing.dataset.loaded === 'true') return Promise.resolve()
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load Pictura CAPTCHA script')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.defer = true
    script.dataset.picturaCaptcha = src
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Pictura CAPTCHA script'))
    document.head.appendChild(script)
  })
}

async function renderCaptcha(target, options = {}) {
  const {
    siteKey,
    callback,
    size = 'normal',
    theme = 'auto',
    baseUrl = DEFAULT_BASE_URL,
  } = options

  if (!siteKey) throw new Error('siteKey is required')
  if (typeof document === 'undefined') throw new Error('renderCaptcha must run in a browser')

  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) throw new Error('CAPTCHA target element not found')

  el.setAttribute('data-sitekey', siteKey)
  el.setAttribute('data-size', size)
  el.setAttribute('data-theme', theme)

  if (callback) {
    const callbackName = `picturaCaptchaCallback_${Math.random().toString(36).slice(2, 10)}`
    window[callbackName] = callback
    el.setAttribute('data-callback', callbackName)
  }

  await ensureScript(baseUrl)

  if (window.PicturaCaptcha?.render) {
    window.PicturaCaptcha.render(el)
  }

  return el
}

function createReactCaptcha(React) {
  const { useEffect, useRef } = React

  return function PicturaCaptcha({ siteKey, onVerify, size = 'normal', theme = 'auto', baseUrl = DEFAULT_BASE_URL, className }) {
    const ref = useRef(null)

    useEffect(() => {
      if (!ref.current || !siteKey) return
      renderCaptcha(ref.current, { siteKey, callback: onVerify, size, theme, baseUrl }).catch((error) => {
        console.error('[PicturaCaptcha] render failed:', error)
      })
    }, [siteKey, onVerify, size, theme, baseUrl])

    return React.createElement('div', { id: 'pictura-captcha', ref, className })
  }
}

module.exports = {
  DEFAULT_BASE_URL,
  getScriptSrc,
  ensureScript,
  renderCaptcha,
  createReactCaptcha,
}
