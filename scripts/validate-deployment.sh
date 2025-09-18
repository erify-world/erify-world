#!/bin/bash

# ERIFY™ Deployment Validation Script
# Validates deployment readiness for Cloudflare Pages and Workers

set -e

echo "🔥 ERIFY™ Deployment Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation results
VALIDATION_PASSED=true

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅ Found: $1${NC}"
    else
        echo -e "${RED}❌ Missing: $1${NC}"
        VALIDATION_PASSED=false
    fi
}

check_directory() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✅ Found directory: $1${NC}"
    else
        echo -e "${RED}❌ Missing directory: $1${NC}"
        VALIDATION_PASSED=false
    fi
}

check_secret() {
    local secret_name="$1"
    echo -e "${BLUE}🔑 Secret: $secret_name${NC}"
    echo -e "${YELLOW}   ⚠️  Please ensure this is configured in GitHub Secrets${NC}"
}

echo -e "\n${BLUE}📁 Checking file structure...${NC}"
check_file "index.html"
check_file "wrangler.toml"
check_file "package.json"
check_file ".github/workflows/deploy.yaml"
check_directory "styles"
check_directory "components"
check_directory "styleguide"

echo -e "\n${BLUE}🎨 Checking CSS files...${NC}"
check_file "styles/erify-glow-kit.css"

echo -e "\n${BLUE}🔧 Checking Cloudflare Workers setup...${NC}"
check_file "docs/ops/scheduling/cloudflare-workers/wrangler.toml"
check_file "docs/ops/scheduling/cloudflare-workers/src/worker.ts"
check_file "docs/ops/scheduling/cloudflare-workers/package.json"

echo -e "\n${BLUE}📄 Validating HTML files...${NC}"
for html_file in $(find . -name "*.html" -not -path "./node_modules/*"); do
    if grep -q "<!DOCTYPE html>" "$html_file" && grep -q "</html>" "$html_file"; then
        echo -e "${GREEN}✅ Valid HTML: $html_file${NC}"
    else
        echo -e "${RED}❌ Invalid HTML: $html_file${NC}"
        VALIDATION_PASSED=false
    fi
done

echo -e "\n${BLUE}🔐 GitHub Secrets Requirements:${NC}"
check_secret "CLOUDFLARE_API_TOKEN"
check_secret "CLOUDFLARE_ACCOUNT_ID"
check_secret "ERIFY_API_KEY"

echo -e "\n${BLUE}🚀 Deployment URLs:${NC}"
echo -e "${GREEN}📍 Main Site: https://erify-world.pages.dev${NC}"
echo -e "${GREEN}🔄 Cron Workers: https://erify-cron-workers.[account].workers.dev${NC}"

echo -e "\n${BLUE}🔗 Integration Points:${NC}"
echo -e "${GREEN}🌐 Website Links:${NC}"
echo "   - erifyworldwide.com"
echo "   - x.com/erifyteam"
echo "   - youtube.com/@erifyworld"

echo -e "\n${BLUE}⚙️  ERIFY Configuration:${NC}"
if grep -q "ERIFY" wrangler.toml; then
    echo -e "${GREEN}✅ ERIFY branding configured in wrangler.toml${NC}"
else
    echo -e "${YELLOW}⚠️  ERIFY branding not found in wrangler.toml${NC}"
fi

if grep -q "ERIFY" index.html; then
    echo -e "${GREEN}✅ ERIFY branding present in index.html${NC}"
else
    echo -e "${RED}❌ ERIFY branding missing in index.html${NC}"
    VALIDATION_PASSED=false
fi

# Final validation result
echo -e "\n================================"
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}🎉 All validations passed!${NC}"
    echo -e "${GREEN}🚀 Ready for deployment to Cloudflare Pages${NC}"
    echo -e "${GREEN}✨ From the ashes to the stars!${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed. Please fix the issues above.${NC}"
    exit 1
fi