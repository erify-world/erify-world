# ERIFY™ Worker Deployment Guide

This repository contains the complete production-ready infrastructure for deploying the ERIFY™ Cloudflare Worker, designed for real-time wallet telemetry, security, and scale.

## 🚀 Quick Start

### Prerequisites
- [Cloudflare account](https://cloudflare.com) with Workers plan
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) installed
- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) for version control

### Initial Setup
```bash
# 1. Install dependencies
make install

# 2. Login to Cloudflare
wrangler login

# 3. Initialize complete environment
make init
```

This will:
- Set up D1 database
- Configure secrets
- Run database migrations
- Prepare for deployment

### Quick Deploy
```bash
# Deploy to development
make deploy-dev

# Deploy to staging  
make deploy-staging

# Deploy to production (requires manual approval)
make deploy-prod
```

## 📁 File Overview

### Core Worker Files
- **`src/index.js`** - Main Cloudflare Worker with full feature set
- **`wrangler.toml`** - Worker configuration for all environments
- **`schema.sql`** - D1 database schema with optimized indexes

### Deployment & Automation
- **`Makefile`** - Complete deployment automation and development tools
- **`.github/workflows/deploy-worker.yml`** - CI/CD pipeline with testing
- **`set-secrets.sh`** - Interactive secrets management script

## 🔧 Worker Features

### Security
- ✅ **HMAC Signature Verification** - Prevents request tampering
- ✅ **Anti-Replay Protection** - Nonce-based request tracking
- ✅ **Rate Limiting** - IP-based request throttling
- ✅ **Security Headers** - XSS, CSRF, and content type protection
- ✅ **JWT Ready** - Authentication token endpoints prepared

### Telemetry & Analytics
- ✅ **Real-time Telemetry** - Wallet activity tracking
- ✅ **Transaction Logging** - Financial operation recording
- ✅ **Performance Monitoring** - Request timing and health checks
- ✅ **Security Event Logging** - Suspicious activity tracking

### Database Integration
- ✅ **D1 Database** - Serverless SQL database
- ✅ **Optimized Schema** - Indexed for performance
- ✅ **Migration Support** - Version-controlled schema changes
- ✅ **Backup Automation** - Automated backup in CI/CD

## 🌍 Multi-Environment Support

### Development Environment
- **Purpose**: Local testing and feature development
- **Database**: `erify-telemetry-db-dev`
- **URL**: `https://erify-worker-dev.{account-id}.workers.dev`
- **Rate Limit**: 100 RPM

### Staging Environment
- **Purpose**: Pre-production testing and QA
- **Database**: `erify-telemetry-db-staging`
- **URL**: `https://erify-worker-staging.{account-id}.workers.dev`
- **Rate Limit**: 500 RPM

### Production Environment
- **Purpose**: Live production traffic
- **Database**: `erify-telemetry-db`
- **URL**: `https://api.erify.world`
- **Rate Limit**: 1000 RPM

## 🛠 Development Workflow

### Local Development
```bash
# Start development server
make dev

# Test endpoints
curl http://localhost:8787/health
curl http://localhost:8787/
```

### Code Quality
```bash
# Lint code
make lint

# Format code
make format

# Security scan
make security-scan
```

### Database Operations
```bash
# Run migrations
make migrate

# Backup database
make backup-db

# Open database shell
make db-shell

# Reset database (WARNING: destructive)
make db-reset
```

## 📊 API Endpoints

### Core Endpoints
- `GET /` - API information and status
- `GET /health` - Health check with database connectivity
- `POST /telemetry` - Submit telemetry data (requires HMAC)
- `GET /wallet/status?walletId=xyz` - Get wallet activity status
- `POST /wallet/transaction` - Submit wallet transaction (requires HMAC)
- `POST /auth/verify` - JWT verification endpoint

### Security Requirements
Most endpoints require HMAC signature verification with these headers:
- `X-Erify-Signature` - HMAC-SHA256 signature
- `X-Erify-Timestamp` - Request timestamp (within 5 minutes)
- `X-Erify-Nonce` - Unique request identifier

## 🔐 Secrets Management

### Required Secrets
```bash
# Set up all secrets interactively
./set-secrets.sh development

# Or set individual secrets
wrangler secret put ERIFY_API_SECRET --env development
wrangler secret put JWT_SECRET --env development
```

### Secret Types
- **`ERIFY_API_SECRET`** - HMAC signing key (64 chars)
- **`JWT_SECRET`** - JWT signing key (64 chars)
- **`WEBHOOK_SECRET`** - Webhook verification (optional)
- **`EXTERNAL_API_KEY`** - External integrations (optional)

## 🔄 CI/CD Pipeline

### Automatic Deployment
- **Push to `develop`** → Deploy to development
- **Push to `main`** → Deploy to staging
- **Manual trigger** → Deploy to production (with approval)

### Pipeline Stages
1. **Lint & Validate** - Code quality and syntax checks
2. **Test** - Dry-run deployment and database tests
3. **Deploy** - Environment-specific deployment
4. **Health Check** - Post-deployment verification
5. **Notify** - Success/failure notifications

### GitHub Secrets Required
- `CLOUDFLARE_API_TOKEN` - Cloudflare API access
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## 📈 Monitoring & Observability

### Built-in Monitoring
- Health check endpoint with database connectivity
- Security event logging
- Performance metrics collection
- Rate limiting statistics

### Cloudflare Analytics
- Request volume and latency
- Error rates and status codes
- Geographic distribution
- Security threat detection

### Viewing Logs
```bash
# Real-time logs
make logs

# Or directly with wrangler
wrangler tail --env production
```

## 🔧 Configuration

### Environment Variables
Configure in `wrangler.toml`:
```toml
[vars]
RATE_LIMIT_RPM = "1000"
ENVIRONMENT = "production"
SERVICE_NAME = "ERIFY™ Worker"
```

### Database Configuration
Update database IDs in `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "erify-telemetry-db"
database_id = "your-actual-database-id"
```

## 🚨 Troubleshooting

### Common Issues

**Worker not deploying?**
```bash
# Check authentication
wrangler whoami

# Validate configuration
wrangler validate

# Check build
make build
```

**Database connection errors?**
```bash
# Verify database exists
wrangler d1 list

# Check migrations
make migrate

# Test connection
make db-shell
```

**Secrets not working?**
```bash
# List current secrets
wrangler secret list --env development

# Reset secrets
./set-secrets.sh development
```

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your environment variables.

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [D1 Database Guide](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [ERIFY™ API Documentation](https://api.erify.world/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test: `make dev`
4. Run tests: `make test`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.erify.world](https://docs.erify.world)
- **Issues**: [GitHub Issues](https://github.com/erify-world/erify-world/issues)
- **Discord**: [ERIFY™ Community](https://discord.gg/erify)
- **Email**: support@erify.world

---

**ERIFY™ Technologies** | Building the future of digital infrastructure