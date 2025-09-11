# Cloudflare Workers Cron Template

Workers can't run your local Django commands. Pattern: expose internal secure HTTP endpoints (in
your Django/Backend) and have Workers call them on schedule with a secret token. This keeps the
serverless scheduler + your existing app logic.

## Files

1. **wrangler.toml** - Cloudflare Workers configuration with cron triggers
2. **src/worker.ts** - TypeScript worker implementation

## Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Configure Secrets

Set your backend authentication token:

```bash
wrangler secret put ERIFY_CRON_TOKEN
```

When prompted, enter your secure token that your Django backend will validate.

### 3. Update Configuration

Edit `wrangler.toml` to set your backend URL:

```toml
[vars]
BACKEND_BASE = "https://your-actual-backend.com"
```

### 4. Deploy

```bash
wrangler deploy
```

## Backend Integration

You'll need to create secure HTTP endpoints in your Django backend that correspond to the cron jobs:

### URL Mapping

| Worker Path                      | Django Management Command                                                                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------- |
| `POST /cron/ee-recent`           | `manage.py uk_create_elections_from_every_election --recently-updated`                             |
| `POST /cron/parties-import`      | `manage.py parties_import_from_ec --post-to-slack`                                                 |
| `POST /cron/check-current`       | `manage.py uk_create_elections_from_every_election --check-current`                                |
| `POST /cron/mop-recent?delta=25` | `manage.py uk_create_elections_from_every_election --recently-updated --recently-updated-delta 25` |

### Django Views Example

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.management import call_command
import subprocess
import json

@csrf_exempt
@require_http_methods(["POST"])
def cron_ee_recent(request):
    # Validate Bearer token
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer ') or auth_header[7:] != settings.ERIFY_CRON_TOKEN:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        # Run management command asynchronously (consider using Celery)
        call_command('uk_create_elections_from_every_election', recently_updated=True)
        return JsonResponse({'status': 'success'})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
```

### Security Considerations

- **Authentication**: Always validate the Bearer token
- **Rate Limiting**: Implement rate limiting per endpoint
- **Idempotency**: Ensure commands can be run multiple times safely
- **Locking**: Use Redis or database locks to prevent concurrent runs
- **Logging**: Log all cron job executions for monitoring

## Monitoring

### Cloudflare Dashboard

Monitor your Workers in the Cloudflare dashboard:

- View execution logs
- Monitor request patterns
- Check error rates

### Analytics

```typescript
// Add to worker for custom analytics
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // ... existing code ...

    // Custom analytics
    ctx.waitUntil(
      fetch('https://analytics.example.com/cron-heartbeat', {
        method: 'POST',
        body: JSON.stringify({
          timestamp: event.scheduledTime,
          worker: 'erify-cron',
        }),
      })
    );
  },
};
```

## Limitations & Considerations

### Free Plan Limitations

- **CPU Time**: 10ms per request (usually sufficient for HTTP calls)
- **Execution Time**: 30 seconds maximum
- **Requests**: 100,000 per day

### Minute-Level Tasks

Consider consolidating "every minute" jobs (images/SOPN parse) into every 5–15 minutes or keep them
on a VM/Container with node-cron/PM2 for high frequency.

### Alternative: Hybrid Approach

- **High-frequency jobs** (every minute): Use Node.js template on a server
- **Low-frequency jobs** (hourly, daily): Use Cloudflare Workers

## Development

### Local Testing

```bash
wrangler dev
```

### Triggering Cron Locally

```bash
curl -X POST "http://localhost:8787/__scheduled?cron=*/5+*+*+*+*"
```

## Environment Variables

Set additional variables in `wrangler.toml`:

```toml
[vars]
BACKEND_BASE = "https://api.erify.example"
ENVIRONMENT = "production"
LOG_LEVEL = "info"
```
