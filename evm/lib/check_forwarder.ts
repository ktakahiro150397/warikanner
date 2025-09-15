import { ethers } from "ethers";
import {
  paymentgatewayAbi,
  paymentgatewayTrustedForwarderAbi,
} from "./check_forward_abi.js";
import type { JsonRpcProvider } from "ethers";
import type { Wallet } from "ethers";
import type { Provider } from "ethers";

const rpcUrl = "http://localhost:8545";

const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addressPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const forwarderContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const paymentGatewayContractAddress =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

interface ForwarderContract {
  nonces(address: string): Promise<bigint>;
  verify(request: any): Promise<boolean>;
  execute(request: any): Promise<ethers.TransactionResponse>;
  eip712Domain(): Promise<{
    fields: string;
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: string;
    salt: string;
    extensions: bigint[];
  }>;
}

const types = {
  ForwardRequest: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "gas", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint48" },
    { name: "data", type: "bytes" },
  ],
};

const signMetaTransaction = async (
  provider: JsonRpcProvider,
  signer: Wallet
) => {
  console.log("Using account:", await signer.getAddress());

  // Forwarderコントラクトのインスタンス作成
  const forwarderContract = new ethers.Contract(
    forwarderContractAddress,
    paymentgatewayTrustedForwarderAbi,
    provider
  ) as ethers.Contract & ForwarderContract;

  // PaymentGatewayコントラクトのインスタンス作成
  const paymentGatewayContract = new ethers.Contract(
    paymentGatewayContractAddress,
    paymentgatewayAbi,
    provider
  ) as ethers.Contract;

  console.log("Forwarder Contract Address:", forwarderContract.target);
  console.log(
    "PaymentGateway Contract Address:",
    paymentGatewayContract.target
  );

  const eip712Domain = await forwarderContract.eip712Domain();
  console.log("EIP712 Domain:", eip712Domain);

  // Forwarderコントラクトのインターフェース
  const recipientInterface = new ethers.Interface(paymentgatewayAbi);

  // 呼び出しペイロードの作成
  const data = recipientInterface.encodeFunctionData("addNewTransaction", [
    100,
    200,
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    1000,
    "test memo",
  ]);

  console.log("Encoded data:", data);

  // nonceを事前に取得
  const nonce = await forwarderContract.nonces(signer.address);
  console.log("Current nonce:", nonce);

  // 署名データの作成（すべてBigInt型に統一）
  const value = {
    from: signer.address,
    to: paymentGatewayContract.target,
    value: 0n, // BigInt型に変更
    gas: 500000n, // ガス制限を増やしてBigInt型に変更
    nonce: nonce, // 既にBigInt型
    deadline: BigInt(Math.floor(Date.now() / 1000) + 3600), // BigInt型に変更
    data: data,
  };

  console.log("Value to sign:", value);

  // ドメインの構築（salt と extensions を除外）
  const domain = {
    name: eip712Domain.name,
    version: eip712Domain.version,
    chainId: eip712Domain.chainId,
    verifyingContract: eip712Domain.verifyingContract,
  };

  console.log("Domain for signing:", domain);

  // 署名
  const signature = await signer.signTypedData(domain, types, value);
  console.log("Signature:", signature);

  // リクエストの作成
  const request = {
    from: value.from,
    to: value.to,
    value: value.value,
    gas: value.gas,
    nonce: value.nonce,
    deadline: value.deadline,
    data: value.data,
    signature: signature,
  };

  console.log("Sending request:", request);

  return request;
};

const sendMetaTransaction = async (
  provider: Provider,
  signer: Wallet,
  request: any
) => {
  // Forwarderコントラクトのインスタンス作成
  const forwarderContract = new ethers.Contract(
    forwarderContractAddress,
    paymentgatewayTrustedForwarderAbi,
    signer
  ) as ethers.Contract & ForwarderContract;

  console.log("Verifying request...");
  console.log("Request details:", {
    from: request.from,
    to: request.to,
    value: request.value.toString(),
    gas: request.gas.toString(),
    nonce: request.nonce.toString(),
    deadline: request.deadline.toString(),
    data: request.data,
    signature: request.signature,
  });

  // 署名したリクエストデータの検証
  const result = await forwarderContract.verify(request);
  console.log("Verification result:", result);

  if (result) {
    console.log("Executing meta-transaction...");
    const tx = await forwarderContract.execute(request);
    console.log("Transaction sent, waiting for confirmation...");
    await tx.wait(1);
    return tx;
  } else {
    console.error("Verification failed");
    console.error("Request:", request);

    // デバッグ用：現在のnonceを再確認
    const currentNonce = await forwarderContract.nonces(request.from);
    console.error("Current nonce:", currentNonce.toString());
    console.error("Request nonce:", request.nonce.toString());

    throw new Error("Invalid signature");
  }
};

const main = async () => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(addressPrivateKey, provider);

  try {
    // メタトランザクションの署名とリクエストデータの取得
    const request = await signMetaTransaction(provider, signer);
    const tx = await sendMetaTransaction(provider, signer, request);

    console.log("Meta-transaction sent. Tx Hash:", tx.hash);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
