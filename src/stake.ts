import Web3 from "web3";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config();

interface Config {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

// ✅ Hàm stake chính
async function stake(abi: any, contractAddress: string, amount: number) {
  try {
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress,
    };

    const web3 = new Web3(config.rpcUrl);
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    const contract = new web3.eth.Contract(abi, config.contractAddress);
    const value = web3.utils.toWei(amount.toString(), "ether");
    const receiver = account.address;

    // ✅ Log thông tin
    console.log("📨 Ví:", account.address);
    console.log("🏦 Contract:", contract.options.address);
    console.log("💰 Stake:", amount, "MON");
    console.log("🧾 Value (wei):", value);
    console.log("🎯 Receiver:", receiver);

    const balance = await web3.eth.getBalance(account.address);
    if (BigInt(balance) < BigInt(value)) {
      const msg = `❌ Không đủ MON để stake (${web3.utils.fromWei(balance, "ether")} < ${amount})`;
      console.log(msg);
      console.log(`TELEGRAM_LOG::${msg}`);
      return null;
    }

    const gasEstimate = await contract.methods.deposit(value, receiver).estimateGas({
      from: account.address,
      value: value,
    });

    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.deposit(value, receiver).encodeABI(),
      value: value,
      gas: gasEstimate.toString(),
      gasPrice: await web3.eth.getGasPrice(),
    };

    const receipt = await web3.eth.sendTransaction(tx);

    console.log("✅ Stake thành công!");
    console.log("Tx hash:", receipt.transactionHash);
    console.log("Block:", receipt.blockNumber);
    console.log("Số lượng:", amount, "MON");

    return receipt;
  } catch (error: any) {
    console.error("❌ Stake thất bại:", error.message || error);
    console.log(`TELEGRAM_LOG::❌ Stake lỗi: ${error.message || error}`);
    return null;
  }
}

// ✅ Stake shMON
export async function stake_shMON(amount: number) {
  const abiPath = path.resolve(__dirname, "./abi/shMON.json");
  if (!fs.existsSync(abiPath)) {
    const msg = `❌ ABI file not found at ${abiPath}`;
    console.log(msg);
    console.log(`TELEGRAM_LOG::${msg}`);
    return null;
  }

  const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  return await stake(contractABI, "0x3a98250f98dd388c211206983453837c8365bdc1", amount);
}

// ✅ Stake aprMON
export async function stake_aprMON(amount: number) {
  const abiPath = path.resolve(__dirname, "./abi/aprMON.json");
  if (!fs.existsSync(abiPath)) {
    const msg = `❌ ABI file not found at ${abiPath}`;
    console.log(msg);
    console.log(`TELEGRAM_LOG::${msg}`);
    return null;
  }

  const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  return await stake(contractABI, "0xb2f82d0f38dc453d596ad40a37799446cc89274a", amount);
}
