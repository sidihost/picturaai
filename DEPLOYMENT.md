# Pictura AI Deployment Guide

This guide covers deploying Pictura AI to various hosting platforms.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Deployment](#local-deployment)
- [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
- [Self-Hosting](#self-hosting)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ A Neon PostgreSQL database created
2. ✅ At least one AI provider API key
3. ✅ Vercel Blob or Cloudflare R2 configured (for image storage)
4. ✅ All environment variables documented

---

## Local Deployment

### Quick Start

```bash
# Clone the repository
git clone https://github.com/sidihost/picturaai.git
cd picturaai

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your values

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Production Build (Local)

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

---

## Vercel Deployment (Recommended)

Vercel is the recommended platform for deploying Pictura AI as it's optimized for Next.js.

### Step 1: Prepare Your Repository

```bash
# Ensure your code is committed
git add .
git commit -m "Prepare for deployment"
git push
```

### Step 2: Connect to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Log in or create an account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Project**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `pnpm build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

### Step 3: Set Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
| `SESSION_EPOCH` | `v1` | All |
| `MISTRAL_API_KEY` | Your Mistral API key | Production |
| `OPENAI_API_KEY` | Your OpenAI API key | Production |
| `ALIBABA_API_KEY` | Your Alibaba API key | Production |
| `BLOB_READ_WRITE_TOKEN` | Your Vercel Blob token | Production |
| `ZEPTO_MAIL_USERNAME` | Your ZeptoMail username | Production |
| `ZEPTO_MAIL_PASSWORD` | Your ZeptoMail password | Production |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Your Turnstile site key | Production |
| `TURNSTILE_SECRET_KEY` | Your Turnstile secret | Production |
| `ADMIN_SECRET_KEY` | Your admin secret | Production |

**Important**: Enable "Encrypt" for sensitive variables like API keys.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (~2-3 minutes)
3. Your site will be available at `https://your-project.vercel.app`

### Step 5: Custom Domain (Optional)

1. **Add Domain**
   - Go to **Settings → Domains**
   - Enter your domain name (e.g., `picturaai.sbs`)
   - Vercel will provide DNS records

2. **Configure DNS**
   Add the following records to your DNS provider:

   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

3. **Verify SSL**
   Vercel automatically provisions SSL certificates via Let's Encrypt.

---

## Self-Hosting

For self-hosting on your own infrastructure.

### Requirements

- Node.js 18+ (20 LTS recommended)
- PostgreSQL 14+ database
- Process manager (PM2 recommended)
- Reverse proxy (Nginx recommended)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

### Step 2: Clone and Build

```bash
# Clone repository
git clone https://github.com/sidihost/picturaai.git
cd picturaai

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.production
nano .env.production  # Edit with production values

# Build application
pnpm build
```

### Step 3: Configure PM2

```bash
# Create ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'pictura',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/path/to/picturaai',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save

# Setup startup script
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hpad ~/ > /dev/null
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/pictura
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name picturaai.sbs;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/pictura /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d picturaai.sbs
```

---

## Environment-Specific Configuration

### Development

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/pictura_dev
MISTRAL_API_KEY=test_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Staging/Preview

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@ep-staging.neon.tech/staging?sslmode=require
NEXT_PUBLIC_APP_URL=https://staging.picturaai.sbs
```

### Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@ep-prod.neon.tech/prod?sslmode=require
NEXT_PUBLIC_APP_URL=https://picturaai.sbs
```

---

## Post-Deployment

### 1. Run Database Migrations

```bash
# For Vercel: Migrations run automatically on first deploy
# For Self-hosting:

node scripts/run-migration.mjs
```

### 2. Verify Installation

1. Visit your deployed URL
2. Test image generation
3. Check browser console for errors
4. Verify API endpoints work

### 3. Configure Monitoring

For Vercel deployments, monitoring is built-in.

For self-hosted deployments:

```bash
# Install monitoring
pm2 install pm2-server-monit
pm2 install pm2-logrotate

# Configure
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

---

## Monitoring

### Vercel Analytics

Vercel provides built-in analytics including:

- Core Web Vitals
- Page views
- Bandwidth usage
- Build metrics

Access via Vercel Dashboard → Analytics

### Self-Hosted Monitoring

```bash
# View logs
pm2 logs pictura

# Monitor metrics
pm2 monit

# Check status
pm2 status
```

### Log Aggregation

For production, consider:

- **Sentry**: Error tracking
- **Datadog**: APM and logs
- **LogRocket**: Session replay

---

## Troubleshooting

### Common Deployment Issues

#### 1. Build Fails

**Symptoms**: Vercel build step fails

**Solutions**:
```bash
# Clear cache and rebuild
vercel --force
# OR
rm -rf .next && pnpm build
```

#### 2. Database Connection Failed

**Symptoms**: `DATABASE_URL is not set` or connection errors

**Solutions**:
- Verify `DATABASE_URL` is set in Vercel environment variables
- Ensure `?sslmode=require` is appended to Neon URL
- Check Neon dashboard for database status

#### 3. API Key Not Working

**Symptoms**: AI generation returns errors

**Solutions**:
- Verify API key is set in production environment variables
- Check API key has sufficient credits
- Verify API key is not rate-limited

#### 4. Images Not Loading

**Symptoms**: Generated images not displaying

**Solutions**:
- Verify storage credentials are set
- Check CORS configuration
- Verify public bucket policies (for R2)

#### 5. Email Not Sending

**Symptoms**: OTP emails not arriving

**Solutions**:
- Verify ZeptoMail credentials
- Check email spam folder
- Test SMTP connection:
  ```bash
  nc -zv smtp.zeptomail.com 587
  ```

### Rollback Procedure

#### Vercel

```bash
# Via CLI
vercel rollback [deployment-url]

# Via Dashboard
# Deployments → Select previous deployment → "Promote to Production"
```

#### Self-Hosted

```bash
# Check available versions
git log --oneline

# Revert to previous version
git checkout <commit-hash>
pnpm build
pm2 restart pictura
```

---

## Security Checklist

Before going to production:

- [ ] All environment variables set with encryption
- [ ] `ADMIN_SECRET_KEY` is a strong, random value
- [ ] Database uses SSL connection
- [ ] API keys have appropriate rate limits
- [ ] CAPTCHA enabled for public forms
- [ ] HTTPS enforced (via Vercel or Nginx)
- [ ] Security headers configured
- [ ] No sensitive data in public commits

---

## Performance Optimization

### Vercel

- Enable "Auto-optimize" for images
- Use Edge Functions for low-latency APIs
- Enable Caching headers (already configured)

### Self-Hosted

```nginx
# Add to nginx.conf
gzip on;
gzip_types text/plain application/json image/svg+xml;
gzip_min_length 1000;
```

### Database

- Ensure indexes are created (migration scripts do this)
- Monitor query performance with `EXPLAIN ANALYZE`
- Consider connection pooling for high traffic

---

## Backup and Recovery

### Database Backups

Neon provides automatic daily backups.

For manual backups:
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore from Backup

```bash
psql $DATABASE_URL < backup_20240101.sql
```

---

## Support

For deployment support:

- **Documentation**: [README.md](README.md)
- **Issues**: GitHub Issues
- **Email**: support@picturaai.sbs

---

*Last updated: 2025*
