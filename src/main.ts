import { deposit } from "./deposit";
import { redeem_aprMON, redeem_shMON } from "./redeem";
import { stake_aprMON, stake_shMON } from "./stake";
import { withdraw } from "./withdraw";
import * as fs from "fs/promises";
import * as path from "path";

// Array of function references
const functions = [
  deposit,
  withdraw,
  stake_shMON,
  redeem_shMON,
  stake_aprMON,
  redeem_aprMON,
];
const functionNames = functions.map((f) => f.name);

// CSV file path
const csvFilePath = path.join(__dirname, "../function_calls.csv");

// Load counters from CSV or initialize
async function loadCounters(): Promise<Record<string, number>> {
  const counters: Record<string, number> = functionNames.reduce((acc, fn) => {
    acc[fn] = 0;
    return acc;
  }, {} as Record<string, number>);

  try {
    const data = await fs.readFile(csvFilePath, "utf8");
    const lines = data.trim().split("\n");
    if (lines.length > 1) {
      // Check for data row
      const counts = lines[1].split(",").map(Number); // Second line is the data

      for (let i = 0; i < functionNames.length; i++) {
        counters[functionNames[i]] = counts[i] || 0;
      }
    }
  } catch {
    // File doesn’t exist or is invalid; use defaults
  }
  return counters;
}

// Write counters to CSV as a single row
async function saveCounters(counters: Record<string, number>) {
  const header = `${functionNames.join(",")}\n`;
  const csvLine = `${Object.values(counters).join(",")}\n`;
  const csvContent = header + csvLine;

  try {
    await fs.writeFile(csvFilePath, csvContent); // Overwrite entire file
    console.log(`Updated CSV: ${csvLine.trim()}`);
  } catch (error) {
    console.error("Error writing to CSV:", error);
  }
}

// Main execution
async function run() {
  const counters = await loadCounters();
  const randomIndex = Math.floor(Math.random() * functions.length);
  const fn = functions[randomIndex];
  const selectedFunctionName = functionNames[randomIndex];

  console.log(`Selected function: ${fn.name}`);

  try {
    await fn(); // Execute the function
    counters[selectedFunctionName] += 1; // Increment the counter for the selected function
    await saveCounters(counters);
    console.log("Function executed successfully");
    process.exit(0);
  } catch (error: any) {
    counters[selectedFunctionName] += 1; // Optional: count even on error
    await saveCounters(counters);
    console.error("Error executing function:", error);
    process.exit(1);
  }
}

run();
