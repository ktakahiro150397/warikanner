import { WalletInterface, ContractInterface, HistoryInterface, Invoice, PaymentHistory } from '@/types';

// ======================================
// モックウォレットサービス
// ======================================

class MockWalletService implements WalletInterface {
  private connected = false;
  private address = '';

  async connect(): Promise<string> {
    // モック: 固定アドレスを返す
    this.address = '0x742d35Cc6834C0532925a3b8D697Fc41B3Abb22f';
    this.connected = true;
    return this.address;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.address = '';
  }

  async getAddress(): Promise<string> {
    if (!this.connected) throw new Error('Wallet not connected');
    return this.address;
  }

  async getNetwork(): Promise<number> {
    // モック: Polygon Mumbai testnet
    return 80001;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// ======================================
// モックコントラクトサービス
// ======================================

class MockContractService implements ContractInterface {
  private invoices: Map<string, Invoice> = new Map();
  private invoiceCounter = 1;

  constructor() {
    // 初期データを作成
    this.initMockData();
  }

  private initMockData() {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        payer: '0x742d35Cc6834C0532925a3b8D697Fc41B3Abb22f',
        recipient: '0x8ba1f109551bD432803012645Hac136c9123456789',
        amount: '1000000000000000000', // 1 ETH in Wei
        isPaid: false,
        createdAt: Date.now() - 86400000, // 1日前
        description: 'ランチ代の割り勘'
      },
      {
        id: '2',
        payer: '0x742d35Cc6834C0532925a3b8D697Fc41B3Abb22f',
        recipient: '0x1234567890123456789012345678901234567890',
        amount: '500000000000000000', // 0.5 ETH in Wei
        isPaid: true,
        createdAt: Date.now() - 172800000, // 2日前
        description: 'タクシー代'
      },
      {
        id: '3',
        payer: '0x9876543210987654321098765432109876543210',
        recipient: '0x742d35Cc6834C0532925a3b8D697Fc41B3Abb22f',
        amount: '2000000000000000000', // 2 ETH in Wei
        isPaid: false,
        createdAt: Date.now() - 259200000, // 3日前
        description: '飲み会の幹事費用'
      }
    ];

    mockInvoices.forEach(invoice => {
      this.invoices.set(invoice.id, invoice);
    });
    this.invoiceCounter = mockInvoices.length + 1;
  }

  async createInvoice(payer: string, amount: string, description?: string): Promise<string> {
    // 現在接続中のアドレスを受取人とする
    const recipient = '0x742d35Cc6834C0532925a3b8D697Fc41B3Abb22f';
    
    const newInvoice: Invoice = {
      id: this.invoiceCounter.toString(),
      payer,
      recipient,
      amount,
      isPaid: false,
      createdAt: Date.now(),
      description: description || ''
    };

    this.invoices.set(newInvoice.id, newInvoice);
    this.invoiceCounter++;

    // モック: 少し待機してリアルな感じを演出
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return newInvoice.id;
  }

  async payInvoice(invoiceId: string): Promise<string> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    if (invoice.isPaid) {
      throw new Error('Invoice already paid');
    }

    // 支払い処理（モック）
    invoice.isPaid = true;
    this.invoices.set(invoiceId, invoice);

    // モック: 少し待機してリアルな感じを演出
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // モックトランザクションハッシュを返す
    return `0x${Math.random().toString(16).substr(2, 64)}`;
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async getInvoicesForUser(userAddress: string): Promise<Invoice[]> {
    const userInvoices = Array.from(this.invoices.values()).filter(
      invoice => invoice.payer === userAddress || invoice.recipient === userAddress
    );
    
    // 作成日時でソート（新しい順）
    return userInvoices.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }
}

// ======================================
// モック履歴サービス
// ======================================

class MockHistoryService implements HistoryInterface {
  async getPaymentHistory(userAddress: string): Promise<PaymentHistory[]> {
    // モックデータ
    const mockHistory: PaymentHistory[] = [
      {
        invoiceId: '2',
        payer: userAddress,
        recipient: '0x1234567890123456789012345678901234567890',
        amount: '500000000000000000',
        timestamp: Date.now() - 172800000,
      },
      {
        invoiceId: '4',
        payer: '0x9876543210987654321098765432109876543210',
        recipient: userAddress,
        amount: '1500000000000000000',
        timestamp: Date.now() - 345600000, // 4日前
      }
    ];

    return mockHistory;
  }

  async getInvoiceHistory(userAddress: string): Promise<Invoice[]> {
    // 実際の実装では、ContractServiceと連携する
    const contractService = new MockContractService();
    return contractService.getInvoicesForUser(userAddress);
  }
}

// ======================================
// サービスインスタンスをエクスポート
// ======================================

export const walletService = new MockWalletService();
export const contractService = new MockContractService();
export const historyService = new MockHistoryService();
