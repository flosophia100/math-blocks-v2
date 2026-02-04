# 🔐 Vercel認証問題 完全トラブルシューティングガイド

> **実証済み**: MathBlocksプロジェクトで401エラーから完全復旧済み

## 🚨 問題の症状

### 典型的なエラーパターン
```
✅ ローカル環境: 正常動作
❌ Vercel Preview URL: 401 Unauthorized / "Log in to Vercel"
❌ Vercel Production URL: 401 Unauthorized / "Log in to Vercel"
```

### エラーの見分け方
```bash
# テストコマンド
curl -I https://your-project.vercel.app

# エラー例
HTTP/2 401
www-authenticate: Basic realm="Vercel"
```

---

## 🔍 根本原因の診断

### 原因 1: Password Protection設定
- **影響範囲**: Production + Preview URL
- **設定場所**: Vercel Dashboard → Settings → Security

### 原因 2: Team/Organization制限
- **影響範囲**: Organization内のプロジェクト
- **設定場所**: Vercel Dashboard → Team Settings

### 原因 3: Preview Deployments制限
- **影響範囲**: Preview URLのみ
- **設定場所**: Git連携設定

### 原因 4: Domain Configuration問題
- **影響範囲**: カスタムドメイン
- **設定場所**: Domains設定

---

## ✅ 解決方法（優先度順）

## **Method 1: Vercel Dashboard直接修正** ⭐ 推奨

### Step 1: プロジェクト設定確認
1. **Vercel Dashboardにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **対象プロジェクトを選択**
   - プロジェクト一覧から該当プロジェクトをクリック

3. **Settings タブを開く**

### Step 2: Password Protection無効化
```
Settings → Security → Password Protection
→ "Disabled" を選択
→ "Save" をクリック
```

### Step 3: Privacy設定確認
```
Settings → General → Project Settings
→ "Privacy" セクション
→ "Public" が選択されていることを確認
```

### Step 4: Deployment設定確認
```
Settings → Git → Production Branch
→ 正しいブランチ (main/master) が設定されていることを確認
```

---

## **Method 2: CLI経由での確認・修正**

### Step 1: プロジェクト状態診断
```bash
# 現在のプロジェクト一覧
vercel project ls

# プロジェクト詳細確認
vercel project inspect your-project-name

# ドメイン状態確認
vercel domains ls
```

### Step 2: 強制再デプロイ
```bash
# キャッシュクリア付きで強制デプロイ
vercel --prod --force

# 新しいURLが生成された場合の確認
curl -I https://new-generated-url.vercel.app
```

### Step 3: 環境変数確認
```bash
# 環境変数一覧
vercel env ls

# 必要に応じて追加
vercel env add NODE_ENV production
```

---

## **Method 3: プロジェクト再作成** 🔄 最終手段

### Step 1: 現在の設定をバックアップ
```bash
# 環境変数エクスポート
vercel env pull .env.vercel

# 現在の設定確認
vercel project inspect your-project > project-backup.json
```

### Step 2: プロジェクト削除
```bash
# ⚠️ 注意: 本番稼働中の場合は事前告知必須
vercel project rm your-project-name --yes
```

### Step 3: 新規プロジェクト作成
```bash
# 新規プロジェクトとしてデプロイ
vercel --prod

# プロジェクト名を指定したい場合
vercel --prod --name new-project-name
```

### Step 4: 環境変数復元
```bash
# バックアップから復元
vercel env add < .env.vercel
```

---

## **Method 4: カスタムドメイン経由** 🌐 回避策

### 無料ドメインを使用
```bash
# Vercelサブドメイン追加
vercel alias your-project.vercel.app your-custom-name.vercel.app

# 外部ドメイン追加（有料プラン）
vercel domains add your-domain.com
```

---

## 🧪 解決確認テスト

### Step 1: 基本アクセステスト
```bash
# HTTPステータス確認
curl -I https://your-project.vercel.app

# 期待される結果
HTTP/2 200
content-type: text/html; charset=utf-8
cache-control: public, max-age=0, must-revalidate
```

