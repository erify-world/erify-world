# ERIFY™ Logflare Saved Queries for OAuth Flow Monitoring

This file contains ready-to-use saved queries for monitoring OAuth flows in Logflare. Import these queries into your Logflare dashboard for comprehensive observability.

## OAuth Error Trends

### OAuth Error Rate Over Time
```sql
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) as error_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate_percent
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY time_bucket
ORDER BY time_bucket DESC;
```

### Top OAuth Error Types
```sql
SELECT 
  error_type,
  error_code,
  COUNT(*) as error_count,
  COUNT(DISTINCT metadata.user_id) as affected_users,
  MAX(timestamp) as last_occurrence
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_error'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY error_type, error_code
ORDER BY error_count DESC
LIMIT 20;
```

### OAuth Errors by Provider
```sql
SELECT 
  provider,
  oauth_flow,
  COUNT(*) as error_count,
  ROUND(
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 
    2
  ) as percentage
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_error'
  AND timestamp >= NOW() - INTERVAL '6 hours'
GROUP BY provider, oauth_flow
ORDER BY error_count DESC;
```

## OAuth Latency Analysis

### Average OAuth Latency by Provider
```sql
SELECT 
  provider,
  oauth_flow,
  COUNT(*) as request_count,
  ROUND(AVG(duration_ms), 2) as avg_latency_ms,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms), 2) as p50_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 2) as p95_ms,
  ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms), 2) as p99_ms
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_success'
  AND duration_ms IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '2 hours'
GROUP BY provider, oauth_flow
ORDER BY avg_latency_ms DESC;
```

### OAuth Latency Distribution Over Time
```sql
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  ROUND(AVG(duration_ms), 2) as avg_latency,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 2) as p95_latency,
  COUNT(*) as request_count
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_success'
  AND duration_ms IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '4 hours'
GROUP BY time_bucket
ORDER BY time_bucket DESC;
```

### Slow OAuth Requests (>3 seconds)
```sql
SELECT 
  timestamp,
  provider,
  oauth_flow,
  duration_ms,
  geo_country,
  user_agent,
  correlation_id
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_success'
  AND duration_ms > 3000
  AND timestamp >= NOW() - INTERVAL '1 hour'
ORDER BY duration_ms DESC
LIMIT 50;
```

## Geographic Distribution

### OAuth Requests by Country
```sql
SELECT 
  geo_country,
  COUNT(*) as request_count,
  COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) as success_count,
  COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) as error_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate_percent
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND geo_country IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY geo_country
ORDER BY request_count DESC
LIMIT 30;
```

### High Error Rate Countries
```sql
SELECT 
  geo_country,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) as error_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate_percent
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND geo_country IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '12 hours'
GROUP BY geo_country
HAVING COUNT(*) >= 10  -- Only countries with significant traffic
ORDER BY error_rate_percent DESC
LIMIT 20;
```

## Success and Error Rates

### Overall OAuth Success Rate (Last 24h)
```sql
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) as success_count,
  COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) as error_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate_percent,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate_percent
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '24 hours';
```

### Success Rate Trend (Hourly)
```sql
SELECT 
  DATE_TRUNC('hour', timestamp) as hour_bucket,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) as success_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate_percent
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY hour_bucket
ORDER BY hour_bucket DESC;
```

### Provider Success Rate Comparison
```sql
SELECT 
  provider,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) as success_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate_percent,
  ROUND(AVG(duration_ms), 2) as avg_latency_ms
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '6 hours'
GROUP BY provider
ORDER BY success_rate_percent DESC;
```

## Stripe Error Monitoring

### Stripe Error Spike Detection
```sql
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  COUNT(*) as stripe_errors,
  COUNT(DISTINCT customer_id) as affected_customers
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'stripe_error'
  AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY time_bucket
HAVING COUNT(*) > 5  -- Alert threshold
ORDER BY time_bucket DESC;
```

### Top Stripe Error Types
```sql
SELECT 
  error_type,
  error_code,
  COUNT(*) as error_count,
  SUM(amount) as total_failed_amount,
  currency,
  MAX(timestamp) as last_occurrence
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'stripe_error'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY error_type, error_code, currency
ORDER BY error_count DESC
LIMIT 15;
```

## User Agent and Device Analysis

### Top User Agents for OAuth Errors
```sql
SELECT 
  user_agent,
  COUNT(*) as error_count,
  COUNT(DISTINCT correlation_id) as unique_sessions
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_error'
  AND user_agent IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '6 hours'
GROUP BY user_agent
ORDER BY error_count DESC
LIMIT 20;
```

### Mobile vs Desktop OAuth Success Rate
```sql
SELECT 
  CASE 
    WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' OR user_agent LIKE '%iPhone%' THEN 'Mobile'
    WHEN user_agent LIKE '%Tablet%' OR user_agent LIKE '%iPad%' THEN 'Tablet'
    ELSE 'Desktop'
  END as device_type,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) as success_count,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate_percent
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND user_agent IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY device_type
ORDER BY total_requests DESC;
```

## Performance Monitoring

### Slowest OAuth Operations
```sql
SELECT 
  operation,
  ROUND(AVG(duration_ms), 2) as avg_duration_ms,
  ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms), 2) as p95_duration_ms,
  COUNT(*) as operation_count
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'performance'
  AND operation IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '2 hours'
GROUP BY operation
ORDER BY avg_duration_ms DESC;
```

### Request Volume Trends
```sql
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  COUNT(*) as request_count,
  COUNT(DISTINCT correlation_id) as unique_sessions
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND timestamp >= NOW() - INTERVAL '2 hours'
GROUP BY time_bucket
ORDER BY time_bucket DESC;
```

## Setup Instructions

1. **Import to Logflare:**
   - Copy each query you want to use
   - Go to your Logflare dashboard → Saved Queries
   - Create new query and paste the SQL
   - Name the query descriptively (e.g., "OAuth Error Rate Over Time")
   - Set appropriate refresh intervals

2. **Query Customization:**
   - Adjust time intervals based on your needs
   - Modify service name if different from 'erify-oauth'
   - Add additional filters for specific environments
   - Customize thresholds in HAVING clauses

3. **Alert Setup:**
   - Use queries with thresholds for alerting
   - Set up email/Slack notifications in Logflare
   - Configure appropriate alert frequencies

4. **Dashboard Organization:**
   - Group related queries in dashboard sections
   - Use consistent time ranges for comparison
   - Add visualizations (charts, tables, gauges)