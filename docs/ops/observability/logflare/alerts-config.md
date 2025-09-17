# ERIFY™ Logflare Alert Configurations

This document defines alert configurations for critical error conditions, including Stripe error spikes, OAuth failures, and performance degradation.

## Alert Overview

ERIFY™ Logflare alerts are designed to provide timely notifications for:
- 🚨 Critical system failures requiring immediate attention
- ⚠️ Performance degradation needing investigation  
- 📊 Unusual traffic patterns or anomalies
- 💳 Payment processing issues via Stripe

---

## 🚨 Critical Alerts (Immediate Response Required)

### 1. OAuth Service Availability Critical
**Trigger Condition**: Success rate drops below 90%
```sql
SELECT 
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_success' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as success_rate
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '5 minutes'
HAVING success_rate < 90;
```
- **Severity**: Critical
- **Frequency**: Check every 1 minute
- **Notification**: Slack @here + SMS to on-call
- **Auto-resolve**: When success rate > 95% for 5 minutes

### 2. Stripe Payment Failure Spike
**Trigger Condition**: >10 Stripe errors per minute
```sql
SELECT 
  COUNT(*) as stripe_errors_per_minute
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'stripe_error'
  AND timestamp >= NOW() - INTERVAL '1 minute'
HAVING stripe_errors_per_minute > 10;
```
- **Severity**: Critical
- **Frequency**: Check every 30 seconds
- **Notification**: Slack @channel + Email to finance team
- **Auto-resolve**: When errors < 3 per minute for 3 minutes

### 3. OAuth Complete Service Outage
**Trigger Condition**: No successful OAuth requests in 3 minutes
```sql
SELECT 
  COUNT(*) as successful_requests
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_success'
  AND timestamp >= NOW() - INTERVAL '3 minutes'
HAVING successful_requests = 0;
```
- **Severity**: Critical
- **Frequency**: Check every 1 minute
- **Notification**: Slack @here + SMS + Email
- **Auto-resolve**: When successful requests > 0

---

## ⚠️ Warning Alerts (Investigation Required)

### 4. High OAuth Error Rate
**Trigger Condition**: Error rate > 5% sustained for 10 minutes
```sql
SELECT 
  DATE_TRUNC('minute', timestamp) as time_bucket,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '10 minutes'
GROUP BY time_bucket
HAVING error_rate > 5
ORDER BY time_bucket DESC
LIMIT 10;
```
- **Severity**: Warning
- **Frequency**: Check every 2 minutes
- **Notification**: Slack #alerts channel
- **Auto-resolve**: When error rate < 3% for 5 minutes

### 5. OAuth High Latency Alert
**Trigger Condition**: Average latency > 5 seconds for 5 minutes
```sql
SELECT 
  ROUND(AVG(duration_ms), 2) as avg_latency_ms
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'oauth_success'
  AND duration_ms IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '5 minutes'
HAVING avg_latency_ms > 5000;
```
- **Severity**: Warning
- **Frequency**: Check every 2 minutes  
- **Notification**: Slack #performance channel
- **Auto-resolve**: When latency < 3000ms for 3 minutes

### 6. Provider-Specific OAuth Failures
**Trigger Condition**: >20% error rate for any OAuth provider
```sql
SELECT 
  provider,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND timestamp >= NOW() - INTERVAL '10 minutes'
GROUP BY provider
HAVING error_rate > 20 AND COUNT(*) >= 10;
```
- **Severity**: Warning
- **Frequency**: Check every 3 minutes
- **Notification**: Slack #integrations channel
- **Auto-resolve**: When all providers < 10% error rate

### 7. Geographic OAuth Issues
**Trigger Condition**: >30% error rate in any country with >50 requests
```sql
SELECT 
  geo_country,
  COUNT(*) as total_requests,
  ROUND(
    COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type IN ('oauth_success', 'oauth_error')
  AND geo_country IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '15 minutes'
GROUP BY geo_country
HAVING error_rate > 30 AND total_requests >= 50;
```
- **Severity**: Warning
- **Frequency**: Check every 5 minutes
- **Notification**: Slack #ops channel
- **Auto-resolve**: When all countries < 20% error rate

