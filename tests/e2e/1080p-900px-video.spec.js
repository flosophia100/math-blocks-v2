// 900px制限での1080P解像度 ビデオ録画テスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度 900px制限 ビデオ録画テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('900px制限での完全ゲームプレイ - ビデオ録画', async ({ page }) => {
    console.log('🎬 900px制限 1080P ビデオ録画テスト開始');
    
    // 1. サイトに移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    console.log('✅ サイト読み込み完了');
    
    // 2. ユーザー登録フロー
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.waitForTimeout(1000);
    console.log('✅ ゲストモード開始');
    
    // 3. ゲームモード選択
    await page.click('button[data-mode="score"]');
    await page.waitForTimeout(1000);
    console.log('✅ スコアアタックモード選択');
    
    // 4. 難易度選択
    await page.click('button[data-difficulty="normal"]');
    await page.waitForTimeout(1000);
    console.log('✅ ノーマル難易度選択');
    
    // 5. ゲーム開始
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(2000);
    console.log('✅ ゲーム開始 - 900px制限レイアウト適用');
    
    // 6. 900px制限の確認
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    console.log('📐 ビデオ録画中のゲーム画面サイズ:', gameScreenBox);
    console.log('📐 高さが900pxに制限されているか:', gameScreenBox.height === 900);
    
    // 7. ゲームプレイデモ - 900px制限内での動作確認
    console.log('🎮 900px制限でのゲームプレイデモ開始');
    
    // テンキー操作のデモンストレーション（ゆっくりとした操作）
    const numbers = ['1', '2', '3', '4', '5'];
    
    for (const number of numbers) {
      await page.click(`.numpad button[data-value="${number}"]`);
      await page.waitForTimeout(1000); // ゆっくりとしたデモ
      console.log(`🔢 数字 ${number} を入力 (900px制限レイアウト内)`);
    }
    
    await page.waitForTimeout(1500);
    
    // クリア操作
    await page.click('.numpad button[data-action="clear"]');
    await page.waitForTimeout(1000);
    console.log('🧹 入力をクリア');
    
    // より複雑な入力パターン
    const sequence = ['6', '7', '8', '9', '0'];
    for (const number of sequence) {
      await page.click(`.numpad button[data-value="${number}"]`);
      await page.waitForTimeout(800);
      console.log(`🔢 数字 ${number} を入力`);
    }
    
    await page.waitForTimeout(1500);
    
    // 再度クリア
    await page.click('.numpad button[data-action="clear"]');
    await page.waitForTimeout(1000);
    console.log('🧹 最終クリア');
    
    // 8. レイアウト確認のためのスクロール動作（ゆっくり）
    await page.mouse.move(960, 540); // 画面中央に移動
    await page.waitForTimeout(1000);
    
    // Canvas部分にホバー
    const canvas = page.locator('#gameScreen canvas');
    await canvas.hover();
    await page.waitForTimeout(1000);
    console.log('🖼️ Canvas部分ホバー確認');
    
    // サイドパネル部分にホバー
    const sidePanel = page.locator('.side-panel');
    await sidePanel.hover();
    await page.waitForTimeout(1000);
    console.log('📊 サイドパネル部分ホバー確認');
    
    // 9. ゲーム要素の最終確認
    await expect(page.locator('#gameScreen')).toBeVisible();
    await expect(canvas).toBeVisible();
    await expect(sidePanel).toBeVisible();
    await expect(page.locator('.numpad')).toBeVisible();
    await expect(page.locator('#answerDisplay')).toBeVisible();
    
    // 高さ制限の最終確認
    const finalGameScreenBox = await gameScreen.boundingBox();
    expect(finalGameScreenBox.height).toBe(900);
    console.log('✅ 全ゲーム要素が900px制限内で正常に表示・動作');
    
    // 10. 最終待機（ビデオ録画のため）
    await page.waitForTimeout(2000);
    
    console.log('🎬 900px制限 1080P ビデオ録画テスト完了');
    console.log('📁 ビデオは test-results/ フォルダに自動保存されます');
    console.log('🎯 ブラウザUI余白: ' + (1080 - finalGameScreenBox.height) + 'px確保');
  });

  test('900px制限 キーボード操作デモ - ビデオ録画', async ({ page }) => {
    console.log('⌨️ 900px制限 キーボード操作ビデオ録画開始');
    
    // ゲーム画面まで移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="easy"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // 900px制限の確認
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    console.log('📐 キーボードテスト用ゲーム画面サイズ:', gameScreenBox);
    console.log('🎮 900px制限ゲーム画面到達');
    
    // キーボード操作のデモ（ゆっくりとした操作）
    const keySequence = ['1', '2', '3', '4', '5', 'Backspace', 'Backspace', '6', '7', '8', '9', '0'];
    
    for (const key of keySequence) {
      await page.keyboard.press(key);
      await page.waitForTimeout(1000); // ゆっくりとした操作
      console.log(`⌨️ キー入力: ${key} (900px制限レイアウト)`);
    }
    
    // 入力状態を確認するための待機
    await page.waitForTimeout(1500);
    
    // Escapeでクリア試行（動作確認）
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    console.log('⌨️ Escapeキーでクリア試行');
    
    // テンキーとキーボード操作の組み合わせデモ
    await page.click('.numpad button[data-value="1"]');
    await page.waitForTimeout(500);
    await page.keyboard.press('2');
    await page.waitForTimeout(500);
    await page.click('.numpad button[data-value="3"]');
    await page.waitForTimeout(500);
    console.log('🔢 テンキーとキーボードの組み合わせ操作');
    
    // 最終確認
    const answerDisplay = page.locator('#answerDisplay');
    await expect(answerDisplay).toBeVisible();
    await page.waitForTimeout(2000);
    
    console.log('⌨️ 900px制限 キーボード操作デモ完了');
    console.log('🎯 レイアウト制限内で全ての操作が実行可能');
  });
});