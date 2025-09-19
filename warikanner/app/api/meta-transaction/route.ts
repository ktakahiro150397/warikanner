import { NextRequest, NextResponse } from "next/server";
import { AddNewTransactionParams } from "@/contracts/PaymentGateway/Parameters";
import {
  GetSignMetaTransaction,
  sendMetaTransaction,
} from "@/contracts/PaymentGateway/Functions";

export async function POST(request: NextRequest) {
  try {
    const signedTransaction = await request.json();

    // const params = new AddNewTransactionParams(
    //   body.id,
    //   body.warikanId,
    //   body.from,
    //   body.to,
    //   body.amount,
    //   body.memo
    // );

    console.log("Received signedTransaction:", signedTransaction);

    // const signedTransaction = await GetSignMetaTransaction(params);
    // console.log("Signed Transaction:", signedTransaction);

    const receipt = await sendMetaTransaction(signedTransaction);
    console.log("Transaction Receipt:", receipt);

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Error in /api/meta-transaction:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
