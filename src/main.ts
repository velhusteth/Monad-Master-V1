import { deposit } from "./deposit";
import { redeem_aprMON, redeem_shMON } from "./redeem";
import { stake_aprMON, stake_shMON } from "./stake";
import { withdraw } from "./withdraw";
import { getRandomFloat } from "./utils/random";
import * as fs from "fs/promises";
import * as path from "path";

// ✅ Bản đồ tên hàm sang nhãn tiếng Việt để log
const labelMap: Record<string, string> = {
  deposit: "Nạp MON",
  withdraw: "Rút MON",
  stake_aprMON: "Stake aprMon",
  stake_shMON: "Stake shMon",
  redeem_aprMON: "Redeem aprMon",
  redeem_shMON: "Redeem shMon",
};

// ✅ Danh sách các hàm
const functions = [
  deposit,
  withdraw,
  stake_shMON,
  redeem_shMON,
  stake_aprMON,
  redeem_aprMON,
];

const functionNames = functions.map((f) => f.name);

// ✅ File CSV lưu số lần chạy
const csvFilePath = path.join(__dirname, "../function_calls.csv");

async function loadCounters(): Promise<Record<string, number>> {
  const counters: Record<string, number> = functionNames.reduce((acc, fn) => {
    acc[fn] = 0;
    return acc;
  }, {} as Record<string, number>);

  try {
    const data = await fs.readFile(csvFilePath, "utf8");
    const lines = data.trim().split("\n");
    if (lines.length > 1) {
      const counts = lines[1].split(",").map(Number);
      for (let i = 0; i < functionNames.length; i++) {
        counters[functionNames[i]] = counts[i] || 0;
      }
    }
  } catch {
    // Không có file, bỏ qua
  }

  return counters;
}

async function saveCounters(counters: Record<string, number>) {
  const header = `${functionNames.join(",")}\n`;
  const csvLine = `${Object.values(counters).join(",")}\n`;
  const csvContent = header + csvLine;
  await fs.writeFile(csvFilePath, csvContent);
}

// ✅ Hàm chính
async function run() {
  const counters = await loadCounters();

  // 👉 Random hàm và chuẩn bị thông tin
  const randomIndex = Math.floor(Math.random() * functions.length);
  const fn = functions[randomIndex];
  const selectedFunctionName = functionNames[randomIndex];
  const label = labelMap[selectedFunctionName] || selectedFunctionName;

  const amount = getRandomFloat(0.1, 0.5, 2);
  console.log(`🎯 Đang chạy hàm: ${selectedFunctionName}(${amount})`);

  try {
    // ✅ Gọi hàm tương ứng có truyền amount
    const result = await fn(amount);

    counters[selectedFunctionName] += 1;
    await saveCounters(counters);

    if (result) {
      // ✅ Gửi log dạng Telegram đọc được
      console.log(`TELEGRAM_LOG::✅ Đã thực hiện: ${label} SL: ${amount}`);

      // Đảm bảo stdout được flush trước khi exit
      process.stdout.write("", async () => {
        await new Promise((res) => setTimeout(res, 100));
        process.exit(0); // thành công → cron sẽ chờ 1 phút rồi gọi lại
      });
    } else {
      console.log(`⚠️ ${label} bị skip hoặc không đủ điều kiện.`);
      process.exit(0);
    }
  } catch (error: any) {
    counters[selectedFunctionName] += 1;
    await saveCounters(counters);

    console.error("❌ Lỗi khi chạy hàm:", error.message || error);
    process.exit(1); // lỗi → cron chạy tiếp không delay
  }
}

run();
