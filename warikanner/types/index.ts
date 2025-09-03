// ======================================
// 基本データ型
// ======================================

export interface User {
  address: string;
  name?: string;
}

export interface Invoice {
  id: string;
  payer: string;        // 支払者のアドレス
  recipient: string;    // 受取人のアドレス
  amount: string;       // 金額（Wei単位での文字列）
  isPaid: boolean;      // 支払い済みフラグ
  createdAt?: number;   // 作成日時（タイムスタンプ）
  description?: string; // 説明
}

export interface PaymentHistory {
  invoiceId: string;
  payer: string;
  recipient: string;
  amount: string;
  timestamp: number;
  transactionHash?: string;
}

// ======================================
// API インターフェース（モック用）
// ======================================

export interface WalletInterface {
  connect(): Promise<string>;
  disconnect(): Promise<void>;
  getAddress(): Promise<string>;
  getNetwork(): Promise<number>;
  isConnected(): boolean;
}

export interface ContractInterface {
  createInvoice(payer: string, amount: string, description?: string): Promise<string>;
  payInvoice(invoiceId: string): Promise<string>;
  getInvoice(invoiceId: string): Promise<Invoice>;
  getInvoicesForUser(userAddress: string): Promise<Invoice[]>;
}

export interface HistoryInterface {
  getPaymentHistory(userAddress: string): Promise<PaymentHistory[]>;
  getInvoiceHistory(userAddress: string): Promise<Invoice[]>;
}

// ======================================
// フォームデータ型
// ======================================

export interface CreateInvoiceForm {
  /**
   * 合計金額
   */
  amountSum: number;

  /**
   * 合計金額の通貨
   */
  amountSumCurrency: string;

  /**
   * 割り勘を行う人の数
   */
  splitCount: number;
}

export interface CreateInvoiceParticipant {
  participantNumber: number;

  /**
   * ウォレットアドレス
   */
  walletAddress: string;

  /**
   * 支払う金額
   */
  amount: number;
  
  /**
   * 端数を負担するかどうか
   */
  isRounding: boolean;
}

export interface RegisterForm {
  walletAddress: string;
  name: string;
  email: string;
  network: string;
}

// ======================================
// UI状態管理用
// ======================================

export interface AppState {
  user: User | null;
  isConnected: boolean;
  network: number | null;
  loading: boolean;
}
