# ERIFY™ Observability Infrastructure

Comprehensive observability solution for ERIFY™ OAuth services with Logflare dashboards, Datadog integration, and PII redaction helpers.

## 🎯 Overview

This observability infrastructure provides:

- **📊 Logflare Dashboard configurations** for OAuth flow monitoring
- **🔔 Datadog integration** for real-time alerting and log streaming  
- **🔒 PII Redaction Helpers** for sanitizing OAuth logs
- **📚 Comprehensive documentation** for setup and best practices

## 🚀 Quick Start

### 1. PII Helpers Library
```javascript
import PIIHelpers from './lib/pii-helpers/piiHelpers.js';

// Sanitize OAuth logs
const sanitizedLog = PIIHelpers.sanitizeOAuthLog({
  user_id: 'user123',
  email: 'user@example.com',
  error_message: 'Invalid grant: expired authorization code'
});

// Mask sensitive data
const maskedText = PIIHelpers.maskSensitiveData('Contact: john.doe@company.com');

// Remove sensitive URL parameters
const cleanUrl = PIIHelpers.sanitizeUrl('https://api.com/oauth?access_token=secret123&state=xyz');
```

### 2. Datadog Client
```javascript
import { datadogClient } from './docs/ops/observability/datadog/datadogClient.js';

// Log OAuth success
datadogClient.logOAuthSuccess({
  flow: 'authorization_code',
  provider: 'google',
  user_id: 'user123',
  duration_ms: 1234,
  geo_country: 'US'
});

// Log OAuth error  
datadogClient.logOAuthError(error, {
  flow: 'authorization_code',
  provider: 'google',
  geo_country: 'US'
});

// Log Stripe payment error
datadogClient.logStripeError(error, {
  charge_id: 'ch_123',
  amount: 2999,
  currency: 'usd'
});
```

### 3. Datadog Monitors Setup
```bash
# Set environment variables
export DATADOG_API_KEY="your_api_key"
export DATADOG_APP_KEY="your_app_key"
export SLACK_WEBHOOK_URL="your_slack_webhook"

# Create monitors automatically
./docs/ops/observability/datadog/create-datadog-monitors.sh
```

## 📁 Directory Structure

```
docs/ops/observability/
├── datadog/
│   ├── datadogClient.js           # Non-blocking log streaming client
│   ├── create-datadog-monitors.sh # Automated monitor creation script
│   └── integration-guide.md       # Comprehensive setup guide
├── logflare/
│   ├── saved-queries.md           # Ready-to-use SQL queries
│   ├── dashboard-config.md        # Dashboard layout suggestions
│   ├── alerts-config.md           # Alert configurations
│   └── integration-guide.md       # Setup and validation guide
└── README.md                      # This file

lib/pii-helpers/
├── piiHelpers.js                  # PII redaction utilities
└── package.json                   # Package configuration
```

## 🔧 Components

### Logflare Dashboard Configurations

#### Saved Queries
Ready-to-use SQL queries for:
- **OAuth error trends** - Track error rates over time
- **Latency analysis** - Monitor OAuth performance 
- **Geographic distribution** - View requests by country
- **Success/error rates** - Overall service health metrics
- **Stripe error monitoring** - Payment-specific alerts

#### Dashboard Layout
Organized into four main sections:
- **🟢 Health** - Overall system health and availability
- **🔵 Reliability** - Error rates, latency, and performance
- **🟡 Traffic** - Request volume and geographic distribution  
- **🟠 Operations** - Detailed error analysis and insights

#### Alert Configurations
- **Critical alerts** - Service outages, high error rates
- **Warning alerts** - Performance degradation, provider issues
- **Monitoring alerts** - Traffic anomalies, new error types

### Datadog Integration

#### DatadogClient Features
- **Non-blocking log streaming** with intelligent sampling
- **Automatic PII redaction** for sensitive data protection
- **OAuth-specific logging methods** for common events
- **Correlation ID generation** for request tracing
- **Graceful error handling** to prevent application impact

