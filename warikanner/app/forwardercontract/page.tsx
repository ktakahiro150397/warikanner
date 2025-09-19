"use client";

import { ethers, Provider, Signer, Contract } from "ethers";
import { targetChainIdStr } from "@/contracts/simpleStorageContract";
import { useEffect, useState } from "react";
import { walletService } from "@/services";
import { GetSignMetaTransaction } from "@/contracts/PaymentGateway/Functions";
import {
  paymentgatewayAbi,
  PaymentGatewayContractAddress,
} from "../../contracts/PaymentGateway/Contract";
import { Address } from "@/contracts/types";
import { AddNewTransactionParams } from "../../contracts/PaymentGateway/Parameters";
import { ca } from "zod/locales";

export default function Page() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const [id, setId] = useState("");
  const [warikanId, setwarikanId] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [responseJson, setResponseJson] = useState<string>("");

  const [activeTab, setActiveTab] = useState(1);

  const [events, setEvents] = useState<unknown[]>([]);

  const tabs = [
    { name: "Forwarder Contract", id: "forwarder" },
    { name: "履歴", id: "history" },
  ];

  const generateRandomUint128 = (): string => {
    // 128ビット = 32桁の16進数
    const randomHex = ethers.hexlify(ethers.randomBytes(16));
    return BigInt(randomHex).toString();
  };

  useEffect(() => {
    setId(generateRandomUint128());
    setwarikanId(generateRandomUint128());

    (async () => {
      try {
        const targetChainId = BigInt(
          process.env.NEXT_PUBLIC_CHAIN_ID || "1337"
        );

        const newProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(newProvider);

        const newSigner = await newProvider.getSigner();
        setSigner(newSigner);

        const { chainId } = await newProvider.getNetwork();
        console.log("Connected chainId:", chainId);

        if (chainId !== targetChainId) {
          alert(
            `Please switch to the ${targetChainId} network in your wallet. Current chainId: ${chainId}`
          );

          await walletService.requestAddNetwork({
            chainId: targetChainIdStr,
            chainName: "local development",
            rpcUrls: [process.env.NEXT_PUBLIC_CONTRACT_RPC_URL || ""],
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            blockExplorerUrls: null,
          });
        }
      } catch (error) {
        console.error("Error setting up provider and signer:", error);
      }
    })();
  }, []);

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const handlewarikanIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setwarikanId(e.target.value);
  };

  async function fetchContractEvents() {
    if (!provider) {
      console.error("Provider is not initialized");
      return;
    }

    try {
      const address = await walletService.getAddress();
      const filter = {
        address: "",
        fromBlock: 0,
        toBlock: "latest",
      };
      console.log("Fetching logs with filter:", filter);

      const contract = new ethers.Contract(
        PaymentGatewayContractAddress,
        paymentgatewayAbi,
        provider
      );

      const logs = await provider.getLogs(filter);

      const decodedLogs = logs.map((log, index) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return {
            ...parsedLog,
            eventName: parsedLog?.name || "Unknown Event",
          };
        } catch (error) {
          console.error(`Error parsing log at index ${index}:`, error);
        }
      });

      console.log("Fetched logs:", logs);
      console.log("Parsed logs:", decodedLogs);
      setEvents(decodedLogs);
    } catch (error) {
      console.error("Error fetching contract events:", error);
    }
  }

  async function onClickCall() {
    // サーバー側へパラメータを送信
    setIsSending(true);
    try {
      const walletAddress = await walletService.connect();

      const addNewTransactionParam = new AddNewTransactionParams(
        id,
        warikanId,
        walletAddress as Address,
        PaymentGatewayContractAddress as Address,
        100,
        "Forwarder Contract Test"
      );

      const requestBody = await GetSignMetaTransaction(
        signer!,
        addNewTransactionParam
      );

      const response = await fetch("/api/meta-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return renderForwarderTab();
      case 1:
        return renderHistoryTab();
      default:
        return null;
    }
  };

  const renderForwarderTab = () => {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-6">
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
          <label
            htmlFor="warikanId"
            className="block font-medium text-gray-700"
          >
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
  };

  const renderHistoryTab = () => {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-6">履歴</h1>

        <div>
          <button
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white fond-medium py-2 px-4 rounded-md hover:cursor-pointer"
            onClick={fetchContractEvents}
          >
            イベント取得
          </button>
        </div>
        <div>
          {events.length === 0 ? (
            <p className="text-gray-600">No events found.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event, index) => (
                <li key={index} className="bg-white p-4 rounded-md shadow">
                  <p>No.{index}</p>
                  <pre className="overflow-x-auto">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 p-6 py-20">
      <div>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(index)}
            className={`w-1/4 px-4 py-2 mr-2 font-medium ${
              activeTab === index
                ? "bg-blue-600 text-white rounded-md"
                : "bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 hover:cursor-pointer"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
}
