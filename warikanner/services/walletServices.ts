import {
  WalletInterface,
  ContractInterface,
  HistoryInterface,
  Invoice,
  PaymentHistory,
} from "@/types";
import { ethers } from "ethers";

class WalletService implements WalletInterface {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private connected: boolean = false;

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();
    this.connected = true;
    return address;
  }

  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.connected = false;
  }

  async getAddress(): Promise<string> {
    if (!this.connected || !this.signer) {
      throw new Error("Wallet not connected");
    }
    return this.signer.getAddress();
  }

  async getNetwork(): Promise<bigint> {
    if (!this.connected || !this.provider) {
      throw new Error("Wallet not connected");
    }
    const network = await this.provider.getNetwork();
    return network.chainId as bigint;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

export const walletService = new WalletService();
