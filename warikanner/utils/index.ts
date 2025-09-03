import { ethers } from 'ethers';

// ======================================
// ETH/Wei変換ユーティリティ
// ======================================

export function weiToEth(wei: string): string {
  return ethers.formatEther(wei);
}

export function ethToWei(eth: string): string {
  return ethers.parseEther(eth).toString();
}

export function formatEth(wei: string, decimals: number = 4): string {
  const eth = weiToEth(wei);
  return `${parseFloat(eth).toFixed(decimals)} ETH`;
}

// ======================================
// アドレス関連ユーティリティ
// ======================================

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function isValidAddress(address: string): boolean {
  try {
    return true;
    // return ethers.isAddress(address);
  } catch {
    return false;
  }
}

// ======================================
// 日時関連ユーティリティ
// ======================================

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'たった今';
  if (minutes < 60) return `${minutes}分前`;
  if (hours < 24) return `${hours}時間前`;
  if (days < 7) return `${days}日前`;
  
  return formatDate(timestamp);
}

// ======================================
// EIP-681 支払いリンク生成
// ======================================

export function generatePaymentLink(
  contractAddress: string,
  invoiceId: string,
  amount?: string
): string {
  // EIP-681形式の支払いリンクを生成
  const baseUrl = `ethereum:${contractAddress}`;
  const functionName = 'payInvoice';
  const params = new URLSearchParams();
  
  params.set('function', functionName);
  params.set('invoiceId', invoiceId);
  
  if (amount) {
    params.set('value', amount);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

export function generateQRCodeData(
  contractAddress: string,
  invoiceId: string,
  amount?: string
): string {
  return generatePaymentLink(contractAddress, invoiceId, amount);
}

// ======================================
// CSS関連ユーティリティ
// ======================================

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ======================================
// バリデーション
// ======================================

export function validateEthAmount(amount: string): boolean {
  try {
    const parsed = parseFloat(amount);
    return parsed > 0 && parsed <= 1000000; // 1M ETH上限
  } catch {
    return false;
  }
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>\"']/g, '');
}
