import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #faf8f5 0%, #f5ebe0 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <svg
            width="100"
            height="100"
            viewBox="0 0 64 64"
            fill="none"
          >
            <rect width="64" height="64" rx="16" fill="url(#bg)" />
            <path
              d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4"
              stroke="white"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="44" cy="20" r="3" fill="#FFD700" />
            <defs>
              <linearGradient id="bg" x1="0" y1="0" x2="64" y2="64">
                <stop stopColor="#C87941" />
                <stop offset="1" stopColor="#A0522D" />
              </linearGradient>
            </defs>
          </svg>
          <span
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#1a1a1a',
              letterSpacing: '-2px',
            }}
          >
            Pictura
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            background: 'rgba(200, 121, 65, 0.1)',
            borderRadius: '100px',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              fontSize: '24px',
              color: '#C87941',
              fontWeight: 600,
            }}
          >
            AI-Powered Image Generation
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: '28px',
            color: '#666',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Create stunning images from text. Free, fast, and beautiful.
        </p>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#999',
            fontSize: '18px',
          }}
        >
          <span>picturaai.sbs</span>
          <span style={{ color: '#ccc' }}>|</span>
          <span>by Imoogle</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
