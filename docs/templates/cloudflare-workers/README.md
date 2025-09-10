# Cloudflare Workers Cron Scheduler for ERIFY™

This template provides a Cloudflare Workers-based cron scheduler using Scheduled Triggers. Workers can't run your local Django commands directly, so this pattern exposes internal secure HTTP endpoints in your Django/Backend and has Workers call them on schedule with a secret token.

## Architecture

```
Cloudflare Workers (Scheduler) → HTTP API Endpoints → Django Management Commands
```

This keeps the serverless scheduler + your existing app logic separated and secure.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure secrets:**
   ```bash
   wrangler secret put ERIFY_CRON_TOKEN
   ```

3. **Update wrangler.toml:**
   - Set your backend URL in `BACKEND_BASE`
   - Adjust cron schedules as needed

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Configuration

### Environment Variables

- `BACKEND_BASE`: Your backend API URL (e.g., `https://api.erify.example`)
- `ERIFY_CRON_TOKEN`: Secret token for API authentication

### Cron Schedules

The `wrangler.toml` file defines the trigger schedules:

```toml
[triggers]
crons = [
  "*/5 * * * *",   # Every 5 minutes
  "6 2 * * *",     # Daily at 02:06
  "23 23 * * *",   # Daily at 23:23
  "33 23 * * *"    # Daily at 23:33
]
```

### Job Mapping

Jobs are mapped to API endpoints in `src/worker.ts`:

```typescript
const JOBS = {
  every5min: { path: "/cron/ee-recent", method: "POST" },
  partiesEC: { path: "/cron/parties-import", method: "POST" },
  checkCurrent: { path: "/cron/check-current", method: "POST" },
  mopDelta25: { path: "/cron/mop-recent?delta=25", method: "POST" }
};
```

## Backend Integration

### Django URL Patterns

Add secure endpoints to your Django application:

```python
# urls.py
from django.urls import path
from . import cron_views

urlpatterns = [
    path('cron/ee-recent', cron_views.ee_recent_update, name='cron_ee_recent'),
    path('cron/parties-import', cron_views.parties_import, name='cron_parties_import'),
    path('cron/check-current', cron_views.check_current_elections, name='cron_check_current'),
    path('cron/mop-recent', cron_views.mop_recent_elections, name='cron_mop_recent'),
]
```

### Example Django Views

```python
# cron_views.py
import subprocess
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import user_passes_test
import logging

logger = logging.getLogger(__name__)

def verify_cron_token(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    return token == settings.ERIFY_CRON_TOKEN

@csrf_exempt
@require_http_methods(["POST"])
def ee_recent_update(request):
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        # Run management command asynchronously
        subprocess.Popen([
            'python', 'manage.py', 
            'uk_create_elections_from_every_election',
            '--recently-updated'
        ])
        return JsonResponse({'status': 'started'})
    except Exception as e:
        logger.error(f'EE recent update failed: {e}')
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def parties_import(request):
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    try:
        subprocess.Popen([
            'python', 'manage.py',
            'parties_import_from_ec',
            '--post-to-slack'
        ])
        return JsonResponse({'status': 'started'})
    except Exception as e:
        logger.error(f'Parties import failed: {e}')
        return JsonResponse({'error': str(e)}, status=500)
```

### Security Considerations

1. **Authentication**: Use strong Bearer tokens
2. **Rate Limiting**: Implement rate limiting on endpoints
3. **Idempotency**: Ensure jobs can run multiple times safely
4. **Locking**: Use Redis/database locks for single-run jobs

## Development

### Local Development

```bash
# Start local development server
npm run dev

# Test scheduled events locally
curl -X POST http://localhost:8787/__scheduled?cron=*/5+*+*+*+*
```

### Monitoring

```bash
# Tail logs in real-time
npm run tail

# View analytics in Cloudflare dashboard
# Go to Workers > Analytics
```

## Deployment

### Production Deployment

```bash
# Deploy to Cloudflare
npm run deploy

# Verify deployment
wrangler whoami
wrangler deployments list
```

### Environment Management

```bash
# List secrets
wrangler secret list

# Update secrets
wrangler secret put ERIFY_CRON_TOKEN

# Delete secrets
wrangler secret delete ERIFY_CRON_TOKEN
```

## Limitations & Considerations

### Cloudflare Workers Limits

- **Free Plan**: 100,000 requests/day, 10ms CPU time
- **Paid Plan**: 10 million requests/month, 50ms CPU time
- **Cron Frequency**: Minimum 1 minute intervals

### Minute-Level Jobs

For high-frequency jobs (every minute), consider:

1. **Batching**: Combine multiple minute-level operations
2. **Hybrid Approach**: Use VM/Container for frequent jobs, Workers for scheduled ones
3. **Consolidation**: Run frequent jobs every 5-15 minutes instead

### Error Handling

- Workers automatically retry failed scheduled events
- Implement circuit breakers in backend endpoints
- Use dead letter queues for failed jobs
- Monitor via Cloudflare Analytics and custom logging

## Migration Strategy

1. **Phase 1**: Set up backend endpoints alongside existing cron
2. **Phase 2**: Deploy Workers with monitoring
3. **Phase 3**: Gradually disable traditional cron jobs
4. **Phase 4**: Remove old cron infrastructure

## Troubleshooting

### Common Issues

**401 Unauthorized:**
- Verify `ERIFY_CRON_TOKEN` is set correctly
- Check token in backend authentication

**Cron not triggering:**
- Verify cron syntax in `wrangler.toml`
- Check Cloudflare Workers dashboard for trigger status

**Backend timeouts:**
- Ensure endpoints return quickly (use async processing)
- Implement proper timeout handling
- Use background tasks for long-running operations

### Debug Commands

```bash
# Check worker status
wrangler whoami

# View recent deployments
wrangler deployments list

# Check logs
wrangler tail --format=pretty

# Test locally
wrangler dev --local
```