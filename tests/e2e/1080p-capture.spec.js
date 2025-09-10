// 1080P解像度での画面キャプチャとビデオ録画テスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度 画面キャプチャ・ビデオ録画', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('1080P解像度での完全ゲームプレイ - 画面キャプチャ付き', async ({ page }) => {
    console.log('📸 1080P 画面キャプチャテスト開始');
    
    // 1. サイトに移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // 初期画面をキャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-01-initial-screen.png', 
      fullPage: true 
    });
    console.log('📸 初期画面キャプチャ保存: test-results/1080p-01-initial-screen.png');

    // 2. ゲスト登録
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    
    // ゲームモード選択画面をキャプチャ  
    await page.screenshot({ 
      path: 'test-results/1080p-02-mode-selection.png', 
      fullPage: true 
    });
    console.log('📸 モード選択画面キャプチャ保存: test-results/1080p-02-mode-selection.png');

    // 3. スコアアタック選択
    await page.click('button[data-mode="score"]');
    await page.waitForTimeout(500);
    
    // 難易度選択画面をキャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-03-difficulty-selection.png', 
      fullPage: true 
    });
    console.log('📸 難易度選択画面キャプチャ保存: test-results/1080p-03-difficulty-selection.png');

    // 4. ノーマル難易度選択
    await page.click('button[data-difficulty="normal"]');
    await page.waitForTimeout(500);
    
    // スタートボタンが有効化された状態をキャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-04-ready-to-start.png', 
      fullPage: true 
    });
    console.log('📸 ゲーム開始準備画面キャプチャ保存: test-results/1080p-04-ready-to-start.png');

    // 5. ゲーム開始
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000); // ゲーム初期化を待つ
    
    // ゲーム画面をキャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-05-game-screen.png', 
      fullPage: true 
    });
    console.log('📸 ゲーム画面キャプチャ保存: test-results/1080p-05-game-screen.png');

    // 6. ゲーム要素の詳細キャプチャ（Canvas部分のみ）
    const canvas = page.locator('#gameScreen canvas');
    await canvas.screenshot({ 
      path: 'test-results/1080p-06-game-canvas.png'
    });
    console.log('📸 ゲームCanvas部分キャプチャ保存: test-results/1080p-06-game-canvas.png');

    // 7. サイドパネルキャプチャ
    const sidePanel = page.locator('.side-panel');
    await sidePanel.screenshot({ 
      path: 'test-results/1080p-07-side-panel.png'
    });
    console.log('📸 サイドパネルキャプチャ保存: test-results/1080p-07-side-panel.png');

    // 8. テンキー操作デモ
    console.log('🎮 テンキー操作デモ開始');
    
    // 数字入力テスト
    await page.click('.numpad button[data-value="1"]');
    await page.waitForTimeout(300);
    await page.click('.numpad button[data-value="2"]');
    await page.waitForTimeout(300);
    await page.click('.numpad button[data-value="3"]');
    await page.waitForTimeout(300);
    
    // 入力後の状態をキャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-08-input-demo.png', 
      fullPage: true 
    });
    console.log('📸 入力デモ画面キャプチャ保存: test-results/1080p-08-input-demo.png');

    // 9. クリア操作
    await page.click('.numpad button[data-action="clear"]');
    await page.waitForTimeout(300);
    
    // クリア後の状態をキャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-09-after-clear.png', 
      fullPage: true 
    });
    console.log('📸 クリア後画面キャプチャ保存: test-results/1080p-09-after-clear.png');

    // 10. ゲーム要素の表示確認
    await expect(page.locator('#gameScreen')).toBeVisible();
    await expect(canvas).toBeVisible();
    await expect(sidePanel).toBeVisible();
    await expect(page.locator('.numpad')).toBeVisible();
    await expect(page.locator('#answerDisplay')).toBeVisible();

    console.log('✅ 1080P解像度での全ての要素が正常に表示されることを確認');
    console.log('📸 画面キャプチャテスト完了 - test-results/ フォルダに保存');
  });

  test('1080P解像度でのレスポンシブ表示確認', async ({ page }) => {
    console.log('📐 1080P レスポンシブ表示確認開始');
    
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // ゲーム画面まで移動
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="easy"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // ビューポート情報を取得
    const viewport = await page.viewportSize();
    console.log('📐 現在のビューポート:', viewport);
    
    // 各要素のサイズ情報をキャプチャ
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    
    const canvas = page.locator('#gameScreen canvas');
    const canvasBox = await canvas.boundingBox();
    
    const sidePanel = page.locator('.side-panel');
    const sidePanelBox = await sidePanel.boundingBox();
    
    console.log('📐 ゲーム画面サイズ:', gameScreenBox);
    console.log('📐 Canvasサイズ:', canvasBox);
    console.log('📐 サイドパネルサイズ:', sidePanelBox);
    
    // レスポンシブ表示の最終キャプチャ
    await page.screenshot({ 
      path: 'test-results/1080p-responsive-final.png', 
      fullPage: true 
    });
    console.log('📸 レスポンシブ確認最終画面: test-results/1080p-responsive-final.png');
    
    // サイズ検証
    expect(gameScreenBox.height).toBeLessThanOrEqual(1080);
    expect(gameScreenBox.width).toBeLessThanOrEqual(1920);
    expect(canvasBox.width).toBeGreaterThan(200);
    expect(canvasBox.height).toBeGreaterThan(200);
    
    console.log('✅ 1080P解像度でのレスポンシブ表示が適切に動作');
  });
});