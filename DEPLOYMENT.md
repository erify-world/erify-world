# ERIFY™ World - Cloudflare Pages Deployment

This repository is configured for deployment to Cloudflare Pages using the production-ready `wrangler.toml` configuration.

## 🚀 Quick Deploy

### Prerequisites
- Cloudflare account
- Wrangler CLI installed: `npm install -g wrangler`

### Setup & Deploy

1. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

2. **Create Required Resources** (First time only)
   ```bash
   # Create KV namespaces
   wrangler kv:namespace create ERIFY_CACHE
   wrangler kv:namespace create ERIFY_SESSIONS
   
   # Create D1 database
   wrangler d1 create erify-production-db
   
   # Create R2 buckets (optional)
   wrangler r2 bucket create erify-media-production
   wrangler r2 bucket create erify-uploads-production
   ```

3. **Set API Secrets**
   ```bash
   # Core ERIFY secrets
   wrangler secret put ERIFY_API_KEY
   wrangler secret put ERIFY_JWT_SECRET
   wrangler secret put ERIFY_ENCRYPTION_KEY
   
   # External API keys (as needed)
   wrangler secret put STRIPE_API_KEY
   wrangler secret put DISCORD_BOT_TOKEN
   wrangler secret put OPENAI_API_KEY
   # ... add others as required
   ```

4. **Update Configuration**
   - Replace placeholder IDs in `wrangler.toml` with actual resource IDs
   - Update domain settings in the `[vars]` section

5. **Deploy to Production**
   ```bash
   wrangler pages deploy
   ```

## 🏗️ Configuration Features

### ✅ Immediate Static Hosting
- Serves components, styleguide, and documentation
- Optimized for Cloudflare's global CDN
- Ready for immediate deployment

### 🔧 Worker Scripts Ready
- Commented configuration for future Workers
- D1 database bindings prepared
- KV storage for caching and sessions

### 🔌 API Integration Placeholders
- Comprehensive secret management setup
- External service integration ready
- Scalable architecture foundation

### 📊 Future Expansion Support
- Analytics Engine configuration
- Durable Objects for stateful operations
- Queue processing for background jobs
- R2 storage for media files
- Vectorize for AI/ML embeddings

## 🌍 Environments

- **Production**: `wrangler pages deploy`
- **Staging**: `wrangler pages deploy --env staging`
- **Development**: `wrangler pages dev .`

## 📝 Monitoring & Management

```bash
# View logs
wrangler tail

# Manage KV data
wrangler kv:key list --binding=ERIFY_CACHE

# Database operations
wrangler d1 execute erify-production-db --command="SELECT COUNT(*) FROM users"

# Check deployment status
wrangler pages deployment list
```

## 🔐 Security Notes

- All sensitive keys are managed via Wrangler secrets
- Environment-specific configurations available
- CORS and security headers pre-configured
- CSP policy template included

---

**Ready to scale from static hosting to full Workers ecosystem!** 🚀