'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, FileText, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { InvoiceCard } from '@/components/InvoiceCard';
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal';
import { walletService, contractService } from '@/services/mockServices';
import { formatEth, shortenAddress } from '@/utils';
import type { Invoice, CreateInvoiceForm } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function InvoiceCreatePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'payable' | 'receivable'>('all');

  // フォーム管理
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateInvoiceForm>();

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

  const onClickSetMyselfAddress = () => {
    if (address) {
      setValue('payerAddress', address);
    } else {
      alert('ウォレットが接続されていません');
    }
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
                請求書を作成するには、
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
          
          <form className='space-y-4'>
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">
                  新しい割り勘請求書を作成
                </h2>
                <p className='text-sm text-gray-600'>
                  割り勘情報を入力してください。
                </p>
              </CardHeader>

              <CardBody className='space-y-4'>
                <div className='flex flex-col sm:flex-row gap-2 sm:items-end'>
                  <div className='flex-1'>
                    <Input 
                      label="支払いを行った人のウォレットアドレス"
                      placeholder='0x...'
                      {...register('payerAddress', {
                        required: '支払者のアドレスは必須です'
                      })}
                      error={errors.payerAddress?.message}
                    />
                  </div>
                  <div className='w-full sm:w-auto'>
                    <Button 
                      type="button"
                      onClick={onClickSetMyselfAddress}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <span>自分を設定する</span>
                    </Button>
                  </div>
                </div>

                <div className='flex flex-col sm:flex-row gap-2 sm:items-end'>
                  <div className='flex-1'>
                    <Input
                      label="支払いを行った合計金額"
                      placeholder='123'
                      type="number"
                      step="0.001"
                      {...register('amount', {
                        required: '金額は必須です'
                      })}
                      error={errors.amount?.message}
                    />
                  </div>
                  <div className='w-full sm:w-64'>
                    <Select
                      label="通貨"
                      options={[
                        { value: 'jpy', label: 'JPY' },
                        { value: 'usd', label: 'USD' },
                        { value: 'eur', label: 'EUR' },
                      ]}
                    />
                  </div>
                </div>

                <Input
                  label="説明文"
                  placeholder='ラーメン代'
                  {...register('description')}
                />
              </CardBody>

            </Card>
            

          </form>
       
      </div>
    </div>
  );
}
