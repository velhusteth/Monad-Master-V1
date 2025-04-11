const cron = require('node-cron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lấy đường dẫn thư mục hiện tại
const PROJECT_PATH = __dirname;

// Tạo thư mục logs nếu chưa có
const LOG_DIR = path.join(PROJECT_PATH, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// File log
const LOG_FILE = path.join(LOG_DIR, 'cronjob.log');

// Lịch cron (mỗi phút)
const CRON_SCHEDULE = '* * * * *';

// Chạy job mỗi phút
cron.schedule(CRON_SCHEDULE, () => {
  const timestamp = new Date().toISOString();
  const command = 'npm run start';

  exec(command, { cwd: PROJECT_PATH }, (error, stdout, stderr) => {
    let log = `\n[${timestamp}] Running: ${command}\n`;
    if (error) log += `Error: ${error.message}\n`;
    if (stdout) log += `Output:\n${stdout}\n`;
    if (stderr) log += `Stderr:\n${stderr}\n`;

    fs.appendFileSync(LOG_FILE, log);
    console.log(`[Cron] ✅ Đã chạy lúc ${timestamp}`);
  });
});