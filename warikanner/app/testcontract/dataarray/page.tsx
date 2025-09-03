"use client";

// Extend the Window interface to include ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}

import { ethers, BrowserProvider, Signer, Contract } from "ethers";
import { contractAddress, contractABI, targetChainId, targetNetwork, targetChainIdStr } from "@/contracts/simpleDataArrayContract"
import { useEffect, useState } from "react";

export default function Page() {

    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<Signer | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    const [eventHistory, setEventHistory] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
        if (window.ethereum) {
            connectWallet();
        } else {
            alert("MetaMaskがインストールされていません。");
        }

        return () => {
            if (contract) {
                contract.off("DataAdded",onDataAdded);
            }
        }
    }, []);

    useEffect(() => {
        if (contract) {
            // getCurrentValue();
        }
    },[contract]);

    const connectWallet = async () => {
        try {
            let provider = new ethers.BrowserProvider(window.ethereum);
            setProvider(provider);

            const {chainId,name} = await provider.getNetwork();
            console.log(`Connected to network ${name} with chain ID ${chainId}`);
            if (chainId !== BigInt(targetChainId)) {
                // ネットワークが異なる場合は切り替え
                console.log(`Switching to target network with chain ID ${targetChainId}`);
                await switchNetwork(provider);

                provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);
            }

            const accounts = await provider.send("eth_requestAccounts", []);
            setAccount(accounts[0]);

            const signer = await provider.getSigner();
            setSigner(signer);

            const contract = new ethers.Contract(contractAddress, contractABI, signer);
            setContract(contract);

            await contract.on("DataAdded",onDataAdded);
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("ウォレットの接続に失敗しました。");
        }
    }

    const onDataAdded = (id:any,sender:any,message:any) => {
        console.log("DataAdded event received:", id);
        setEventHistory((prevHistory) => [...prevHistory, 
            `Data ID :  ${id} | message : ${message} from ${sender}`]);
    }

    const getCurrentValue = async () => {
        if (contract) {
            try {
                console.log("contract.getDataCount()");

                const dataCount = await contract.getDataCount() as bigint;
                
                console.log(`contract.getDataCount() : ${dataCount}`);
                
                // const latestData = await contract.getDataById(dataCount - BigInt(1))
                
                //eventHistory.push(`ID : ${latestData - 1} : ${latestData.message}`);
            } catch (error) {
                console.error("Error getting value:", error);
                alert("値の取得に失敗しました。");
            }
    }}

    const onClickSetValue = async () => {
        if (contract && inputValue !== null) {
            try {
                const tx = await contract.addData(inputValue);
                const receipt = await tx.wait();
                console.log("Transaction receipt:", receipt);
                await getCurrentValue();
            } catch (error) {
                console.error("Error setting value:", error);
                alert("値の設定に失敗しました。");
            }
        }
    }

    const switchNetwork = async (provider:BrowserProvider) => {
        try {
            console.log("Switching network...");
            console.log("provider:",provider);
            await provider?.send("wallet_switchEthereumChain", [{ chainId: targetChainIdStr }]);
            console.log("Network switched successfully");
        }catch (switchError:any) {
            if (switchError.code === 4902) {
                // This error code indicates that the chain has not been added to MetaMask.
                try {
                    await provider?.send("wallet_addEthereumChain", [targetNetwork]);
                } catch (addError) {
                    console.error("Error adding network:", addError);
                    alert("ネットワークの追加に失敗しました。");
                }
            }
        }
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <h1>Test Contract Page</h1>

            <div className="mt-6">
                <div>
                    {account ? (
                        <p>Connected account: {account}</p>
                    ) : (
                        <button onClick={connectWallet}>
                            Connect Wallet
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <div>
                    CurrentValue : {inputValue}
                </div>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value as unknown as string)}
                    placeholder="Enter a message!"
                ></input>

                <button onClick={onClickSetValue}>
                    Set Value
                </button>

            </div>

            <div className="mt-6">
                <h2>Event History</h2>
                <ul>
                    {eventHistory.reverse().map((event, index) => (
                        <li key={index}>{event}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
