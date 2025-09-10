# Node.js Cron Scheduler for ERIFY™

This template provides a Node.js-based cron scheduler that mirrors the original behavior using node-cron for schedules, execa to run manage.py commands, optional nice/ionice, and a PID/lock file to emulate flock.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   export PROJECT_ROOT="/var/www/ynr"
   export USE_NICE="1"
   export LOG_LEVEL="info"
   ```

3. **Start the scheduler:**
   ```bash
   npm start
   ```

## Configuration

### Environment Variables

- `PROJECT_ROOT`: Path to your project root (default: `/var/www/ynr`)
- `USE_NICE`: Enable nice/ionice for low priority jobs (default: disabled)
- `LOG_LEVEL`: Logging level (default: `info`)
- `MAILTO`: Optional email for log routing

### File Structure

```
nodejs-cron/
├── package.json     # Dependencies and scripts
├── scheduler.js     # Main scheduler implementation
├── ecosystem.config.js  # PM2 configuration
├── Dockerfile       # Container setup
└── README.md        # This file
```

## Deployment Options

### PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start scheduler.js --name erify-cron

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

### Systemd Service

Create `/etc/systemd/system/erify-cron.service`:

```ini
[Unit]
Description=ERIFY™ Cron Scheduler
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/erify-cron
ExecStart=/usr/bin/node scheduler.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PROJECT_ROOT=/var/www/ynr

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable erify-cron
sudo systemctl start erify-cron
```

### Docker

```bash
# Build image
docker build -t erify-cron .

# Run container
docker run -d \
  --name erify-cron \
  -e PROJECT_ROOT=/var/www/ynr \
  -e USE_NICE=1 \
  -v /var/www/ynr:/var/www/ynr \
  erify-cron
```

## Features

### Lock Management
- Uses `proper-lockfile` to emulate flock behavior
- Prevents overlapping job execution
- Configurable per job with `flockKey` parameter

### Process Priority
- Optional nice/ionice support for low-priority jobs
- Controlled via `USE_NICE` environment variable
- Reduces system impact during heavy operations

### Logging
- Structured logging with Pino
- Configurable log levels
- JSON output for easy parsing and monitoring

### Error Handling
- Graceful handling of command failures
- Lock contention detection and skipping
- Process cleanup on shutdown

## Job Configuration

Each job can be configured with:

```javascript
runManage(['command', '--args'], { 
  nice: true,           // Use nice/ionice
  flockKey: 'job-name'  // Prevent overlapping runs
})
```

## Monitoring

### Health Checks
Add health check endpoint for monitoring:

```javascript
import express from 'express';
const app = express();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.listen(3000);
```

### Log Monitoring
- Use PM2 logs: `pm2 logs erify-cron`
- Forward to external services (Papertrail, CloudWatch)
- Set up alerts for error patterns

## Migration from Crontab

1. **Backup existing crontab:**
   ```bash
   crontab -l > crontab.backup
   ```

2. **Test in parallel:**
   - Run both systems temporarily
   - Compare execution times and outputs
   - Monitor for conflicts

3. **Gradual migration:**
   - Disable old jobs one by one
   - Verify new scheduler handles each job
   - Remove crontab entries after confirmation

## Troubleshooting

### Common Issues

**Lock files not releasing:**
- Check `/tmp/*.lock` files
- Restart scheduler if locks persist
- Ensure proper cleanup on process termination

**Commands not found:**
- Verify `PROJECT_ROOT` path
- Check Python virtual environment path
- Ensure manage.py is executable

**Nice/ionice not working:**
- Verify `USE_NICE=1` is set
- Check user permissions for nice/ionice
- Linux-only feature, not available on other platforms

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm start
```

This provides detailed information about:
- Job scheduling and execution
- Lock acquisition and release
- Command execution and output
- Error details and stack traces