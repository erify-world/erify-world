/**
 * ERIFY™ Worker - Production-ready Cloudflare Worker
 * Real-time wallet telemetry, security, and scale
 * 
 * Features:
 * - Telemetry collection and analytics
 * - Anti-replay protection with nonce tracking
 * - HMAC signature verification
 * - JWT authentication ready
 * - D1 database integration
 * - Rate limiting and security headers
 */

// Environment interface for TypeScript-like documentation
// Expected environment variables:
// - DB: D1 database binding
// - ERIFY_API_SECRET: HMAC secret for request verification
// - JWT_SECRET: JWT signing/verification secret
// - RATE_LIMIT_RPM: Requests per minute limit (default: 1000)

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Erify-Signature, X-Erify-Timestamp, X-Erify-Nonce',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: { ...CORS_HEADERS }
        });
      }

      // Rate limiting
      const rateLimitResult = await checkRateLimit(request, env);
      if (!rateLimitResult.allowed) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        }), {
          status: 429,
          headers: { 
            ...CORS_HEADERS, 
            ...SECURITY_HEADERS,
            'Retry-After': rateLimitResult.retryAfter.toString()
          }
        });
      }

      const url = new URL(request.url);
      const pathname = url.pathname;

      // Route handling
      switch (pathname) {
        case '/':
          return handleRoot(request, env);
        case '/health':
          return handleHealth(request, env);
        case '/telemetry':
          return handleTelemetry(request, env, ctx);
        case '/wallet/status':
          return handleWalletStatus(request, env);
        case '/wallet/transaction':
          return handleWalletTransaction(request, env, ctx);
        case '/auth/verify':
          return handleAuthVerify(request, env);
        default:
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
          });
      }
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        requestId: crypto.randomUUID()
      }), {
        status: 500,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }
  }
};

/**
 * Handle root endpoint - API info
 */
async function handleRoot(request, env) {
  return new Response(JSON.stringify({
    service: 'ERIFY™ Worker',
    version: '1.0.0',
    status: 'operational',
    features: [
      'telemetry',
      'anti-replay',
      'hmac-verification',
      'jwt-ready',
      'rate-limiting'
    ],
    endpoints: [
      'GET /',
      'GET /health',
      'POST /telemetry',
      'GET /wallet/status',
      'POST /wallet/transaction',
      'POST /auth/verify'
    ]
  }), {
    status: 200,
    headers: { 
      ...CORS_HEADERS, 
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json'
    }
  });
}

/**
 * Health check endpoint
 */
