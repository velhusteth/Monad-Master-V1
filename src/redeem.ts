import Web3 from "web3";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

config();

interface Config {
  rpcUrl: string;
  privateKey: string;
  contractAddress: string;
  abiPath: string;
}

export async function redeem_shMON() {
  try {
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress: "0x3a98250f98dd388c211206983453837c8365bdc1",
      abiPath: "./abi/shMON.json",
    };

    // Load ABI from JSON file
    const abiPath = path.resolve(__dirname, config.abiPath);
    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI file not found at ${abiPath}`);
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

    const web3 = new Web3(config.rpcUrl);
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    const contract = new web3.eth.Contract(abi, config.contractAddress);
    const receiver = account.address;
    const owner = account.address; // Set _owner to the caller

    // Fetch the token balance of the caller (owner)
    const tokenBalance = await contract.methods
      .balanceOf(account.address)
      .call();

    // Use the full balance or a fixed amount for shares
    const shares = tokenBalance as unknown as bigint; // Redeem full balance; adjust as needed
    const sharesInEther = web3.utils.fromWei(shares, "ether");

    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.redeem(shares, receiver, owner).encodeABI(),
      gas: "100000",
      gasPrice: await web3.eth.getGasPrice(),
    };

    const gasEstimate = await contract.methods
      .redeem(shares, receiver, owner)
      .estimateGas({ from: account.address });
    tx.gas = gasEstimate.toString();

    console.log(`Calling redeem method with ${sharesInEther} token shares...`);

    const receipt = await web3.eth.sendTransaction(tx);

    console.log("Transaction successful!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Block number:", receipt.blockNumber);
    console.log("Shares redeemed:", sharesInEther);

    return receipt;
  } catch (error: any) {
    console.error("Error calling contract method:", error.message);
    if (error.data) console.error("Error data:", error.data);
    throw error;
  }
}

export async function redeem_aprMON() {
  try {
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress: "0xb2f82d0f38dc453d596ad40a37799446cc89274a",
      abiPath: "./abi/aprMON.json",
    };

    // Load ABI from JSON file
    const abiPath = path.resolve(__dirname, config.abiPath);
    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI file not found at ${abiPath}`);
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));

    const web3 = new Web3(config.rpcUrl);
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    const contract = new web3.eth.Contract(abi, config.contractAddress);
    const receiver = account.address;
    const owner = account.address; // Set _owner to the caller

    // Fetch the token balance of the caller (owner)
    const tokenBalance = await contract.methods
      .balanceOf(account.address)
      .call();

    // Use the full balance or a fixed amount for shares
    const shares = tokenBalance as unknown as bigint; // Redeem full balance; adjust as needed
    const sharesInEther = web3.utils.fromWei(shares, "ether");

    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.requestRedeem(shares, receiver, owner).encodeABI(),
      gas: "100000",
      gasPrice: await web3.eth.getGasPrice(),
    };

    const gasEstimate = await contract.methods
      .requestRedeem(shares, receiver, owner)
      .estimateGas({ from: account.address });
    tx.gas = gasEstimate.toString();

    console.log(`Calling redeem method with ${sharesInEther} token shares...`);

    const receipt = await web3.eth.sendTransaction(tx);

    console.log("Transaction successful!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Block number:", receipt.blockNumber);
    console.log("Shares redeemed:", sharesInEther);

    return receipt;
  } catch (error: any) {
    console.error("Error calling contract method:", error.message);
    if (error.data) console.error("Error data:", error.data);
    throw error;
  }
}
