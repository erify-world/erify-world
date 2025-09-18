#!/bin/bash

# ERIFY™ Azure Template Validation Script
# Validate ARM templates and Bicep files

set -e

echo "🔍 ERIFY™ Template Validation"
echo "⚡ From the ashes to the stars ✨"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR"

validate_json() {
    local file="$1"
    if python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "✅ $file - JSON syntax valid"
        return 0
    else
        echo "❌ $file - JSON syntax invalid"
        return 1
    fi
}

validate_bicep() {
    local file="$1"
    if command -v az &> /dev/null; then
        if az bicep build --file "$file" --stdout > /dev/null 2>&1; then
            echo "✅ $file - Bicep syntax valid"
            return 0
        else
            echo "❌ $file - Bicep syntax invalid"
            return 1
        fi
    else
        echo "⚠️  $file - Azure CLI not available, skipping Bicep validation"
        return 0
    fi
}

# Validate all JSON files
echo "🔧 Validating ARM templates..."
failed=0

find "$TEMPLATE_DIR" -name "*.json" -type f | while read -r file; do
    if ! validate_json "$file"; then
        failed=1
    fi
done

# Validate all Bicep files
echo ""
echo "🔧 Validating Bicep templates..."

find "$TEMPLATE_DIR" -name "*.bicep" -type f | while read -r file; do
    if ! validate_bicep "$file"; then
        failed=1
    fi
done

echo ""
if [ $failed -eq 0 ]; then
    echo "🎉 All ERIFY™ templates validated successfully!"
    echo "💎 Ready for luxury deployment!"
else
    echo "💥 Some templates failed validation"
    exit 1
fi