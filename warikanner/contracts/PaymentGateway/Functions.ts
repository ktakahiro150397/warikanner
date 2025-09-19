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

export async function GetSignMetaTransaction(
  //   provider: Provider,
  //   signer: JsonRpcSigner,
  params: AddNewTransactionParams
): Promise<MetaTransactionRequest & { signature: string }> {
  console.log("GetSignMetaTransaction called");
  console.log("ForwarderContractAddress:", TrustedForwarderContractAddress);

  // リレイヤー側の情報から署名器を生成
  const provider = new ethers.JsonRpcProvider(RpcUrl);
  const relayerSigner = new ethers.Wallet(RelayerPrivateKey, provider);

  console.log("RpcUrl:", RpcUrl);
  console.log("Relayer address:", relayerSigner.address);

  // Forwaderコントラクト
  const forwarderContract = new ethers.Contract(
    TrustedForwarderContractAddress,
    TrustedForwarderAbi,
    provider
  ) as ethers.Contract & ForwarderContract;

  // リクエストデータの作成
  const recipientInterface = new ethers.Interface(paymentgatewayAbi);
  const payloadRaw = recipientInterface.encodeFunctionData(
    "addNewTransaction",
    params.ToParamArray()
  );

  // 処理前に現在のnonceを取得
  const nonce = await forwarderContract.nonces(relayerSigner.address);

  // EIP-712 構造化データの作成
  const value = new SignedRequestForTrustedForwarder({
    from: relayerSigner.address as Address,
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
  console.log("Param Domain:", paramDomain);

  // 署名の生成
  const signature = await relayerSigner.signTypedData(
    paramDomain,
    value.types,
    value.getUnsignedRawData()
  );
  value.setSignature(signature);

  return {
    ...value.getSignedData(),
  };
}
