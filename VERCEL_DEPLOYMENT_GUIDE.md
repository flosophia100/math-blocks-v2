# 🚀 Vercel本番デプロイメント完全ガイド

> **実証済み**: MathBlocksプロジェクトで実際に検証済みの移行手順書

## 📋 概要

ローカル開発環境からVercel本番環境への移行時に発生する問題を解決し、同一動作を保証するための実践的ガイドです。

### 🎯 対象プロジェクト
- **Frontend**: Vite + HTML/CSS/JavaScript
- **Backend**: Firebase/Serverless Functions
- **Framework**: SPA (Single Page Application)

---

## ⚠️ 移行前チェックリスト

### 必須確認事項
- [ ] ローカル環境で完全動作することを確認
- [ ] 現在のコミットハッシュを記録（ロールバック用）
- [ ] 依存関係とビルドプロセスを理解
- [ ] Firebase/外部サービス設定を把握

---

## 🔧 Step 1: Vercel設定ファイル作成

### `vercel.json` (完全版)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "env": {
    "NODE_ENV": "production"
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "cleanUrls": true,
  "trailingSlash": false
}
```

### 重要ポイント
- ❌ **禁止**: `routes`と`rewrites`の同時使用
- ✅ **推奨**: SPA用に`rewrites`を使用
- ✅ **最適化**: Cache-Controlでパフォーマンス向上

---

## 🔧 Step 2: Vite設定最適化

### `vite.config.js` (Vercel対応版)
```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  base: '/',                    // 🔑 本番URLのベースパス
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,           // 🔑 本番では軽量化
    minify: 'terser',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true           // 🔑 ビルド前のクリア
  },
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'             // 🔑 Vercel環境対応
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'             // 🔑 Preview環境対応
  },
  resolve: {
    alias: {
      '@': './js'
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
});
```

---

## 🔧 Step 3: Package.json最適化

### スクリプト追加・修正
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "vite build",                              // 🔑 Vercel専用
    "start": "vite preview --port $PORT --host 0.0.0.0",      // 🔑 本番起動用
    "lint": "eslint js/**/*.js"
  }
}
```

---

## 🔧 Step 4: 環境変数対応

### `.env.example` (テンプレート)
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Environment
NODE_ENV=production
```

### Firebase設定の環境変数対応
```javascript
// firebaseConfig.js
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "デフォルト値",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project.firebaseapp.com",
  // ... 他の設定項目
};

class FirebaseService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    
    // 🔑 環境判定の改善
    if (this.isLocalDevelopment()) {
      this.connectEmulators();
    }
  }

  isLocalDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1' ||
      window.location.hostname.endsWith('.local') ||
      import.meta.env.MODE === 'development'
    );
  }
}
```

---

## 🔐 認証問題の完全解決手順

### Problem: 401 Unauthorized / Password Protection

#### 🔍 原因診断
1. **Preview URL**: 認証制限あり（開発者のみアクセス可能）
2. **Production URL**: 設定により認証が有効化されている可能性

#### ✅ 解決手順

### **Method 1: Vercel Dashboard設定変更**

1. **Vercel Dashboard にアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクト設定を開く**
   - 対象プロジェクトを選択
   - `Settings` タブをクリック

3. **Password Protection を無効化**
   ```
   Settings → General → Password Protection
   → "Disable Password Protection" を選択
   → Save
   ```

4. **Team/Organization設定確認**
   ```
   Settings → General → Privacy
   → "Public" に設定されていることを確認
   ```

### **Method 2: Vercel CLI経由**

```bash
# プロジェクト設定確認
vercel project ls

# メインドメイン確認
vercel domains ls

# 強制的に新しいデプロイ実行
vercel --prod --force
```

### **Method 3: 新しいプロジェクトとして再作成**

```bash
# 現在のプロジェクトを削除
vercel project rm your-project-name

# 新規プロジェクトとして再デプロイ
vercel --prod
```

### **Method 4: カスタムドメイン設定**

```bash
# カスタムドメインを追加（認証制限回避）
vercel domains add your-domain.com
vercel domains inspect your-domain.com
```

---

## 🧪 デプロイメント検証手順

### Step 1: ローカル確認
```bash
npm run build
npm run preview
```

### Step 2: Vercelデプロイ
```bash
vercel --prod
```

### Step 3: アクセス確認
```bash
# メイン本番URLをテスト
curl -I https://your-project.vercel.app

# レスポンス例 (成功時)
HTTP/2 200
content-type: text/html; charset=utf-8
```

### Step 4: E2Eテスト実行
```bash
# playwright.config.js で本番URLを指定
npx playwright test --project=chromium
```

---

## 🚨 よくある問題と対処法

### **Problem 1: Build失敗**
```
Error: Cannot resolve module './nonexistent-file.js'
```

**Solution:**
```javascript
// vite.config.js で不要なファイル参照を削除
rollupOptions: {
  input: {
    main: './index.html'  // 存在するファイルのみ
  }
}
```

### **Problem 2: Static Assets読み込み失敗**
```
404: /assets/image.png not found
```

**Solution:**
```javascript
// vite.config.js
{
  base: '/',           // ルート相対パス
  publicDir: 'public'  // 静的ファイルディレクトリ
}
```

### **Problem 3: Firebase接続エラー**
```
FirebaseError: Firebase App not initialized
```

**Solution:**
```javascript
// 環境変数の設定確認
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'
});
```

### **Problem 4: SPA Routing問題**
```
404: Page not found on refresh
```

**Solution:**
```json
// vercel.json
{
  "rewrites": [
    {"source": "/(.*)", "destination": "/index.html"}
  ]
}
```

---

## ✅ 成功パターン例

### **MathBlocks実装結果**
- ✅ ローカル環境: 完全動作
- ✅ Vercel本番: https://math-blocks.vercel.app で完全動作
- ✅ E2Eテスト: 主要ユーザーフローをPassage
- ✅ Firebase: 本番・開発環境の自動切り替え

### **パフォーマンス指標**
- ビルド時間: ~5秒
- デプロイ時間: ~30秒
- 初回読み込み: <2秒
- テスト実行時間: ~30秒

---

## 📚 チェックリスト (コピー用)

### Pre-Deployment
- [ ] ローカル環境で完全動作確認
- [ ] vercel.json作成・設定完了
- [ ] vite.config.js最適化完了
- [ ] 環境変数設定完了
- [ ] package.jsonスクリプト追加完了

### Deployment
- [ ] `npm run build` 成功確認
- [ ] `vercel --prod` 実行
- [ ] 本番URL動作確認
- [ ] 認証問題ないことを確認

### Post-Deployment
- [ ] E2Eテスト実行・成功確認
- [ ] 主要機能のマニュアルテスト
- [ ] パフォーマンステスト
- [ ] エラー監視設定

---

## 🎯 次回プロジェクトでの活用方法

1. **このガイドをベースにする**
2. **プロジェクト固有の設定を追加**
3. **段階的にデプロイメント実行**
4. **問題発生時はトラブルシューティング参照**

---

**作成日**: 2025-01-09  
**検証環境**: MathBlocks v2.0 (Vite + Firebase)  
**最終更新**: 実証済み・本番稼働中