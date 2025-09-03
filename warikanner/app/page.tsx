'use client';

import Link from 'next/link';
import { ArrowRight, Shield, QrCode, Users, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            ブロックチェーンで
            <span className="text-blue-600">透明な割り勘</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            QRコードやリンクで簡単に支払い請求。すべての取引がブロックチェーンに記録され、
            透明性と信頼性を確保します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="flex items-center space-x-2">
                <span>今すぐ始める</span>
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/invoices">
              <Button variant="outline" size="lg">
                支払い一覧を見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              なぜワリカンナーなのか？
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              従来の割り勘アプリの問題を解決し、より透明で信頼できる体験を提供します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  透明性
                </h3>
                <p className="text-gray-600 text-sm">
                  すべての取引がブロックチェーンに記録され、改ざん不可能で透明性が保たれます。
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  簡単操作
                </h3>
                <p className="text-gray-600 text-sm">
                  QRコードやリンクを送るだけで、相手に支払い請求を送ることができます。
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="text-purple-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  グループ管理
                </h3>
                <p className="text-gray-600 text-sm">
                  複数人での割り勘も簡単に管理。誰が支払ったかすぐに確認できます。
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="text-orange-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  自動決済
                </h3>
                <p className="text-gray-600 text-sm">
                  スマートコントラクトにより、支払い条件が満たされると自動で決済が実行されます。
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* 使い方セクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              簡単3ステップ
            </h2>
            <p className="text-lg text-gray-600">
              誰でも簡単に使えるシンプルな操作
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                ウォレット接続
              </h3>
              <p className="text-gray-600">
                MetaMaskなどのウォレットを接続して、アカウントを作成します。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                請求作成
              </h3>
              <p className="text-gray-600">
                支払者のアドレスと金額を入力して、支払い請求を作成します。
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                リンク共有
              </h3>
              <p className="text-gray-600">
                QRコードやリンクを支払者に送信して、簡単に支払いを受け取ります。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            今すぐワリカンナーを始めよう
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            透明で信頼できる割り勘体験を、今日から始めませんか？
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 flex items-center space-x-2"
              >
                <span>無料で始める</span>
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/invoices">
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                デモを見る
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