#### Monitor Automation
- **OAuth service availability** monitoring
- **Stripe payment failure** spike detection
- **High latency alerting** with Slack integration
- **Geographic error distribution** tracking
- **Traffic anomaly detection** with machine learning

### PII Redaction Helpers

#### Security Features
- **Email masking** - Obfuscate email addresses
- **Phone number redaction** - Remove or mask phone numbers
- **Credit card protection** - Detect and mask card numbers
- **URL sanitization** - Remove sensitive query parameters
- **Error message truncation** - Limit sensitive error details
- **User ID hashing** - Hash identifiers for privacy

#### OAuth-Specific Protection
- **Token redaction** - Remove access/refresh tokens
- **Client secret protection** - Mask authentication credentials
- **Session data sanitization** - Clean session identifiers
- **Log safety validation** - Verify logs don't contain PII

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ 
- Datadog account (Pro/Enterprise plan)
- Logflare account (Professional plan)
- Slack workspace (for notifications)

### Environment Configuration
```bash
# Datadog configuration
export DATADOG_API_KEY="your_datadog_api_key"
export DATADOG_APP_KEY="your_datadog_app_key"
export DATADOG_SITE="datadoghq.com"
export DATADOG_ENV="production"
export DATADOG_SERVICE="erify-oauth"

# Logflare configuration  
export LOGFLARE_API_KEY="your_logflare_api_key"
export LOGFLARE_SOURCE_TOKEN="your_source_token"

# Notification configuration
export SLACK_WEBHOOK_URL="your_slack_webhook_url"

# Feature flags
export DATADOG_ENABLED="true"
export LOGFLARE_ENABLED="true"
export PII_REDACTION_ENABLED="true"
```

### Quick Installation
```bash
# Install dependencies
npm install

# Set up Datadog monitors
./docs/ops/observability/datadog/create-datadog-monitors.sh

# Import Logflare queries (manual process)
# Follow: docs/ops/observability/logflare/integration-guide.md
```

## 📊 Dashboard Sections

### Health Section
- Overall OAuth success rate gauge
- Current error rate with trend
- Average response time monitoring
- Active sessions counter

### Reliability Section  
- Top error types analysis
- Provider error comparison
- Latency percentile tracking
- Slow request identification

### Traffic Section
- Request volume timeline
- Geographic distribution map
- Provider usage breakdown
- Device type analysis

### Operations Section
- High error rate countries
- User agent error patterns
- Recent critical errors
- Correlation ID lookup

## 🚨 Alert Types

### Critical Alerts (Immediate Response)
- **OAuth service availability** < 90% success rate
- **Stripe payment failures** > 10 errors/minute
- **Complete service outage** - no successful requests

### Warning Alerts (Investigation Required)
- **High error rate** > 5% sustained
- **High latency** > 5 seconds average
- **Provider-specific failures** > 20% error rate

### Monitoring Alerts (Operational Awareness)
- **Traffic spikes** > 300% increase
- **New error types** detected
- **Revenue impact** > $1000 failed transactions

## 🔒 Security & Compliance

### Data Protection
- **PII redaction** - Automatic sanitization of sensitive data
- **Token masking** - OAuth tokens and secrets protected
- **Error truncation** - Limit exposure of sensitive errors
- **IP masking** - Preserve geo data while protecting privacy

### Compliance Features
- **GDPR compliance** - User data protection and anonymization
- **SOC 2 compliance** - Audit trail and data handling
- **PCI DSS** - Payment card data protection
- **HIPAA considerations** - Healthcare data protection guidelines

## 🎛️ Configuration

### Sampling Rates
```javascript
// Default sampling configuration
const samplingConfig = {
  baseSampleRate: 0.1,        // 10% for normal operations
  errorSampleRate: 1.0,       // 100% for all errors  
  highValueSampleRate: 1.0,   // 100% for $100+ transactions
  criticalSampleRate: 1.0     // 100% for critical events
};
```

