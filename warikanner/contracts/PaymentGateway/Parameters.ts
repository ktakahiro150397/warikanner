import type { Address } from "@/contracts/types";

export interface IMetaTransctionSignable {
  ToParamArray(): unknown[];
  ToJson(): string;
}

export class AddNewTransactionParams implements IMetaTransctionSignable {
  constructor(
    public readonly id: string,
    public readonly warikanId: string,
    public readonly from: Address,
    public readonly to: Address,
    public readonly amount: number,
    public readonly memo: string
  ) {}

  ToParamArray(): unknown[] {
    return [
      this.id,
      this.warikanId,
      this.from,
      this.to,
      this.amount,
      this.memo,
    ];
  }

  ToJson(): string {
    return JSON.stringify({
      id: this.id,
      warikanId: this.warikanId,
      from: this.from,
      to: this.to,
      amount: this.amount,
      memo: this.memo,
    });
  }
}
