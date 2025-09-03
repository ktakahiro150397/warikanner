import { CreateInvoiceParticipant } from "@/types";

export function getSplitAmountResults(
    totalAmount: number,
    participants: Array<{
        participantNumber: number;
        isRounding: boolean;
    }>,
) : Array<{
        participantNumber: number;
        splitAmount: number;
}> {
    return [
        {
            participantNumber: 1,
            splitAmount: totalAmount/3
        },
        {
            participantNumber: 2,
            splitAmount: totalAmount/3
        },
        {
            participantNumber: 3,
            splitAmount: totalAmount/3
        }
    ];
}