import Web3 from "web3";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config();

// Configuration interface
interface Config {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  abiPath: string;
}

export async function withdraw() {
  try {
    // Set up configuration
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress: "0x760afe86e5de5fa0ee542fc7b7b713e1c5425701",
      abiPath: "./abi/WrappedMonad.json",
    };

    // Load ABI from JSON file
    const abiPath = path.resolve(__dirname, config.abiPath);
    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI file not found at ${abiPath}`);
    }

    const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

    const web3 = new Web3(config.rpcUrl);
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    const contract = new web3.eth.Contract(contractABI, config.contractAddress);

    // Lấy balance và ép kiểu string (phòng lỗi void)
    const rawBalance = await contract.methods.balanceOf(account.address).call() as string;

    // Nếu balance = 0 thì return
    if (rawBalance === "0") {
      console.log("⚠️ Không có MON để rút.");
      return false;
    }

    const value = rawBalance;

    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.withdraw(value).encodeABI(),
      gas: "100000",
      gasPrice: await web3.eth.getGasPrice(),
    };

    // Ước lượng gas chính xác
    const gasEstimate = await contract.methods.withdraw(value).estimateGas({
      from: account.address,
    });
    tx.gas = gasEstimate.toString();

    console.log(`👉 Gọi withdraw với toàn bộ: ${web3.utils.fromWei(value, "ether")} MON`);

    const receipt = await web3.eth.sendTransaction(tx);

    console.log("✅ Giao dịch thành công!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Block number:", receipt.blockNumber);
    console.log("MON đã rút:", web3.utils.fromWei(value, "ether"));

    return receipt;
  } catch (error) {
    console.error("❌ Lỗi khi gọi withdraw:", error);
    throw error;
  }
}
