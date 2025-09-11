import { ethers } from "ethers";
import {
  paymentgatewayAbi,
  paymentgatewayTrustedForwarderAbi,
} from "./check_forward_abi.js";

const rpcUrl = "http://localhost:8545";

const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addressPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const forwarderContractAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
const paymentGatewayContractAddress =
  "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e";

const main = async () => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(addressPrivateKey, provider);

  console.log("Using account:", await signer.getAddress());

  // Forwarderコントラクトのインスタンス作成
  const forwardContract = new ethers.Contract(
    forwarderContractAddress,
    paymentgatewayTrustedForwarderAbi,
    provider
  ) as ethers.Contract;
  // PaymentGatewayコントラクトのインスタンス作成
  const paymentGatewayContract = new ethers.Contract(
    paymentGatewayContractAddress,
    paymentgatewayAbi,
    provider
  ) as ethers.Contract;

  console.log("Forwarder Contract Address:", forwardContract.address);
  console.log(
    "PaymentGateway Contract Address:",
    paymentGatewayContract.address
  );

  const eip712Domain = await forwardContract.eip712Domain();
  console.log("EIP712 Domain:", eip712Domain);
};

main();
