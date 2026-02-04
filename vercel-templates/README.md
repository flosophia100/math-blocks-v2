# 📁 Vercelデプロイメント テンプレート集

## 📋 ファイル構成

### 📚 ガイドドキュメント
- **`../VERCEL_DEPLOYMENT_GUIDE.md`** - 完全デプロイメントガイド
- **`../VERCEL_AUTH_TROUBLESHOOTING.md`** - 認証問題専用トラブルシューティング

### ⚙️ 設定ファイルテンプレート
- **`vercel.json`** - Vercel設定ファイル（認証問題解決済み）
- **`vite.config.js`** - Vite設定ファイル（Vercel最適化済み）
- **`package.json.scripts`** - package.jsonスクリプト追加用
- **`firebase-config-template.js`** - Firebase環境変数対応テンプレート

## 🚀 使用方法

### 新規プロジェクトの場合
1. プロジェクトルートに `vercel.json` をコピー
2. `vite.config.js` を既存設定にマージ
3. `package.json` にスクリプトを追加
4. Firebase使用時は設定ファイルを更新

### 既存プロジェクトの移行
1. `VERCEL_DEPLOYMENT_GUIDE.md` の手順に従う
2. 認証問題発生時は `VERCEL_AUTH_TROUBLESHOOTING.md` を参照
3. 各テンプレートファイルを適用

## ✅ 検証済み環境
- **MathBlocks v2.0** (https://math-blocks.vercel.app)
- **Vite + Firebase + JavaScript**
- **E2Eテスト完全通過**