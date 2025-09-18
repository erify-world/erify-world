# 🚀 ERIFY™ Deployment Guide

## Overview
This guide provides complete setup instructions for deploying ERIFY™ World to Cloudflare Pages and Workers.

## Prerequisites

### 1. GitHub Secrets Configuration
Configure the following secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Required Secrets:
- **`CLOUDFLARE_API_TOKEN`** - Your Cloudflare API token with necessary permissions
- **`CLOUDFLARE_ACCOUNT_ID`** - Your Cloudflare account ID
- **`ERIFY_API_KEY`** - ERIFY backend authentication token (for integrations)

#### Getting Cloudflare Credentials:
1. **API Token**: Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template
   - Add permissions for "Page:Edit" and "Zone:Read"
   - Copy the generated token

2. **Account ID**: Found in your Cloudflare dashboard sidebar

### 2. Cloudflare Setup
1. **Pages Project**: Create a new Pages project named `erify-world`
2. **Workers Setup**: Ensure Workers are enabled for your account

## Deployment Structure

### Main Site (Cloudflare Pages)
- **Source**: Repository root directory
- **Build Output**: Static files (HTML, CSS, assets)
- **URL**: `https://erify-world.pages.dev`

### Cron Workers (Cloudflare Workers)
- **Source**: `docs/ops/scheduling/cloudflare-workers/`
- **Function**: Automated backend job scheduling
- **URL**: `https://erify-cron-workers.[account].workers.dev`

## File Structure
```
erify-world/
├── index.html                          # Main landing page
├── wrangler.toml                       # Cloudflare Pages config
├── package.json                        # Dependencies and scripts
├── .github/workflows/deploy.yaml       # Deployment automation
├── scripts/validate-deployment.sh      # Validation script
├── styles/                             # CSS styles
│   └── erify-glow-kit.css
├── components/                         # UI components
│   ├── erify-search-chat.html
│   └── erify-visual-slide.html
├── styleguide/                         # Design demos
│   ├── demo.html
│   └── visual-slide-demo.html
└── docs/ops/scheduling/cloudflare-workers/  # Workers config
    ├── wrangler.toml
    ├── package.json
    └── src/worker.ts
```

## Deployment Process

### Automatic Deployment
The deployment is triggered automatically when:
1. **Push to `main` branch** - Full deployment (Pages + Workers)
2. **Pull Request** - Pages deployment only (preview)

### Manual Deployment
```bash
# Install dependencies
npm install

# Validate deployment readiness
./scripts/validate-deployment.sh

# Deploy to Cloudflare Pages
npm run deploy

# Deploy Workers (from workers directory)
cd docs/ops/scheduling/cloudflare-workers
npm install
npm run deploy
```

## Validation Checklist

Run the validation script to ensure deployment readiness:
```bash
./scripts/validate-deployment.sh
```

This checks:
- ✅ Required files (index.html, wrangler.toml, etc.)
- ✅ HTML file structure and validity
- ✅ CSS and asset availability
- ✅ Workers configuration
- ✅ ERIFY branding integration

## Environment Variables

### Pages (wrangler.toml)
```toml
[env.production.vars]
ENVIRONMENT = "production"
ERIFY_BRAND = "ERIFY™ World"
SITE_URL = "https://erify-world.pages.dev"
```

### Workers (docs/ops/scheduling/cloudflare-workers/wrangler.toml)
```toml
[vars]
BACKEND_BASE = "https://api.erify.example"
ENVIRONMENT = "production"
```

### Workers Secrets
Set via Wrangler CLI:
```bash
cd docs/ops/scheduling/cloudflare-workers
wrangler secret put ERIFY_CRON_TOKEN
```

## Integration Points

### ERIFY Ecosystem
- **Website**: erifyworldwide.com
- **Social**: x.com/erifyteam
- **Video**: youtube.com/@erifyworld

### Backend Integration
The Workers connect to ERIFY backend endpoints:
- `POST /cron/ee-recent` - Recent elections update
- `POST /cron/parties-import` - Party data import
- `POST /cron/check-current` - Current elections check
- `POST /cron/mop-recent` - Data cleanup

## Monitoring & Maintenance

### Cloudflare Dashboard
- Monitor deployment status
- View real-time analytics
- Check error logs

### GitHub Actions
- View deployment history
- Check build logs
- Monitor workflow status

## Troubleshooting

### Common Issues

1. **Deployment Fails - Missing Secrets**
   - Verify all GitHub secrets are configured
   - Check secret names match exactly

2. **Pages Build Fails**
   - Ensure HTML files are valid
   - Check CSS file paths

3. **Workers Deployment Fails**
   - Verify CLOUDFLARE_API_TOKEN permissions
   - Check wrangler.toml configuration

4. **ERIFY Integration Issues**
   - Verify ERIFY_API_KEY is correctly set
   - Check backend endpoint availability

### Support
For deployment issues:
1. Check GitHub Actions logs
2. Review Cloudflare dashboard
3. Run validation script locally
4. Verify all prerequisites are met

## Security Considerations

### Headers (Applied via wrangler.toml)
- Content Security Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- XSS Protection

### Secrets Management
- All sensitive data stored in GitHub Secrets
- API tokens with minimal required permissions
- Regular rotation of authentication tokens

## Performance Optimization

### Caching
- Static assets: 1 year cache
- HTML: No cache (for updates)
- CDN optimization via Cloudflare

### Build Optimization
- Minimal JavaScript footprint
- Optimized CSS delivery
- Image optimization

---

## Ready for Production ✨

Once all validations pass and secrets are configured, your ERIFY™ World deployment is ready to go live!

**From the ashes to the stars** 🔥✨