## [2025-01-25 09:45] - getAllUsersメソッド未実装エラーの修正

### ユーザー命令
統合データ自動保存でエラーが発生：
```
ui.js:972 統合データ自動保存エラー: TypeError: this.userManager.getAllUsers is not a function
    at UIManager.autoSaveAllData (ui.js:937:60)
    at UIManager.showScoreScreen (ui.js:813:14)
```

### 実行内容
1. エラーの原因調査
   - `getAllUsers()`メソッドが`UserManager`クラスに存在しないことを確認
   - `ui.js`の`autoSaveAllData()`メソッドで呼び出されている

2. 修正実装
   - `/home/user/myfolder/game/math-blocks/js/userManager.js`に`getAllUsers()`メソッドを追加
   - Mapオブジェクトから配列形式に変換して返すメソッドを実装

### 結果
```javascript
// 全ユーザーデータを取得
getAllUsers() {
    // MapオブジェクトからArray形式に変換
    const usersArray = Array.from(this.users.entries()).map(([username, data]) => ({
        username,
        ...data
    }));
    return usersArray;
}
```

### 注記
- 統合データ自動保存機能が正常に動作するようになった
- スコアボード表示時に統合JSONファイルが正しくダウンロードされる

---

## [2025-01-25 10:15] - ヒントブロック表示方式とヒント生成ロジック改善

### ユーザー命令
ヒントブロックの機能について修正：
1. 現在の元計算式との入れ替え表示を、元計算式は残しつつその下に青字でヒントを追加表示する方式に変更
2. ヒント生成を最小の数値調整で一の位を0にする変換に改善（64-19 → 60-15 や 65-20）
3. 数値の前後入れ替えのようなヒントは表示しない

### 実行内容
1. **表示方式の変更（block.js）**
   - フェードアニメーションロジックを簡素化
   - `originalAlpha`を削除し、元計算式は常に表示
   - ヒントを青字で下部に小さく表示するよう修正
   - フェード段階を`'fade_in_hint' → 'display_hint' → 'fade_out_hint'`に変更

2. **ヒント生成アルゴリズム改善（hintSystem.js）**
   - 引き算ヒント生成を全面改良：
     - 64-19 → 60-15（一の位を揃える）
     - 64-19 → 65-20（減数を10の倍数にする）
     - 47-23 → 50-26（被減数を切りの良い数にする）
   - 足し算の数値入れ替えヒント（3+5 → 5+3）を削除

### 結果
**表示変更:**
```javascript
// 元の計算式を上部に表示（常に不透明）
ctx.fillStyle = '#000';
ctx.font = 'bold 16px sans-serif';
ctx.fillText(this.problem.expression, x + size / 2, y + size / 2 - 10);

// ヒントを下部に青字で表示（フェードアニメーション対応）
ctx.fillStyle = '#3498db';
ctx.font = 'bold 13px sans-serif';  
ctx.fillText(this.hintText, x + size / 2, y + size / 2 + 10);
```

**ヒント生成改善:**
```javascript
// 引き算ヒント例: 64-19
// パターン1: 60-15（一の位を揃える）
// パターン2: 65-20（減数を10の倍数にする）  
// パターン3: 47-23 → 50-26（被減数を切りの良い数にする）
```

### 注記
- ヒント表示が見やすくなり、元の計算式も確認しながら学習可能
- より実用的で教育効果の高いヒント生成に改善
- 単純な数値入れ替えではない、計算方法を学べるヒントを提供

---

## [2025-01-25 10:30] - 特訓コース4モード追加とスコアボード表示対応

### ユーザー命令
特訓コースを増やし、スコアボードでの表示にも対応：
1. 足し算のみ、引き算のみ、掛け算のみ、割り算のみの4モードを追加
2. スコアボードに特訓選択の有無と選んだ場合のコースを表示

### 実行内容

1. **特訓モード追加（config.js）**
   ```javascript
   addition_only: {
       name: '足し算のみ',
       operations: { add: true, sub: false, mul: false, div: false },
       minNum: 1, maxNum: 50,
       description: '足し算の特訓'
   },
   subtraction_only: {
       name: '引き算のみ',
       operations: { add: false, sub: true, mul: false, div: false },
       minNum: 1, maxNum: 50,
       description: '引き算の特訓'
   },
   multiplication_only: {
       name: '掛け算のみ',
       operations: { add: false, sub: false, mul: true, div: false },
       minNum: 1, maxNum: 12,
       description: '掛け算の特訓'
   },
   division_only: {
       name: '割り算のみ',
       operations: { add: false, sub: false, mul: false, div: true },
       minNum: 2, maxNum: 12,
       description: '割り算の特訓'
   }
   ```

2. **スコアボード表示対応**
   - HTMLテーブルに「特訓」列を追加
   - ui.jsでスコア表示時に特訓モード名を表示
   - game.jsのcreateScoreDataでtrainingフィールドを追加
   - scoreManager.jsのCSVエクスポートでも特訓モード対応

3. **表示ロジック実装**
   ```javascript
   // 特訓モード表示用の文字列を生成
   let trainingModeStr = '-';
   if (score.training) {
       const trainingConfig = CONFIG.TRAINING_MODES[score.training];
       trainingModeStr = trainingConfig?.name || score.training;
   }
   ```

### 結果
- 特訓コースが7種類に拡張（既存3 + 新規4）
- スコアボードに特訓モード情報が表示され、通常モードとの区別が可能
- CSVエクスポートでも特訓モード情報が含まれる
- 各演算に特化した練習が可能

### 注記
- 新しい特訓モードは基本的な数値範囲で設定
- スコアボードでの識別により、特定の特訓での上達を追跡可能
- データエクスポート機能も特訓情報を含み、分析に活用できる

---

## [2025-01-25 10:45] - トップ画面への新特訓モード追加と数値範囲修正

### ユーザー命令
1. トップ画面に新しい4つの特訓モードが表示されていない
2. 数値範囲を以下に修正：
   - 足し算：1～100
   - 引き算：1～100  
   - 掛け算：1～50
   - 割り算：1～500

### 実行内容

1. **CONFIG.js数値範囲修正**
   ```javascript
   addition_only: { minNum: 1, maxNum: 100 },
   subtraction_only: { minNum: 1, maxNum: 100 },
   multiplication_only: { minNum: 1, maxNum: 50 },
   division_only: { minNum: 1, maxNum: 500 }
   ```

2. **HTML特訓モード選択画面に4つのボタン追加**
   ```html
   <button class="training-btn" data-training="addition_only">
       <div class="training-name">足し算のみ</div>
       <div class="training-desc">足し算の特訓（1-100）</div>
   </button>
   <button class="training-btn" data-training="subtraction_only">
       <div class="training-name">引き算のみ</div>
       <div class="training-desc">引き算の特訓（1-100）</div>
   </button>
   <button class="training-btn" data-training="multiplication_only">
       <div class="training-name">掛け算のみ</div>
       <div class="training-desc">掛け算の特訓（1-50）</div>
   </button>
   <button class="training-btn" data-training="division_only">
       <div class="training-name">割り算のみ</div>
       <div class="training-desc">割り算の特訓（1-500）</div>
   </button>
   ```

### 結果
- トップ画面の特訓モード選択に計7つのモードが表示される
- 各モードの説明に適切な数値範囲が記載される
- 指定された数値範囲でゲームが動作する

### 注記
- 特訓モードの選択UI完成、全モードが利用可能
- より幅広い数値範囲での練習が可能になった
- 割り算の範囲が大幅に拡張され、より実用的な計算練習が可能

---