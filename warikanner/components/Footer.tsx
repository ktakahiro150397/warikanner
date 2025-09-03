import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サービス概要 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">割</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ワリカンナー</span>
            </div>
            <p className="text-gray-600 text-sm">
              ブロックチェーン技術を活用した、透明性の高い割り勘アプリです。
              QRコードやリンクで簡単に支払い請求ができます。
            </p>
          </div>

          {/* ナビゲーション */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">ナビゲーション</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  ホーム
                </Link>
              </li>
              <li>
                <Link href="/invoices" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  支払い一覧
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  新規登録
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート情報 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  使い方ガイド
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  よくある質問
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  お問い合わせ
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © 2025 ワリカンナー. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-600 text-sm">
              プライバシーポリシー
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-600 text-sm">
              利用規約
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
