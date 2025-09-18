# ERIFY™ Production Cloudflare Workers Cron Automation

Production-ready serverless cron automation for ERIFY™ backend systems. This setup provides reliable, observable, and scalable scheduled job execution with proper error handling, retry logic, and multi-environment support.

## 🚀 Quick Start (Ops)

### Prerequisites
- Cloudflare account with Workers enabled
- Node.js 18+ and npm
- Backend API with cron endpoints implemented
- Valid authentication tokens

### 1. Initial Setup

```bash
# Clone and navigate to workers directory
cd docs/ops/scheduling/cloudflare-workers

# Install dependencies
npm install

# Authenticate with Cloudflare (one-time setup)
wrangler auth

# Configure your Cloudflare account ID (check Cloudflare dashboard)
wrangler whoami
```

### 2. Environment Configuration

Set up secrets for each environment:

```bash
# Production secrets
wrangler secret put ERIFY_CRON_TOKEN --env production
# Enter your production backend authentication token

# Optional: Enhanced monitoring
wrangler secret put ANALYTICS_TOKEN --env production
wrangler secret put SLACK_WEBHOOK_URL --env production

# Staging secrets
wrangler secret put ERIFY_CRON_TOKEN --env staging

# Development secrets  
wrangler secret put ERIFY_CRON_TOKEN --env development
```

### 3. Backend URL Configuration

Edit `wrangler.toml` to set your actual backend URLs:

```toml
[env.production.vars]
BACKEND_BASE = "https://api.erify.world"

[env.staging.vars]  
BACKEND_BASE = "https://api-staging.erify.world"

[env.development.vars]
BACKEND_BASE = "https://api-dev.erify.world"
```

### 4. Deploy to Environments

```bash
# Deploy to production
wrangler deploy --env production

# Deploy to staging  
wrangler deploy --env staging

# Deploy to development
wrangler deploy --env development
```

## 🔧 Development & Testing

### Local Development

```bash
# Start local development server
npm run dev

# Test health endpoint
curl http://localhost:8787/health

# Manual trigger (single job)
curl -X POST http://localhost:8787/trigger \
  -H "Content-Type: application/json" \
  -d '{"job": "every5min"}'

# Manual trigger (all jobs)
curl -X POST http://localhost:8787/trigger \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Testing Cron Triggers

```bash
# Test cron execution locally
curl -X POST "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"

# Test with specific scheduled time
curl -X POST "http://localhost:8787/__scheduled" \
  -H "Content-Type: application/json" \
  -d '{"scheduledTime": 1693468800000, "cron": "*/5 * * * *"}'
```

### Production Testing

```bash
# Health check production worker
curl https://erify-cron-workers-prod.your-subdomain.workers.dev/health

# Manual trigger in production (use with caution)
curl -X POST https://erify-cron-workers-prod.your-subdomain.workers.dev/trigger \
  -H "Content-Type: application/json" \
  -d '{"job": "checkCurrent"}'
```

## 📊 Monitoring & Observability

### Cloudflare Dashboard

Monitor your workers in the Cloudflare Dashboard:
- **Workers > erify-cron-workers-prod** - View logs, metrics, and errors
- **Analytics** - Request patterns, duration, and success rates  
- **Real-time Logs** - Live execution logs with correlation IDs

### Structured Logging

All logs include correlation IDs for tracing:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO", 
  "correlationId": "123e4567-e89b-12d3-a456-426614174000",
  "environment": "production",
  "message": "Job EE Recent Elections completed successfully",
  "statusCode": 200,
  "duration": 1250
}
```

### Health Monitoring

```bash
# Automated health checks (add to monitoring system)
curl -f https://erify-cron-workers-prod.your-subdomain.workers.dev/health

# Example response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z", 
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "backend": "healthy",
    "auth": "configured"
  }
}
```

## 🏗 Backend Integration

### Required Endpoints

Your backend must implement these secure HTTP endpoints:

| Worker Path | Purpose | Django Management Command |
|-------------|---------|---------------------------|
| `POST /cron/ee-recent` | Fetch recent elections | `manage.py uk_create_elections_from_every_election --recently-updated` |
| `POST /cron/parties-import` | Import parties | `manage.py parties_import_from_ec --post-to-slack` |
| `POST /cron/check-current` | Check elections | `manage.py uk_create_elections_from_every_election --check-current` |
| `POST /cron/mop-recent?delta=25` | Cleanup missed | `manage.py uk_create_elections_from_every_election --recently-updated --recently-updated-delta 25` |
| `GET /health` | Health check | Basic status endpoint |

