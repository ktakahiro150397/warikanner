import { ethers } from "ethers";
import {
  paymentgatewayAbi,
  paymentgatewayTrustedForwarderAbi,
} from "./check_forward_abi.js";
import type { JsonRpcProvider } from "ethers";
import type { Wallet } from "ethers";
import type { Provider } from "ethers";

const rpcUrl = "http://localhost:8545";

// ユーザーアドレス(ガスレスで実行するアドレス)
const userAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const userAddressPrivateKey =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// トランザクションの送付先アドレス
const toAddress = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

// Forwaderコントラクト
const forwarderContractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
// PaymentGatewayコントラクト
const paymentGatewayContractAddress =
  "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// ガス代負担者(リレイヤー)のアドレスと秘密鍵
const relayerAddress = "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720";
const relayerPrivateKey =
  "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6";

const testTransactionId = 103;
const testPayloadData = [
  testTransactionId,
  200,
  userAddress,
  toAddress,
  1000,
  "test memo",
];

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
  // console.log("EIP712 Domain:", eip712Domain);

  // Forwarderコントラクトのインターフェース
  const recipientInterface = new ethers.Interface(paymentgatewayAbi);

  // 呼び出しペイロードの作成
  const data = recipientInterface.encodeFunctionData(
    "addNewTransaction",
    testPayloadData
  );

  // console.log("Encoded data:", data);

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

  // console.log("Value to sign:", value);

  // ドメインの構築（salt と extensions を除外）
  const domain = {
    name: eip712Domain.name,
    version: eip712Domain.version,
    chainId: eip712Domain.chainId,
    verifyingContract: eip712Domain.verifyingContract,
  };

  // console.log("Domain for signing:", domain);

  // 署名
  const signature = await signer.signTypedData(domain, types, value);
  // console.log("Signature:", signature);

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

  // console.log("Sending request:", request);

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
  // console.log("Request details:", {
  //   from: request.from,
  //   to: request.to,
  //   value: request.value.toString(),
  //   gas: request.gas.toString(),
  //   nonce: request.nonce.toString(),
  //   deadline: request.deadline.toString(),
  //   data: request.data,
  //   signature: request.signature,
  // });

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

const checkPaymentGatewayState = async (
  provider: Provider,
  transactionId: number
) => {
  const paymentGatewayContract = new ethers.Contract(
    paymentGatewayContractAddress,
    paymentgatewayAbi,
    provider
  );

  try {
    const transaction = await paymentGatewayContract.getTransaction?.(
      transactionId
    );
    if (transaction) {
      console.log(`Transaction ${transactionId} details:`, {
        id: transaction.id.toString(),
        warikanId: transaction.warikanId.toString(),
        from: transaction.from,
        to: transaction.to,
        amount: transaction.amount.toString(),
        timestamp: transaction.timestamp.toString(),
        isPaid: transaction.isPaid,
        isCanceled: transaction.isCanceled,
      });

      if (transaction.id !== 0n) {
        console.log(`Transaction ${transactionId} exists.`);
        return transaction;
      } else {
        console.log(`Transaction ${transactionId} does not exist.`);
        return null;
      }
    }
    return null;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log(
      `Transaction ${transactionId} not found or error:`,
      errorMessage
    );
    return null;
  }
};

const checkETHBalance = async (provider: Provider, addresses: string[]) => {
  for (const address of addresses) {
    const balance = await provider.getBalance(address);
    console.log(
      `Address: ${address}, ETH Balance: ${ethers.formatEther(balance)} ETH`
    );
  }
};

const main = async () => {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(userAddressPrivateKey, provider);
  const relayerSigner = new ethers.Wallet(relayerPrivateKey, provider);

  const testTransactionId = testPayloadData[0] as number; // testPayloadDataの最初の要素を使用

  try {
    console.log("=== メタトランザクション実行前の状態確認 ===");
    const beforeState = await checkPaymentGatewayState(
      provider,
      testTransactionId
    );

    // signerとrelayerSignerのETH残高を取得
    console.log("\n=== ガス代負担者と署名者のETH残高確認(実行前) ===");
    await checkETHBalance(provider, [
      await signer.getAddress(),
      await relayerSigner.getAddress(),
    ]);

    console.log("\n=== メタトランザクションの署名と実行 ===");
    // メタトランザクションの署名とリクエストデータの取得
    const request = await signMetaTransaction(provider, signer);
    const tx = await sendMetaTransaction(provider, relayerSigner, request);

    console.log("Meta-transaction sent. Tx Hash:", tx.hash);

    // トランザクションレシートを取得してイベントログを確認
    console.log("\n=== トランザクションレシートとイベントログの確認 ===");
    const receipt = await tx.wait();
    if (receipt) {
      console.log("Transaction confirmed. Block number:", receipt.blockNumber);
      console.log("Gas used:", receipt.gasUsed.toString());
      console.log("Logs count:", receipt.logs.length);

      // // イベントログをデコード
      // const paymentGatewayContract = new ethers.Contract(
      //   paymentGatewayContractAddress,
      //   paymentgatewayAbi,
      //   provider
      // );

      // for (let i = 0; i < receipt.logs.length; i++) {
      //   const log = receipt.logs[i];
      //   if (log) {
      //     try {
      //       if (
      //         log.address.toLowerCase() ===
      //         paymentGatewayContractAddress.toLowerCase()
      //       ) {
      //         const parsedLog = paymentGatewayContract.interface.parseLog({
      //           topics: log.topics,
      //           data: log.data,
      //         });
      //         if (parsedLog) {
      //           console.log(`Event ${i + 1}:`, {
      //             name: parsedLog.name,
      //             args: parsedLog.args.map((arg, index) => ({
      //               name:
      //                 parsedLog.fragment.inputs?.[index]?.name || `arg${index}`,
      //               value: typeof arg === "bigint" ? arg.toString() : arg,
      //             })),
      //           });
      //         }
      //       }
      //     } catch (parseError) {
      //       console.log(`Log ${i + 1} (raw):`, {
      //         address: log.address,
      //         topics: log.topics,
      //         data: log.data,
      //       });
      //     }
      //   }
      // }
    }

    console.log("\n=== メタトランザクション実行後の状態確認 ===");
    const afterState = await checkPaymentGatewayState(
      provider,
      testTransactionId
    );

    console.log("\n=== 実行結果の検証 ===");
    if (!beforeState && afterState) {
      console.log("✅ 成功: 新しいトランザクションが正常に作成されました");
      console.log(
        "TrustedForwarderからPaymentGatewayへの呼び出しが正常に動作しています"
      );
    } else if (beforeState) {
      console.log(
        `⚠️  注意: トランザクションID ${testTransactionId}は既に存在していました`
      );
    } else {
      console.log("❌ エラー: トランザクションが作成されていません");
    }

    // signerとrelayerSignerのETH残高を取得
    console.log("\n=== ガス代負担者と署名者のETH残高確認(実行後) ===");
    await new Promise((res) => setTimeout(res, 3000));
    await checkETHBalance(provider, [
      await signer.getAddress(),
      await relayerSigner.getAddress(),
    ]);
  } catch (error) {
    console.error("Error:", error);
  }
};

main();
