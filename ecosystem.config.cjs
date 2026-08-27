/** @type {import('pm2').StartOptions[]} */
const apps = [
  {
    name: "ai-content-web",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 3000",
    cwd: __dirname,
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
    },
    max_memory_restart: "512M",
    error_file: "./logs/web-error.log",
    out_file: "./logs/web-out.log",
    merge_logs: true,
    time: true,
  },
  {
    name: "ai-content-worker",
    script: "node_modules/.bin/tsx",
    args: "src/workers/script-worker.ts",
    cwd: __dirname,
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
    },
    max_memory_restart: "512M",
    error_file: "./logs/worker-error.log",
    out_file: "./logs/worker-out.log",
    merge_logs: true,
    time: true,
  },
];

module.exports = { apps };
