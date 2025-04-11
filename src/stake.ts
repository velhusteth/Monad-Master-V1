import Web3 from "web3";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config();

const AMOUNT = `${process.env.STAKE_AMOUNT || 0.01}`;

// Configuration interface
interface Config {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
}

async function stake(abi: any, contractAddress: string) {
  try {
    // Set up configuration
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress,
    };

    // Initialize Web3
    const web3 = new Web3(config.rpcUrl);

    // Add private key to wallet
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    // Create contract instance
    const contract = new web3.eth.Contract(abi, config.contractAddress);
    const value = web3.utils.toWei(AMOUNT, "ether");
    const receiver = account.address;

    // Prepare transaction
    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.deposit(value, receiver).encodeABI(), // Pass assets and receiver
      value: value, // Send Ether
      gas: "100000", // Initial estimate
      gasPrice: await web3.eth.getGasPrice(),
    };

    // Estimate gas (recommended for payable functions)
    const gasEstimate = await contract.methods
      .deposit(value, receiver)
      .estimateGas({
        from: account.address,
        value: value,
      });
    tx.gas = gasEstimate.toString();

    console.log(
      `Calling deposit method with ${web3.utils.fromWei(value, "ether")} MON...`
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

export async function stake_shMON() {
  const abiPath = path.resolve(__dirname, "./abi/shMON.json");
  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI file not found at ${abiPath}`);
  }

  const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

  await stake(contractABI, "0x3a98250f98dd388c211206983453837c8365bdc1");
}

export async function stake_aprMON() {
  const abiPath = path.resolve(__dirname, "./abi/aprMON.json");
  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI file not found at ${abiPath}`);
  }

  const contractABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

  await stake(contractABI, "0xb2f82d0f38dc453d596ad40a37799446cc89274a");
}