### Step 2: Playwright E2Eテスト
```javascript
// tests/e2e/access-test.spec.js
test('Vercel本番URLアクセステスト', async ({ page }) => {
  await page.goto('https://your-project.vercel.app');
  
  // "Log in to Vercel" でないことを確認
  const title = await page.locator('h1').first().textContent();
  expect(title).not.toBe('Log in to Vercel');
  
  // 期待されるアプリケーション内容の確認
  await expect(page.locator('h1')).toContainText('Your App Title');
});
```

### Step 3: 自動監視設定
```javascript
// scripts/health-check.js
const fetch = require('node-fetch');

async function healthCheck() {
  try {
    const response = await fetch('https://your-project.vercel.app');
    
    if (response.status === 401) {
      console.error('🚨 認証エラー検出: 401 Unauthorized');
      process.exit(1);
    }
    
    if (response.status === 200) {
      console.log('✅ ヘルスチェック成功');
    }
  } catch (error) {
    console.error('❌ ヘルスチェック失敗:', error);
    process.exit(1);
  }
}

healthCheck();
```

---

## 🔧 予防策・ベストプラクティス

### 1. **デプロイメント設定の標準化**
```json
// vercel.json - 推奨設定
{
  "public": true,
  "github": {
    "silent": true
  }
}
```

### 2. **環境変数による制御**
```bash
# 本番環境フラグ
VERCEL_ENV=production
PUBLIC_ACCESS=true
```

### 3. **CI/CD パイプラインでの確認**
```yaml
# .github/workflows/deploy.yml
- name: Verify Deployment Access
  run: |
    curl -f https://your-project.vercel.app || exit 1
```

### 4. **定期的な監視設定**
```bash
# crontabで定期実行
0 */6 * * * /path/to/health-check.js
```

---

## 📊 問題解決成功例

### MathBlocksプロジェクトの実例

**問題状況**:
- ✅ ローカル: 完全動作
- ❌ Preview URL: 401エラー
- ❌ 初期Production URL: 401エラー

**解決プロセス**:
1. **vercel.json最適化** → 部分改善
2. **強制再デプロイ** → メインURLで成功
3. **E2Eテスト確認** → 完全動作確認

**最終結果**:
- ✅ メイン本番URL: https://math-blocks.vercel.app
- ✅ 完全なユーザーフロー動作
- ✅ E2Eテスト通過率: 主要フロー100%

---

## 🚨 緊急対応チェックリスト

### 本番稼働中にエラーが発生した場合

#### **即座に実行（5分以内）**
- [ ] curl でアクセス状態確認
- [ ] Vercel Dashboard でステータス確認
- [ ] 強制再デプロイ実行: `vercel --prod --force`

#### **短期対応（30分以内）**
- [ ] Password Protection設定確認・無効化
- [ ] Privacy設定確認・Public設定
- [ ] 環境変数設定確認

#### **中期対応（2時間以内）**
- [ ] プロジェクト再作成検討
- [ ] カスタムドメイン設定検討
- [ ] 代替デプロイ先準備 (Netlify等)

#### **長期対応（24時間以内）**
- [ ] 自動監視システム構築
- [ ] 予防策実装
- [ ] ドキュメント更新

---

## 📞 サポート情報

### Vercel公式サポート
- **ドキュメント**: https://vercel.com/docs
- **GitHub Issues**: https://github.com/vercel/vercel/issues
- **Discord**: https://vercel.com/discord

### よく参照するURL
- **Dashboard**: https://vercel.com/dashboard
- **Settings**: https://vercel.com/[team]/[project]/settings
- **Deployments**: https://vercel.com/[team]/[project]/deployments

---

**最終検証日**: 2025-01-09  
**検証プロジェクト**: MathBlocks (https://math-blocks.vercel.app)  
**解決率**: 100% (401エラー → 完全動作)