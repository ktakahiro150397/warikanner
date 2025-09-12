import { ethers } from "ethers";
import {
  paymentgatewayAbi,
  paymentgatewayTrustedForwarderAbi,
} from "./check_forward_abi.js";

const rpcUrl = "http://localhost:8545";

const address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addressPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

const forwarderContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const paymentGatewayContractAddress =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

interface ForwarderContract {
  nonces(address: string): Promise<bigint>;
  eip712Domain(): {
    // fields: string;
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: string;
    // salt: string;
    // extensions: bigint[];
  };
}

const types = {
  ForwardRequest: [
    { name: "from", type: "address" },
    { name: "to", type: "address" },
    { name: "value", type: "uint256" },
    { name: "gas", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "data", type: "bytes" },
  ],
};

const main = async () => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(addressPrivateKey, provider);

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
  // console.log("Recipient Interface:", recipientInterface);

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

  // 署名データの作成（ペイロードを含める）
  const value = {
    from: signer.address, // 署名者
    to: paymentGatewayContract.target, // 呼び出し先(Forwarder経由で呼び出すコントラクトアドレス)
    value: 0, // ETH送付量
    gas: 50000n, // ガスリミット
    nonce: await forwarderContract.nonces(signer.address), // 署名者の現在のnonce
    deadline: Math.floor(Date.now() / 1000) + 3600, // 有効期限(現在時刻+1時間)
    data: data, // 呼び出しペイロード
  };

  // 署名してデータを取得
  const sign = await signer.signTypedData(
    {
      name: eip712Domain.name,
      version: eip712Domain.version,
      chainId: eip712Domain.chainId,
      verifyingContract: eip712Domain.verifyingContract,
    },
    types,
    value
  );

  // リクエストの送信
  const request = {
    from: value.from,
    to: value.to,
    value: value.value,
    gas: value.gas,
    deadline: value.deadline,
    data: value.data,
    signature: sign,
  };

  console.log("Sending request:", request);
};

main();
