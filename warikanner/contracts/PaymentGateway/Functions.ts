import { ethers, Provider, JsonRpcSigner } from "ethers";
import { AddNewTransactionParams } from "./Parameters";
import {
  EIP712Domain,
  SignedRequestForTrustedForwarder,
  ForwarderContract,
  Address,
  MetaTransactionRequest,
} from "../types";
import {
  PaymentGatewayContractAddress,
  TrustedForwarderAbi,
  TrustedForwarderContractAddress,
  paymentgatewayAbi,
  RpcUrl,
  RelayerPrivateKey,
} from "./Contract";
import { Signer } from "ethers";

// シングルトンパターンでプロバイダーを管理
let _sharedProvider: ethers.JsonRpcProvider | null = null;
let _sharedRelayerSigner: ethers.Wallet | null = null;

function getSharedProvider(): ethers.JsonRpcProvider {
  if (!_sharedProvider) {
    _sharedProvider = new ethers.JsonRpcProvider(RpcUrl);
  }
  return _sharedProvider;
}

function getSharedRelayerSigner(): ethers.Wallet {
  if (!_sharedRelayerSigner) {
    _sharedRelayerSigner = new ethers.Wallet(
      RelayerPrivateKey,
      getSharedProvider()
    );
  }
  return _sharedRelayerSigner;
}

export async function GetSignMetaTransaction(
  signer: Signer,
  params: AddNewTransactionParams
): Promise<MetaTransactionRequest & { signature: string }> {
  console.log("GetSignMetaTransaction called");
  console.log("ForwarderContractAddress:", TrustedForwarderContractAddress);

  const signerAddress = await signer.getAddress();

  console.log("RpcUrl:", RpcUrl);
  console.log("Signer address:", signerAddress);

  // サーバー側のRPCプロバイダーを使用してnonceを取得
  const serverProvider = getSharedProvider();
  const forwarderContract = new ethers.Contract(
    TrustedForwarderContractAddress,
    TrustedForwarderAbi,
    serverProvider // 共有プロバイダーを使用
  ) as ethers.Contract & ForwarderContract;

  // リクエストデータの作成
  const recipientInterface = new ethers.Interface(paymentgatewayAbi);
  const payloadRaw = recipientInterface.encodeFunctionData(
    "addNewTransaction",
    params.ToParamArray()
  );

  // 処理前に現在のnonceを取得
  let nonce: bigint;
  try {
    nonce = await forwarderContract.nonces(signerAddress);
  } catch (error) {
    console.error("Error calling nonces():", error);
    throw error;
  }

  // EIP-712 構造化データの作成
  const value = new SignedRequestForTrustedForwarder({
    from: signerAddress as Address,
    to: PaymentGatewayContractAddress,
    value: "0",
    gas: "1000000",
    nonce: nonce.toString(),
    deadline: (Math.floor(Date.now() / 1000) + 3600).toString(),
    data: payloadRaw,
  });

  const domain = await forwarderContract.eip712Domain();
  console.log("EIP712 Domain:", domain);

  const paramDomain = {
    name: domain.name,
    version: domain.version,
    chainId: domain.chainId,
    verifyingContract: domain.verifyingContract,
  };

  // 署名の生成
  const signature = await signer.signTypedData(
    paramDomain,
    value.types,
    value.getUnsignedRawData()
  );
  value.setSignature(signature);

  return {
    ...value.getSignedData(),
  };
}

export async function sendMetaTransaction(
  request: MetaTransactionRequest & { signature: string }
) {
  console.log("sendMetaTransaction called");

  const relayerSigner = getSharedRelayerSigner();

  const forwarderContract = new ethers.Contract(
    TrustedForwarderContractAddress,
    TrustedForwarderAbi,
    relayerSigner
  ) as ethers.Contract & ForwarderContract;

  console.log("Verifying request...");
  const result = await forwarderContract.verify(request);
  console.log("Verification result:", result);

  if (!result) {
    console.error("Request verification failed");
    throw new Error("Request verification failed");
  }

  console.log("Executing transaction...");
  try {
    const tx = await forwarderContract.execute(request);
    console.log("Transaction sent:", tx.hash);
    console.log("Transaction details:", {
      from: tx.from,
      to: tx.to,
      gasLimit: tx.gasLimit?.toString(),
      gasPrice: tx.gasPrice?.toString(),
    });

    const receipt = await tx.wait();
    console.log("Transaction confirmed!");

    if (receipt) {
      console.log("Receipt details:", {
        status: receipt.status,
        gasUsed: receipt.gasUsed?.toString(),
        blockNumber: receipt.blockNumber,
      });
    }

    return receipt;
  } catch (error) {
    console.error("Transaction execution failed:", error);

    // 実行失敗後のnonceを確認
    const nonceAfterFailure = await forwarderContract.nonces(request.from);
    console.log("Nonce after failure:", nonceAfterFailure.toString());

    throw error;
  }
}
