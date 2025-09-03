// Simple CORS utilities for Workers

export function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

export function handlePreflight(request) {
  const origin = request.headers.get("Origin") ?? "*";
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin)
  });
}

export function withCors(response, origin = "*") {
  const headers = new Headers(response.headers);
  const ch = corsHeaders(origin);
  for (const [k, v] of Object.entries(ch)) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}