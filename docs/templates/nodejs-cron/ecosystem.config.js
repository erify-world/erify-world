module.exports = {
  apps: [{
    name: 'erify-cron',
    script: 'scheduler.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PROJECT_ROOT: '/var/www/ynr',
      USE_NICE: '1',
      LOG_LEVEL: 'info'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    restart_delay: 5000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};