---

## 📊 Monitoring Alerts (Operational Awareness)

### 8. Unusual Traffic Spike
**Trigger Condition**: >300% increase in traffic compared to same hour last week
```sql
WITH current_hour AS (
  SELECT COUNT(*) as current_requests
  FROM logflare_logs 
  WHERE 
    service = 'erify-oauth'
    AND timestamp >= DATE_TRUNC('hour', NOW())
), 
last_week_hour AS (
  SELECT COUNT(*) as last_week_requests
  FROM logflare_logs 
  WHERE 
    service = 'erify-oauth'
    AND timestamp >= DATE_TRUNC('hour', NOW() - INTERVAL '7 days')
    AND timestamp < DATE_TRUNC('hour', NOW() - INTERVAL '7 days') + INTERVAL '1 hour'
)
SELECT 
  c.current_requests,
  l.last_week_requests,
  ROUND(c.current_requests * 100.0 / GREATEST(l.last_week_requests, 1), 2) as traffic_increase_percent
FROM current_hour c, last_week_hour l
WHERE c.current_requests > l.last_week_requests * 3;
```
- **Severity**: Info
- **Frequency**: Check every 10 minutes
- **Notification**: Slack #monitoring channel
- **Auto-resolve**: Manual review required

### 9. New Error Types Detected
**Trigger Condition**: Error types not seen in last 24 hours
```sql
WITH recent_errors AS (
  SELECT DISTINCT error_type, error_code
  FROM logflare_logs 
  WHERE 
    service = 'erify-oauth'
    AND event_type = 'oauth_error'
    AND timestamp >= NOW() - INTERVAL '1 hour'
),
historical_errors AS (
  SELECT DISTINCT error_type, error_code
  FROM logflare_logs 
  WHERE 
    service = 'erify-oauth'
    AND event_type = 'oauth_error'
    AND timestamp >= NOW() - INTERVAL '25 hours'
    AND timestamp < NOW() - INTERVAL '1 hour'
)
SELECT 
  r.error_type,
  r.error_code
FROM recent_errors r
LEFT JOIN historical_errors h ON r.error_type = h.error_type AND r.error_code = h.error_code
WHERE h.error_type IS NULL;
```
- **Severity**: Info
- **Frequency**: Check every 15 minutes
- **Notification**: Slack #development channel
- **Auto-resolve**: Manual review after 24 hours

### 10. Stripe Revenue Impact Alert
**Trigger Condition**: >$1000 in failed transactions in 1 hour
```sql
SELECT 
  SUM(amount) as total_failed_amount,
  currency,
  COUNT(*) as failed_transaction_count
FROM logflare_logs 
WHERE 
  service = 'erify-oauth'
  AND event_type = 'stripe_error'
  AND amount IS NOT NULL
  AND timestamp >= NOW() - INTERVAL '1 hour'
GROUP BY currency
HAVING SUM(amount) > 100000; -- $1000 in cents
```
- **Severity**: Warning
- **Frequency**: Check every 5 minutes
- **Notification**: Slack #finance + Email to CFO
- **Auto-resolve**: When hourly failed amount < $500

---

## Alert Configuration Files

