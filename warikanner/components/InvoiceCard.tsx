'use client';

import { useState } from 'react';
import { QrCode as QRCodeIcon, Copy, ExternalLink, CheckCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { formatEth, shortenAddress, formatRelativeTime, generateQRCodeData } from '@/utils';
import type { Invoice } from '@/types';

interface InvoiceCardProps {
  invoice: Invoice;
  onPay?: (invoiceId: string) => Promise<void>;
  isPayable?: boolean;
}

export function InvoiceCard({ invoice, onPay, isPayable = false }: InvoiceCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [paying, setPaying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const paymentData = generateQRCodeData(
    '0x1234567890123456789012345678901234567890', // モックコントラクトアドレス
    invoice.id,
    invoice.amount
  );

  const handlePay = async () => {
    if (!onPay) return;
    
    try {
      setPaying(true);
      await onPay(invoice.id);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setPaying(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusColor = () => {
    if (invoice.isPaid) return 'text-green-600 bg-green-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getStatusText = () => {
    return invoice.isPaid ? '支払い済み' : '未払い';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {invoice.description || `請求書 #${invoice.id}`}
            </h3>
            <p className="text-sm text-gray-600">
              {invoice.createdAt && formatRelativeTime(invoice.createdAt)}
            </p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </CardHeader>

      <CardBody>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">金額</label>
            <p className="text-2xl font-bold text-gray-900">
              {formatEth(invoice.amount)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">支払者</label>
              <p className="text-sm text-gray-900 font-mono">
                {shortenAddress(invoice.payer)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">受取人</label>
              <p className="text-sm text-gray-900 font-mono">
                {shortenAddress(invoice.recipient)}
              </p>
            </div>
          </div>

          {showQR && (
            <div className="flex flex-col items-center space-y-3 p-4 bg-gray-50 rounded-lg">
              <QRCode value={paymentData} size={200} />
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-2">
                  QRコードをスキャンして支払い
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(paymentData)}
                    className="flex items-center space-x-1"
                  >
                    {copySuccess ? (
                      <CheckCircle size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="text-xs">
                      {copySuccess ? 'コピー済み' : 'リンクをコピー'}
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(paymentData, '_blank')}
                    className="flex items-center space-x-1"
                  >
                    <ExternalLink size={14} />
                    <span className="text-xs">外部で開く</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>

      {!invoice.isPaid && (
        <CardFooter>
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center space-x-2"
            >
              <QRCodeIcon size={16} />
              <span>{showQR ? 'QRコードを閉じる' : 'QRコードを表示'}</span>
            </Button>
            
            {isPayable && (
              <Button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                {paying ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span>支払い中...</span>
                  </>
                ) : (
                  <span>支払う</span>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
