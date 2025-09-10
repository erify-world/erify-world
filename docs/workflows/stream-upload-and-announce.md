# 🎬 ERIFY Stream Upload & Announce Workflow

## Overview

The ERIFY Stream Upload & Announce workflow provides a comprehensive solution for uploading stream content, generating signed URLs, creating thumbnails, and announcing new streams across multiple channels.

## Features

### 🔄 Upload Types
- **URL Upload**: Download content from a remote URL
- **Path Upload**: Use content from a local repository path

### 🔐 Security
- **Signed URLs**: Generate time-limited signed URLs for secure access
- **Content Hashing**: Generate SHA-256 hashes for content integrity
- **Secret Management**: Secure handling of signing secrets and webhook URLs

### 🖼️ Media Processing
- **Thumbnail Generation**: Optional thumbnail creation for video content
- **Content Validation**: Verify content accessibility and format

### 📢 Multi-Channel Announcements
- **Discord Integration**: Announce to Discord channels via webhooks
- **Slack Integration**: Announce to Slack channels via webhooks
- **Configurable Channels**: Specify multiple channels for announcements

### 🧪 Testing & Monitoring
- **Dry-Run Mode**: Test workflow without actual uploads or announcements
- **Upload Polling**: Monitor upload status with automatic retries
- **PR Comments**: Automatic PR comments with workflow results

## Usage

### Manual Trigger (workflow_dispatch)

The workflow can be manually triggered with the following inputs:

```yaml
inputs:
  upload_type: 'url' | 'path'           # Required: Source type
  source_url: string                    # Required if upload_type is 'url'
  source_path: string                   # Required if upload_type is 'path'
  generate_thumbnail: boolean           # Optional: Generate thumbnail
  announcement_channels: string         # Optional: Comma-separated channel list
  dry_run: boolean                      # Optional: Run in dry-run mode
  signing_enabled: boolean              # Optional: Enable URL signing
```

### Automatic Triggers

The workflow automatically runs on:
- **Push to main**: When changes are made to `streams/**` or the workflow file
- **Pull Request**: When PRs target main branch with relevant changes

## Configuration

### Required Secrets

Configure these secrets in your repository:

```yaml
ERIFY_STREAM_BUCKET: 'your-stream-bucket'      # Cloud storage bucket
ERIFY_CDN_DOMAIN: 'cdn.yourdomain.com'         # CDN domain for URLs
ERIFY_SIGNING_SECRET: 'your-signing-secret'    # Secret for URL signing
DISCORD_WEBHOOK: 'https://discord.webhook.url' # Discord webhook URL
SLACK_WEBHOOK: 'https://slack.webhook.url'     # Slack webhook URL
```

### Environment Variables

Default values are provided for:
- `ERIFY_STREAM_BUCKET`: defaults to 'erify-streams'
- `ERIFY_CDN_DOMAIN`: defaults to 'cdn.erifyworld.com'

## Workflow Jobs

### 1. 🔍 validate-inputs
- Validates all input parameters
- Normalizes input values
- Generates unique workflow ID
- Performs accessibility checks for URLs

### 2. 🎬 stream-processing
- Downloads or prepares stream content
- Generates content hash for integrity
- Uploads content to cloud storage
- Creates thumbnails (if enabled)
- Generates signed URLs (if enabled)

### 3. 📊 polling-monitor
- Monitors upload completion status
- Implements retry logic with exponential backoff
- Verifies content accessibility
- Times out after maximum attempts

### 4. 📢 multi-channel-announce
- Formats announcement messages
- Sends notifications to Discord channels
- Sends notifications to Slack channels
- Handles announcement failures gracefully

### 5. 💬 pr-comment
- Updates pull requests with workflow results
- Includes stream URLs and metadata
- Shows workflow status and timestamps
- Only runs for pull request events

### 6. 🧹 cleanup
- Removes temporary files
- Provides workflow summary
- Generates GitHub step summary
- Runs regardless of previous job success

## Examples

### Upload from URL with thumbnail

```yaml
upload_type: 'url'
source_url: 'https://example.com/stream.mp4'
generate_thumbnail: true
announcement_channels: 'general,streams,announcements'
signing_enabled: true
dry_run: false
```

### Upload from repository path

```yaml
upload_type: 'path'
source_path: './streams/my-stream.mp4'
generate_thumbnail: false
announcement_channels: 'streams'
signing_enabled: true
dry_run: false
```

### Dry-run test

```yaml
upload_type: 'url'
source_url: 'https://example.com/test.mp4'
generate_thumbnail: true
announcement_channels: 'testing'
signing_enabled: true
dry_run: true
```

## Output

The workflow generates the following outputs:

- **Stream URL**: Direct URL to the uploaded content
- **Signed URL**: Time-limited signed URL (if enabled)
- **Thumbnail URL**: URL to generated thumbnail (if created)
- **Content Hash**: SHA-256 hash of the uploaded content
- **Workflow ID**: Unique identifier for the workflow run

## Error Handling

The workflow includes comprehensive error handling:

- **Input validation**: Fails early if required inputs are missing
- **Network errors**: Retries failed uploads with exponential backoff
- **Announcement failures**: Logs warnings but doesn't fail the workflow
- **Cleanup**: Always runs cleanup regardless of previous job failures

## Monitoring

Monitor workflow execution through:

- **GitHub Actions UI**: View detailed logs and step results
- **PR Comments**: Automatic updates on pull requests
- **Channel Announcements**: Success notifications in Discord/Slack
- **GitHub Step Summary**: Comprehensive workflow summary

## Security Considerations

- All secrets are properly masked in logs
- Signed URLs have configurable expiration times
- Content hashes ensure integrity verification
- Webhook URLs are kept secure and not logged
- Dry-run mode allows safe testing without actual uploads

## Troubleshooting

### Common Issues

1. **URL not accessible**: Verify the source URL is publicly accessible
2. **Authentication failures**: Check that secrets are properly configured
3. **Webhook failures**: Verify webhook URLs and permissions
4. **Upload timeouts**: Check network connectivity and file sizes

### Debug Mode

Enable dry-run mode to test the workflow without actual uploads:

```yaml
dry_run: true
```

This will simulate all operations and provide detailed logs without making actual changes.