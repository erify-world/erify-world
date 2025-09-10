# Django Backend Integration for Cron Endpoints

This document provides example Django code for integrating with the Cloudflare Workers cron scheduler.

## URL Configuration

```python
# urls.py
from django.urls import path, include
from . import cron_views

# Add to your main urls.py
cron_patterns = [
    path('ee-recent', cron_views.ee_recent_update, name='cron_ee_recent'),
    path('parties-import', cron_views.parties_import, name='cron_parties_import'),
    path('check-current', cron_views.check_current_elections, name='cron_check_current'),
    path('mop-recent', cron_views.mop_recent_elections, name='cron_mop_recent'),
    path('moderation-images', cron_views.process_moderation_images, name='cron_mod_images'),
    path('sopn-parse', cron_views.parse_sopn_data, name='cron_sopn_parse'),
]

urlpatterns = [
    # ... your existing patterns
    path('api/cron/', include(cron_patterns)),
]
```

## View Implementations

```python
# cron_views.py
import subprocess
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.core.cache import cache
import time

logger = logging.getLogger(__name__)

def verify_cron_token(request):
    """Verify the cron token from Authorization header"""
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return False
    token = auth_header.replace('Bearer ', '')
    return token == getattr(settings, 'ERIFY_CRON_TOKEN', '')

def run_management_command(command_args, lock_key=None, timeout=300):
    """Run a Django management command with optional locking"""
    if lock_key:
        # Check if already running
        if cache.get(f'cron_lock_{lock_key}'):
            return {'status': 'skipped', 'reason': 'already_running'}
        
        # Set lock
        cache.set(f'cron_lock_{lock_key}', True, timeout)
    
    try:
        # Run command asynchronously
        process = subprocess.Popen([
            'python', 'manage.py'
        ] + command_args, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
        )
        
        return {'status': 'started', 'pid': process.pid}
    except Exception as e:
        logger.error(f'Command failed: {" ".join(command_args)} - {e}')
        return {'status': 'error', 'error': str(e)}
    finally:
        if lock_key:
            cache.delete(f'cron_lock_{lock_key}')

@csrf_exempt
@require_http_methods(["POST"])
def ee_recent_update(request):
    """Handle EE recently-updated job"""
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    result = run_management_command([
        'uk_create_elections_from_every_election',
        '--recently-updated'
    ])
    
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["POST"])
def parties_import(request):
    """Handle parties import from EC"""
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    result = run_management_command([
        'parties_import_from_ec',
        '--post-to-slack'
    ], lock_key='parties_import')
    
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["POST"])
def check_current_elections(request):
    """Handle current elections check"""
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    result = run_management_command([
        'uk_create_elections_from_every_election',
        '--check-current'
    ])
    
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["POST"])
def mop_recent_elections(request):
    """Handle mop up of missed elections"""
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    delta = request.GET.get('delta', '25')
    
    result = run_management_command([
        'uk_create_elections_from_every_election',
        '--recently-updated',
        '--recently-updated-delta', delta
    ])
    
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["POST"])
def process_moderation_images(request):
    """Handle moderation image processing"""
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    result = run_management_command([
        'moderation_queue_process_queued_images'
    ])
    
    return JsonResponse(result)

@csrf_exempt
@require_http_methods(["POST"])
def parse_sopn_data(request):
    """Handle SOPN data parsing"""
    if not verify_cron_token(request):
        return JsonResponse({'error': 'Unauthorized'}, status=401)
    
    result = run_management_command([
        'sopn_parsing_process_unparsed'
    ], lock_key='sopn_parse')
    
    return JsonResponse(result)
```

## Settings Configuration

```python
# settings.py

# Cron authentication token
ERIFY_CRON_TOKEN = os.environ.get('ERIFY_CRON_TOKEN', '')

# Cache configuration for locks
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'cron.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'cron_views': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Security Middleware

```python
# middleware.py
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
import time

class CronRateLimitMiddleware(MiddlewareMixin):
    """Rate limiting for cron endpoints"""
    
    def process_request(self, request):
        if request.path.startswith('/api/cron/'):
            # Get client IP
            ip = self.get_client_ip(request)
            
            # Rate limit: 60 requests per minute per IP
            cache_key = f'cron_rate_limit_{ip}'
            requests = cache.get(cache_key, 0)
            
            if requests >= 60:
                return JsonResponse({
                    'error': 'Rate limit exceeded'
                }, status=429)
            
            # Increment counter
            cache.set(cache_key, requests + 1, 60)
        
        return None
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

## Testing

```python
# tests/test_cron_views.py
from django.test import TestCase, Client
from django.conf import settings
from unittest.mock import patch
import json

class CronViewsTestCase(TestCase):
    
    def setUp(self):
        self.client = Client()
        self.token = 'test-token'
        self.headers = {
            'HTTP_AUTHORIZATION': f'Bearer {self.token}'
        }
    
    @patch('cron_views.subprocess.Popen')
    def test_ee_recent_update(self, mock_popen):
        """Test EE recent update endpoint"""
        mock_popen.return_value.pid = 12345
        
        with self.settings(ERIFY_CRON_TOKEN=self.token):
            response = self.client.post(
                '/api/cron/ee-recent',
                **self.headers
            )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'started')
        self.assertEqual(data['pid'], 12345)
    
    def test_unauthorized_access(self):
        """Test unauthorized access is rejected"""
        response = self.client.post('/api/cron/ee-recent')
        self.assertEqual(response.status_code, 401)
    
    def test_invalid_token(self):
        """Test invalid token is rejected"""
        headers = {'HTTP_AUTHORIZATION': 'Bearer invalid-token'}
        
        with self.settings(ERIFY_CRON_TOKEN='valid-token'):
            response = self.client.post(
                '/api/cron/ee-recent',
                **headers
            )
        
        self.assertEqual(response.status_code, 401)
```

## Deployment Checklist

1. **Environment Variables:**
   ```bash
   export ERIFY_CRON_TOKEN="your-secure-token-here"
   ```

2. **Database Migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Redis Configuration:**
   - Ensure Redis is running
   - Configure cache settings
   - Test cache connectivity

4. **Logging Setup:**
   - Create log directories
   - Set appropriate permissions
   - Configure log rotation

5. **Security:**
   - Add rate limiting middleware
   - Configure firewall rules
   - Set up monitoring alerts

6. **Testing:**
   ```bash
   # Test endpoints locally
   curl -X POST http://localhost:8000/api/cron/ee-recent \
     -H "Authorization: Bearer your-token" \
     -H "Content-Type: application/json"
   ```