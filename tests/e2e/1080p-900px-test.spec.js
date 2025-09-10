// 1080P解像度での900px制限テスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度 900px制限レイアウト確認', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('900px制限でのゲーム画面サイズ確認', async ({ page }) => {
    console.log('📐 900px制限レイアウト確認開始');
    
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // ゲーム画面まで移動
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="normal"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // ゲーム画面のサイズを測定
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    
    console.log('📐 修正後のゲーム画面サイズ:', gameScreenBox);
    console.log('📐 高さが900px以下かチェック:', gameScreenBox.height <= 900);
    
    // Canvas要素のサイズ確認
    const canvas = page.locator('#gameScreen canvas');
    const canvasBox = await canvas.boundingBox();
    console.log('📐 修正後のCanvasサイズ:', canvasBox);
    
    // サイドパネルのサイズ確認
    const sidePanel = page.locator('.side-panel');
    const sidePanelBox = await sidePanel.boundingBox();
    console.log('📐 修正後のサイドパネルサイズ:', sidePanelBox);
    
    // 高さ制限の検証
    expect(gameScreenBox.height).toBeLessThanOrEqual(900);
    console.log('✅ ゲーム画面が900px以下に制限されている');
    
    // 要素が適切に表示されているかチェック
    await expect(gameScreen).toBeVisible();
    await expect(canvas).toBeVisible();
    await expect(sidePanel).toBeVisible();
    await expect(page.locator('.numpad')).toBeVisible();
    await expect(page.locator('#answerDisplay')).toBeVisible();
    
    console.log('✅ 全ての要素が900px制限内で正常に表示');
    
    // ブラウザUI余白を考慮した実際の利用可能高さをシミュレート
    const availableHeight = 1080 - 100; // ブラウザヘッダ・OSフッタ想定
    const fitsInBrowser = gameScreenBox.height <= availableHeight;
    console.log('📐 ブラウザUI余白考慮後の収まり具合:', fitsInBrowser);
    expect(fitsInBrowser).toBe(true);
    
    console.log('🎉 900px制限レイアウト確認完了');
  });

  test('900px制限での機能動作確認', async ({ page }) => {
    console.log('🔧 900px制限での機能動作確認開始');
    
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // ゲーム開始
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="easy"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // テンキー操作テスト
    await page.click('.numpad button[data-value="1"]');
    await page.click('.numpad button[data-value="2"]');
    await page.click('.numpad button[data-value="3"]');
    
    const answerDisplay = page.locator('#answerDisplay');
    await expect(answerDisplay).toHaveValue('123');
    console.log('✅ テンキー入力が正常動作');
    
    // クリア機能テスト
    await page.click('.numpad button[data-action="clear"]');
    await expect(answerDisplay).toHaveValue('');
    console.log('✅ クリア機能が正常動作');
    
    // キーボード入力テスト
    await page.keyboard.press('4');
    await page.keyboard.press('5');
    await page.keyboard.press('6');
    await expect(answerDisplay).toHaveValue('456');
    console.log('✅ キーボード入力が正常動作');
    
    // Backspace機能テスト
    await page.keyboard.press('Backspace');
    await expect(answerDisplay).toHaveValue('45');
    console.log('✅ Backspace機能が正常動作');
    
    console.log('🎉 900px制限での全機能が正常動作確認完了');
  });
});