# Vercelキャッシュ完全解決方法

## 現在の状況
- ローカル: 修正済み (336px/360px)
- Vercel: 古いキャッシュ (280px) が残存

## 完全解決策

### 1. Vercel CLI による強制デプロイ
```bash
vercel --force
```

### 2. Vercelダッシュボードでの手動再デプロイ
1. https://vercel.com/dashboard にアクセス
2. math-blocks プロジェクト選択
3. "Deployments" タブ
4. 最新デプロイの "..." → "Redeploy"

### 3. ファイル名変更によるキャッシュバスト
```html
<!-- 現在 -->
<link rel="stylesheet" href="css/styles.css">

<!-- 変更後 -->
<link rel="stylesheet" href="css/styles-v2.css">
```

### 4. vercel.jsonでのキャッシュ設定強化
```json
{
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

## 推奨解決順序
1. ファイル名変更 (最も確実)
2. Vercel手動再デプロイ
3. キャッシュ設定更新