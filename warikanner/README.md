# ワリカンナー - ブロックチェーン割り勘アプリ

透明性の高いブロックチェーン技術を活用した割り勘アプリです。QRコードやリンクで簡単に支払い請求ができます。

## 🌟 特徴

- **透明性**: すべての取引がブロックチェーンに記録され、改ざん不可能
- **簡単操作**: QRコードやリンクを送るだけで支払い請求
- **グループ管理**: 複数人での割り勘も簡単に管理
- **自動決済**: スマートコントラクトによる自動支払い実行
- **レスポンシブデザイン**: スマホ・PCどちらでも快適に利用可能

## 🚀 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **ブロックチェーン**: ethers.js (Polygon対応予定)
- **UI コンポーネント**: Lucide React (アイコン)
- **フォーム管理**: React Hook Form + Zod
- **QRコード**: react-qr-code

## 📁 プロジェクト構造

```
warikanner/
├── app/                    # Next.js App Router
│   ├── page.tsx           # トップページ (ランディングページ)
│   ├── register/          # 新規登録ページ
│   └── invoices/          # 支払い一覧ページ
├── components/            # Reactコンポーネント
│   ├── ui/               # 共通UIコンポーネント
│   ├── Header.tsx        # ヘッダー
│   ├── Footer.tsx        # フッター
│   ├── InvoiceCard.tsx   # 請求書カード
│   └── CreateInvoiceModal.tsx  # 請求書作成モーダル
├── services/             # API・サービス層
│   └── mockServices.ts   # モックサービス (実装分離)
├── types/               # TypeScript型定義
├── utils/               # ユーティリティ関数
└── docs/               # ドキュメント
    └── overview.md     # アプリ概要
```

## 🛠️ セットアップ & 実行

### 前提条件

- Node.js 18+
- npm または yarn

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

アプリケーションが `http://localhost:3000` (または利用可能なポート) で起動します。

### ビルド

```bash
# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start
```

## 📱 主要ページ

### 1. トップページ (/)
- サービス概要とメリット紹介
- 使い方ガイド (3ステップ)
- CTA (新規登録・デモへの導線)

### 2. 新規登録ページ (/register)
- ウォレット接続
- ユーザー情報入力
- アカウント作成

### 3. 支払い一覧ページ (/invoices)
- 自分関連の請求書一覧
- 支払い予定・受取予定の統計
- 新規請求書作成
- QRコード・リンク生成
- 支払い実行

## 🔧 主要機能

### ウォレット接続
```typescript
// モックサービスによるウォレット接続
const connectWallet = async () => {
  const address = await walletService.connect();
  // 実際の実装では MetaMask などの Web3 ウォレットに接続
};
```

### 請求書作成
```typescript
// 新しい請求書を作成
const createInvoice = async (data: CreateInvoiceForm) => {
  const invoiceId = await contractService.createInvoice(
    data.payerAddress,
    ethToWei(data.amount),
    data.description
  );
};
```

### 支払い実行
```typescript
// 請求書への支払い
const payInvoice = async (invoiceId: string) => {
  const txHash = await contractService.payInvoice(invoiceId);
  // 実際の実装では スマートコントラクトの payInvoice 関数を呼び出し
};
```

## 🎨 デザインシステム

### カラーパレット
- **プライマリ**: Blue (blue-600)
- **成功**: Green (green-600)
- **警告**: Yellow (yellow-600)
- **エラー**: Red (red-600)
- **グレースケール**: Gray (gray-50 〜 gray-900)

### コンポーネント
- `Button`: 各種バリアント対応
- `Input`: ラベル・エラー表示付き
- `Card`: ヘッダー・ボディ・フッター構造
- `LoadingSpinner`: 読み込み状態表示

## 🔮 今後の実装予定

### スマートコントラクト連携
現在はモックサービスですが、以下の実装を予定:

```solidity
// 請求書スマートコントラクト (Solidity)
contract InvoiceContract {
    struct Invoice {
        address payer;
        address recipient;
        uint256 amount;
        bool isPaid;
        string description;
    }
    
    function createInvoice(address _payer, uint256 _amount, string memory _description) external;
    function payInvoice(uint256 _invoiceId) external;
}
```

### バックエンド API
- ユーザー通知 (メール・Push)
- 複雑な計算処理
- The Graph 連携 (履歴取得)

### 追加機能
- グループ割り勘機能
- 定期支払い設定
- 支払い履歴エクスポート
- 多言語対応

## 🔒 セキュリティ

- 入力値検証 (Zod スキーマ)
- XSS 対策 (React の自動エスケープ)
- アドレス検証 (ethers.js)
- HTTPS 通信 (本番環境)

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📞 サポート

質問や問題がある場合は、Issue を作成してください。
