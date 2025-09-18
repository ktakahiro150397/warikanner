"use client";

import { ethers, BrowserProvider, Signer, Contract } from "ethers";
import { contractAddress, contractABI, targetChainId, targetNetwork, targetChainIdStr } from "@/contracts/simpleStorageContract"
import { useEffect, useState } from "react";

export default function Page() {
    const [id, setId] = useState("");
    const [warikanId, setwarikanId] = useState("");


    const generateRandomUint128 = (): string => {
        // 128ビット = 32桁の16進数
        const randomHex = ethers.hexlify(ethers.randomBytes(16));
        return BigInt(randomHex).toString();
    };

    useEffect(() => {
        setId(generateRandomUint128());
        setwarikanId(generateRandomUint128());
    }, []);

    function onClickCall() {

    }

    return (
        <div>
            <h1>Forwarder Contract Call Sample</h1>

            <div>
                <label>ID</label>
                <input type="text" placeholder="id" value={id} />
            </div>
            <div>
                <label>割り勘ID</label>
                <input type="text" placeholder="warikanId" value={warikanId} />
            </div>

            <button onClick={onClickCall}>addNewTransaction呼び出し</button>
        </div>
    )

}