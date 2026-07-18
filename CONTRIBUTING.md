# Contributing to Pictura AI

Thank you for your interest in contributing to Pictura AI! This document provides guidelines and instructions for contributing.

---

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20 LTS)
- pnpm package manager
- Git
- Access to a Neon PostgreSQL database
- API keys for at least one AI provider

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/picturaai.git
   cd picturaai
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/sidihost/picturaai.git
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Create environment file**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

6. **Start the development server**:
   ```bash
   pnpm dev
   ```

---

## Development Workflow

### 1. Keep Your Fork Updated

```bash
# Fetch latest changes from upstream
git fetch upstream

# Merge into your main branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature
git merge main
```

### 2. Create a Feature Branch

```bash
# Create a new branch for your work
git checkout -b feature/add-new-ai-provider
# OR
git checkout -b fix/session-cookie-issue
# OR
git checkout -b refactor/rate-limit-logic
```

### 3. Make Your Changes

- Write clean, readable code
- Follow existing patterns in the codebase
- Add TypeScript types for new functionality
- Update comments for complex logic

### 4. Test Your Changes

```bash
# Run linting
pnpm lint

# Start development server
pnpm dev
# Test your changes in the browser
```

### 5. Commit Your Changes

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new image generation model
fix: resolve session cookie expiration issue
docs: update API documentation
refactor: simplify rate limiting logic
style: adjust studio component styling
test: add tests for API key validation
chore: update dependencies
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## Project Architecture

### Directory Structure

```
app/           - Next.js App Router pages and API routes
components/    - React components
lib/          - Utility functions and libraries
packages/     - Monorepo packages (e.g., pictura-captcha)
scripts/      - Database migration scripts
public/       - Static assets
```

### Key Files

| File | Purpose |
|------|---------|
| `app/studio/page.tsx` | Main AI generation interface |
| `lib/session.ts` | User session management |
| `lib/storage.ts` | Cloud storage operations |
| `lib/rate-limit.ts` | Usage rate limiting |
| `app/api/v1/generate/route.ts` | Core image generation API |

### Adding New AI Providers

To add a new AI provider:

1. **Update `app/api/v1/generate/route.ts`**:
   ```typescript
   async function generateWithNewProvider(
     prompt: string,
     width: number,
     height: number
   ): Promise<string> {
     const apiKey = process.env.NEW_PROVIDER_API_KEY
     if (!apiKey) throw new Error('New provider not configured')
     
     // Make API call to provider
     // Return image URL
   }
   ```

2. **Add provider selection logic**:
   ```typescript
   // In the generate function
   if (model === 'new-provider') {
     return await generateWithNewProvider(prompt, width, height)
   }
   ```

3. **Update model documentation**:
   - Update the API endpoint's model list
   - Update README documentation

---

## API Routes

### Creating New API Routes

API routes are located in `app/api/`. Use the App Router pattern:

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Handle GET request
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  // Handle POST request
  const body = await request.json()
  return NextResponse.json({ success: true, data: body })
}
```

### API Response Format

Standard success response:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Standard error response:
```json
{
  "error": "Error message",
  "code": "error_code"
}
```

---

## Database

### Running Migrations

Individual migration scripts are in the `scripts/` directory:

```bash
# Run a specific migration
node scripts/create-api-schema.js

# Run the main migration
node scripts/run-migration.mjs
```

### Creating New Tables

1. Create a new migration script:
   ```javascript
   // scripts/011-create-new-table.js
   import { neon } from '@neondatabase/serverless'
   
   const sql = neon(process.env.DATABASE_URL)
   
   async function run() {
     await sql`
       CREATE TABLE IF NOT EXISTS new_table (
         id SERIAL PRIMARY KEY,
         name TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT NOW()
       )
     `
     console.log('Created new_table')
   }
   
   run()
   ```

2. Test the migration:
   ```bash
   node scripts/011-create-new-table.js
   ```

---

## Components

### Creating New Components

Follow the existing patterns:

```typescript
// components/pictura/example-component.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { someIcon } from 'lucide-react'

interface ExampleComponentProps {
  title: string
  onAction?: () => void
}

export function ExampleComponent({ title, onAction }: ExampleComponentProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await onAction?.()
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2"
    >
      <button onClick={handleClick} disabled={loading}>
        {loading ? 'Loading...' : title}
      </button>
    </motion.div>
  )
}
```

### Component Guidelines

- Use `'use client'` directive for interactive components
- Use Lucide icons for consistency
- Use Framer Motion for animations
- Support dark/light themes via CSS variables
- Use Tailwind CSS classes
- Keep components modular and reusable

---

## Styling

### CSS Variables

The project uses CSS variables for theming. Key variables in `app/globals.css`:

```css
--background      /* Page background */
--foreground      /* Text color */
--primary         /* Primary brand color */
--secondary       /* Secondary color */
--muted           /* Muted background */
--accent          /* Accent color */
--destructive     /* Error/danger color */
--border          /* Border color */
--radius           /* Border radius */
```

### Tailwind Classes

Use Tailwind utility classes for styling:

```tsx
<div className="flex items-center justify-between p-4 bg-card rounded-lg">
  <span className="text-sm text-muted-foreground">Text</span>
</div>
```

---

## Testing

### Manual Testing Checklist

Before submitting a PR:

- [ ] Run `pnpm lint` - no errors
- [ ] Start dev server with `pnpm dev`
- [ ] Test the affected functionality
- [ ] Test on both mobile and desktop
- [ ] Test dark/light mode if applicable
- [ ] Check browser console for errors
- [ ] Test edge cases (empty inputs, long text, etc.)

### Testing AI Features

When testing image generation:

1. Use a test prompt: "A red apple on a wooden table"
2. Test different image sizes: 1024x1024, 1024x1792, 1792x1024
3. Test rate limiting by generating multiple images
4. Verify images are saved to gallery

---

## Pull Request Guidelines

### PR Title

Follow Conventional Commits:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `refactor: improve code structure`

### PR Description Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Include before/after screenshots for UI changes

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex code
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
```

---

## Questions?

If you have questions:

- **Issues**: Open a GitHub Issue
- **Email**: support@picturaai.sbs
- **Documentation**: Check the README.md

---

Thank you for contributing to Pictura AI! 🎨
