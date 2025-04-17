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

async function setupContract(config: Config) {
  const abiPath = path.resolve(__dirname, config.abiPath);
  if (!fs.existsSync(abiPath)) {
    throw new Error(`ABI file not found at ${abiPath}`);
  }

  const abi = JSON.parse(fs.readFileSync(abiPath, "utf8"));
  const web3 = new Web3(config.rpcUrl);
  const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
  web3.eth.accounts.wallet.add(account);

  const contract = new web3.eth.Contract(abi, config.contractAddress);

  return { web3, account, contract };
}

// ✅ redeem shMON
export async function redeem_shMON() {
  try {
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress: "0x3a98250f98dd388c211206983453837c8365bdc1",
      abiPath: "./abi/shMON.json",
    };

    const { web3, account, contract } = await setupContract(config);
    const receiver = account.address;
    const owner = account.address;

    const rawBalance = await contract.methods.balanceOf(account.address).call() as string;
    const sharesInEther = parseFloat(web3.utils.fromWei(rawBalance, "ether"));

    // ✅ Skip nếu nhỏ hơn 0.01
    if (sharesInEther < 0.01) {
      console.log(`⚠️ Token quá ít (${sharesInEther} shMON), không thực hiện redeem.`);
      return false;
    }

    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.redeem(rawBalance, receiver, owner).encodeABI(),
      gas: "100000",
      gasPrice: await web3.eth.getGasPrice(),
    };

    const gasEstimate = await contract.methods
      .redeem(rawBalance, receiver, owner)
      .estimateGas({ from: account.address });
    tx.gas = gasEstimate.toString();

    console.log(`👉 Gọi redeem shMON với ${sharesInEther} shares...`);

    const receipt = await web3.eth.sendTransaction(tx);

    console.log("✅ Giao dịch thành công!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Shares redeemed:", sharesInEther);

    return { receipt, sharesInEther };
  } catch (error: any) {
    console.error("❌ Lỗi khi redeem shMON:", error.message);
    if (error.data) console.error("Error data:", error.data);
    return false;
  }
}

// ✅ redeem aprMON
export async function redeem_aprMON() {
  try {
    const config: Config = {
      rpcUrl: "https://testnet-rpc.monad.xyz",
      privateKey: process.env.PRIVATE_KEY as string,
      contractAddress: "0xb2f82d0f38dc453d596ad40a37799446cc89274a",
      abiPath: "./abi/aprMON.json",
    };

    const { web3, account, contract } = await setupContract(config);
    const receiver = account.address;
    const owner = account.address;

    const rawBalance = await contract.methods.balanceOf(account.address).call() as string;
    const sharesInEther = parseFloat(web3.utils.fromWei(rawBalance, "ether"));

    if (sharesInEther < 0.01) {
      console.log(`⚠️ Token quá ít (${sharesInEther} aprMON), không thực hiện redeem.`);
      return false;
    }

    const tx = {
      from: account.address,
      to: config.contractAddress,
      data: contract.methods.requestRedeem(rawBalance, receiver, owner).encodeABI(),
      gas: "100000",
      gasPrice: await web3.eth.getGasPrice(),
    };

    const gasEstimate = await contract.methods
      .requestRedeem(rawBalance, receiver, owner)
      .estimateGas({ from: account.address });
    tx.gas = gasEstimate.toString();

    console.log(`👉 Gọi redeem aprMON với ${sharesInEther} shares...`);

    const receipt = await web3.eth.sendTransaction(tx);

    console.log("✅ Giao dịch thành công!");
    console.log("Transaction hash:", receipt.transactionHash);
    console.log("Shares redeemed:", sharesInEther);

    return { receipt, sharesInEther };
  } catch (error: any) {
    console.error("❌ Lỗi khi redeem aprMON:", error.message);
    if (error.data) console.error("Error data:", error.data);
    return false;
  }
}
