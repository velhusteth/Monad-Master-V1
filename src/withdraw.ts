import Web3 from "web3";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config();

const AMOUNT = "0.01";

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

    // Initialize Web3
    const web3 = new Web3(config.rpcUrl);

    // Add private key to wallet
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    // Create contract instance
    const contract = new web3.eth.Contract(contractABI, config.contractAddress);

    const tokenBalance = await contract.methods
      .balanceOf(account.address)
      .call();
    const value = tokenBalance as unknown as bigint;

    // Prepare transaction
    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.withdraw(value).encodeABI(),
      gas: "100000", // Set a default gas limit
      gasPrice: await web3.eth.getGasPrice(),
    };

    // Estimate gas (optional but recommended for payable functions)
    const gasEstimate = await contract.methods.withdraw(value).estimateGas({
      from: account.address,
    });
    tx.gas = gasEstimate.toString();

    console.log(
      `Calling withdraw method with ${web3.utils.fromWei(
        value,
        "ether"
      )} MON...`
    );

    // Sign and send transaction
    const receipt = await web3.eth.sendTransaction(tx);

    console.log("Transaction successful!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Block number:", receipt.blockNumber);
    console.log("MON sent:", web3.utils.fromWei(value, "ether"));

    return receipt;
  } catch (error) {
    console.error("Error calling contract method:", error);
    throw error;
  }
}
