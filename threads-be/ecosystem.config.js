module.exports = {
  apps: [
    {
      name: 'threads-be',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
    },
  ],
};
