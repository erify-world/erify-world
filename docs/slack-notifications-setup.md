# Slack Notifications Setup for ERIFY World

This document provides instructions for setting up Slack notifications for the ERIFY World repository using GitHub Actions and Slack Incoming Webhooks.

## Overview

The repository now includes three automated Slack notification workflows:

1. **Pull Request Notifications** (`slack-notifications-pr.yml`) - Triggers on PR creation, closure, and reopening
2. **Issue Notifications** (`slack-notifications-issues.yml`) - Triggers on issue creation, closure, and reopening  
3. **Workflow Completion Notifications** (`slack-notifications-workflows.yml`) - Triggers when workflows complete

## Setup Instructions

### 1. Create a Slack App and Incoming Webhook

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Enter app name (e.g., "ERIFY World GitHub Notifications")
4. Select your workspace and click "Create App"

### 2. Enable Incoming Webhooks

1. In your app settings, go to "Incoming Webhooks"
2. Toggle "Activate Incoming Webhooks" to **On**
3. Click "Add New Webhook to Workspace"
4. Select the channel where you want notifications (e.g., `#erify-dev` or `#github-notifications`)
5. Click "Allow"
6. Copy the webhook URL (it will look like `https://hooks.slack.com/services/...`)

### 3. Add Webhook URL to GitHub Repository Secrets

1. Go to your GitHub repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Paste the webhook URL from step 2
6. Click "Add secret"

### 4. Customize Slack Channel (Optional)

You can create a dedicated channel for GitHub notifications:

1. Create a new Slack channel (e.g., `#erify-github`)
2. Repeat steps 2-3 above to add the webhook to this new channel
3. Update the `SLACK_WEBHOOK_URL` secret with the new webhook URL

## Notification Types

### Pull Request Notifications

Triggered when:
- A pull request is opened
- A pull request is closed (merged or not merged)
- A pull request is reopened

Information included:
- PR title and author
- Source and target branches
- Status (opened, merged, closed)
- Direct link to the PR

### Issue Notifications

Triggered when:
- An issue is opened
- An issue is closed
- An issue is reopened

Information included:
- Issue title and reporter
- Issue number and labels
- Status (opened, closed, reopened)
- Direct link to the issue

### Workflow Completion Notifications

Triggered when any of these workflows complete:
- 🧭 Triage
- GitHub Pages
- ERIFY Stream Workflow

Information included:
- Workflow name and status (success, failure, cancelled)
- Branch and triggering user
- Run ID and event type
- Direct link to the workflow run

## Testing the Integration

1. After setting up the webhook URL secret, create a test pull request or issue
2. Check your designated Slack channel for the notification
3. Verify that the message format and links work correctly

## Troubleshooting

### No notifications appearing

1. Verify the `SLACK_WEBHOOK_URL` secret is set correctly
2. Check the webhook URL is still valid in your Slack app settings
3. Ensure the Slack app has permission to post to the target channel

### Workflow not triggering

1. Check the GitHub Actions tab in your repository for any errors
2. Verify the workflow files are in the correct location (`.github/workflows/`)
3. Check that the event types match your testing actions

### Message formatting issues

1. Test the webhook directly using curl or Postman
2. Verify the JSON payload structure in the workflow files
3. Check Slack's Block Kit Builder for message formatting

## Customization

You can customize the notifications by:

1. **Changing notification triggers**: Modify the `on:` section in each workflow file
2. **Updating message content**: Edit the `custom_payload` section in each workflow
3. **Adding more workflows**: Create additional YAML files following the same pattern
4. **Filtering notifications**: Add conditions using the `if:` parameter

## Security Notes

- The webhook URL is stored as a GitHub secret and not exposed in logs
- All workflows include a condition to only run if the webhook URL secret exists
- Consider using environment-specific webhooks for production vs. development

## Support

For issues with this integration:
1. Check GitHub Actions logs for detailed error messages
2. Test webhook connectivity directly through Slack
3. Review Slack app permissions and channel access

---

*This integration enhances team collaboration by providing real-time GitHub activity updates directly in Slack.*