### Alert Thresholds
```javascript
// Alert threshold configuration
const alertThresholds = {
  critical: {
    successRate: 0.90,        // 90% success rate
    errorRate: 0.10,          // 10% error rate
    latency: 5000,            // 5 seconds
    stripeErrors: 10          // 10 errors/minute
  },
  warning: {
    successRate: 0.95,        // 95% success rate
    errorRate: 0.05,          // 5% error rate
    latency: 3000,            // 3 seconds
    stripeErrors: 5           // 5 errors/minute
  }
};
```

## 📈 Metrics & KPIs

### Service Level Indicators (SLIs)
- **Availability** - OAuth service uptime percentage
- **Latency** - 95th percentile response time
- **Error Rate** - Percentage of failed OAuth requests
- **Throughput** - Requests per second handled

### Service Level Objectives (SLOs)
- **99.9% availability** - Less than 43 minutes downtime/month
- **<2 second latency** - 95th percentile under 2 seconds
- **<1% error rate** - Less than 1% of requests fail
- **1000 RPS capacity** - Handle 1000 requests per second

### Business Metrics
- **Conversion rate** - OAuth completion percentage
- **Provider performance** - Success rate by OAuth provider
- **Geographic performance** - Success rate by country
- **Revenue impact** - Failed transaction value tracking

## 🔧 Troubleshooting

### Common Issues

#### Logs Not Appearing
```bash
# Check Datadog connectivity
curl -I https://http-intake.logs.datadoghq.com/v1/input/test

# Verify Logflare source
curl -H "X-API-KEY: $LOGFLARE_API_KEY" \
     https://api.logflare.app/sources

# Check application logs
tail -f /var/log/erify-oauth/app.log | grep -E "(datadog|logflare)"
```

#### High Costs
```javascript
// Monitor and adjust sampling rates
if (dailyLogVolume > costThreshold) {
  datadogClient.setSampleRate(0.05); // Reduce to 5%
  console.warn('High volume detected, reducing sample rate');
}
```

#### Alert Fatigue
```javascript
// Implement alert suppression
const isMaintenanceWindow = () => {
  const now = new Date();
  const hour = now.getUTCHours();
  const day = now.getUTCDay();
  
  // Sunday 2-4 AM UTC maintenance window
  return day === 0 && hour >= 2 && hour < 4;
};
```

## 📚 Documentation

- **[Datadog Integration Guide](./docs/ops/observability/datadog/integration-guide.md)** - Complete setup and configuration
- **[Logflare Integration Guide](./docs/ops/observability/logflare/integration-guide.md)** - Dashboard and alert setup
- **[PII Helpers Documentation](./lib/pii-helpers/README.md)** - Security and privacy utilities
- **[Best Practices Guide](./docs/ops/observability/best-practices.md)** - Operational recommendations

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** - `git checkout -b feature/amazing-feature`
3. **Add comprehensive tests** for new functionality
4. **Update documentation** for any changes
5. **Commit changes** - `git commit -m 'Add amazing feature'`
6. **Push to branch** - `git push origin feature/amazing-feature`
7. **Open Pull Request** with detailed description

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🆘 Support

### Emergency Contacts
- **Critical Issues**: ops@erify.com
- **On-call Engineer**: +1-XXX-XXX-XXXX
- **Slack Channel**: #erify-critical-alerts

### Resources
- **Documentation**: https://docs.erify.com/observability
- **Status Page**: https://status.erify.com
- **Developer Community**: https://community.erify.com

---

## 🎉 Key Benefits Summary

✅ **Enhanced Observability** - Comprehensive monitoring across all OAuth flows  
✅ **Improved Security** - Automatic PII redaction and data protection  
✅ **Operational Efficiency** - Automated setup scripts and pre-configured dashboards  
✅ **Proactive Alerting** - Intelligent alerts with Slack integration  
✅ **Cost Optimization** - Intelligent sampling and resource management  
✅ **Compliance Ready** - GDPR, SOC 2, and PCI DSS considerations built-in

Ready for immediate deployment to improve monitoring, debugging, and user experience insights for ERIFY™ OAuth services.