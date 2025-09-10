# Node.js Cron Template

Why this works: mirrors original behavior; uses node-cron for schedules, execa to run manage.py, optional nice/ionice, and a PID/lock file to emulate flock.

## Files

1. **package.json** - Dependencies for the cron scheduler
2. **scheduler.js** - Main scheduler implementation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Set these environment variables:

```bash
export PROJECT_ROOT="/var/www/ynr"              # Path to your Django project
export USE_NICE="1"                             # Enable nice/ionice (Linux only)
export LOG_LEVEL="info"                         # Pino log level
export MAILTO="admin@example.com"               # Optional (for reference)
```

### 3. Run with PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the scheduler
pm2 start scheduler.js --name erify-cron

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 4. Alternative: Systemd Service

Create `/etc/systemd/system/erify-cron.service`:

```ini
[Unit]
Description=ERIFY Cron Scheduler
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/your/scheduler
Environment=NODE_ENV=production
Environment=PROJECT_ROOT=/var/www/ynr
Environment=USE_NICE=1
ExecStart=/usr/bin/node scheduler.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl enable erify-cron
sudo systemctl start erify-cron
```

## Features

- **Process Locking**: Uses `proper-lockfile` to emulate flock behavior
- **Nice/Ionice**: Optional low-priority execution for resource-intensive tasks
- **Structured Logging**: Uses Pino for JSON-structured logs
- **Error Handling**: Graceful error handling with logging
- **PM2 Integration**: Ready for production deployment with PM2

## Monitoring

### Check Status

```bash
pm2 status
pm2 logs erify-cron
```

### Log Forwarding

Configure PM2 to forward logs to your monitoring system:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Notes

- **MAILTO**: Not a cron concept here. Use PM2 log forwarding, Papertrail, or a Pino transport to email/Slack if needed.
- **USE_NICE=1**: Enables nice/ionice (Linux only).
- **proper-lockfile**: Emulates flock to prevent job overlap.
- **Timezone**: Uses system timezone. For specific timezone, set `TZ` environment variable.