### Logflare Alert JSON Configuration
```json
{
  "alerts": [
    {
      "name": "OAuth Service Availability Critical",
      "query_id": "oauth_availability_critical",
      "severity": "critical",
      "check_interval": "1m",
      "notification_channels": [
        "slack-critical",
        "sms-oncall", 
        "email-ops"
      ],
      "auto_resolve": {
        "enabled": true,
        "duration": "5m",
        "condition": "success_rate > 95"
      }
    },
    {
      "name": "Stripe Payment Failure Spike", 
      "query_id": "stripe_error_spike",
      "severity": "critical",
      "check_interval": "30s",
      "notification_channels": [
        "slack-finance",
        "email-finance"
      ],
      "auto_resolve": {
        "enabled": true,
        "duration": "3m", 
        "condition": "errors_per_minute < 3"
      }
    },
    {
      "name": "High OAuth Error Rate",
      "query_id": "oauth_error_rate_high", 
      "severity": "warning",
      "check_interval": "2m",
      "notification_channels": [
        "slack-alerts"
      ],
      "auto_resolve": {
        "enabled": true,
        "duration": "5m",
        "condition": "error_rate < 3"
      }
    }
  ]
}
```

### Slack Webhook Configuration
```json
{
  "webhooks": {
    "slack-critical": {
      "url": "https://hooks.slack.com/services/CRITICAL/WEBHOOK/URL",
      "channel": "#critical-alerts",
      "username": "ERIFY Alerts",
      "icon_emoji": ":rotating_light:",
      "template": {
        "text": "🚨 CRITICAL: {{alert_name}}",
        "attachments": [
          {
            "color": "danger",
            "fields": [
              {
                "title": "Service",
                "value": "{{service}}",
                "short": true
              },
              {
                "title": "Metric",
                "value": "{{metric_value}}",
                "short": true
              },
              {
                "title": "Runbook",
                "value": "<https://docs.erify.com/runbooks/{{runbook_id}}|View Runbook>",
                "short": false
              }
            ]
          }
        ]
      }
    },
    "slack-alerts": {
      "url": "https://hooks.slack.com/services/ALERTS/WEBHOOK/URL", 
      "channel": "#alerts",
      "username": "ERIFY Monitoring",
      "icon_emoji": ":warning:",
      "template": {
        "text": "⚠️ {{alert_name}}",
        "attachments": [
          {
            "color": "warning",
            "fields": [
              {
                "title": "Details",
                "value": "{{alert_description}}",
                "short": false
              }
            ]
          }
        ]
      }
    }
  }
}
```

---

## Implementation Instructions

### 1. Create Alert Queries in Logflare
1. Navigate to Logflare Dashboard → Saved Queries
2. Create each alert query with the provided SQL
3. Test queries to ensure they return expected results
4. Set appropriate time ranges and parameters

### 2. Configure Alert Rules
1. Go to Alerts section in Logflare
2. Create new alert rule for each query
3. Set thresholds and check intervals as specified
4. Configure notification channels

### 3. Set Up Notification Channels
1. Create Slack webhooks for different severity levels
2. Configure email distribution lists
3. Set up SMS alerts for critical issues
4. Test all notification channels

### 4. Create Runbooks
1. Document response procedures for each alert
2. Include troubleshooting steps and escalation paths
3. Link runbooks in alert notifications
4. Regular review and update runbook procedures

### 5. Alert Tuning
1. Monitor alert frequency and false positives
2. Adjust thresholds based on normal operational patterns
3. Implement alert suppression during maintenance
4. Regular review of alert effectiveness

---

## Alert Response Procedures

### Critical Alert Response (< 5 minutes)
1. **Acknowledge** alert in Slack/monitoring system
2. **Assess** impact and scope using dashboard
3. **Escalate** to on-call engineer if needed
4. **Communicate** status updates every 15 minutes
5. **Document** resolution and lessons learned

### Warning Alert Response (< 15 minutes)
1. **Review** alert details and context
2. **Investigate** using related dashboards and logs
3. **Determine** if immediate action is required
4. **Create** ticket for follow-up if needed
5. **Update** alert if threshold adjustment is needed

### Monitoring Alert Response (< 1 hour)
1. **Analyze** trend and historical patterns
2. **Research** potential causes
3. **Document** findings for future reference
4. **Consider** if proactive action is needed
5. **Share** insights with relevant teams

This alert configuration ensures comprehensive monitoring of ERIFY™ OAuth services while minimizing alert fatigue through appropriate thresholds and auto-resolution.