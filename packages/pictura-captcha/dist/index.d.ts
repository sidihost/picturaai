export declare const DEFAULT_BASE_URL: string
export declare function getScriptSrc(baseUrl?: string): string
export declare function ensureScript(baseUrl?: string): Promise<void>

export type CaptchaOptions = {
  siteKey: string
  callback?: (token: string) => void
  size?: 'normal' | 'compact'
  theme?: 'auto' | 'light' | 'dark'
  baseUrl?: string
}

export declare function renderCaptcha(target: string | Element, options: CaptchaOptions): Promise<Element>

export declare function createReactCaptcha(React: any): (props: {
  siteKey: string
  onVerify?: (token: string) => void
  size?: 'normal' | 'compact'
  theme?: 'auto' | 'light' | 'dark'
  baseUrl?: string
  className?: string
}) => any
