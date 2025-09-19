"use client";

import { ethers, BrowserProvider, Signer, Contract } from "ethers";
import {
  contractAddress,
  contractABI,
  targetChainId,
  targetNetwork,
  targetChainIdStr,
} from "@/contracts/simpleStorageContract";
import { useEffect, useState } from "react";
import { walletService } from "@/services";
import { GetSignMetaTransaction } from "@/contracts/PaymentGateway/Functions";
import {
  PaymentGatewayContractAddress,
  TrustedForwarderContractAddress,
} from "../../contracts/PaymentGateway/Contract";
import { Address } from "@/contracts/types";
import { AddNewTransactionParams } from "../../contracts/PaymentGateway/Parameters";
import { set } from "zod";

export default function Page() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const [id, setId] = useState("");
  const [warikanId, setwarikanId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [responseJson, setResponseJson] = useState<string>(null);

  const generateRandomUint128 = (): string => {
    // 128ビット = 32桁の16進数
    const randomHex = ethers.hexlify(ethers.randomBytes(16));
    return BigInt(randomHex).toString();
  };

  useEffect(() => {
    setId(generateRandomUint128());
    setwarikanId(generateRandomUint128());
  }, []);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const handlewarikanIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setwarikanId(e.target.value);
  };

  //   const connectWallet = async (): Promise<Signer> => {
  //     if (!window.ethereum) {
  //       throw new Error("MetaMask is not installed");
  //     }

  //     const provider = new BrowserProvider(window.ethereum);
  //     const signer = await provider.getSigner();

  //     setProvider(provider);
  //     setSigner(signer);
  //   };

  async function onClickCall() {
    // サーバー側へパラメータを送信
    setIsSending(true);
    try {
      const walletAddress = await walletService.connect();

      const response = await fetch("/api/meta-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: new AddNewTransactionParams(
          id,
          warikanId,
          walletAddress as Address,
          PaymentGatewayContractAddress as Address,
          100,
          "Forwarder Contract Test"
        ).ToJson(),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      console.log("Response received from server");
      const signedTransaction = await response.json();
      console.log("Signed Transaction:", signedTransaction);

      setResponseJson(JSON.stringify(signedTransaction, null, 2));
    } catch (error) {
      console.error("Error sending request:", error);
    } finally {
      setIsSending(false);
    }
    // // 自身のウォレットに接続
    // const provider = new ethers.BrowserProvider(window.ethereum);
    // const signer = await provider.getSigner();

    // // 送信するデータを署名
    // if (!signer) {
    //   console.error("Signer is not available.");
    //   return;
    // }

    // console.log("provider:", provider);
    // console.log("signer:", signer);
    // console.log("walletAddress:", walletAddress);
    // console.log(
    //   "PaymentGatewayContractAddress:",
    //   PaymentGatewayContractAddress
    // );

    // // 署名
    // const signedData = await GetSignMetaTransaction(
    //   //   provider,
    //   //   signer,
    //   new AddNewTransactionParams(
    //     BigInt(id),
    //     BigInt(warikanId),
    //     walletAddress as Address,
    //     PaymentGatewayContractAddress as Address,
    //     100,
    //     "Forwarder Contract Test"
    //   )
    // );

    // console.log("Signed Data:", signedData);

    // フォワーダーコントラクトの呼び出し
  }

  return (
    <div className="max-w-7xl mx-auto px-4 p-6 py-20 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Forwarder Contract Call Sample
      </h1>

      <div>
        <label htmlFor="id" className="block font-medium text-gray-700">
          ID
        </label>
        <input
          type="text"
          placeholder="id"
          id="id"
          value={id}
          onChange={handleIdChange}
          className="px-3 py-2 w-1/2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="warikanId" className="block font-medium text-gray-700">
          割り勘ID
        </label>
        <input
          type="text"
          placeholder="warikanId"
          id="warikanId"
          value={warikanId}
          onChange={handlewarikanIdChange}
          className="px-3 py-2 w-1/2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-colors duration-100"
        />
      </div>

      <div>
        <div className="mb-4">
          <p>addNewTransaction呼び出し</p>
          <button
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white fond-medium py-2 rounded-md hover:cursor-pointer"
            onClick={onClickCall}
            disabled={isSending}
          >
            addNewTransaction呼び出し
            <span>{isSending ? " 送信中..." : ""}</span>
          </button>
        </div>

        {responseJson && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-800 mb-2">
              サーバーからのレスポンス
            </h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
              {responseJson}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
