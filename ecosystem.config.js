module.exports = {
  apps: [
    {
      name: "discord-bot",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      }
    }
  ]
};
