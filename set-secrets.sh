#!/bin/bash

# ERIFY™ Worker Secrets Setup Script
# Production-ready secrets management for Cloudflare Workers
# Usage: ./set-secrets.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Banner
echo -e "${BLUE}"
echo "██████╗ ███████╗██████╗ ██╗███████╗██╗   ██╗"
echo "██╔══██╗██╔════╝██╔══██╗██║██╔════╝╚██╗ ██╔╝"
echo "██████╔╝█████╗  ██████╔╝██║█████╗   ╚████╔╝ "
echo "██╔══██╗██╔══╝  ██╔══██╗██║██╔══╝    ╚██╔╝  "
echo "██████╔╝███████╗██║  ██║██║██║        ██║   "
echo "╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   "
echo ""
echo "ERIFY™ Worker Secrets Setup"
echo "Environment: $ENVIRONMENT"
echo -e "${NC}"

# Check prerequisites
echo -e "${GREEN}Checking prerequisites...${NC}"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Please install it first:${NC}"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in to Cloudflare. Please login first:${NC}"
    echo "wrangler login"
    exit 1
fi

# Check if wrangler.toml exists
if [[ ! -f "$SCRIPT_DIR/wrangler.toml" ]]; then
    echo -e "${RED}❌ wrangler.toml not found in $SCRIPT_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Function to generate secure random string
