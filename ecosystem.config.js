module.exports = {
  apps: [
    {
      name: "FC-Admin",
      script: "./bin/www",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development"
      },
      env_production: {
        NODE_ENV: "production"
      }
    }
  ],

  deploy: {
    production: {
      key: "~/.ssh/orangenamu.pem",
      user: "ec2-user",
      host: "ec2-52-78-125-228.ap-northeast-2.compute.amazonaws.com",
      ref: "origin/master",
      repo: "git@github.com:Parkseokje/FC-Admin.git",
      path: "/home/ec2-user/FC-backoffice",
      "pre-deploy": "git reset --hard",
      "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};
