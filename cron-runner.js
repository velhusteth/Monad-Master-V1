const cron = require("node-cron");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

// 📁 Cấu hình đường dẫn
const PROJECT_PATH = __dirname;
const LOG_DIR = path.join(PROJECT_PATH, "logs");
const LOG_FILE = path.join(LOG_DIR, "cronjob.log");

// 🛠 Tạo thư mục logs nếu chưa có
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 🕒 Cron schedule (chạy mỗi phút)
const CRON_SCHEDULE = "* * * * *";

// ✅ Gửi Telegram
async function sendTelegram(message) {
  try {
    const { TELEGRAM_TOKEN, CHAT_ID } = process.env;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      console.warn("[Telegram] ⚠️ Thiếu TELEGRAM_TOKEN hoặc CHAT_ID trong .env");
      return;
    }

    await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
    });

    console.log("[Telegram] ✅ Đã gửi thông báo");
  } catch (e) {
    console.error("[Telegram] ❌ Gửi Telegram lỗi:", e.message);
  }
}

// 🧠 Hàm chạy script
function runScript() {
  const timestamp = new Date().toISOString();
  const formattedTime = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
  const command = "npm run start";

  exec(command, { cwd: PROJECT_PATH }, async (error, stdout, stderr) => {
    let log = `\n[${timestamp}] ▶️ Đang chạy: ${command}\n`;

    if (error) {
      log += `❌ Error: ${error.message}\n`;
    }

    if (stdout) {
      log += `📤 Output:\n${stdout}\n`;

      // ✅ Gửi Telegram nếu có dòng TELEGRAM_LOG::
      const match = stdout.match(/TELEGRAM_LOG::(.+)/);
      if (match) {
        const message = `🕒 Cron đã chạy lúc ${formattedTime}\n${match[1]}`;
        await sendTelegram(message);
      }
    }

    if (stderr) {
      log += `📛 Stderr:\n${stderr}\n`;
    }

    fs.appendFileSync(LOG_FILE, log);
    console.log(`[Cron] ✅ Đã chạy lúc ${formattedTime}`);
  });
}

// 🚀 Lên lịch chạy mỗi phút
cron.schedule(CRON_SCHEDULE, () => {
  console.log("🕑 [Cron] Bắt đầu job mới...");
  runScript();
});
