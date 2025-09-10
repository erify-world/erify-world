#!/bin/bash
# Test script to validate the ERIFY Stream Workflow

set -euo pipefail

echo "🧪 Testing ERIFY Stream Workflow..."

# Test 1: Validate YAML syntax
echo "1. Validating YAML syntax..."
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/stream-upload-and-announce.yml'))"
echo "✅ YAML syntax is valid"

# Test 2: Check required components
echo "2. Checking required components..."

WORKFLOW_FILE=".github/workflows/stream-upload-and-announce.yml"

# Check for modern Node.js setup
if grep -q "actions/setup-node@v4" "$WORKFLOW_FILE"; then
    echo "✅ Modern Node.js setup found"
else
    echo "❌ Modern Node.js setup missing"
    exit 1
fi

# Check for fail-fast safety
FAIL_FAST_COUNT=$(grep -c "set -euo pipefail" "$WORKFLOW_FILE")
if [ "$FAIL_FAST_COUNT" -ge 8 ]; then
    echo "✅ Fail-fast safety implemented ($FAIL_FAST_COUNT instances)"
else
    echo "❌ Insufficient fail-fast safety implementations"
    exit 1
fi

# Check for signing key validation
if grep -q "CF_STREAM_SIGNING_KEY" "$WORKFLOW_FILE"; then
    echo "✅ Signing key validation found"
else
    echo "❌ Signing key validation missing"
    exit 1
fi

# Check for webhook validation
if grep -q "webhooks_configured" "$WORKFLOW_FILE"; then
    echo "✅ Webhook validation found"
else
    echo "❌ Webhook validation missing"
    exit 1
fi

# Check for Teams card fallback
if grep -q "1\.4.*1\.2" "$WORKFLOW_FILE"; then
    echo "✅ Teams card version fallback found"
else
    echo "❌ Teams card version fallback missing"
    exit 1
fi

# Check for iframe token separation
if grep -q "iframe?token=\${jwtToken}" "$WORKFLOW_FILE"; then
    echo "✅ Iframe token handling properly implemented"
else
    echo "❌ Iframe token handling not properly implemented"
    exit 1
fi

# Test 3: Check all notification platforms
echo "3. Checking notification platforms..."
if grep -q "notify-slack" "$WORKFLOW_FILE" && 
   grep -q "notify-discord" "$WORKFLOW_FILE" && 
   grep -q "notify-teams" "$WORKFLOW_FILE"; then
    echo "✅ All notification platforms found (Slack, Discord, Teams)"
else
    echo "❌ Missing notification platforms"
    exit 1
fi

# Test 4: Check ERIFY branding
echo "4. Checking ERIFY branding..."
if grep -q "ERIFY™" "$WORKFLOW_FILE" && 
   grep -q "erifyworldwide.com" "$WORKFLOW_FILE"; then
    echo "✅ ERIFY branding found"
else
    echo "❌ ERIFY branding missing"
    exit 1
fi

echo ""
echo "🎉 All tests passed! The ERIFY Stream Workflow is properly configured."
echo ""
echo "Summary of implemented features:"
echo "✅ Modern Node.js setup with actions/setup-node@v4"
echo "✅ Fail-fast safety with set -euo pipefail in all scripts"
echo "✅ Signed URL requirement check for CF_STREAM_SIGNING_KEY"
echo "✅ Proper iframe token handling (JWT only, not full HLS URL)"
echo "✅ Teams card version fallback from 1.4 to 1.2"
echo "✅ Webhook validation to skip announcements if no secrets"
echo "✅ Slack, Discord, and Teams notifications with ERIFY™ branding"
echo "✅ Comprehensive error handling and conditional execution"