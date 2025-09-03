'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { InvoiceCard } from '@/components/InvoiceCard';
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal';
import { walletService, contractService } from '@/services/mockServices';
import { formatEth, shortenAddress } from '@/utils';
import type { Invoice, CreateInvoiceForm } from '@/types';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'payable' | 'receivable'>('all');

  useEffect(() => {
    checkWalletAndLoadData();
  }, []);

  const checkWalletAndLoadData = async () => {
    try {
      if (walletService.isConnected()) {
        const addr = await walletService.getAddress();
        setAddress(addr);
        setIsConnected(true);
        await loadInvoices(addr);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const loadInvoices = async (userAddress: string) => {
    try {
      setLoading(true);
      const userInvoices = await contractService.getInvoicesForUser(userAddress);
      setInvoices(userInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    try {
      const addr = await walletService.connect();
      setAddress(addr);
      setIsConnected(true);
      await loadInvoices(addr);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('ウォレットの接続に失敗しました');
    }
  };

  const createInvoice = async (data: CreateInvoiceForm) => {
    try {
      const invoiceId = await contractService.createInvoice(
        data.payerAddress,
        data.amount,
        data.description
      );
      
      console.log('Created invoice:', invoiceId);
      
      // 請求書リストを再読み込み
      await loadInvoices(address);
      
      alert('請求書が作成されました！');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      alert('請求書の作成に失敗しました');
      throw error;
    }
  };

  const payInvoice = async (invoiceId: string) => {
    try {
      const txHash = await contractService.payInvoice(invoiceId);
      console.log('Payment transaction:', txHash);
      
      // 請求書リストを再読み込み
      await loadInvoices(address);
      
      alert('支払いが完了しました！');
    } catch (error) {
      console.error('Failed to pay invoice:', error);
      alert('支払いに失敗しました');
      throw error;
    }
  };

  const getFilteredInvoices = () => {
    switch (activeTab) {
      case 'payable':
        return invoices.filter(invoice => 
          invoice.payer === address && !invoice.isPaid
        );
      case 'receivable':
        return invoices.filter(invoice => 
          invoice.recipient === address
        );
      default:
        return invoices;
    }
  };

  const getStats = () => {
    const totalInvoices = invoices.length;
    const payableInvoices = invoices.filter(invoice => 
      invoice.payer === address && !invoice.isPaid
    ).length;
    const receivableInvoices = invoices.filter(invoice => 
      invoice.recipient === address && !invoice.isPaid
    ).length;

    const totalPayable = invoices
      .filter(invoice => invoice.payer === address && !invoice.isPaid)
      .reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0);

    const totalReceivable = invoices
      .filter(invoice => invoice.recipient === address && !invoice.isPaid)
      .reduce((sum, invoice) => sum + parseFloat(invoice.amount), 0);

    return {
      totalInvoices,
      payableInvoices,
      receivableInvoices,
      totalPayable: totalPayable.toString(),
      totalReceivable: totalReceivable.toString()
    };
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardBody className="py-12">
              <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ウォレットを接続してください
              </h2>
              <p className="text-gray-600 mb-6">
                支払い一覧を表示するには、
                <br />
                ウォレットを接続する必要があります。
              </p>
              <Button
                onClick={connectWallet}
                className="flex items-center space-x-2 mx-auto"
              >
                <Wallet size={20} />
                <span>ウォレットを接続</span>
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={32} />
          <p className="text-gray-600 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const filteredInvoices = getFilteredInvoices();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              支払い一覧
            </h1>
            <p className="text-gray-600">
              接続中: {shortenAddress(address)}
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 mt-4 sm:mt-0"
          >
            <Plus size={20} />
            <span>新しい請求書</span>
          </Button>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">総請求書数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalInvoices}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-red-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">支払い予定</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatEth(stats.totalPayable)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.payableInvoices}件
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">受取予定</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatEth(stats.totalReceivable)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.receivableInvoices}件
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* フィルタータブ */}
        <div className="inline-flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            すべて
          </button>
          <button
            onClick={() => setActiveTab('payable')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'payable'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            支払い予定 ({stats.payableInvoices})
          </button>
          <button
            onClick={() => setActiveTab('receivable')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'receivable'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            受取予定 ({stats.receivableInvoices})
          </button>
        </div>

        {/* 請求書一覧 */}
        {filteredInvoices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onPay={payInvoice}
                isPayable={invoice.payer === address && !invoice.isPaid}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                請求書がありません
              </h3>
              <p className="text-gray-600 mb-4">
                {activeTab === 'all' && '請求書を作成するか、支払い請求を受け取ってください。'}
                {activeTab === 'payable' && '支払い予定の請求書はありません。'}
                {activeTab === 'receivable' && '受取予定の請求書はありません。'}
              </p>
              {activeTab !== 'payable' && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>最初の請求書を作成</span>
                </Button>
              )}
            </CardBody>
          </Card>
        )}

        {/* 請求書作成モーダル */}
        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={createInvoice}
        />
      </div>
    </div>
  );
}
