'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { walletService } from '@/services/mockServices';
import { shortenAddress } from '@/utils';

export function Header() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (walletService.isConnected()) {
        const addr = await walletService.getAddress();
        setAddress(addr);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      const addr = await walletService.connect();
      setAddress(addr);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('ウォレットの接続に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletService.disconnect();
      setAddress('');
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">割</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ワリカンナー</span>
          </Link>

          {/* デスクトップナビゲーション */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                ホーム
              </Link>
              <Link href="/invoices" className="text-gray-600 hover:text-gray-900 transition-colors">
                支払い一覧
              </Link>
              <Link href="/register" className="text-gray-600 hover:text-gray-900 transition-colors">
                新規登録
              </Link>
            </nav>
            
            {/* ウォレット接続ボタン */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
                  <Wallet size={16} />
                  <span className="text-sm font-medium">
                    {shortenAddress(address)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectWallet}
                >
                  切断
                </Button>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Wallet size={16} />
                <span>{loading ? '接続中...' : 'ウォレット接続'}</span>
              </Button>
            )}
          </div>

          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                ホーム
              </Link>
              <Link 
                href="/invoices" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                支払い一覧
              </Link>
              <Link 
                href="/register" 
                className="text-gray-600 hover:text-gray-900 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                新規登録
              </Link>
              
              {/* モバイル用ウォレット接続 */}
              <div className="pt-3 border-t border-gray-200">
                {isConnected ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-md">
                      <Wallet size={16} />
                      <span className="text-sm font-medium">
                        {shortenAddress(address)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disconnectWallet}
                      className="w-full"
                    >
                      切断
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={connectWallet}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Wallet size={16} />
                    <span>{loading ? '接続中...' : 'ウォレット接続'}</span>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
