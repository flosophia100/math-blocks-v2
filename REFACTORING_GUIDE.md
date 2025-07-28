# MathBlocks リファクタリングガイド v1.3.0

## 概要

このドキュメントは、MathBlocksの対戦モード追加により複雑化したコードベースのリファクタリング結果と移行方法について説明します。

## リファクタリングの目的

1. **コード複雑度の削減**: 特にUIManagerの肥大化の解決
2. **責務の明確化**: 単一責任の原則に基づくクラス分割
3. **保守性の向上**: 機能追加・修正の容易性向上
4. **エラーハンドリングの統一**: 一貫したエラー処理
5. **設定の一元管理**: 定数・設定の統一

## リファクタリング結果

### 新規作成ファイル

#### 1. ゲームモード管理 (`gameModeManager.js`)
- **目的**: ゲームモードの抽象化と統一管理
- **クラス**: `GameModeManager`, `BaseGameMode`, `ScoreAttackMode`, `TimeAttackMode`, `VersusCPUMode`, `VersusHumanMode`
- **機能**: モード別の処理を分離、設定可能なモードシステム

#### 2. UI責務分離
- **`authUIManager.js`**: 認証・ユーザー管理UI専門
- **`gameUIManager.js`**: ゲーム設定・進行UI専門
- **`versusUIManager.js`**: 対戦モードUI専門
- **`uiManagerRefactored.js`**: 上記を統合する新しいUIManager

#### 3. 対戦モード専用ヘルパー (`versusGameHelper.js`)
- **クラス**: `VersusGameConfig`, `VersusGameResult`, `VersusGameState`, `VersusInputManager`, `VersusGameUtils`
- **機能**: 対戦ゲーム専用の設定・状態・結果管理

#### 4. 共通ヘルパー (`commonHelpers.js`)
- **クラス**: `TimeUtils`, `NumberUtils`, `DOMUtils`, `StorageUtils`, `FileUtils`, `ValidationUtils`, `ErrorUtils`, `DebugUtils`
- **機能**: プロジェクト全体で使用する汎用ユーティリティ

#### 5. 統一エラーハンドリング (`errorHandler.js`)
- **クラス**: `MathBlocksError`, `ErrorHandler`
- **機能**: エラーの分類・重要度判定・自動復旧・ユーザー通知

#### 6. 統一定数管理 (`constants.js`)
- **定数**: ゲームモード、難易度、UI設定、キーバインド等
- **機能**: 全定数の一元管理と型安全性

## 移行方法

### Phase 1: 新しいファイルの読み込み

HTMLファイルに新しいJSファイルを追加：

```html
<!-- 定数・設定 -->
<script src="js/constants.js"></script>

<!-- ヘルパー・ユーティリティ -->
<script src="js/commonHelpers.js"></script>
<script src="js/errorHandler.js"></script>

<!-- ゲーム管理 -->
<script src="js/gameModeManager.js"></script>
<script src="js/versusGameHelper.js"></script>

<!-- UI管理 -->
<script src="js/authUIManager.js"></script>
<script src="js/gameUIManager.js"></script>
<script src="js/versusUIManager.js"></script>
<script src="js/uiManagerRefactored.js"></script>

<!-- 既存ファイル -->
<script src="js/config.js"></script>
<script src="js/userManager.js"></script>
<script src="js/scoreManager.js"></script>
<!-- ... 他の既存ファイル ... -->
```

### Phase 2: インスタンス化の変更

`main.js`での初期化を更新：

```javascript
// 従来
window.uiManager = new UIManager(game, scoreManager, userManager);

// 新方式
window.authUIManager = new AuthUIManager(userManager);
window.gameUIManager = new GameUIManager();
window.versusUIManager = new VersusUIManager();
window.uiManagerRefactored = new UIManagerRefactored(game, scoreManager, userManager);

// 段階的移行のため、既存のuiManagerも保持
window.uiManager = window.uiManagerRefactored;
```

### Phase 3: 段階的移行

#### 3.1 エラーハンドリングの移行

```javascript
// 従来
try {
    // 処理
} catch (error) {
    console.error('エラー:', error);
}

// 新方式
try {
    // 処理
} catch (error) {
    globalErrorHandler.handleError(createError.game('ゲーム処理エラー', { error }));
}
```

#### 3.2 定数使用の移行

```javascript
// 従来
if (mode === 'versus_cpu') {
    // 処理
}

// 新方式
if (mode === GameMode.VERSUS_CPU) {
    // 処理
}
```

#### 3.3 ヘルパー関数の移行

```javascript
// 従来
const timeStr = `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

// 新方式
const timeStr = TimeUtils.formatTime(seconds);
```

### Phase 4: UI管理の移行

#### 4.1 認証画面の移行

```javascript
// 従来
uiManager.showScreen('auth');

