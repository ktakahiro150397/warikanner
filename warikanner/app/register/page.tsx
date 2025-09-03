'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Wallet, UserPlus, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectOption } from '@/components/ui/Select';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/Loading';
import { walletService } from '@/services/mockServices';
import { shortenAddress, isValidAddress } from '@/utils';
import type { RegisterForm } from '@/types';

export default function RegisterPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  // ネットワーク選択のオプション
  const networkOptions: SelectOption[] = [
    { value: 'polygon', label: 'Polygon (MATIC)' },
    { value: 'ethereum', label: 'Ethereum (ETH)' },
    { value: 'mumbai', label: 'Polygon Mumbai (テストネット)', disabled: false },
    { value: 'goerli', label: 'Goerli (テストネット)', disabled: true },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterForm>();

  const connectWallet = async () => {
    try {
      setLoading(true);
      const addr = await walletService.connect();
      setAddress(addr);
      setIsConnected(true);
      setValue('walletAddress', addr);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('ウォレットの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);
      
      // モック：登録処理
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration data:', data);
      setIsRegistered(true);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardBody className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                登録完了！
              </h2>
              <p className="text-gray-600 mb-6">
                アカウントの登録が完了しました。
                <br />
                ワリカンナーをお楽しみください！
              </p>
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/invoices'}
                >
                  支払い一覧を見る
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/'}
                >
                  ホームに戻る
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            新規アカウント登録
          </h1>
          <p className="text-gray-600">
            ワリカンナーを始めるために、
            <br />
            ウォレットを接続してアカウントを作成しましょう。
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              アカウント情報
            </h2>
            <p className="text-sm text-gray-600">
              必要な情報を入力してください
            </p>
          </CardHeader>
          
          <CardBody>
            {/* ウォレット接続セクション */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                ウォレット接続
              </label>
              {isConnected ? (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      接続済み
                    </p>
                    <p className="text-xs text-green-600">
                      {shortenAddress(address)}
                    </p>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Wallet size={20} />
                  <span>
                    {loading ? '接続中...' : 'ウォレットを接続'}
                  </span>
                  {loading && <LoadingSpinner size={16} />}
                </Button>
              )}
            </div>

            {/* 登録フォーム */}
            {isConnected && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="ウォレットアドレス"
                  {...register('walletAddress', {
                    required: 'ウォレットアドレスは必須です',
                    validate: (value) => 
                      isValidAddress(value) || '有効なアドレスを入力してください'
                  })}
                  value={address}
                  readOnly
                  className="bg-gray-50"
                  error={errors.walletAddress?.message}
                />

                <Input
                  label="表示名"
                  placeholder="例: 田中太郎"
                  {...register('name', {
                    required: '表示名は必須です',
                    minLength: {
                      value: 2,
                      message: '表示名は2文字以上で入力してください'
                    }
                  })}
                  error={errors.name?.message}
                />

                <Input
                  label="メールアドレス（任意）"
                  type="email"
                  placeholder="example@domain.com"
                  {...register('email', {
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: '有効なメールアドレスを入力してください'
                    }
                  })}
                  error={errors.email?.message}
                />

                <Controller
                  name="network"
                  control={control}
                  rules={{ required: 'ネットワークの選択は必須です' }}
                  render={({ field }) => (
                    <Select
                      label="利用ネットワーク"
                      placeholder="ネットワークを選択してください"
                      options={networkOptions}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.network?.message}
                    />
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <LoadingSpinner size={16} />
                        <span>登録中...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>アカウントを作成</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {!isConnected && (
              <div className="text-center text-gray-500 text-sm mt-6">
                ウォレットを接続してから登録情報を入力してください
              </div>
            )}
          </CardBody>
        </Card>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            ご利用にあたって
          </h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• MetaMaskなどのWeb3ウォレットが必要です</li>
            <li>• Polygon networkに対応しています</li>
            <li>• ガス代が必要になる場合があります</li>
            <li>• 個人情報は最小限の取得に留めています</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
