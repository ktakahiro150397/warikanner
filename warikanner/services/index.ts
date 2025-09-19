// 単純なre-export approach
// Next.jsのwebpack aliasで実際の実装を切り替える

export { walletService } from "./walletServices";
export { contractService, historyService } from "./mockServices";