// 新方式
authUIManager.showAuthScreen();
// または
uiManagerRefactored.authUI.showAuthScreen();
```

#### 4.2 ゲーム設定の移行

```javascript
// 従来
uiManager.selectMode('score');

// 新方式
gameUIManager.selectMode(GameMode.SCORE);
// または
uiManagerRefactored.gameUI.selectMode(GameMode.SCORE);
```

## 利用方法

### ゲームモード管理

```javascript
// モードインスタンスの作成
const scoreMode = gameModeManager.createModeInstance(GameMode.SCORE, settings);
scoreMode.start();

// モード情報の取得
const modeConfig = gameModeManager.getModeConfig(GameMode.TIME);
console.log(modeConfig.name); // "タイムアタック"
```

### 対戦ゲーム

```javascript
// 対戦設定の作成
const config = new VersusGameConfig(
    GameMode.VERSUS_CPU,
    Difficulty.NORMAL,
    null,
    3 // CPUレベル
);

// 対戦結果の管理
const result = new VersusGameResult();
result.setPlayerNames('プレイヤー1', 'CPU');
result.updatePlayerData('left', { score: 1500, level: 5 });
```

### エラーハンドリング

```javascript
// エラーコールバックの登録
globalErrorHandler.onError(ErrorType.GAME_ERROR, (error) => {
    console.log('ゲームエラーが発生:', error.message);
});

// カスタムエラーの作成
throw createError.validation('不正な入力値です', { input: userInput });
```

### ヘルパー関数

```javascript
// 時間フォーマット
const displayTime = TimeUtils.formatTime(gameTime);

// 数値フォーマット
const displayScore = NumberUtils.formatNumber(score);

// DOM操作
DOMUtils.setElementText('scoreDisplay', score);
DOMUtils.showNotification('保存完了', 'success');

// ストレージ操作
StorageUtils.setItem('settings', gameSettings);
const settings = StorageUtils.getItem('settings', defaultSettings);
```

## 互換性

### 後方互換性の保持

リファクタリング後も既存のコードは動作するよう、以下の互換性を保持：

1. **UIManager**: `uiManagerRefactored`が既存のUIManagerの主要メソッドを実装
2. **CONFIG**: 既存の`CONFIG`オブジェクトは新しい定数システムと併用可能
3. **グローバル変数**: 重要なグローバル変数は引き続き利用可能

### 非互換な変更

以下の変更は手動での修正が必要：

1. **内部メソッド**: UIManagerの内部メソッドの一部は分離されたクラスに移動
2. **イベント名**: 一部のカスタムイベント名が変更
3. **エラー形式**: エラーオブジェクトの構造が変更

## パフォーマンス改善

### メモリ使用量の削減

- UI管理クラスの分離により、不要な機能の読み込みを削減
- イベントリスナーの適切な管理による メモリリークの防止

### 実行速度の向上

- 責務分離による処理の最適化
- 共通処理のキャッシュ化
- エラーハンドリングの効率化

## トラブルシューティング

### よくある問題

1. **`GameMode is not defined`**
   - `constants.js`が読み込まれていない
   - スクリプトの読み込み順序を確認

2. **`authUIManager is not defined`**
   - 新しいUIマネージャーファイルが読み込まれていない
   - インスタンス化が実行されていない

3. **エラーハンドリングが動作しない**
   - `errorHandler.js`の読み込みを確認
   - `globalErrorHandler`の初期化を確認

### デバッグ方法

```javascript
// デバッグモードの有効化
DebugUtils.setDebugMode(true);

// エラー統計の確認
console.log(globalErrorHandler.getErrorStatistics());

// ストレージ使用量の確認
console.log(StorageUtils.getStorageSizeFormatted());
```

## 今後の拡張計画

### 短期計画
- [ ] 既存UIManagerからの完全移行
- [ ] パフォーマンス監視システムの統合
- [ ] テストスイートの作成

### 中期計画
- [ ] TypeScript化の検討
- [ ] Webコンポーネント化
- [ ] PWA対応

### 長期計画
- [ ] マルチプレイヤー対応
- [ ] AI対戦相手の改善
- [ ] 3Dグラフィックス対応

## まとめ

このリファクタリングにより、MathBlocksのコードベースは以下の点で改善されました：

1. **保守性**: 機能別にクラスが分離され、修正箇所が特定しやすくなった
2. **拡張性**: 新機能の追加が既存コードに影響を与えにくくなった
3. **信頼性**: 統一されたエラーハンドリングにより障害対応が向上した
4. **一貫性**: 定数管理により設定値の統一が図られた

段階的な移行により、既存機能を維持しながら新しいアーキテクチャへの移行が可能です。