async function handleHealth(request, env) {
  try {
    // Test D1 connection
    const dbTest = await env.DB.prepare('SELECT 1 as test').first();
    
    return new Response(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: dbTest ? 'connected' : 'error',
        worker: 'operational'
      }
    }), {
      status: 200,
      headers: { 
        ...CORS_HEADERS, 
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }), {
      status: 503,
      headers: { 
        ...CORS_HEADERS, 
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Handle telemetry data collection
 */
async function handleTelemetry(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }

  try {
    // Verify request signature
    const verification = await verifyRequestSignature(request, env);
    if (!verification.valid) {
      return new Response(JSON.stringify({ 
        error: 'Invalid signature or replay attack detected',
        code: verification.code
      }), {
        status: 401,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }

    const telemetryData = await request.json();
    
    // Validate telemetry data structure
    if (!isValidTelemetryData(telemetryData)) {
      return new Response(JSON.stringify({ error: 'Invalid telemetry data format' }), {
        status: 400,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }

    // Store telemetry in D1
    const telemetryId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO telemetry_events 
      (id, event_type, wallet_id, user_agent, ip_address, timestamp, data, processed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      telemetryId,
      telemetryData.eventType,
      telemetryData.walletId,
      request.headers.get('User-Agent') || 'unknown',
      request.headers.get('CF-Connecting-IP') || 'unknown',
      new Date().toISOString(),
      JSON.stringify(telemetryData),
      false
    ).run();

    // Store nonce to prevent replay attacks
    await storeNonce(verification.nonce, env);

    return new Response(JSON.stringify({
      success: true,
      telemetryId,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        ...CORS_HEADERS, 
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Telemetry error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process telemetry' }), {
      status: 500,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }
}

/**
 * Handle wallet status queries
 */
async function handleWalletStatus(request, env) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }

  try {
    const url = new URL(request.url);
    const walletId = url.searchParams.get('walletId');

    if (!walletId) {
      return new Response(JSON.stringify({ error: 'walletId parameter required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }

    // Get recent telemetry for wallet
    const recentEvents = await env.DB.prepare(`
      SELECT event_type, timestamp, COUNT(*) as count
      FROM telemetry_events 
      WHERE wallet_id = ? AND timestamp > datetime('now', '-24 hours')
      GROUP BY event_type
      ORDER BY timestamp DESC
      LIMIT 10
    `).bind(walletId).all();

    return new Response(JSON.stringify({
      walletId,
      status: 'active',
      recentActivity: recentEvents.results,
      lastSeen: recentEvents.results.length > 0 ? recentEvents.results[0].timestamp : null
    }), {
      status: 200,
      headers: { 
        ...CORS_HEADERS, 
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Wallet status error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get wallet status' }), {
      status: 500,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }
}

/**
 * Handle wallet transactions
 */
async function handleWalletTransaction(request, env, ctx) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }

  try {
    // Verify request signature
    const verification = await verifyRequestSignature(request, env);
    if (!verification.valid) {
      return new Response(JSON.stringify({ 
        error: 'Invalid signature or replay attack detected'
      }), {
        status: 401,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }

    const transactionData = await request.json();
    
    // Validate transaction data
    if (!isValidTransactionData(transactionData)) {
      return new Response(JSON.stringify({ error: 'Invalid transaction data' }), {
        status: 400,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }

    // Store transaction
    const transactionId = crypto.randomUUID();
    await env.DB.prepare(`
      INSERT INTO wallet_transactions 
      (id, wallet_id, transaction_type, amount, currency, status, timestamp, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      transactionId,
      transactionData.walletId,
      transactionData.type,
      transactionData.amount,
      transactionData.currency || 'USD',
      'pending',
      new Date().toISOString(),
      JSON.stringify(transactionData.metadata || {})
    ).run();

    // Store nonce
    await storeNonce(verification.nonce, env);

    return new Response(JSON.stringify({
      success: true,
      transactionId,
      status: 'pending',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 
        ...CORS_HEADERS, 
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    return new Response(JSON.stringify({ error: 'Failed to process transaction' }), {
      status: 500,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }
}

/**
 * Handle JWT verification (placeholder for future JWT implementation)
 */
async function handleAuthVerify(request, env) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      });
    }

    // JWT verification placeholder - implement with actual JWT library
    const token = authHeader.substring(7);
    
    return new Response(JSON.stringify({
      valid: true,
      message: 'JWT verification endpoint ready for implementation',
      token: token.substring(0, 10) + '...' // Only show first 10 chars for security
    }), {
      status: 200,
      headers: { 
        ...CORS_HEADERS, 
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return new Response(JSON.stringify({ error: 'Failed to verify token' }), {
      status: 500,
      headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
    });
  }
}

/**
 * Verify HMAC signature and check for replay attacks
 */
async function verifyRequestSignature(request, env) {
  const signature = request.headers.get('X-Erify-Signature');
  const timestamp = request.headers.get('X-Erify-Timestamp');
  const nonce = request.headers.get('X-Erify-Nonce');

  if (!signature || !timestamp || !nonce) {
    return { valid: false, code: 'MISSING_HEADERS' };
  }

  // Check timestamp (prevent old requests)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300000) { // 5 minutes
    return { valid: false, code: 'TIMESTAMP_EXPIRED' };
  }

  // Check for replay attack
  const nonceExists = await checkNonceExists(nonce, env);
  if (nonceExists) {
    return { valid: false, code: 'REPLAY_ATTACK' };
  }

  // Verify HMAC signature
  const body = await request.clone().text();
  const payload = `${timestamp}.${nonce}.${body}`;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.ERIFY_API_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  if (signature !== expectedSignature) {
    return { valid: false, code: 'INVALID_SIGNATURE' };
  }

  return { valid: true, nonce };
}

/**
 * Check if nonce already exists (replay attack prevention)
 */
async function checkNonceExists(nonce, env) {
  try {
    const result = await env.DB.prepare(
      'SELECT id FROM request_nonces WHERE nonce = ? AND expires_at > datetime("now")'
    ).bind(nonce).first();
    
    return !!result;
  } catch (error) {
    console.error('Nonce check error:', error);
    return false;
  }
}

/**
 * Store nonce to prevent replay attacks
 */
async function storeNonce(nonce, env) {
  try {
    const expiresAt = new Date(Date.now() + 300000).toISOString(); // 5 minutes
    await env.DB.prepare(
      'INSERT INTO request_nonces (id, nonce, expires_at) VALUES (?, ?, ?)'
    ).bind(crypto.randomUUID(), nonce, expiresAt).run();
  } catch (error) {
    console.error('Nonce store error:', error);
  }
}

/**
 * Rate limiting check
 */
async function checkRateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const limit = parseInt(env.RATE_LIMIT_RPM) || 1000;
  const window = 60; // 1 minute
  
  try {
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % window);
    
    // Get current count for this IP in this window
    const result = await env.DB.prepare(
      'SELECT request_count FROM rate_limits WHERE ip_address = ? AND window_start = ?'
    ).bind(ip, windowStart).first();
    
    const currentCount = result ? result.request_count : 0;
    
    if (currentCount >= limit) {
      return { 
        allowed: false, 
        retryAfter: window - (now % window) 
      };
    }
    
    // Update or insert count
    await env.DB.prepare(`
      INSERT INTO rate_limits (ip_address, window_start, request_count, updated_at)
      VALUES (?, ?, 1, ?)
      ON CONFLICT (ip_address, window_start) 
      DO UPDATE SET request_count = request_count + 1, updated_at = ?
    `).bind(ip, windowStart, now, now).run();
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { allowed: true }; // Allow on error to prevent service disruption
  }
}

/**
 * Validate telemetry data structure
 */
function isValidTelemetryData(data) {
  return data && 
         typeof data.eventType === 'string' &&
         typeof data.walletId === 'string' &&
         data.eventType.length > 0 &&
         data.walletId.length > 0;
}

/**
 * Validate transaction data structure
 */
function isValidTransactionData(data) {
  return data &&
         typeof data.walletId === 'string' &&
         typeof data.type === 'string' &&
         typeof data.amount === 'number' &&
         data.walletId.length > 0 &&
         data.type.length > 0 &&
         data.amount > 0;
}