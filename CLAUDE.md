# MathBlocks開発ドキュメント - Vercelデプロイ知見集

## デプロイ時の静的・動的サイトの課題と解決策

### 1. 静的サイト vs 動的サイトの特徴

#### 静的サイト設定（推奨）
```json
{
  "version": 2,
  "headers": [...],
  "cleanUrls": true,
  "trailingSlash": false
}
```

**適用条件:**
- vanilla HTML/CSS/JavaScript
- import/export文なし
- コンパイル不要
- シンプルなファイル構成

**メリット:**
- 高速配信
- キャッシュ問題が少ない
- 設定がシンプル
- デバッグが容易

#### 動的サイト設定（Vite/SPA）
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist", 
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}]
}
```

**適用条件:**
- React/Vue/Svelte等のフレームワーク
- TypeScript使用
- モジュールバンドリング必要
- SPA（Single Page Application）

**デメリット:**
- 複雑なキャッシュ階層
- ビルドプロセス必要
- デプロイ時間が長い

### 2. Vercelキャッシュ問題の解決策

#### 問題の原因
Vercelは多層キャッシュシステムを使用:
1. ブラウザキャッシュ
2. CDNキャッシュ（Edge）
3. Vercelサーバーキャッシュ
4. GitHubからの同期キャッシュ

#### 解決策の優先順位

**1. 最強 - ファイル名変更**
```html
<!-- 旧 -->
<link rel="stylesheet" href="css/styles.css">
<!-- 新 -->
<link rel="stylesheet" href="css/styles-v2.css">
```
- 完全に新しいファイルとして認識
- 全キャッシュ層をバイパス
- **注意**: Vercelで404エラーが発生する場合あり

**2. 強 - Query Parameter + 内容変更**
```html
<link rel="stylesheet" href="css/styles.css?v=20240910-1300">
```
```css
/* CSS内のバージョンコメントも更新 */
/* MathBlocks CSS - v2024.09.10-CACHE-BUST */
```

**3. 中 - vercel.json キャッシュ設定**
```json
{
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
```

**4. 弱 - Meta Tags**
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

**5. 最終手段 - 空コミット + 強制デプロイ**
```bash
git commit --allow-empty -m "Force redeploy"
git push
```

### 3. CSS更新が反映されない時のチェックリスト

#### 確認手順
1. **ローカル確認**
```bash
grep -n "336px\|360px" css/styles.css
head -5 css/styles.css  # バージョンコメント確認
```

2. **Git状態確認**
```bash
git status
git diff css/styles.css
git log --oneline -3
```

3. **デプロイ確認**
```bash
curl -I https://your-site.vercel.app/css/styles.css
# Cache-Controlヘッダーを確認
```

4. **内容確認**
- ブラウザの開発者ツール → Networkタブ
- CSSファイルに「Disable cache」チェック
- Vercel URL直接アクセスで内容確認

### 4. 実際の修正プロセス（MathBlocks事例）

#### 問題
- 右パネルの幅: 280px → 336px/360px
- スコア・レベル・コンボの縦配置 → 横配置

#### 解決までの試行錯誤
1. `!important`追加 → ❌ 効果なし
2. Query parameter → ❌ 効果なし  
3. Meta tags追加 → ❌ 効果なし
4. ファイル名変更 → ❌ 404エラー
5. 静的サイト化 + 内容変更 → ✅ **成功**

#### 最終的な修正内容
```css
.side-panel {
    width: 336px !important; /* 280px + 20% 強制適用 */
}

@media (min-width: 1920px) and (min-height: 1080px) {
    .side-panel {
        width: 360px !important; /* 300px + 20% = 360px */
    }
}

.score-level-combo {
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between;
}
```

### 5. 開発・デプロイのベストプラクティス

#### 開発時
- ローカルサーバーでテスト: `python -m http.server 8000`
- E2Eテストでレイアウト確認
- 複数解像度での動作確認

#### デプロイ時
- コミット前に必ずローカル確認
- CSSにバージョンコメント追加
- デプロイ後は必ず本番URL確認
- キャッシュクリア手順を準備

#### トラブルシューティング
```bash
# デプロイ状況確認
git log --oneline -5
git status

# 強制キャッシュクリア
git commit --allow-empty -m "Force cache clear"
git push

# Vercel CLI使用（認証済みの場合）
vercel --prod --force
```

### 6. 今後の改善提案

#### 予防策
1. **CSSバージョニングの自動化**
2. **デプロイ前テストの自動化**
3. **キャッシュ設定の標準化**
4. **ロールバック手順の確立**

#### 監視
- デプロイ後の自動確認スクリプト
- CSS変更の影響範囲チェック
- パフォーマンス監視の導入

---
*このドキュメントは実際のMathBlocksデプロイ経験に基づいて作成されました*
*最終更新: 2024年9月10日*