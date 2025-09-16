# Slack Notifications Setup Guide

This guide explains how to set up the GitHub Actions workflow for automated Slack notifications to the #launch-central channel.

## Prerequisites

1. **Slack Workspace Access**: You need admin access to the Slack workspace where #launch-central channel exists.
2. **GitHub Repository Admin Access**: You need admin access to configure repository secrets.

## Step 1: Set up Slack Incoming Webhooks

1. Go to your Slack workspace
2. Navigate to **Apps** → **Manage** → **Custom Integrations**
3. Click on **Incoming WebHooks**
4. Click **Add to Slack**
5. Choose the **#launch-central** channel from the dropdown
6. Click **Add Incoming WebHooks integration**
7. Copy the **Webhook URL** (it will look like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX`)

## Step 2: Configure GitHub Repository Secret

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Set the name as: `SLACK_WEBHOOK_URL`
5. Paste the webhook URL from Step 1 as the value
6. Click **Add secret**

## Step 3: Customize Slack Integration (Optional)

You can customize the webhook integration in Slack:
- **Name**: GitHub Bot (or your preferred name)
- **Icon**: You can upload a custom icon or use an emoji like `:github:`
- **Channel**: Ensure it's set to #launch-central

## What Gets Notified

The workflow will send notifications for:

### 🐛 New Issues
- Triggered when new issues are opened
- Includes issue title, description, author, and direct link
- Red color coding for easy identification

### 🔀 New Pull Requests  
- Triggered when new pull requests are opened
- Includes PR title, description, author, base/head branches, and direct link
- Teal color coding for easy identification

### ✅/❌ Workflow Completions
- Triggered when any workflow completes (success or failure)
- Monitors: Triage, GitHub Pages, and ERIFY Stream workflows
- Includes workflow name, status, branch, commit, and direct link
- Green for success, red for failure

## Testing the Setup

After completing the setup:

1. Create a test issue to verify issue notifications
2. Create a test pull request to verify PR notifications  
3. Push a commit to trigger existing workflows and verify completion notifications

## Troubleshooting

If notifications aren't working:

1. **Check the secret**: Ensure `SLACK_WEBHOOK_URL` is correctly set in repository secrets
2. **Verify webhook URL**: Test the webhook URL directly with a curl command:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message from GitHub Actions"}' \
     YOUR_WEBHOOK_URL
   ```
3. **Check workflow runs**: Go to **Actions** tab to see if the workflow is running and check for any errors
4. **Verify channel**: Ensure the webhook is configured for the correct #launch-central channel

## Security Note

The webhook URL is sensitive information that should be kept secure. Never commit it directly to your repository - always use GitHub Secrets.