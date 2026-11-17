// PM2 Ecosystem — keeps the server running forever
// Usage: pm2 start ecosystem.config.js

module.exports = {
  apps: [{
    name:        'taanavana',
    script:      'server.js',
    instances:   1,              // increase to 'max' for multi-core
    exec_mode:   'fork',
    watch:       false,
    max_memory_restart: '300M',  // restart if RAM exceeds 300 MB
    env: {
      NODE_ENV: 'development',
      PORT:     5000,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT:     5000,
    },
    // Auto-restart settings
    exp_backoff_restart_delay: 100,
    max_restarts: 20,
    min_uptime:   '5s',
    // Log settings
    log_file:     './logs/combined.log',
    out_file:     './logs/out.log',
    error_file:   './logs/error.log',
    merge_logs:   true,
    time:         true,
  }],
};
