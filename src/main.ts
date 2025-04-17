import { deposit } from "./deposit";
import { redeem_aprMON, redeem_shMON } from "./redeem";
import { stake_aprMON, stake_shMON } from "./stake";
import { withdraw } from "./withdraw";
import { getRandomFloat } from "./utils/random";
import * as fs from "fs/promises";
import * as path from "path";

const labelMap: Record<string, string> = {
  deposit: "Nạp MON",
  withdraw: "Rút MON",
  stake_aprMON: "Stake aprMON",
  stake_shMON: "Stake shMON",
  redeem_aprMON: "Redeem aprMON",
  redeem_shMON: "Redeem shMON"
};

const functionNames = [
  "deposit",
  "withdraw",
  "stake_shMON",
  "redeem_shMON",
  "stake_aprMON",
  "redeem_aprMON"
];

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

async function run() {
  const counters = await loadCounters();

  const randomIndex = Math.floor(Math.random() * functionNames.length);
  const selectedFunctionName = functionNames[randomIndex];
  const label = labelMap[selectedFunctionName] || selectedFunctionName;
  const amount = getRandomFloat(0.1, 0.5, 2);

  console.log(
    `🎯 Đang chạy hàm: ${selectedFunctionName}${
      selectedFunctionName !== "withdraw" &&
      !selectedFunctionName.startsWith("redeem_")
        ? `(${amount})`
        : ""
    }`
  );

  try {
    let result: any;
    let actionAmount: string | number = amount;

    switch (selectedFunctionName) {
      case "withdraw":
        result = await withdraw();
        actionAmount = "toàn bộ";
        break;

      case "redeem_aprMON":
        result = await redeem_aprMON();
        actionAmount = result?.sharesInEther || "0";
        break;

      case "redeem_shMON":
        result = await redeem_shMON();
        actionAmount = result?.sharesInEther || "0";
        break;

      case "stake_aprMON":
        result = await stake_aprMON(amount);
        break;

      case "stake_shMON":
        result = await stake_shMON(amount);
        break;

      case "deposit":
        result = await deposit(amount);
        break;

      default:
        console.log(`⚠️ Hàm không hợp lệ: ${selectedFunctionName}`);
        return;
    }

    counters[selectedFunctionName] += 1;
    await saveCounters(counters);

    if (result) {
      console.log(`TELEGRAM_LOG::✅ Đã thực hiện: ${label} SL: ${actionAmount}`);
      process.stdout.write("", async () => {
        await new Promise((res) => setTimeout(res, 100));
        process.exit(0);
      });
    } else {
      console.log(`⚠️ ${label} bị skip hoặc không đủ điều kiện.`);
      process.exit(0);
    }
  } catch (error: any) {
    counters[selectedFunctionName] += 1;
    await saveCounters(counters);
    console.error("❌ Lỗi khi chạy hàm:", error.message || error);
    process.exit(1);
  }
}

run();