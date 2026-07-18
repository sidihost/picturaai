# Pictura AI

Pictura is an AI-powered image and video generation platform built with Next.js 16. It provides a web-based studio for creating stunning images from text prompts, transforming existing images, and generating videos. The platform also includes a developer API for programmatic access.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running Migrations](#running-migrations)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Pages](#project-pages)
- [Key Libraries](#key-libraries)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Features

### Core Features

- **Text-to-Image Generation**: Create images from text prompts using AI
- **Image-to-Image Generation**: Transform existing images with AI
- **Text-to-Video Generation**: Generate short videos from text prompts
- **AI Image Editor**: Edit generated images with AI (remove backgrounds, enhance, etc.)
- **Gallery**: Store and manage generated images
- **Rate Limiting**: Fair usage limits for all users

### Developer Platform

- **REST API**: Programmatic access to image generation
- **API Key Management**: Create and manage API keys
- **Usage Analytics**: Track API usage and costs
- **Credit System**: Prepaid credit system for API usage

### CAPTCHA Service

- **PicturaCAPTCHA**: Bot protection service
- **Widget Integration**: Easy-to-use CAPTCHA widgets

### Admin Features

- **Dashboard**: Overview of platform usage and statistics
- **Session Management**: View and manage user sessions
- **Reports**: Generate usage and analytics reports

---

## Project Structure

```
picturaai/
├── app/                          # Next.js App Router pages
│   ├── about/                    # About page
│   ├── admin/                    # Admin panel (login, dashboard, sessions)
│   ├── api/                      # API routes
│   │   ├── admin/               # Admin API endpoints
│   │   ├── blog/                # Blog API endpoints
│   │   ├── captcha/             # CAPTCHA API endpoints
│   │   ├── careers/            # Careers API endpoints
│   │   ├── developers/         # Developer API endpoints
│   │   ├── gallery/            # Gallery API endpoints
│   │   ├── v1/                 # Version 1 API endpoints
│   │   ├── generate/            # Generation API endpoints
│   │   └── ...                 # Other API routes
│   ├── api-docs/               # API documentation page
│   ├── blog/                   # Blog pages
│   ├── brand/                  # Brand assets page
│   ├── captcha/                # CAPTCHA service pages
│   ├── careers/                # Careers page
│   ├── developers/             # Developer portal pages
│   │   ├── dashboard/         # Developer dashboard
│   │   ├── analytics/         # Usage analytics
│   │   ├── login/             # Developer login
│   │   └── signup/            # Developer signup
│   ├── features/               # Features page
│   ├── legal/                  # Legal pages (TOS, Privacy)
│   ├── models/                # AI models page
│   ├── newsletter/            # Newsletter signup
│   ├── pricing/               # Pricing page
│   ├── report/                # Report generation page
│   ├── staff/                 # Staff pages
│   ├── studio/                # Main image generation studio
│   │   ├── editor/            # Image editor
│   │   └── page.tsx           # Studio page
│   ├── support/               # Support page
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/                 # React components
│   ├── pictura/              # Pictura-specific components
│   │   ├── studio.tsx        # Main studio component
│   │   ├── navbar.tsx        # Navigation bar
│   │   ├── footer.tsx        # Footer
│   │   ├── landing.tsx       # Landing page content
│   │   ├── ai-image-editor.tsx # AI image editor
│   │   └── ...               # Other components
│   ├── ui/                   # UI component library (Radix-based)
│   └── ...
├── lib/                        # Utility libraries
│   ├── session.ts            # Session management
│   ├── storage.ts            # Cloud storage (R2/Blob) utilities
│   ├── rate-limit.ts         # Rate limiting logic
│   ├── email.ts              # Email sending utilities
│   ├── email-templates.ts    # Email HTML templates
│   ├── admin-auth.ts         # Admin authentication
│   ├── admin-data.ts         # Admin data utilities
│   ├── gallery.ts            # Gallery utilities
│   ├── types.ts              # TypeScript type definitions
│   ├── utils.ts              # General utilities
│   └── ...
├── packages/                  # Monorepo packages
│   └── pictura-captcha/      # CAPTCHA package
│       └── dist/             # Built package
├── public/                    # Static assets
│   ├── images/               # Static images
│   └── sdk/                  # Client SDK
│       └── pictura-sdk.js    # JavaScript SDK
├── scripts/                   # Database migration scripts
│   ├── run-migration.mjs     # Main migration runner
│   └── *.js, *.sql           # Individual migrations
├── styles/                    # Additional styles
│   └── globals.css           # Global CSS styles
├── package.json               # Dependencies
├── next.config.mjs           # Next.js configuration
└── tsconfig.json             # TypeScript configuration
```

---

## Tech Stack

### Framework & Runtime

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Runtime**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with CSS variables

### UI Components

- **Component Library**: Radix UI (headless)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Toasts**: Sonner

### Database & Storage

- **Database**: PostgreSQL (via Neon serverless)
- **Storage**: 
  - Vercel Blob (primary)
  - Cloudflare R2 (alternative)

### AI/Image Generation

Supports multiple AI providers (configurable via environment variables):

- **Mistral AI** (Pixtral)
- **OpenAI** (DALL-E 3)
- **Alibaba Cloud** (DashScope/Qwen)
- **Replicate** (Flux)
- **Together AI**
- **Fireworks AI**
- **DeepInfra**
- **Fal AI**
- **ZyLabs**

### Email

- **Provider**: ZeptoMail (SMTP)

### Payments

- **Payment Providers**: Paystack, KoraPay (configured but may need additional setup)

### Analytics

- **Analytics**: Vercel Analytics
- **Performance**: Vercel Speed Insights

---

## Prerequisites

Before setting up the project, ensure you have:

1. **Node.js 18+** (recommended: Node.js 20 LTS)
2. **pnpm** (package manager - see [Installation](#installation))
3. **Git** for version control
4. **A Neon PostgreSQL database** (free tier available at [neon.tech](https://neon.tech))
5. **A Vercel account** (for deployment)
6. **API keys** for at least one AI provider

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/sidihost/picturaai.git
cd picturaai
```

### 2. Install pnpm (if not already installed)

```bash
npm install -g pnpm
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Then add the required environment variables (see [Environment Configuration](#environment-configuration)).

---

## Environment Configuration

Create a `.env.local` file with the following variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Session
SESSION_EPOCH=v1

# Primary AI Provider (at least one required)
MISTRAL_API_KEY=your_mistral_api_key
# OR
OPENAI_API_KEY=your_openai_api_key
# OR
ALIBABA_API_KEY=your_alibaba_api_key
# OR
REPLICATE_API_TOKEN=your_replicate_token
```

### Optional Variables

```env
# Additional AI Providers
TOGETHER_API_KEY=your_together_api_key
FIREWORKS_API_KEY=your_fireworks_api_key
DEEPINFRA_API_KEY=your_deepinfra_api_key
FAL_KEY=your_fal_api_key
DASHSCOPE_API_KEY=your_dashscope_api_key

# Cloud Storage
# Vercel Blob (used if R2 not configured)
BLOB_READ_WRITE_TOKEN=your_blob_token

# Cloudflare R2 (alternative to Vercel Blob)
CF_R2_BUCKET_NAME=your_bucket_name
CF_R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
CF_R2_ACCESS_KEY_ID=your_access_key
CF_R2_SECRET_ACCESS_KEY=your_secret_key
CF_R2_PUBLIC_DOMAIN=https://cdn.yourdomain.com

# Email (ZeptoMail)
ZEPTO_MAIL_USERNAME=your_zepto_username
ZEPTO_MAIL_PASSWORD=your_zepto_password

# CAPTCHA (Cloudflare Turnstile)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key

# Admin Authentication
ADMIN_SECRET_KEY=your_secure_admin_secret

# Analytics (optional - Vercel provides these automatically)
# VERCEL_URL=https://your-domain.com
```

### Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `SESSION_EPOCH` | Session versioning (use `v1` initially) | No |
| `MISTRAL_API_KEY` | Mistral AI API key (recommended) | No* |
| `OPENAI_API_KEY` | OpenAI API key | No* |
| `ALIBABA_API_KEY` | Alibaba Cloud API key | No* |
| `REPLICATE_API_TOKEN` | Replicate API token | No* |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access token | No |
| `CF_R2_*` | Cloudflare R2 configuration | No |
| `ZEPTO_MAIL_USERNAME` | ZeptoMail SMTP username | No |
| `ZEPTO_MAIL_PASSWORD` | ZeptoMail SMTP password | No |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key | No |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key | No |
| `ADMIN_SECRET_KEY` | Secret key for admin authentication | Yes (for admin) |

*At least one AI provider API key is required.

---

## Database Setup

### 1. Create a Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string from the dashboard

### 2. Set the DATABASE_URL

Add your connection string to `.env.local`:

```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Run Initial Setup

The database tables are automatically created when the app starts. However, you can manually set up the initial schema using the migration scripts:

```bash
# Run the main migration
pnpm run db:migrate

# Or run individual scripts
node scripts/fix-all-tables.js
```

---

## Running Migrations

The project includes several migration scripts to set up and update the database schema.

### Available Scripts

```bash
# Main migration (creates all tables)
pnpm run db:migrate
node scripts/run-migration.mjs

# Create blog tables
node scripts/create-blog-tables.js

# Create developer tables
node scripts/create-api-schema.js

# Create newsletter table
node scripts/create-newsletter-table.js

# Setup OTP verification
node scripts/setup-otp-table.js

# Setup rate limits
node scripts/setup-rate-limits.js

# Create CAPTCHA tables
node scripts/006-create-captcha-tables.js
node scripts/007-update-captcha-tables.js

# Add referral/promo system
node scripts/009-add-referral-and-promo.js
node scripts/010-add-referral-to-otp.js

# Fix/cleanup operations
node scripts/fix-all-tables.js
node scripts/fix-developers-table-final.js
node scripts/fix-api-keys-columns.js
```

### Running All Migrations in Order

```bash
# Run migrations sequentially
for script in scripts/*.js scripts/*.mjs; do
  node "$script"
done
```

---

## Development

### Starting the Development Server

```bash
# Start development server with hot reload
pnpm dev

# The app will be available at http://localhost:3000
```

### Build for Production

```bash
# Create an optimized production build
pnpm build

# Start production server
pnpm start
```

### Linting

```bash
# Run ESLint
pnpm lint
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Connect to GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required variables from [Environment Configuration](#environment-configuration)

3. **Deploy**
   - Vercel will automatically detect Next.js and deploy
   - Add your custom domain if needed

### Deploy to Other Platforms

The project can be deployed to any platform that supports Next.js:

1. **Build the application**:
   ```bash
   pnpm build
   ```

2. **Start the server**:
   ```bash
   pnpm start
   ```

3. **Configure your hosting environment** with the same environment variables.

### Database Connection

Ensure your `DATABASE_URL` uses `sslmode=require` for production connections:

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
```

### Custom Domain Setup

1. Configure your domain's DNS to point to Vercel
2. Add the domain in Vercel dashboard → Settings → Domains
3. Update any environment variables that reference your domain

---

## API Documentation

### API Endpoints

#### Generation APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate/text-to-image` | POST | Generate image from text |
| `/api/generate/image-to-image` | POST | Transform image with AI |
| `/api/generate/video` | POST | Generate video from text |
| `/api/v1/generate` | POST | Core image generation API |
| `/api/edit-image` | POST | Edit existing image |

#### Developer APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/developers/auth/signup` | POST | Create developer account |
| `/api/developers/auth/login` | POST | Developer login |
| `/api/developers/dashboard` | GET | Get dashboard data |
| `/api/developers/profile` | GET/PUT | Manage profile |
| `/api/developers/api-keys` | GET/POST/DELETE | Manage API keys |
| `/api/developers/analytics` | GET | Get usage analytics |
| `/api/developers/images` | GET | Get generated images |

#### Other APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gallery` | GET | Public gallery |
| `/api/newsletter` | POST | Newsletter subscription |
| `/api/rate-limit` | GET | Check rate limits |
| `/api/captcha/verify` | POST | Verify CAPTCHA |
| `/api/paystack/webhook` | POST | Payment webhook |
| `/api/korapay-webhook` | POST | KoraPay webhook |

### Using the SDK

Include the SDK in your HTML:

```html
<script src="https://picturaai.sbs/sdk/pictura-sdk.js"></script>
```

Or use it in JavaScript:

```javascript
const pictura = new PicturaAI({
  apiKey: 'pk_your_api_key_here',
  baseURL: 'https://picturaai.sbs'
})

// Generate an image
const result = await pictura.generate({
  prompt: 'A beautiful sunset over mountains',
  width: 1024,
  height: 1024,
  model: 'pi-1.5-turbo'
})

console.log(result.imageUrl)
```

### API Key Format

Developer API keys should start with `pk_` and are generated in the developer dashboard.

### Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "usage": {
    "credits_used": 5,
    "credits_remaining": 95,
    "currency": "NGN"
  }
}
```

Error responses:

```json
{
  "error": "Error message",
  "code": "error_code"
}
```

---

## Project Pages

### User-Facing Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Marketing landing page |
| Studio | `/studio` | AI image generation interface |
| Features | `/features` | Feature showcase |
| Pricing | `/pricing` | Pricing information |
| About | `/about` | About the company |
| Support | `/support` | Help and support |
| Blog | `/blog` | Blog posts |
| Legal | `/legal` | Terms and Privacy |

### Developer Portal

| Page | Path | Description |
|------|------|-------------|
| Login | `/developers/login` | Developer login |
| Signup | `/developers/signup` | Developer registration |
| Dashboard | `/developers/dashboard` | Usage overview and credits |
| Analytics | `/developers/analytics` | Detailed usage analytics |
| API Docs | `/api-docs` | API documentation |

### Admin Panel

| Page | Path | Description |
|------|------|-------------|
| Login | `/admin/login` | Admin login |
| Dashboard | `/admin` | Overview and statistics |
| Sessions | `/admin/sessions` | User session management |

### CAPTCHA Service

| Page | Path | Description |
|------|------|-------------|
| Dashboard | `/captcha` | CAPTCHA management |
| Create Site | `/captcha/create-site` | Add new CAPTCHA site |

---

## Key Libraries

### Session Management (`lib/session.ts`)

Manages user sessions with secure cookies:

```typescript
import { getOrCreateSessionId, getSessionId } from '@/lib/session'

// Get or create session ID
const sessionId = await getOrCreateSessionId()

// Get current session ID
const currentSession = await getSessionId()
```

### Storage (`lib/storage.ts`)

Handles file uploads to Vercel Blob or Cloudflare R2:

```typescript
import { uploadObject, readJsonObject, listObjectKeys } from '@/lib/storage'

// Upload a file
const { url } = await uploadObject(key, data, contentType)

// Read JSON data
const data = await readJsonObject(key)

// List objects by prefix
const keys = await listObjectKeys(prefix)
```

### Rate Limiting (`lib/rate-limit.ts`)

Implements usage-based rate limiting:

```typescript
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'

// Check rate limit
const info = await getRateLimitInfo(sessionId)

// Increment usage after generation
await incrementUsage(sessionId)
```

### Email (`lib/email.ts`)

Sends transactional emails:

```typescript
import { sendOTPEmail, sendWelcomeEmail, sendLowCreditsAlert } from '@/lib/email'

// Send verification OTP
await sendOTPEmail(email, name, otp)

// Send welcome email with credits
await sendWelcomeEmail(email, name, credits, currency)
```

---

## Troubleshooting

### Database Connection Issues

**Problem**: `DATABASE_URL is not set` or connection errors

**Solution**:
1. Verify `DATABASE_URL` is set in environment variables
2. Ensure the URL includes `?sslmode=require` for Neon
3. Check Neon dashboard for connection issues

### AI Generation Not Working

**Problem**: Image generation returns errors

**Solution**:
1. Verify at least one AI provider API key is configured
2. Check the API key has sufficient credits/quota
3. Review server logs for specific error messages

### CORS Errors

**Problem**: Cross-origin errors in browser

**Solution**:
1. Next.js handles CORS for API routes automatically
2. Ensure requests use the correct origin
3. Check browser console for specific blocked origins

### Session Issues

**Problem**: Users losing session data

**Solution**:
1. Verify cookies are being set correctly
2. Check `SESSION_EPOCH` variable if changing session format
3. Ensure `secure` cookie flag is set correctly for production

### Storage Upload Failures

**Problem**: Cannot upload images to storage

**Solution**:
1. Verify `BLOB_READ_WRITE_TOKEN` or R2 credentials are set
2. Check bucket permissions
3. Ensure the key format is correct (no special characters)

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes**
   ```bash
   pnpm dev
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add your feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Run `pnpm lint` before committing
- Write meaningful commit messages

### Reporting Issues

When reporting issues, include:

1. **Environment details**: Node.js version, OS
2. **Error message**: Full error output
3. **Steps to reproduce**: Clear reproduction steps
4. **Expected vs actual behavior**: What you expected vs what happened

---

## License

This project is proprietary software. All rights reserved.

---

## Support

For support:

- **Documentation**: [https://picturaai.sbs/developers](https://picturaai.sbs/developers)
- **Email**: support@picturaai.sbs
- **Website**: [https://picturaai.sbs](https://picturaai.sbs)

---

*Last updated: 2025*
