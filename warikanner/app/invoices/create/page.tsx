'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, FileText, CreditCard, Wallet, AlertCircle, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { InvoiceCard } from '@/components/InvoiceCard';
import { CreateInvoiceModal } from '@/components/CreateInvoiceModal';
import { walletService, contractService } from '@/services/mockServices';
import { formatEth, shortenAddress } from '@/utils';
import type { Invoice, CreateInvoiceForm, CreateInvoiceParticipant } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getSplitAmountResults } from '@/utils/splitter';

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
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<CreateInvoiceForm & { participants: Array<CreateInvoiceParticipant> }>({
    defaultValues: {
      participants: [{ participantNumber: 1, walletAddress: '', amount: 0, isRounding: true }]
    }
  });

  // 動的フィールド配列管理
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants'
  });

  const amountSum = watch('amountSum')

  // 参加者を追加する関数
  const addParticipant = () => {
    append({ participantNumber: fields.length + 1, walletAddress: '', amount: 99999, isRounding: false });
  };

  // 参加者を削除する関数
  const removeParticipant = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onChangeAmountSum = (value: number) => {
    const splitResults = getSplitAmountResults(value, fields);
    console.log(splitResults)
    splitResults.forEach((result, index) => {
      setValue(`participants.${index}.amount`, result.splitAmount);
    });
  };

  // const onDeleteParticipant = (value: number) => {
  //   getSplitAmountResults(value, fields);
  // }

  const onSubmit = (data: CreateInvoiceForm & { participants: Array<CreateInvoiceParticipant> }) => {
    console.log('Form Data:', data);
    console.log('Participants:', data.participants);

    // 端数負担者をフィルタリング
    const roundingParticipants = data.participants.filter(p => p.isRounding);
    console.log('端数負担者:', roundingParticipants);
  }

  // useEffect(() => {
  //   // 割り勘金額を再度取得
  //   const splitResults = getSplitAmountResults(amountSum || 0, fields);
  //   console.log(splitResults);
  //   splitResults.forEach((result, index) => {
  //     setValue(`participants.${index}.amount`, result.splitAmount);
  //   });


  // }, [amountSum]);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">請求書作成</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* 基本情報セクション */}
          <Card className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">基本情報</h2>
              <div className='flex items-center gap-4'>
                <div className="flex-1">

                  <Controller
                    name="amountSum"
                    control={control}
                    rules={{
                      required: {
                        value: true,
                        message: '金額を入力してください'
                      },
                      // valueAsNumber: true,
                      min: {
                        value: 1,
                        message: '1以上の数値を入力してください',
                      },
                      validate: (value) => {
                        return !isNaN(value) || '数値を入力してください';
                      }
                    }}
                    render={({ field }) => (
                      <Input
                        type='text'
                        inputMode='numeric'
                        placeholder="金額を入力"
                        className='w-1/2'
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                          onChangeAmountSum(Number(e.target.value) || 0);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        error={errors.amountSum?.message}
                      />
                    )}
                  />
                </div>
                <span className='text-lg font-medium'>円を {fields.length} 人で割り勘する！</span>
              </div>
            </div>
          </Card>

          {/* 参加者セクション */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <h2 className="text-xl font-semibold text-gray-900">参加者詳細</h2>
              </div>

              {/* カード形式 */}
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">参加者 #{index + 1}</h3>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`rounding-${index}`}
                            {...register(`participants.${index}.isRounding`)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label
                            htmlFor={`rounding-${index}`}
                            className="ml-2 text-sm text-gray-600"
                          >
                            端数を負担する
                          </label>
                        </div>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeParticipant(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ウォレットアドレス
                        </label>
                        <Input
                          type="text"
                          placeholder="0x..."
                          className="w-full"
                          {...register(`participants.${index}.walletAddress`, {
                            pattern: {
                              value: /^0x[a-fA-F0-9]{40}$/,
                              message: '有効なウォレットアドレスを入力してください'
                            }
                          })}
                          error={errors.participants?.[index]?.walletAddress?.message}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          分担額
                        </label>
                        <div className="h-10 flex items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            {(watch(`participants.${index}.amount`) || 0).toLocaleString()}円
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 参加者追加ボタン */}
              <div className="text-center">
                <Button
                  type="button"
                  onClick={addParticipant}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  参加者を追加
                </Button>
              </div>

              {/* 参加者リストのサマリー */}
              {fields.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">参加者サマリー</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>参加者数: {fields.length}人</p>
                    <p>
                      合計分担額: {fields.reduce((sum, _, index) => {
                        const amount = watch(`participants.${index}.amount`);
                        return sum + (Number(amount) || 0);
                      }, 0).toLocaleString()}円
                    </p>
                    <p>
                      端数負担者: {fields.filter((_, index) => watch(`participants.${index}.isRounding`)).length}人
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 送信ボタン */}
          <div className='text-right'>
            <Button
              type="submit"
              className="px-8 py-2 bg-green-600 hover:bg-green-700"
            >
              請求書を作成
            </Button>
          </div>
        </form>
      </div>
    </div>
  )

}
