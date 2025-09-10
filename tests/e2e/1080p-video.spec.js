// 1080P解像度でのビデオ録画テスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度 ビデオ録画テスト', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('1080P解像度での完全ゲームプレイ - ビデオ録画', async ({ page }) => {
    console.log('🎬 1080P ビデオ録画テスト開始');
    
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
    console.log('✅ ゲーム開始');
    
    // 6. ゲームプレイデモ
    console.log('🎮 ゲームプレイデモ開始');
    
    // テンキー操作のデモンストレーション
    const numbers = ['1', '2', '3', '4', '5'];
    
    for (const number of numbers) {
      await page.click(`.numpad button[data-value="${number}"]`);
      await page.waitForTimeout(800); // ゆっくりとしたデモ
      console.log(`🔢 数字 ${number} を入力`);
    }
    
    await page.waitForTimeout(1000);
    
    // クリア操作
    await page.click('.numpad button[data-action="clear"]');
    await page.waitForTimeout(1000);
    console.log('🧹 入力をクリア');
    
    // より複雑な入力パターン
    const sequence = ['7', '8', '9'];
    for (const number of sequence) {
      await page.click(`.numpad button[data-value="${number}"]`);
      await page.waitForTimeout(600);
      console.log(`🔢 数字 ${number} を入力`);
    }
    
    await page.waitForTimeout(1000);
    
    // 再度クリア
    await page.click('.numpad button[data-action="clear"]');
    await page.waitForTimeout(1000);
    console.log('🧹 最終クリア');
    
    // 7. ゲーム要素の確認
    await expect(page.locator('#gameScreen')).toBeVisible();
    await expect(page.locator('#gameScreen canvas')).toBeVisible();
    await expect(page.locator('.side-panel')).toBeVisible();
    await expect(page.locator('.numpad')).toBeVisible();
    await expect(page.locator('#answerDisplay')).toBeVisible();
    
    console.log('✅ 全ゲーム要素が1080P解像度で正常に表示');
    
    // 8. 最終待機
    await page.waitForTimeout(2000);
    
    console.log('🎬 1080P ビデオ録画テスト完了');
    console.log('📁 ビデオは test-results/ フォルダに自動保存されます');
  });

  test('1080P解像度 キーボード操作デモ - ビデオ録画', async ({ page }) => {
    console.log('⌨️ 1080P キーボード操作ビデオ録画開始');
    
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
    
    console.log('🎮 ゲーム画面到達');
    
    // キーボード操作のデモ
    const keySequence = ['1', '2', '3', '4', '5', 'Backspace', '6', '7', '8', 'Backspace', 'Backspace', '9', '0'];
    
    for (const key of keySequence) {
      await page.keyboard.press(key);
      await page.waitForTimeout(800);
      console.log(`⌨️ キー入力: ${key}`);
    }
    
    // Escapeでクリア試行
    await page.waitForTimeout(1000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    console.log('⌨️ Escapeキーでクリア試行');
    
    // 最終確認
    await expect(page.locator('#answerDisplay')).toBeVisible();
    await page.waitForTimeout(2000);
    
    console.log('⌨️ キーボード操作デモ完了');
  });
});