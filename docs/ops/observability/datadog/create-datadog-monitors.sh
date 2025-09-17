#!/bin/bash

# ERIFY™ Datadog Monitor Creation Script
# Automates creation of production error condition alerts with Slack integration

set -euo pipefail

# Configuration
DATADOG_API_KEY="${DATADOG_API_KEY:-}"
DATADOG_APP_KEY="${DATADOG_APP_KEY:-}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
ENVIRONMENT="${ENVIRONMENT:-production}"
SERVICE_NAME="${SERVICE_NAME:-erify-oauth}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if [[ -z "$DATADOG_API_KEY" ]]; then
        log_error "DATADOG_API_KEY environment variable is required"
        exit 1
    fi
    
    if [[ -z "$DATADOG_APP_KEY" ]]; then
        log_error "DATADOG_APP_KEY environment variable is required"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        log_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warn "jq is not installed - JSON responses will not be pretty-printed"
    fi
    
    log_success "Prerequisites check passed"
}

# Create Datadog monitor
create_monitor() {
    local monitor_name="$1"
    local query="$2"
    local message="$3"
    local threshold="$4"
    local monitor_type="${5:-metric alert}"
    
    log_info "Creating monitor: $monitor_name"
    
    local json_payload=$(cat <<EOF
{
  "name": "$monitor_name",
  "type": "$monitor_type",
  "query": "$query",
  "message": "$message",
  "tags": ["service:$SERVICE_NAME", "environment:$ENVIRONMENT", "team:erify"],
  "options": {
    "thresholds": {
      "critical": $threshold
    },
    "notify_audit": false,
    "timeout_h": 0,
    "include_tags": true,
    "no_data_timeframe": 10,
    "require_full_window": false,
    "new_host_delay": 300,
    "notify_no_data": false,
    "renotify_interval": 0,
    "escalation_message": "",
    "silenced": {}
  },
  "priority": 3
}
EOF
    )
    
    local response=$(curl -s -X POST \
        "https://api.datadoghq.com/api/v1/monitor" \
        -H "Content-Type: application/json" \
        -H "DD-API-KEY: $DATADOG_API_KEY" \
        -H "DD-APPLICATION-KEY: $DATADOG_APP_KEY" \
        -d "$json_payload")
    
    if command -v jq &> /dev/null; then
        echo "$response" | jq .
    else
        echo "$response"
    fi
    
    local monitor_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2 || echo "")
    
    if [[ -n "$monitor_id" ]]; then
        log_success "Monitor created with ID: $monitor_id"
        return 0
    else
        log_error "Failed to create monitor: $monitor_name"
        return 1
    fi
}

