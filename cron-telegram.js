const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.CHAT_ID;

axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
  chat_id: chatId,
  text: '✅ Cron job chạy xong rồi đây!',
}).then(() => {
  console.log('📩 Gửi thành công!');
}).catch((err) => {
  console.error('❌ Gửi thất bại:', err.message);
});