### Django Implementation Example

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.management import call_command
from django.conf import settings
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def cron_ee_recent(request):
    # Validate Bearer token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer ') or auth_header[7:] != settings.ERIFY_CRON_TOKEN:
        logger.warning('Unauthorized cron request', extra={
            'correlation_id': request.headers.get('X-Correlation-ID'),
            'ip': request.META.get('REMOTE_ADDR')
        })
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    # Extract correlation ID for logging
    correlation_id = request.headers.get('X-Correlation-ID', 'unknown')
    
    try:
        # Parse request body for context
        body = json.loads(request.body) if request.body else {}
        source = body.get('source', 'unknown')
        
        logger.info(f'Starting EE recent elections job', extra={
            'correlation_id': correlation_id,
            'source': source
        })
        
        # Run management command
        call_command('uk_create_elections_from_every_election', recently_updated=True)
        
        logger.info('EE recent elections job completed successfully', extra={
            'correlation_id': correlation_id
        })
        
        return JsonResponse({
            'status': 'success',
            'correlationId': correlation_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f'EE recent elections job failed: {str(e)}', extra={
            'correlation_id': correlation_id,
            'error': str(e)
        })
        return JsonResponse({
            'error': str(e),
            'correlationId': correlation_id
        }, status=500)
```

### Security Best Practices

- **Authentication**: Always validate Bearer tokens
- **Rate Limiting**: Implement per-endpoint rate limits
- **Idempotency**: Commands must be safely repeatable
- **Locking**: Use Redis/DB locks to prevent concurrent runs
- **Input Validation**: Validate all request parameters
- **CORS**: Restrict origins if needed
- **Logging**: Log all execution attempts with correlation IDs

## 🔄 Deployment Workflows

### CI/CD Integration

```yaml
# .github/workflows/deploy-workers.yml
name: Deploy Cloudflare Workers

on:
  push:
    branches: [main]
    paths: ['docs/ops/scheduling/cloudflare-workers/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        working-directory: docs/ops/scheduling/cloudflare-workers
        
      - name: Deploy to staging
        run: wrangler deploy --env staging
        working-directory: docs/ops/scheduling/cloudflare-workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: wrangler deploy --env production  
        working-directory: docs/ops/scheduling/cloudflare-workers
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Blue-Green Deployments

```bash
# Deploy to staging with version suffix
wrangler deploy --env staging --name erify-cron-workers-staging-v2

# Test new version
curl https://erify-cron-workers-staging-v2.your-subdomain.workers.dev/health

# Promote to production after validation
wrangler deploy --env production --name erify-cron-workers-prod
```

## ⚙️ Configuration Reference

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `BACKEND_BASE` | Backend API base URL | - | ✅ |
| `ENVIRONMENT` | Environment name | `development` | ✅ |
| `LOG_LEVEL` | Logging level | `info` | ❌ |
| `RETRY_MAX_ATTEMPTS` | Max retry attempts | `3` | ❌ |
| `RETRY_INITIAL_DELAY` | Initial retry delay (ms) | `1000` | ❌ |
| `REQUEST_TIMEOUT` | Request timeout (ms) | `30000` | ❌ |

### Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `ERIFY_CRON_TOKEN` | Backend authentication token | ✅ |
| `ANALYTICS_TOKEN` | Analytics endpoint token | ❌ |
| `SLACK_WEBHOOK_URL` | Slack notifications webhook | ❌ |

### Cron Schedules (UTC)

| Environment | Every 5min | Daily 02:06 | Daily 23:23 | Daily 23:33 |
|-------------|------------|-------------|-------------|-------------|
| **Production** | ✅ EE Recent | ✅ Parties Import | ✅ Check Current | ✅ Mop Delta |
| **Staging** | Every 15min | 03:06 UTC | 00:23 UTC | 00:33 UTC |
| **Development** | - | - | Every 6 hours | - |

## 🚨 Troubleshooting

### Common Issues

**1. 401 Unauthorized Errors**
```bash
# Check if secret is set correctly
wrangler secret list --env production

# Re-add secret if missing
wrangler secret put ERIFY_CRON_TOKEN --env production
```

**2. Timeout Errors**
```bash
# Check backend response time
curl -w "@curl-format.txt" https://api.erify.world/health

# Adjust timeout in wrangler.toml
REQUEST_TIMEOUT = "45000"  # 45 seconds
```

**3. Missing Logs**
```bash
# View real-time logs
wrangler tail --env production

# Check log level
LOG_LEVEL = "debug"  # More verbose logging
```

**4. Jobs Not Executing**
```bash
# Verify cron triggers
wrangler cron trigger --env production

# Manual test
curl -X POST https://your-worker.workers.dev/trigger
```

### Debug Commands

```bash
# Check worker deployment status
wrangler status --env production

# View recent executions
wrangler tail --env production --since 1h

# Test connectivity to backend
wrangler dev --local --test
curl http://localhost:8787/health
```

## 🔒 Security Considerations

- **Secrets Management**: Use Wrangler secrets, never commit tokens
- **Network Security**: Backend should only accept requests from Cloudflare IPs
- **Token Rotation**: Regularly rotate `ERIFY_CRON_TOKEN`
- **Monitoring**: Set up alerts for failed authentications
- **Least Privilege**: Worker only needs access to specific endpoints

## 📈 Performance & Limits

### Cloudflare Workers Limits

| Resource | Free Plan | Paid Plan |
|----------|-----------|-----------|
| **CPU Time** | 10ms | 50ms |
| **Memory** | 128MB | 128MB |  
| **Execution Time** | 30s | 30s |
| **Requests/Day** | 100,000 | 10,000,000+ |

### Optimization Tips

- **Unbound Usage Model**: Enabled for better performance
- **Concurrent Execution**: Jobs run sequentially to avoid backend overload
- **Retry Logic**: Exponential backoff prevents thundering herd
- **Timeout Management**: Per-job timeouts prevent hanging requests
- **Environment Separation**: Different schedules per environment

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Workers Analytics](https://developers.cloudflare.com/workers/platform/analytics/)
- [ERIFY™ Backend API Documentation](../../../api/README.md)

---

## Support

For issues or questions:
- 📧 Email: ops@erify.world
- 💬 Slack: #erify-ops
- 🐛 Issues: [GitHub Issues](https://github.com/erify-world/erify-world/issues)

**Last Updated**: January 2024  
**Version**: 1.0.0