generate_secret() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Function to prompt for secret with optional generation
prompt_secret() {
    local secret_name=$1
    local description=$2
    local can_generate=${3:-true}
    local min_length=${4:-16}
    
    echo -e "${YELLOW}Setting up: $secret_name${NC}"
    echo "Description: $description"
    
    if [[ "$can_generate" == "true" ]]; then
        echo -e "${BLUE}Options:${NC}"
        echo "  1. Enter your own value"
        echo "  2. Generate secure random value"
        echo "  3. Skip this secret"
        echo ""
        read -p "Choose option (1-3): " choice
        
        case $choice in
            1)
                read -s -p "Enter $secret_name: " secret_value
                echo ""
                ;;
            2)
                secret_value=$(generate_secret 64)
                echo -e "${GREEN}Generated secure random value${NC}"
                ;;
            3)
                echo -e "${YELLOW}Skipped $secret_name${NC}"
                return 0
                ;;
            *)
                echo -e "${RED}Invalid choice${NC}"
                return 1
                ;;
        esac
    else
        read -s -p "Enter $secret_name: " secret_value
        echo ""
    fi
    
    # Validate minimum length
    if [[ ${#secret_value} -lt $min_length ]]; then
        echo -e "${RED}❌ Secret too short (minimum $min_length characters)${NC}"
        return 1
    fi
    
    # Set the secret
    echo "Setting secret in Cloudflare..."
    if echo "$secret_value" | wrangler secret put "$secret_name" --env "$ENVIRONMENT"; then
        echo -e "${GREEN}✅ $secret_name set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set $secret_name${NC}"
        return 1
    fi
    
    echo ""
    return 0
}

# Function to verify secrets
verify_secrets() {
    echo -e "${GREEN}Verifying secrets...${NC}"
    
    # List all secrets (this will show which ones are set)
    echo "Current secrets for environment '$ENVIRONMENT':"
    wrangler secret list --env "$ENVIRONMENT" || true
    echo ""
}

# Main setup process
echo -e "${BLUE}Starting secrets setup for environment: $ENVIRONMENT${NC}"
echo ""

# Required secrets setup
echo -e "${GREEN}=== Required Secrets ===${NC}"

# ERIFY_API_SECRET - HMAC secret for request verification
prompt_secret "ERIFY_API_SECRET" \
    "HMAC secret for request signature verification. Used to ensure requests are authentic and haven't been tampered with." \
    true 32

# JWT_SECRET - JWT signing secret
prompt_secret "JWT_SECRET" \
    "Secret for signing and verifying JWT tokens. Keep this secure and never share it." \
    true 32

echo -e "${GREEN}=== Optional Secrets ===${NC}"

# WEBHOOK_SECRET - For webhook verification
echo -e "${YELLOW}Do you want to set up webhook secrets? (y/n)${NC}"
read -p "Setup webhooks: " setup_webhooks

if [[ "$setup_webhooks" =~ ^[Yy]$ ]]; then
    prompt_secret "WEBHOOK_SECRET" \
        "Secret for verifying incoming webhooks from external services." \
        true 32
fi

# EXTERNAL_API_KEY - For external service integrations
echo -e "${YELLOW}Do you have external API integrations? (y/n)${NC}"
read -p "Setup external APIs: " setup_external

if [[ "$setup_external" =~ ^[Yy]$ ]]; then
    prompt_secret "EXTERNAL_API_KEY" \
        "API key for external service integrations (payment processors, analytics, etc.)." \
        false 16
fi

# MONITORING_API_KEY - For monitoring and alerting
echo -e "${YELLOW}Do you want to set up monitoring integrations? (y/n)${NC}"
read -p "Setup monitoring: " setup_monitoring

if [[ "$setup_monitoring" =~ ^[Yy]$ ]]; then
    prompt_secret "MONITORING_API_KEY" \
        "API key for monitoring services (DataDog, New Relic, etc.)." \
        false 16
fi

# Database encryption key (for sensitive data at rest)
echo -e "${YELLOW}Do you want to set up database encryption? (y/n)${NC}"
read -p "Setup database encryption: " setup_encryption

if [[ "$setup_encryption" =~ ^[Yy]$ ]]; then
    prompt_secret "DB_ENCRYPTION_KEY" \
        "Key for encrypting sensitive data in the database." \
        true 32
fi

# Verify all secrets
verify_secrets

# Create secrets documentation
create_secrets_doc() {
    local doc_file="$SCRIPT_DIR/SECRETS.md"
    
    cat > "$doc_file" << EOF
# ERIFY™ Worker Secrets Documentation

Generated on: $(date)
Environment: $ENVIRONMENT

## Required Secrets

### ERIFY_API_SECRET
- **Purpose**: HMAC secret for request signature verification
- **Length**: 64 characters
- **Rotation**: Every 90 days recommended
- **Usage**: Validates incoming requests to prevent tampering

### JWT_SECRET
- **Purpose**: JWT token signing and verification
- **Length**: 64 characters
- **Rotation**: Every 180 days recommended
- **Usage**: Signs and verifies authentication tokens

## Optional Secrets

### WEBHOOK_SECRET
- **Purpose**: Webhook signature verification
- **Length**: 64 characters
- **Usage**: Validates incoming webhooks from external services

### EXTERNAL_API_KEY
- **Purpose**: External service API authentication
- **Length**: Variable
- **Usage**: Authenticates with payment processors, analytics services

### MONITORING_API_KEY
- **Purpose**: Monitoring service integration
- **Length**: Variable
- **Usage**: Sends metrics and alerts to monitoring platforms

### DB_ENCRYPTION_KEY
- **Purpose**: Database field encryption
- **Length**: 64 characters
- **Usage**: Encrypts sensitive data stored in D1 database

## Security Best Practices

1. **Rotation Schedule**
   - HMAC secrets: Every 90 days
   - JWT secrets: Every 180 days
   - API keys: As required by service provider

2. **Access Control**
   - Limit Cloudflare dashboard access
   - Use environment-specific secrets
   - Regular access audits

3. **Monitoring**
   - Monitor secret usage in logs
   - Set up alerts for authentication failures
   - Track secret rotation dates

4. **Backup & Recovery**
   - Maintain secure backup of secrets
   - Document secret recovery procedures
   - Test recovery process regularly

## Management Commands

\`\`\`bash
# List current secrets
wrangler secret list --env $ENVIRONMENT

# Update a secret
wrangler secret put SECRET_NAME --env $ENVIRONMENT

# Delete a secret
wrangler secret delete SECRET_NAME --env $ENVIRONMENT

# Bulk update secrets
./set-secrets.sh $ENVIRONMENT
\`\`\`

## Environment-Specific Notes

### Development
- Use shorter secrets for convenience
- Regular rotation not critical
- Can use generated test values

### Staging
- Mirror production security practices
- Use separate secrets from production
- Regular testing of rotation procedures

### Production
- Maximum security requirements
- Strict rotation schedule
- Comprehensive monitoring and alerting

---

⚠️ **SECURITY WARNING**: Never commit secrets to version control or share them in plain text.
EOF

    echo -e "${GREEN}✅ Secrets documentation created: $doc_file${NC}"
}

# Create environment-specific configuration
create_env_config() {
    local config_file="$SCRIPT_DIR/.env.$ENVIRONMENT.example"
    
    cat > "$config_file" << EOF
# ERIFY™ Worker Environment Configuration
# Example environment variables for $ENVIRONMENT

# Database Configuration
DATABASE_URL=your-d1-database-url

# External Services
PAYMENT_PROCESSOR_URL=https://api.payment-provider.com
ANALYTICS_ENDPOINT=https://analytics.service.com

# Feature Flags
ENABLE_RATE_LIMITING=true
ENABLE_TELEMETRY=true
ENABLE_SECURITY_LOGGING=true

# Performance Settings
MAX_REQUEST_SIZE=1048576  # 1MB
TIMEOUT_SECONDS=30
CACHE_TTL_SECONDS=300

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
HEALTH_CHECK_INTERVAL=300

# Security Settings
CORS_ORIGINS=https://erify.world,https://app.erify.world
ALLOWED_USER_AGENTS=erify-app/*,curl/*
MAX_LOGIN_ATTEMPTS=5

# Note: Actual secrets should be set via 'wrangler secret put'
# Never put real secrets in this file
EOF

    echo -e "${GREEN}✅ Environment configuration example created: $config_file${NC}"
}

# Generate final documentation
echo -e "${BLUE}Generating documentation...${NC}"
create_secrets_doc
create_env_config

# Final summary
echo -e "${GREEN}"
echo "================================================"
echo "🎉 ERIFY™ Worker Secrets Setup Complete!"
echo "================================================"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Secrets configured for Cloudflare Workers"
echo ""
echo "Next steps:"
echo "1. Review SECRETS.md for security best practices"
echo "2. Set up secret rotation reminders"
echo "3. Configure monitoring for authentication failures"
echo "4. Test your worker deployment"
echo ""
echo "Useful commands:"
echo "  wrangler secret list --env $ENVIRONMENT"
echo "  make deploy WRANGLER_ENV=$ENVIRONMENT"
echo "  wrangler tail --env $ENVIRONMENT"
echo ""
echo "Security reminders:"
echo "- Never commit secrets to version control"
echo "- Rotate secrets regularly"
echo "- Monitor for unauthorized access"
echo "- Keep this script and documentation secure"
echo -e "${NC}"

# Cleanup function
cleanup() {
    # Clear any temporary variables
    unset secret_value
    echo -e "${YELLOW}Cleanup complete${NC}"
}

# Set trap for cleanup on exit
trap cleanup EXIT

echo -e "${GREEN}Setup completed successfully! 🚀${NC}"