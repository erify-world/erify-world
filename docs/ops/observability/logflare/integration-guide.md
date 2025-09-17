# ERIFY™ Logflare Integration Guide

This comprehensive guide covers setup, configuration, validation, and best practices for integrating Logflare with ERIFY™ OAuth monitoring system.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Dashboard Configuration](#dashboard-configuration)
5. [Alert Setup](#alert-setup)
6. [Validation & Testing](#validation--testing)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## Overview

Logflare provides powerful log aggregation and analysis capabilities for ERIFY™ OAuth flows. This integration enables:

- **Real-time log streaming** from OAuth services
- **Interactive dashboards** for monitoring OAuth health
- **Intelligent alerting** for critical issues
- **Historical analysis** of OAuth patterns and trends

### Key Benefits
- 🔍 **Structured log analysis** with SQL-based queries
- 📊 **Visual dashboards** for operational insights  
- 🚨 **Proactive alerting** for critical issues
- 📈 **Trend analysis** for capacity planning
- 🔗 **Integration** with Slack, email, and other tools

---

## Prerequisites

### Required Accounts & Access
- **Logflare Account**: Professional or Enterprise plan
- **ERIFY™ OAuth Service**: Running with structured logging
- **Slack Workspace**: For alert notifications (optional)
- **Admin Access**: To configure integrations and alerts

### Technical Requirements
- Node.js application with structured JSON logging
- Network connectivity to Logflare endpoints
- SSL/TLS certificates for secure log transmission
- Sufficient log retention policy (recommended: 30+ days)

### Required Information
- Logflare source token
- ERIFY™ service endpoints
- Slack webhook URLs (for notifications)
- OAuth provider configuration details

---

## Initial Setup

### Step 1: Create Logflare Source

1. **Login to Logflare Dashboard**
   ```
   https://logflare.app/dashboard
   ```

2. **Create New Source**
   - Navigate to Sources → "Add Source"
   - Name: `erify-oauth-logs`
   - Description: `ERIFY OAuth flow monitoring logs`
   - Select appropriate retention period (30+ days recommended)

3. **Configure Source Settings**
   ```json
   {
     "name": "erify-oauth-logs",
     "retention_period": 30,
     "structured_logging": true,
     "schema_validation": true,
     "bigquery_export": true
   }
   ```

4. **Copy Source Token**
   - Save the generated source token securely
   - This will be used in your application configuration

### Step 2: Configure Application Logging

1. **Install Logflare Client**
   ```bash
   npm install pino-logflare
   ```

2. **Configure Pino with Logflare Transport**
   ```javascript
   import pino from 'pino';
   
   const logger = pino({
     transport: {
       target: 'pino-logflare',
       options: {
         apikey: process.env.LOGFLARE_API_KEY,
         sourceToken: process.env.LOGFLARE_SOURCE_TOKEN,
         size: 1000,
         endpoint: 'https://api.logflare.app/logs/json'
       }
     }
   });
   ```

3. **Environment Variables**
   ```bash
   # Add to your .env file
   LOGFLARE_API_KEY=your_logflare_api_key
   LOGFLARE_SOURCE_TOKEN=your_source_token
   LOGFLARE_ENABLED=true
   ```

### Step 3: Implement Structured Logging

1. **OAuth Success Logging**
   ```javascript
   logger.info({
     event_type: 'oauth_success',
     provider: 'google',
     oauth_flow: 'authorization_code',
     user_id: hashedUserId,
     duration_ms: 1234,
     geo_country: 'US',
     user_agent: 'Mozilla/5.0...',
     correlation_id: 'req-abc123'
   }, 'OAuth authentication successful');
   ```

2. **OAuth Error Logging**
   ```javascript
   logger.error({
     event_type: 'oauth_error',
     error_type: 'invalid_grant',
     error_code: 'OAUTH_001',
     error_message: 'Authorization code expired',
     provider: 'google',
     oauth_flow: 'authorization_code',
     correlation_id: 'req-abc123'
   }, 'OAuth authentication failed');
   ```

3. **Stripe Error Logging**
   ```javascript
   logger.error({
     event_type: 'stripe_error',
     error_type: 'card_declined',
     error_code: 'STRIPE_001', 
     charge_id: 'ch_abc123',
     amount: 2999,
     currency: 'usd',
     correlation_id: 'req-abc123'
   }, 'Stripe payment failed');
   ```

### Step 4: Verify Log Ingestion

1. **Check Logflare Dashboard**
   - Navigate to your source in Logflare
   - Verify logs are appearing in real-time
   - Check log structure and formatting

2. **Test Log Query**
   ```sql
   SELECT * FROM logflare_logs 
   WHERE service = 'erify-oauth' 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

3. **Validate Log Schema**
   - Ensure all required fields are present
   - Check data types and formatting
   - Verify proper JSON structure

---

## Dashboard Configuration

### Step 1: Import Saved Queries

1. **Download Query Definitions**
   - Use queries from `saved-queries.md`
   - Customize service names and filters as needed

2. **Create Saved Queries in Logflare**
   ```sql
   -- Example: OAuth Error Rate Query
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

### Step 2: Create Dashboard Sections

1. **Health Section**
   - Overall success rate gauge
   - Current error rate
   - Average response time  
   - Active sessions count

2. **Reliability Section**
   - Top error types chart
   - Provider error comparison
   - Latency percentiles
   - Slow request analysis

3. **Traffic Section**
   - Request volume timeline
   - Geographic distribution map
   - Provider usage breakdown
   - Device type analysis

4. **Operations Section**
   - High error rate countries
   - User agent error analysis
   - Recent critical errors
   - Correlation ID lookup

### Step 3: Configure Visualizations

1. **Set Chart Types**
   ```json
   {
     "success_rate": "gauge",
     "error_timeline": "line_chart",
     "geographic_dist": "world_map",
     "error_types": "bar_chart",
     "latency_trends": "area_chart"
   }
   ```

2. **Configure Refresh Intervals**
   - Critical metrics: 30 seconds - 1 minute
   - Performance metrics: 1-2 minutes
   - Analytical views: 5-10 minutes
   - Historical trends: 15+ minutes

3. **Set Time Ranges**
   - Real-time views: Last 1-4 hours
   - Operational views: Last 24 hours  
   - Trend analysis: Last 7-30 days

---

## Alert Setup

### Step 1: Configure Alert Queries

1. **Critical Alerts**
   ```sql
   -- OAuth Service Availability Critical
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

2. **Warning Alerts**
   ```sql
   -- High OAuth Error Rate
   SELECT 
     ROUND(
       COUNT(CASE WHEN event_type = 'oauth_error' THEN 1 END) * 100.0 / COUNT(*), 
       2
     ) as error_rate
   FROM logflare_logs 
   WHERE 
     service = 'erify-oauth'
     AND event_type IN ('oauth_success', 'oauth_error')
     AND timestamp >= NOW() - INTERVAL '10 minutes'
   HAVING error_rate > 5;
   ```

### Step 2: Configure Notification Channels

1. **Slack Integration**
   ```json
   {
     "webhook_url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
     "channel": "#erify-alerts",
     "username": "ERIFY Logflare",
     "icon_emoji": ":rotating_light:"
   }
   ```

2. **Email Notifications**
   ```json
   {
     "recipients": [
       "ops@erify.com",
       "dev@erify.com"
     ],
     "subject_template": "[ERIFY] {{alert_name}} - {{severity}}",
     "include_query_results": true
   }
   ```

### Step 3: Set Alert Thresholds

1. **Critical Thresholds**
   - Success rate < 90%
   - Stripe errors > 10/minute
   - Complete service outage (0 successful requests in 3 minutes)

2. **Warning Thresholds**  
   - Error rate > 5%
   - Average latency > 5 seconds
   - Provider error rate > 20%

3. **Info Thresholds**
   - Traffic spike > 300% of normal
   - New error types detected
   - Revenue impact > $1000/hour

---

## Validation & Testing

### Step 1: Verify Log Ingestion

1. **Check Real-time Logs**
   ```bash
   # Generate test OAuth requests
   curl -X POST https://your-oauth-service/test-auth \
     -H "Content-Type: application/json" \
     -d '{"provider": "test", "flow": "authorization_code"}'
   ```

2. **Validate in Logflare**
   ```sql
   SELECT * FROM logflare_logs 
   WHERE correlation_id = 'test-req-123'
   ORDER BY timestamp DESC;
   ```

### Step 2: Test Dashboard Functionality

1. **Widget Data Population**
   - Verify all widgets show data
   - Check refresh intervals work correctly
   - Ensure proper time range filtering

2. **Interactive Features**
   - Test drill-down capabilities
   - Verify search and filtering
   - Check time range selection

### Step 3: Alert Testing

1. **Trigger Test Alerts**
   ```bash
   # Create artificial error conditions
   curl -X POST https://your-oauth-service/simulate-errors \
     -H "Content-Type: application/json" \
     -d '{"error_rate": 15, "duration": "2m"}'
   ```

2. **Verify Notifications**
   - Check Slack messages are received
   - Verify email notifications
   - Test alert auto-resolution

### Step 4: Performance Validation

1. **Query Performance**
   ```sql
   -- Check query execution times
   EXPLAIN (ANALYZE, COSTS OFF, TIMING ON, BUFFERS OFF) 
   SELECT COUNT(*) FROM logflare_logs 
   WHERE service = 'erify-oauth' 
   AND timestamp >= NOW() - INTERVAL '1 hour';
   ```

2. **Dashboard Load Times**
   - Measure dashboard load performance
   - Check widget refresh times
   - Monitor resource usage

---

## Best Practices

### Logging Best Practices

1. **Structured Data**
   ```javascript
   // Good: Structured fields
   logger.info({
     event_type: 'oauth_success',
     provider: 'google',
     duration_ms: 1234,
     user_id: hashedUserId
   }, 'OAuth success');
   
   // Avoid: Unstructured strings
   logger.info('OAuth success for Google in 1234ms');
   ```

2. **Consistent Field Names**
   - Use snake_case for field names
   - Maintain consistent data types
   - Include correlation IDs for tracing

3. **Appropriate Log Levels**
   - `error`: OAuth failures, payment errors
   - `warn`: High latency, rate limiting
   - `info`: Successful operations, metrics
   - `debug`: Detailed diagnostic information

### Performance Optimization

1. **Query Optimization**
   - Use appropriate time ranges
   - Index frequently queried fields
   - Limit result sets with LIMIT clauses
   - Use aggregate functions efficiently

2. **Dashboard Efficiency**
   - Set reasonable refresh intervals
   - Use cached queries where possible
   - Implement progressive loading for large datasets
   - Optimize widget placement and sizing

3. **Alert Tuning**
   - Set appropriate thresholds to minimize noise
   - Use auto-resolution to reduce alert fatigue
   - Implement alert suppression during maintenance
   - Regular review and adjustment of alert rules

### Security Considerations

1. **PII Protection**
   - Hash user identifiers before logging
   - Redact sensitive parameters from URLs
   - Truncate error messages containing sensitive data
   - Use the PII helpers library for sanitization

2. **Access Control**
   - Implement role-based dashboard access
   - Secure API keys and tokens
   - Regular rotation of credentials
   - Monitor access logs

3. **Data Retention**
   - Set appropriate log retention periods
   - Implement data purging for compliance
   - Secure backup and archival processes
   - Document data handling procedures

---

## Troubleshooting

### Common Issues

1. **Logs Not Appearing**
   ```bash
   # Check network connectivity
   curl -I https://api.logflare.app/health
   
   # Verify source token
   curl -H "X-API-KEY: $LOGFLARE_API_KEY" \
        https://api.logflare.app/sources
   
   # Check application logs for errors
   tail -f /var/log/erify-oauth/app.log | grep logflare
   ```

2. **Query Performance Issues**
   ```sql
   -- Check table statistics
   SELECT 
     table_name,
     row_count,
     size_bytes
   FROM information_schema.table_statistics 
   WHERE table_name = 'logflare_logs';
   
   -- Identify slow queries
   SELECT query, avg_duration 
   FROM query_performance 
   ORDER BY avg_duration DESC 
   LIMIT 10;
   ```

3. **Dashboard Loading Slowly**
   - Reduce time ranges for heavy queries
   - Increase widget refresh intervals
   - Use query result caching
   - Optimize database indexes

4. **Alerts Not Firing**
   ```sql
   -- Test alert query manually
   SELECT * FROM (
     -- Insert alert query here
   ) WHERE condition_met = true;
   ```
   - Check alert configuration
   - Verify notification channel setup
   - Test webhook endpoints

### Debugging Steps

1. **Log Ingestion Issues**
   - Check Logflare source configuration
   - Verify API key and source token
   - Review application logging configuration
   - Monitor network connectivity

2. **Query Problems**
   - Validate SQL syntax
   - Check field names and data types
   - Test with smaller time ranges
   - Use EXPLAIN to analyze query plans

3. **Alert Configuration**
   - Test alert queries manually
   - Verify threshold values
   - Check notification channel configuration
   - Review alert history and logs

---

## Maintenance

### Daily Maintenance

1. **Monitor Alert Health**
   - Review fired alerts and resolutions
   - Check for alert fatigue indicators
   - Verify notification delivery

2. **Dashboard Performance**
   - Monitor query execution times
   - Check widget load performance
   - Review user feedback

### Weekly Maintenance

1. **Query Optimization**
   - Review slow-performing queries
   - Update indexes as needed
   - Optimize dashboard refresh intervals

2. **Threshold Tuning**
   - Analyze alert frequency and accuracy
   - Adjust thresholds based on operational patterns
   - Remove or modify ineffective alerts

### Monthly Maintenance

1. **Capacity Planning**
   - Review log volume trends
   - Plan for retention and storage needs
   - Update resource allocations

2. **Configuration Review**
   - Update dashboard layouts and widgets
   - Review and update saved queries
   - Document configuration changes

### Quarterly Maintenance

1. **Security Review**
   - Rotate API keys and tokens
   - Review access permissions
   - Update security configurations

2. **Performance Analysis**
   - Comprehensive performance review
   - Optimization recommendations
   - Capacity planning updates

---

## Support & Resources

### Documentation
- [Logflare Documentation](https://docs.logflare.app/)
- [ERIFY™ OAuth API Documentation](https://docs.erify.com/oauth)
- [PII Helpers Library](../../../lib/pii-helpers/README.md)

### Community
- [Logflare Discord](https://discord.gg/logflare)
- [ERIFY™ Developer Community](https://community.erify.com)

### Emergency Contacts
- **Critical Issues**: ops@erify.com
- **Logflare Support**: support@logflare.app
- **On-call Engineer**: +1-XXX-XXX-XXXX

This integration guide provides comprehensive coverage for implementing Logflare monitoring with ERIFY™ OAuth services, ensuring robust observability and operational excellence.