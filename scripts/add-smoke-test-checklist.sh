#!/bin/bash

# Script to manually add ERIFY™ Smoke Test Review Checklist to PR #26
# This script can be run manually to add the checklist comment

if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed or not in PATH"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI. Run 'gh auth login' first."
    exit 1
fi

PR_NUMBER=26
REPO="erify-world/erify-world"

# Read the checklist content
CHECKLIST_CONTENT=$(cat << 'EOF'
# 🟢 ERIFY™ Smoke Test Review Checklist

## 🧪 Workflow Validation
- [ ] **Trigger Configuration** - `workflow_dispatch` allows manual execution
- [ ] **Runner Environment** - Uses `ubuntu-latest` for consistency
- [ ] **Job Naming** - Clear and descriptive job names (`alive`)
- [ ] **Step Structure** - Logical flow from sanity check to secret validation

## 🔐 Secret Management Review
- [ ] **CF_API_TOKEN** - Cloudflare API authentication check implemented
- [ ] **CF_STREAM_SIGNING_KEY** - Cloudflare Stream signing key validation
- [ ] **SLACK_WEBHOOK_URL** - Slack notification endpoint verification
- [ ] **DISCORD_WEBHOOK_URL** - Discord notification endpoint validation
- [ ] **TEAMS_WEBHOOK_URL** - Microsoft Teams notification endpoint check
- [ ] **Non-blocking Design** - Missing secrets reported as notices, not failures

## 🛡️ Security & Best Practices
- [ ] **No Secret Exposure** - Secrets are only checked for presence, never logged
- [ ] **Safe Failure Mode** - Workflow succeeds even with missing secrets
- [ ] **Informative Output** - Clear ✅ indicators for present secrets
- [ ] **Notice Messages** - Appropriate `::notice::` syntax for missing secrets

## 🚀 Deployment Readiness
- [ ] **Workflow File Location** - Correctly placed in `.github/workflows/`
- [ ] **YAML Syntax** - Valid YAML formatting and structure
- [ ] **Manual Testing** - Can be triggered manually for smoke testing
- [ ] **Environment Agnostic** - Works across different deployment contexts

## 📝 Documentation & Maintenance
- [ ] **Clear Purpose** - Workflow serves as health check for ERIFY™ ecosystem
- [ ] **Maintainable Code** - Individual secret checks for easy modification
- [ ] **Descriptive Messaging** - Output clearly indicates GitHub Actions status

---

**Review Status**: ⏳ Pending | ✅ Approved | ❌ Changes Requested

**Reviewer**: <!-- Add reviewer name -->
**Review Date**: <!-- Add review date -->

---

*This checklist was automatically generated for smoke test workflow reviews. Please check off completed items as you review the PR.*
EOF
)

echo "Adding ERIFY™ Smoke Test Review Checklist to PR #${PR_NUMBER}..."

# Check if comment already exists
if gh pr view "$PR_NUMBER" --repo "$REPO" --json comments --jq '.comments[].body' | grep -q "🟢 ERIFY™ Smoke Test Review Checklist"; then
    echo "Checklist comment already exists on PR #${PR_NUMBER}"
    exit 0
fi

# Add the comment
if gh pr comment "$PR_NUMBER" --repo "$REPO" --body "$CHECKLIST_CONTENT"; then
    echo "✅ Successfully added ERIFY™ Smoke Test Review Checklist to PR #${PR_NUMBER}"
else
    echo "❌ Failed to add comment to PR #${PR_NUMBER}"
    exit 1
fi