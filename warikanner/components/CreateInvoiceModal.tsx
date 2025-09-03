'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { isValidAddress, validateEthAmount } from '@/utils';
import type { CreateInvoiceForm } from '@/types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoiceForm) => Promise<void>;
}

export function CreateInvoiceModal({ isOpen, onClose, onSubmit }: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInvoiceForm>();

  const handleFormSubmit = async (data: CreateInvoiceForm) => {
    try {
      setLoading(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to create invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                新しい請求書を作成
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={loading}
              >
                <X size={20} />
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              支払いを請求する相手の情報を入力してください
            </p>
          </CardHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <CardBody className="space-y-4">
              <Input
                label="支払者のウォレットアドレス"
                placeholder="0x..."
                {...register('payerAddress', {
                  required: '支払者のアドレスは必須です',
                  validate: (value) => 
                    isValidAddress(value) || '有効なウォレットアドレスを入力してください'
                })}
                error={errors.payerAddress?.message}
                disabled={loading}
              />

              <Input
                label="金額 (ETH)"
                type="number"
                step="0.001"
                placeholder="0.1"
                {...register('amount', {
                  required: '金額は必須です',
                  validate: (value) => 
                    validateEthAmount(value) || '有効な金額を入力してください（0より大きい値）'
                })}
                error={errors.amount?.message}
                disabled={loading}
              />

              <Input
                label="説明（任意）"
                placeholder="例: ランチ代の割り勘"
                {...register('description')}
                disabled={loading}
              />

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h4 className="text-sm font-medium text-blue-800 mb-1">
                  確認事項
                </h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 請求書作成後は内容を変更できません</li>
                  <li>• 支払者にQRコードやリンクを共有してください</li>
                  <li>• 支払いはブロックチェーン上で実行されます</li>
                </ul>
              </div>
            </CardBody>

            <CardFooter>
              <div className="flex space-x-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size={16} />
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>請求書を作成</span>
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
