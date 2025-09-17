# ERIFY™ Datadog Integration Guide

This comprehensive guide covers setup, configuration, validation, and best practices for integrating Datadog with ERIFY™ OAuth monitoring system for real-time alerting and log streaming.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Client Integration](#client-integration)
5. [Monitor Configuration](#monitor-configuration)
6. [Dashboard Creation](#dashboard-creation)
7. [Validation & Testing](#validation--testing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

---

## Overview

Datadog provides comprehensive monitoring, alerting, and observability for ERIFY™ OAuth services. This integration enables:

- **Real-time log streaming** with intelligent sampling
- **Custom metrics** for OAuth performance monitoring
- **Automated alerting** with Slack integration
- **Interactive dashboards** for operational insights
- **APM tracing** for request flow analysis

### Key Benefits
- 🚀 **Non-blocking log streaming** with sampling
- 📊 **Rich dashboards** with custom visualizations
- 🔔 **Intelligent alerting** with automated escalation
- 🔍 **Request tracing** for debugging
- 📈 **Performance monitoring** with SLI/SLO tracking

---

## Prerequisites

### Required Accounts & Access
- **Datadog Account**: Pro or Enterprise plan
- **Datadog API Key**: With logs and metrics write permissions
- **Datadog App Key**: For monitor and dashboard creation
- **Slack Workspace**: For alert notifications
- **Admin Access**: To configure integrations and monitors

### Technical Requirements
- Node.js 16+ for Datadog client
- Network connectivity to Datadog endpoints
- SSL/TLS certificates for secure transmission
- Sufficient bandwidth for log streaming

### Required Information
- Datadog API key and App key
- Slack webhook URLs for notifications
- ERIFY™ service configuration
- Environment and service identifiers

---

## Initial Setup

### Step 1: Datadog Account Configuration

1. **Create Datadog Account**
   ```
   https://app.datadoghq.com/signup
   ```

2. **Generate API Keys**
   - Navigate to Organization Settings → API Keys
   - Create new API key: `erify-oauth-logs`
   - Copy and secure the API key
   - Create App key: `erify-oauth-management`

3. **Configure Log Management**
   - Enable Log Management in Datadog
   - Set up log retention (30+ days recommended)
   - Configure log indexes for ERIFY™ services

### Step 2: Environment Configuration

1. **Set Environment Variables**
   ```bash
   # Required for Datadog client
   export DATADOG_API_KEY="your_datadog_api_key"
   export DATADOG_APP_KEY="your_datadog_app_key"
   export DATADOG_SITE="datadoghq.com"  # or datadoghq.eu
   export DATADOG_ENV="production"
   export DATADOG_SERVICE="erify-oauth"
   export DATADOG_VERSION="1.0.0"
   
   # Optional configurations
   export DATADOG_SAMPLE_RATE="0.1"  # 10% sampling
   export DATADOG_ENABLED="true"
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
   ```

2. **Create Configuration File**
   ```javascript
   // config/datadog.js
   export const datadogConfig = {
     apiKey: process.env.DATADOG_API_KEY,
     hostname: process.env.HOSTNAME || 'erify-oauth-service',
     service: process.env.DATADOG_SERVICE || 'erify-oauth',
     environment: process.env.DATADOG_ENV || 'production',
     version: process.env.DATADOG_VERSION || '1.0.0',
     sampleRate: parseFloat(process.env.DATADOG_SAMPLE_RATE) || 0.1,
     enabled: process.env.DATADOG_ENABLED === 'true',
     flushInterval: 5000, // 5 seconds
     maxBatchSize: 100
   };
   ```

### Step 3: Install Dependencies

```bash
# Install Datadog packages
npm install dd-trace @datadog/browser-logs

# For direct log streaming (alternative)
npm install axios

# For monitoring script dependencies
sudo apt-get update
sudo apt-get install -y curl jq
```

---

## Client Integration

### Step 1: Initialize Datadog Client

1. **Import and Configure the Client**
   ```javascript
   import { datadogClient } from './docs/ops/observability/datadog/datadogClient.js';
   import PIIHelpers from './lib/pii-helpers/piiHelpers.js';
   
   // Initialize with configuration
   const ddClient = new DatadogClient({
     apiKey: process.env.DATADOG_API_KEY,
     service: 'erify-oauth',
     environment: process.env.NODE_ENV,
     sampleRate: 0.1,
     enabled: process.env.DATADOG_ENABLED === 'true'
   });
   ```

2. **Integration with Express.js**
   ```javascript
   import express from 'express';
   import { datadogClient } from './path/to/datadogClient.js';
   
   const app = express();
   
   // Middleware for request tracing
   app.use((req, res, next) => {
     req.correlationId = datadogClient.generateCorrelationId();
     res.on('finish', () => {
       datadogClient.logPerformance('http_request', Date.now() - req.startTime, {
         method: req.method,
         url: req.url,
         status_code: res.statusCode,
         correlation_id: req.correlationId
       });
     });
     req.startTime = Date.now();
     next();
   });
   ```

### Step 2: Implement OAuth Logging

1. **OAuth Success Events**
   ```javascript
   // In your OAuth success handler
   export async function handleOAuthSuccess(provider, userProfile, req) {
     const duration = Date.now() - req.oauthStartTime;
     
     // Log to Datadog with PII protection
     datadogClient.logOAuthSuccess({
       flow: req.oauthFlow,
       provider: provider,
       user_id: userProfile.id,
       duration_ms: duration,
       geo_country: req.geoCountry,
       user_agent: req.get('User-Agent'),
       correlation_id: req.correlationId
     });
     
     // Continue with OAuth flow...
   }
   ```

2. **OAuth Error Events**
   ```javascript
   // In your OAuth error handler
   export async function handleOAuthError(error, provider, req) {
     // Sanitize error details
     const sanitizedError = PIIHelpers.sanitizeObject({
       message: error.message,
       stack: error.stack,
       code: error.code
     });
     
     datadogClient.logOAuthError(sanitizedError, {
       flow: req.oauthFlow,
       provider: provider,
       user_id: req.userId,
       geo_country: req.geoCountry,
       user_agent: req.get('User-Agent'),
       correlation_id: req.correlationId
     });
   }
   ```

3. **Stripe Payment Events**
   ```javascript
   // In your Stripe payment handler
   export async function handleStripePayment(charge, req) {
     try {
       const result = await stripe.charges.create(charge);
       
       datadogClient.log('info', 'Stripe payment successful', {
         event_type: 'stripe_success',
         charge_id: result.id,
         amount: result.amount,
         currency: result.currency,
         correlation_id: req.correlationId
       });
     } catch (error) {
       datadogClient.logStripeError(error, {
         charge_id: charge.id,
         customer_id: charge.customer,
         amount: charge.amount,
         currency: charge.currency,
         correlation_id: req.correlationId
       });
       throw error;
     }
   }
   ```

### Step 3: Configure Graceful Shutdown

```javascript
// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await datadogClient.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await datadogClient.shutdown();
  process.exit(0);
});
```

---

## Monitor Configuration

### Step 1: Run Monitor Creation Script

```bash
# Set required environment variables
export DATADOG_API_KEY="your_api_key"
export DATADOG_APP_KEY="your_app_key"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
export ENVIRONMENT="production"
export SERVICE_NAME="erify-oauth"

# Run the monitor creation script
./docs/ops/observability/datadog/create-datadog-monitors.sh
```

### Step 2: Verify Monitor Creation

1. **Check Datadog Dashboard**
   ```
   https://app.datadoghq.com/monitors/manage
   ```

2. **Verify Monitor Configuration**
   ```bash
   # List created monitors
   curl -X GET \
     "https://api.datadoghq.com/api/v1/monitor" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
     | jq '.[] | select(.name | contains("ERIFY"))'
   ```

### Step 3: Configure Custom Monitors

1. **High Value Transaction Failures**
   ```bash
   curl -X POST \
     "https://api.datadoghq.com/api/v1/monitor" \
     -H "Content-Type: application/json" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
     -d '{
       "name": "ERIFY High Value Transaction Failures",
       "type": "log alert",
       "query": "logs(\"service:erify-oauth event_type:stripe_error amount:>50000\").index(\"main\").rollup(\"count\").by(\"currency\").last(\"10m\") > 3",
       "message": "High value transactions are failing. Immediate investigation required.",
       "tags": ["service:erify-oauth", "team:finance", "severity:high"],
       "options": {
         "notify_audit": false,
         "timeout_h": 0,
         "silenced": {}
       }
     }'
   ```

2. **OAuth Provider Health Check**
   ```bash
   curl -X POST \
     "https://api.datadoghq.com/api/v1/monitor" \
     -H "Content-Type: application/json" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
     -d '{
       "name": "ERIFY OAuth Provider Health Check",
       "type": "metric alert",
       "query": "avg(last_10m):avg:erify.oauth.success_rate{*} by {provider} < 0.85",
       "message": "OAuth provider {{provider.name}} success rate has dropped below 85%",
       "tags": ["service:erify-oauth", "team:integration"],
       "options": {
         "thresholds": {
           "critical": 0.85,
           "warning": 0.9
         }
       }
     }'
   ```

---

## Dashboard Creation

### Step 1: Create Main OAuth Dashboard

1. **Dashboard Configuration**
   ```json
   {
     "title": "ERIFY™ OAuth Monitoring Dashboard",
     "description": "Comprehensive OAuth flow monitoring for ERIFY services",
     "widgets": [
       {
         "definition": {
           "title": "OAuth Success Rate",
           "type": "query_value",
           "requests": [
             {
               "q": "avg:erify.oauth.success_rate{service:erify-oauth}",
               "aggregator": "avg"
             }
           ],
           "custom_unit": "%",
           "precision": 2
         }
       },
       {
         "definition": {
           "title": "Error Rate by Provider",
           "type": "timeseries",
           "requests": [
             {
               "q": "avg:erify.oauth.error_rate{service:erify-oauth} by {provider}",
               "display_type": "line"
             }
           ]
         }
       }
     ],
     "layout_type": "ordered"
   }
   ```

2. **Create Dashboard via API**
   ```bash
   curl -X POST \
     "https://api.datadoghq.com/api/v1/dashboard" \
     -H "Content-Type: application/json" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
     -d @dashboard-config.json
   ```

### Step 2: Key Dashboard Widgets

1. **Success Rate Gauge**
   ```json
   {
     "definition": {
       "title": "Overall OAuth Success Rate",
       "type": "query_value",
       "requests": [
         {
           "q": "avg:erify.oauth.success_rate{service:erify-oauth}",
           "conditional_formats": [
             {
               "comparator": ">=",
               "value": 95,
               "palette": "green_on_white"
             },
             {
               "comparator": "<",
               "value": 90,
               "palette": "red_on_white"
             }
           ]
         }
       ]
     }
   }
   ```

2. **Latency Distribution**
   ```json
   {
     "definition": {
       "title": "OAuth Latency Distribution",
       "type": "distribution",
       "requests": [
         {
           "q": "avg:erify.oauth.duration{service:erify-oauth} by {provider}"
         }
       ]
     }
   }
   ```

3. **Geographic Error Distribution**
   ```json
   {
     "definition": {
       "title": "Errors by Country",
       "type": "geomap",
       "requests": [
         {
           "q": "sum:erify.oauth.errors{service:erify-oauth} by {country_code}",
           "style": {
             "palette": "dog_classic",
             "type": "solid"
           }
         }
       ]
     }
   }
   ```

---

## Validation & Testing

### Step 1: Verify Log Streaming

1. **Generate Test Logs**
   ```javascript
   // Test script for log validation
   import { datadogClient } from './datadogClient.js';
   
   // Test OAuth success
   datadogClient.logOAuthSuccess({
     flow: 'test_flow',
     provider: 'test_provider',
     user_id: 'test_user_123',
     duration_ms: 1500,
     geo_country: 'US',
     correlation_id: 'test-correlation-123'
   });
   
   // Test OAuth error
   datadogClient.logOAuthError(
     { type: 'test_error', code: 'TEST_001', message: 'Test error message' },
     {
       flow: 'test_flow',
       provider: 'test_provider',
       correlation_id: 'test-correlation-123'
     }
   );
   
   console.log('Test logs sent to Datadog');
   ```

2. **Verify in Datadog**
   ```bash
   # Search for test logs
   curl -X GET \
     "https://api.datadoghq.com/api/v1/logs-queries/list" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
     -G \
     --data-urlencode 'query=service:erify-oauth correlation_id:test-correlation-123'
   ```

### Step 2: Test Monitor Alerts

1. **Trigger Test Alert**
   ```javascript
   // Generate error spike to test alerts
   for (let i = 0; i < 15; i++) {
     datadogClient.logOAuthError(
       { type: 'test_spike', code: 'SPIKE_001', message: 'Test alert spike' },
       { provider: 'test', correlation_id: `spike-test-${i}` }
     );
   }
   ```

2. **Verify Alert Delivery**
   - Check Datadog Events stream
   - Verify Slack notifications
   - Test alert auto-resolution

### Step 3: Dashboard Validation

1. **Check Widget Data**
   ```bash
   # Test dashboard API
   curl -X GET \
     "https://api.datadoghq.com/api/v1/dashboard/lists/manual" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY"
   ```

2. **Verify Metrics Flow**
   - Check all widgets display data
   - Verify real-time updates
   - Test time range selection

---

## Best Practices

### Performance Optimization

1. **Sampling Strategy**
   ```javascript
   // Implement intelligent sampling
   class SmartSampler {
     constructor() {
       this.baseSampleRate = 0.1; // 10% base rate
       this.errorSampleRate = 1.0; // 100% for errors
       this.highValueSampleRate = 1.0; // 100% for high-value transactions
     }
     
     shouldSample(logEntry) {
       if (logEntry.event_type === 'oauth_error') {
         return Math.random() < this.errorSampleRate;
       }
       
       if (logEntry.amount && logEntry.amount > 10000) { // $100+
         return Math.random() < this.highValueSampleRate;
       }
       
       return Math.random() < this.baseSampleRate;
     }
   }
   ```

2. **Efficient Batching**
   ```javascript
   // Optimize batch sizes based on network conditions
   const getBatchSize = () => {
     const networkQuality = getNetworkQuality(); // Custom function
     
     switch (networkQuality) {
       case 'high': return 200;
       case 'medium': return 100;
       case 'low': return 50;
       default: return 100;
     }
   };
   ```

### Security Best Practices

1. **API Key Management**
   ```bash
   # Use AWS SSM or similar for key management
   aws ssm put-parameter \
     --name "/erify/production/datadog-api-key" \
     --value "your-api-key" \
     --type "SecureString" \
     --overwrite
   
   # Retrieve in application
   export DATADOG_API_KEY=$(aws ssm get-parameter \
     --name "/erify/production/datadog-api-key" \
     --with-decryption --query 'Parameter.Value' --output text)
   ```

2. **PII Sanitization**
   ```javascript
   // Always sanitize before sending to Datadog
   import PIIHelpers from '../../../lib/pii-helpers/piiHelpers.js';
   
   const sanitizeLogEntry = (logEntry) => {
     return PIIHelpers.sanitizeOAuthLog(logEntry);
   };
   
   // Use in Datadog client
   datadogClient.log('info', 'OAuth event', sanitizeLogEntry(rawLogData));
   ```

### Alert Management

1. **Alert Fatigue Prevention**
   ```javascript
   // Implement alert suppression during maintenance
   const isMaintenanceWindow = () => {
     const now = new Date();
     const hour = now.getUTCHours();
     const day = now.getUTCDay();
     
     // Suppress alerts during weekend maintenance window (Sunday 2-4 AM UTC)
     return day === 0 && hour >= 2 && hour < 4;
   };
   ```

2. **Escalation Policies**
   ```json
   {
     "escalation_policies": [
       {
         "name": "ERIFY Critical Escalation",
         "rules": [
           {
             "escalation_delay_in_minutes": 0,
             "targets": ["slack-critical", "sms-oncall"]
           },
           {
             "escalation_delay_in_minutes": 15,
             "targets": ["email-management", "phone-manager"]
           },
           {
             "escalation_delay_in_minutes": 30,
             "targets": ["email-executive"]
           }
         ]
       }
     ]
   }
   ```

---

## Troubleshooting

### Common Issues

1. **Logs Not Appearing in Datadog**
   ```bash
   # Check API connectivity
   curl -I https://http-intake.logs.datadoghq.com/v1/input/test
   
   # Verify API key permissions
   curl -X GET "https://api.datadoghq.com/api/v1/validate" \
     -H "DD-API-KEY: $DATADOG_API_KEY"
   
   # Check application logs
   tail -f /var/log/erify-oauth/app.log | grep -i datadog
   ```

2. **High Datadog Costs**
   ```javascript
   // Monitor log volume and adjust sampling
   const monitorLogVolume = () => {
     const dailyLogCount = getDailyLogCount(); // Custom function
     const costThreshold = 100000; // logs per day
     
     if (dailyLogCount > costThreshold) {
       // Reduce sample rate
       datadogClient.setSampleRate(0.05); // 5%
       console.warn('High log volume detected, reducing sample rate');
     }
   };
   ```

3. **Monitor Not Triggering**
   ```bash
   # Test monitor query manually
   curl -X POST \
     "https://api.datadoghq.com/api/v1/query" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -d '{
       "query": "avg:erify.oauth.error_rate{service:erify-oauth}",
       "from": "'$(date -d '1 hour ago' +%s)'",
       "to": "'$(date +%s)'"
     }'
   ```

### Performance Issues

1. **High Latency in Log Streaming**
   ```javascript
   // Implement circuit breaker pattern
   class DatadogCircuitBreaker {
     constructor() {
       this.failureCount = 0;
       this.lastFailureTime = null;
       this.timeout = 60000; // 1 minute
       this.threshold = 5;
     }
     
     async send(logs) {
       if (this.isOpen()) {
         console.warn('Circuit breaker open, dropping logs');
         return;
       }
       
       try {
         await this.sendToDatadog(logs);
         this.reset();
       } catch (error) {
         this.recordFailure();
         throw error;
       }
     }
     
     isOpen() {
       return this.failureCount >= this.threshold &&
              (Date.now() - this.lastFailureTime) < this.timeout;
     }
   }
   ```

---

## Maintenance

### Daily Tasks

1. **Monitor Alert Health**
   ```bash
   # Check for alert storm conditions
   curl -X GET \
     "https://api.datadoghq.com/api/v1/events" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -G \
     --data-urlencode 'start='$(date -d '24 hours ago' +%s) \
     --data-urlencode 'end='$(date +%s) \
     --data-urlencode 'tags=service:erify-oauth'
   ```

2. **Review Log Volume**
   ```bash
   # Check daily log ingestion
   curl -X GET \
     "https://api.datadoghq.com/api/v1/usage/logs" \
     -H "DD-API-KEY: $DATADOG_API_KEY" \
     -G \
     --data-urlencode 'start_date='$(date -d '7 days ago' +%Y-%m-%d)
   ```

### Weekly Tasks

1. **Performance Review**
   - Analyze dashboard load times
   - Review alert response times
   - Check log sampling effectiveness

2. **Cost Optimization**
   - Review log volume trends
   - Adjust sampling rates if needed
   - Optimize monitor queries

### Monthly Tasks

1. **Security Review**
   ```bash
   # Rotate API keys
   ./scripts/rotate-datadog-keys.sh
   
   # Review access logs
   curl -X GET \
     "https://api.datadoghq.com/api/v1/logs/config/archives" \
     -H "DD-API-KEY: $DATADOG_API_KEY"
   ```

2. **Configuration Updates**
   - Update monitor thresholds
   - Review dashboard relevance
   - Update escalation policies

---

## Support & Resources

### Documentation
- [Datadog API Documentation](https://docs.datadoghq.com/api/)
- [Datadog Log Management](https://docs.datadoghq.com/logs/)
- [ERIFY™ Monitoring Guide](./monitoring-overview.md)

### Emergency Contacts
- **Critical Issues**: ops@erify.com
- **Datadog Support**: support@datadoghq.com
- **On-call Engineer**: +1-XXX-XXX-XXXX

### Useful Commands
```bash
# Monitor creation script
./docs/ops/observability/datadog/create-datadog-monitors.sh

# Test log streaming
node test-scripts/datadog-log-test.js

# Check monitor status
curl -H "DD-API-KEY: $DATADOG_API_KEY" \
     "https://api.datadoghq.com/api/v1/monitor"
```

This integration guide provides comprehensive coverage for implementing Datadog monitoring with ERIFY™ OAuth services, ensuring robust observability and proactive alerting.