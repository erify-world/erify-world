# ERIFY™ Stream Workflow

## Overview

The ERIFY™ Stream Workflow provides a comprehensive solution for uploading streams to Cloudflare Stream, generating secure JWT tokens for playback, and announcing stream availability across multiple platforms (Slack, Discord, Microsoft Teams) with professional ERIFY™ branding.

## Features

### 🔐 Security & Reliability
- **JWT Token Separation**: Iframe URLs contain only JWT tokens, not full signed HLS URLs
- **Fail-Fast Safety**: All shell scripts use `set -euo pipefail` for immediate error detection
- **Guard Checks**: Early validation prevents workflow execution with missing required secrets
- **Modern Node.js**: Uses `actions/setup-node@v4` with LTS version for stability

### 🔗 Adaptive Integration
- **Teams Card Fallback**: Automatically downgrades from Adaptive Card v1.4 to v1.2 on failures
- **Webhook Validation**: Intelligently skips notification steps when no webhook secrets are configured
- **Conditional Execution**: Only runs relevant jobs based on configuration

### 🎨 Professional Branding
- **ERIFY™ Consistent Branding**: All notifications feature ERIFY™ logos and brand colors
- **Multi-Platform Support**: Slack, Discord, and Microsoft Teams with platform-specific formatting
- **Rich Media**: Embedded thumbnails, action buttons, and branded footers

## Usage

### Manual Trigger

The workflow can be manually triggered via GitHub Actions with the following inputs:

- **stream_file** (required): Path or URL to the stream file to upload
- **stream_title** (required): Display title for the stream
- **require_signed_urls** (optional): Whether to require signed URLs for secure playback

### Automatic Trigger

The workflow automatically runs when:
- Pushing to the `main` branch
- Changes are made to files in the `streams/` directory
- The workflow file itself is modified

## Required Secrets

### Core Functionality
- `CF_STREAM_SIGNING_KEY`: Cloudflare Stream signing key (required only if `require_signed_urls=true`)
- `CF_ACCOUNT_ID`: Cloudflare account ID

### Webhook Notifications (Optional)
- `SLACK_WEBHOOK_URL`: Slack incoming webhook URL
- `DISCORD_WEBHOOK_URL`: Discord webhook URL  
- `TEAMS_WEBHOOK_URL`: Microsoft Teams webhook URL

**Note**: If no webhook secrets are configured, the workflow will skip all notification steps gracefully.

## Workflow Jobs

1. **validate-requirements**: Validates signing keys and webhook configuration
2. **stream-processing**: Handles upload and JWT token generation
3. **notify-slack**: Sends branded Slack notifications
4. **notify-discord**: Sends branded Discord notifications  
5. **notify-teams**: Sends Teams notifications with fallback support
6. **summary**: Generates comprehensive workflow summary

## Error Handling

- **Early Validation**: Fails fast if required secrets are missing
- **Graceful Degradation**: Continues with warnings when optional features are unavailable
- **Comprehensive Logging**: Detailed output for troubleshooting
- **Fallback Mechanisms**: Alternative approaches when primary methods fail

## Testing

Run the included test script to validate the workflow:

```bash
./.github/test-workflow.sh
```

This script validates:
- YAML syntax correctness
- All required components presence
- Proper implementation of security features
- Notification platform configuration
- ERIFY™ branding consistency

## Example Output

The workflow generates:
- **JWT Token**: For secure iframe embedding
- **Signed HLS URL**: For direct video playback
- **Iframe URL**: Ready-to-embed player URL
- **Notifications**: Branded messages across all configured platforms
- **Summary**: Detailed workflow execution report

---

*Powered by ERIFY™ Technologies • [erifyworldwide.com](https://erifyworldwide.com)*