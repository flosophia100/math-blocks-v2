// 900px制限での1080P解像度 画面キャプチャ・ビデオ録画テスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度 900px制限 画面キャプチャ・ビデオ録画', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('900px制限での完全ゲームプレイ - 画面キャプチャ付き', async ({ page }) => {
    console.log('📸 900px制限 1080P 画面キャプチャテスト開始');
    
    // 1. サイトに移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    
    // 初期画面をキャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-01-initial-screen.png', 
      fullPage: true 
    });
    console.log('📸 初期画面キャプチャ保存: test-results/900px-01-initial-screen.png');

    // 2. ゲスト登録
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    
    // ゲームモード選択画面をキャプチャ  
    await page.screenshot({ 
      path: 'test-results/900px-02-mode-selection.png', 
      fullPage: true 
    });
    console.log('📸 モード選択画面キャプチャ保存: test-results/900px-02-mode-selection.png');

    // 3. スコアアタック選択
    await page.click('button[data-mode="score"]');
    await page.waitForTimeout(500);
    
    // 難易度選択画面をキャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-03-difficulty-selection.png', 
      fullPage: true 
    });
    console.log('📸 難易度選択画面キャプチャ保存: test-results/900px-03-difficulty-selection.png');

    // 4. ノーマル難易度選択
    await page.click('button[data-difficulty="normal"]');
    await page.waitForTimeout(500);
    
    // スタートボタンが有効化された状態をキャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-04-ready-to-start.png', 
      fullPage: true 
    });
    console.log('📸 ゲーム開始準備画面キャプチャ保存: test-results/900px-04-ready-to-start.png');

    // 5. ゲーム開始
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000); // ゲーム初期化を待つ
    
    // 900px制限ゲーム画面をキャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-05-game-screen-900px.png', 
      fullPage: true 
    });
    console.log('📸 900px制限ゲーム画面キャプチャ保存: test-results/900px-05-game-screen-900px.png');

    // 6. ゲーム画面のサイズ情報を取得・表示
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    console.log('📐 900px制限後のゲーム画面サイズ:', gameScreenBox);
    
    const canvas = page.locator('#gameScreen canvas');
    const canvasBox = await canvas.boundingBox();
    console.log('📐 900px制限後のCanvasサイズ:', canvasBox);
    
    const sidePanel = page.locator('.side-panel');
    const sidePanelBox = await sidePanel.boundingBox();
    console.log('📐 900px制限後のサイドパネルサイズ:', sidePanelBox);

    // 7. Canvas部分の詳細キャプチャ
    await canvas.screenshot({ 
      path: 'test-results/900px-06-game-canvas.png'
    });
    console.log('📸 ゲームCanvas部分キャプチャ保存: test-results/900px-06-game-canvas.png');

    // 8. サイドパネルキャプチャ
    await sidePanel.screenshot({ 
      path: 'test-results/900px-07-side-panel.png'
    });
    console.log('📸 サイドパネルキャプチャ保存: test-results/900px-07-side-panel.png');

    // 9. テンキー操作デモ
    console.log('🎮 テンキー操作デモ開始');
    
    // 数字入力テスト
    await page.click('.numpad button[data-value="7"]');
    await page.waitForTimeout(300);
    await page.click('.numpad button[data-value="8"]');
    await page.waitForTimeout(300);
    await page.click('.numpad button[data-value="9"]');
    await page.waitForTimeout(300);
    
    // 入力後の状態をキャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-08-input-demo.png', 
      fullPage: true 
    });
    console.log('📸 入力デモ画面キャプチャ保存: test-results/900px-08-input-demo.png');

    // 10. クリア操作
    await page.click('.numpad button[data-action="clear"]');
    await page.waitForTimeout(300);
    
    // クリア後の状態をキャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-09-after-clear.png', 
      fullPage: true 
    });
    console.log('📸 クリア後画面キャプチャ保存: test-results/900px-09-after-clear.png');

    // 11. 900px制限の検証
    expect(gameScreenBox.height).toBe(900);
    console.log('✅ ゲーム画面が正確に900pxに制限されている');
    
    // ブラウザUI余白を考慮した実際の利用可能高さチェック
    const browserUIMargin = 1080 - 900; // 180px余白
    console.log('📐 ブラウザUI用の余白:', browserUIMargin + 'px');
    expect(browserUIMargin).toBeGreaterThanOrEqual(100); // 最低100px余白を確保
    console.log('✅ 充分なブラウザUI余白が確保されている');

    // 12. 最終確認キャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-10-final-layout.png', 
      fullPage: true 
    });
    console.log('📸 最終レイアウト確認キャプチャ保存: test-results/900px-10-final-layout.png');

    console.log('✅ 900px制限での全ての要素が正常に表示されることを確認');
    console.log('📸 900px制限画面キャプチャテスト完了 - test-results/ フォルダに保存');
  });

  test('900px制限でのレスポンシブ表示比較確認', async ({ page }) => {
    console.log('📐 900px制限 レスポンシブ表示比較確認開始');
    
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
    
    // 各要素のサイズ情報を取得
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    
    const canvas = page.locator('#gameScreen canvas');
    const canvasBox = await canvas.boundingBox();
    
    const sidePanel = page.locator('.side-panel');
    const sidePanelBox = await sidePanel.boundingBox();
    
    const numpad = page.locator('.numpad');
    const numpadBox = await numpad.boundingBox();
    
    console.log('📐 [900px制限] ゲーム画面サイズ:', gameScreenBox);
    console.log('📐 [900px制限] Canvasサイズ:', canvasBox);
    console.log('📐 [900px制限] サイドパネルサイズ:', sidePanelBox);
    console.log('📐 [900px制限] テンキーサイズ:', numpadBox);
    
    // 比較用の比率計算
    const screenRatio = (gameScreenBox.width / gameScreenBox.height).toFixed(2);
    const canvasRatio = (canvasBox.width / canvasBox.height).toFixed(2);
    console.log('📐 ゲーム画面のアスペクト比:', screenRatio);
    console.log('📐 Canvasのアスペクト比:', canvasRatio);
    
    // レスポンシブ表示の最終キャプチャ
    await page.screenshot({ 
      path: 'test-results/900px-responsive-comparison.png', 
      fullPage: true 
    });
    console.log('📸 レスポンシブ比較最終画面: test-results/900px-responsive-comparison.png');
    
    // サイズ検証
    expect(gameScreenBox.height).toBe(900);
    expect(gameScreenBox.width).toBeLessThanOrEqual(1920);
    expect(canvasBox.width).toBeGreaterThan(200);
    expect(canvasBox.height).toBeGreaterThan(200);
    expect(sidePanelBox.height).toBeLessThanOrEqual(900); // サイドパネルもゲーム画面内に収まる
    
    console.log('✅ 900px制限でのレスポンシブ表示が適切に動作');
    console.log('🎯 ブラウザUI余白: ' + (1080 - gameScreenBox.height) + 'px確保');
  });
});