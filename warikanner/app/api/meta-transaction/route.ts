import { NextRequest, NextResponse } from "next/server";
import { AddNewTransactionParams } from "@/contracts/PaymentGateway/Parameters";
import { GetSignMetaTransaction } from "@/contracts/PaymentGateway/Functions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const params = new AddNewTransactionParams(
      body.id,
      body.warikanId,
      body.from,
      body.to,
      body.amount,
      body.memo
    );

    console.log("Received params:", params);
    const signedTransaction = await GetSignMetaTransaction(params);

    console.log("Signed Transaction:", signedTransaction);

    return NextResponse.json(signedTransaction);
  } catch (error) {
    console.error("Error in /api/meta-transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
