import { ethers } from "ethers";

export type Address = `0x${string}`;

export interface EIP712Domain {
  fields: string;
  name: string;
  version: string;
  chainId: string;
  verifyingContract: string;
  salt: string;
  extensions: string[];
}

export interface MetaTransactionRequest {
  from: Address;
  to: Address;
  value: string;
  gas: string;
  nonce: string;
  deadline: string;
  data: string;
}

export class SignedRequestForTrustedForwarder {
  public _signature: string = "";

  constructor(private data: MetaTransactionRequest) {}

  public setSignature(signature: string) {
    this._signature = signature;
  }

  public getUnsignedRawData(): MetaTransactionRequest {
    return this.data;
  }

  public getSignedData(): MetaTransactionRequest & { signature: string } {
    return {
      ...this.data,
      signature: this._signature,
    };
  }

  public types = {
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
}

export interface ForwarderContract {
  nonces(address: string): Promise<bigint>;
  verify(request: unknown): Promise<boolean>;
  execute(request: unknown): Promise<ethers.TransactionResponse>;
  eip712Domain(): Promise<{
    fields: string;
    name: string;
    version: string;
    chainId: string;
    verifyingContract: string;
    salt: string;
    extensions: string[];
  }>;
}