# Create OAuth error spike monitor
create_oauth_error_monitor() {
    local monitor_name="ERIFY OAuth Error Rate Spike"
    local query="avg(last_5m):rate(sum:erify.oauth.errors{service:$SERVICE_NAME,environment:$ENVIRONMENT} by {provider}.as_rate()) > 0.1"
    local message="🚨 **ERIFY OAuth Error Rate Alert** 🚨

OAuth errors have spiked above 10% in the last 5 minutes.

**Service**: $SERVICE_NAME
**Environment**: $ENVIRONMENT
**Threshold**: >10% error rate

Please investigate immediately:
1. Check OAuth provider status
2. Review recent deployments
3. Check application logs

{{#is_alert}}
@slack-$SLACK_WEBHOOK_URL
{{/is_alert}}

**Runbook**: https://docs.erify.com/runbooks/oauth-errors"
    
    create_monitor "$monitor_name" "$query" "$message" 0.1
}

# Create Stripe error monitor
create_stripe_error_monitor() {
    local monitor_name="ERIFY Stripe Error Rate Alert"
    local query="avg(last_10m):rate(sum:erify.stripe.errors{service:$SERVICE_NAME,environment:$ENVIRONMENT}.as_rate()) > 0.05"
    local message="💳 **ERIFY Stripe Error Alert** 💳

Stripe payment errors are elevated (>5%) in the last 10 minutes.

**Service**: $SERVICE_NAME
**Environment**: $ENVIRONMENT
**Threshold**: >5% error rate

Immediate actions required:
1. Check Stripe dashboard
2. Verify webhook endpoints
3. Review payment flow logs

{{#is_alert}}
@slack-$SLACK_WEBHOOK_URL
{{/is_alert}}

**Runbook**: https://docs.erify.com/runbooks/stripe-errors"
    
    create_monitor "$monitor_name" "$query" "$message" 0.05
}

# Create high latency monitor
create_latency_monitor() {
    local monitor_name="ERIFY OAuth High Latency Alert"
    local query="avg(last_10m):avg:erify.oauth.duration{service:$SERVICE_NAME,environment:$ENVIRONMENT} > 5000"
    local message="⏱️ **ERIFY OAuth Latency Alert** ⏱️

OAuth flow latency is above 5 seconds average over the last 10 minutes.

**Service**: $SERVICE_NAME
**Environment**: $ENVIRONMENT
**Threshold**: >5000ms average latency

Investigation steps:
1. Check database performance
2. Review external API latencies
3. Analyze application performance metrics

{{#is_alert}}
@slack-$SLACK_WEBHOOK_URL
{{/is_alert}}

**Dashboard**: https://app.datadoghq.com/dashboard/erify-oauth"
    
    create_monitor "$monitor_name" "$query" "$message" 5000
}

# Create service availability monitor
create_availability_monitor() {
    local monitor_name="ERIFY OAuth Service Availability"
    local query="avg(last_5m):avg:erify.oauth.success_rate{service:$SERVICE_NAME,environment:$ENVIRONMENT} < 0.95"
    local message="🔴 **ERIFY OAuth Service Availability Critical** 🔴

OAuth service availability has dropped below 95%.

**Service**: $SERVICE_NAME
**Environment**: $ENVIRONMENT
**Threshold**: <95% success rate

CRITICAL: Immediate attention required!
1. Check service health endpoints
2. Verify infrastructure status
3. Escalate to on-call engineer

{{#is_alert}}
@slack-$SLACK_WEBHOOK_URL @here
{{/is_alert}}

**Status Page**: https://status.erify.com"
    
    create_monitor "$monitor_name" "$query" "$message" 0.95
}

# Create anomaly detection monitor
create_anomaly_monitor() {
    local monitor_name="ERIFY OAuth Traffic Anomaly Detection"
    local query="avg(last_4h):anomalies(avg:erify.oauth.requests{service:$SERVICE_NAME,environment:$ENVIRONMENT}, 'basic', 2, direction='both', alert_window='last_15m', interval=60, count_default_zero='true') >= 1"
    local message="📊 **ERIFY OAuth Traffic Anomaly Detected** 📊

Unusual OAuth traffic patterns detected.

**Service**: $SERVICE_NAME
**Environment**: $ENVIRONMENT
**Detection**: Anomaly in request volume

This may indicate:
- Traffic spikes or drops
- DDoS attacks
- Marketing campaigns
- Service issues

{{#is_alert}}
@slack-$SLACK_WEBHOOK_URL
{{/is_alert}}

**Analysis**: https://app.datadoghq.com/dashboard/erify-oauth-traffic"
    
    create_monitor "$monitor_name" "$query" "$message" 1 "query alert"
}

# Main execution
main() {
    log_info "🚀 Starting ERIFY Datadog Monitor Setup"
    log_info "Service: $SERVICE_NAME | Environment: $ENVIRONMENT"
    
    check_prerequisites
    
    log_info "Creating production monitoring alerts..."
    
    # Create all monitors
    create_oauth_error_monitor
    sleep 2
    
    create_stripe_error_monitor
    sleep 2
    
    create_latency_monitor
    sleep 2
    
    create_availability_monitor
    sleep 2
    
    create_anomaly_monitor
    
    log_success "✅ All ERIFY Datadog monitors created successfully!"
    log_info "🔗 View your monitors at: https://app.datadoghq.com/monitors/manage"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        log_info "💬 Slack notifications configured for webhook: $SLACK_WEBHOOK_URL"
    else
        log_warn "💬 No Slack webhook configured - alerts will only appear in Datadog"
    fi
}

# Script usage information
usage() {
    cat << EOF
ERIFY™ Datadog Monitor Setup Script

USAGE:
    $0 [OPTIONS]

ENVIRONMENT VARIABLES:
    DATADOG_API_KEY      Datadog API key (required)
    DATADOG_APP_KEY      Datadog application key (required)
    SLACK_WEBHOOK_URL    Slack webhook for notifications (optional)
    ENVIRONMENT          Target environment (default: production)
    SERVICE_NAME         Service name (default: erify-oauth)

EXAMPLES:
    # Basic setup
    export DATADOG_API_KEY="your-api-key"
    export DATADOG_APP_KEY="your-app-key"
    $0

    # With Slack notifications
    export DATADOG_API_KEY="your-api-key"
    export DATADOG_APP_KEY="your-app-key"
    export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
    $0

    # For staging environment
    export ENVIRONMENT="staging"
    $0

EOF
}

# Handle command line arguments
case "${1:-}" in
    -h|--help)
        usage
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac