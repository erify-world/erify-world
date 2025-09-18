/**
 * ERIFY™ World - Cloudflare Worker Script
 * Main worker entry point for production deployment
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Basic routing for ERIFY API endpoints
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({
        message: 'ERIFY™ API endpoint',
        path: url.pathname,
        environment: env.NODE_ENV || 'development'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Default response for root and other paths
    return new Response('ERIFY™ World - Cloudflare Worker Active', {
      headers: {
        'Content-Type': 'text/plain',
      }
    });
  }
};