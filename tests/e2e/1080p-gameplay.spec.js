// 1080P解像度でのゲームプレイ確認テスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度でのMathBlocksゲームプレイ検証', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('1080P解像度でのユーザーフロー完全検証', async ({ page }) => {
    console.log('🎯 1080P E2Eテスト開始: 完全ユーザーフロー検証');
    
    // 1. サイトに移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    console.log('✅ サイト読み込み完了');

    // 2. 初期画面の確認
    await expect(page.locator('h1').first()).toContainText('MathBlocks');
    console.log('✅ メインタイトル表示確認');
    
    // 3. userScreenが表示されていることを確認
    await expect(page.locator('#userScreen')).toBeVisible();
    console.log('✅ ユーザー選択画面表示確認');

    // 4. ゲストプレイボタンをクリック
    const guestBtn = page.locator('#guestModeBtn');
    await expect(guestBtn).toBeVisible();
    await guestBtn.click();
    console.log('🖱️ ゲストプレイボタンをクリック');

    // 5. スタート画面への遷移確認
    await page.waitForSelector('#startScreen', { state: 'visible', timeout: 5000 });
    await expect(page.locator('#startScreen')).toBeVisible();
    console.log('✅ ゲームモード選択画面への遷移確認');

    // 6. スコアアタックモードを選択
    const scoreBtn = page.locator('button[data-mode="score"]');
    await expect(scoreBtn).toBeVisible();
    await scoreBtn.click();
    console.log('🖱️ スコアアタックボタンをクリック');

    // 7. 難易度選択（ノーマル）
    await page.waitForSelector('.difficulty-selection', { state: 'visible', timeout: 3000 });
    const normalBtn = page.locator('.difficulty-selection button[data-difficulty="normal"]');
    await expect(normalBtn).toBeVisible();
    await normalBtn.click();
    console.log('🖱️ ノーマル難易度ボタンをクリック');

    // 8. スタートボタンをクリック
    const startBtn = page.locator('#startBtn');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toBeEnabled();
    await startBtn.click();
    console.log('🖱️ スタートボタンをクリック');

    // 9. ゲーム画面への遷移確認
    await page.waitForSelector('#gameScreen', { state: 'visible', timeout: 5000 });
    await expect(page.locator('#gameScreen')).toBeVisible();
    console.log('✅ ゲーム画面への遷移確認');

    // 10. 1080P解像度でのゲーム要素の表示確認
    const canvas = page.locator('#gameScreen canvas');
    await expect(canvas).toBeVisible();
    console.log('✅ ゲームCanvasの表示確認');

    // 10. サイドパネルの表示確認
    const sidePanel = page.locator('.side-panel');
    await expect(sidePanel).toBeVisible();
    console.log('✅ サイドパネルの表示確認');

    // 11. 答え入力フィールドの確認（正しいID使用）
    const answerDisplay = page.locator('#answerDisplay');
    await expect(answerDisplay).toBeVisible();
    console.log('✅ 答え入力フィールド確認');

    // 12. テンキーの表示確認
    const numpadContainer = page.locator('.numpad');
    await expect(numpadContainer).toBeVisible();
    console.log('✅ テンキー表示確認');

    // 13. テンキーボタンのクリックテスト
    const button5 = page.locator('.numpad button[data-value="5"]');
    await expect(button5).toBeVisible();
    await button5.click();
    console.log('🖱️ テンキー「5」をクリック');

    // 14. 入力値の確認
    await expect(answerDisplay).toHaveValue('5');
    console.log('✅ 入力値が正しく表示される');

    // 15. クリアボタンのテスト
    const clearBtn = page.locator('.numpad button[data-action="clear"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(answerDisplay).toHaveValue('');
    console.log('✅ クリアボタンが正常に動作');

    // 16. スコア表示の確認
    const scoreDisplay = page.locator('#score');
    await expect(scoreDisplay).toBeVisible();
    console.log('✅ スコア表示確認');

    // 17. レベル表示の確認
    const levelDisplay = page.locator('#level');
    await expect(levelDisplay).toBeVisible();
    console.log('✅ レベル表示確認');

    // 18. ゲーム画面全体のレスポンシブ確認
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    
    // 画面内に収まっているか確認
    expect(gameScreenBox.height).toBeLessThanOrEqual(1080);
    expect(gameScreenBox.width).toBeLessThanOrEqual(1920);
    console.log('✅ 1080P解像度内でゲーム画面が正しく表示');

    console.log('🎉 1080P E2Eテスト完了: 全要素が正常表示・動作');
  });

  test('1080P解像度でのキーボード入力テスト', async ({ page }) => {
    console.log('⌨️ 1080P キーボード入力テスト開始');
    
    // ゲーム画面まで移動
    await page.goto('http://localhost:8000');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="easy"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    
    console.log('✅ ゲーム画面まで到達');

    // キーボード入力のテスト
    const answerDisplay = page.locator('#answerDisplay');
    
    // 数字キーの入力テスト
    await page.keyboard.press('5');
    await expect(answerDisplay).toHaveValue('5');
    console.log('✅ キーボード数字入力が動作');

    // Backspaceキーのテスト
    await page.keyboard.press('Backspace');
    await expect(answerDisplay).toHaveValue('');
    console.log('✅ Backspaceキーが動作');

    // 複数桁入力のテスト
    await page.keyboard.press('2');
    await page.keyboard.press('5');
    await expect(answerDisplay).toHaveValue('25');
    console.log('✅ 複数桁入力が動作');

    // Escapeキーでクリア
    await page.keyboard.press('Escape');
    await expect(answerDisplay).toHaveValue('');
    console.log('✅ Escapeキークリアが動作');

    console.log('🎉 1080P キーボード入力テスト完了');
  });

  test('1080P解像度でのレスポンシブデザイン確認', async ({ page }) => {
    console.log('📱 1080P レスポンシブデザイン確認開始');
    
    await page.goto('http://localhost:8000');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');
    
    // ゲーム画面まで移動
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="normal"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    
    // 各要素の位置とサイズを確認
    const gameScreen = page.locator('#gameScreen');
    const canvas = page.locator('#gameScreen canvas');
    const sidePanel = page.locator('.side-panel');
    const numpad = page.locator('.numpad');
    
    // 要素のバウンディングボックスを取得
    const gameScreenBox = await gameScreen.boundingBox();
    const canvasBox = await canvas.boundingBox();
    const sidePanelBox = await sidePanel.boundingBox();
    const numpadBox = await numpad.boundingBox();
    
    // 1080P解像度での適切な表示確認
    expect(gameScreenBox.height).toBeLessThanOrEqual(1080);
    expect(gameScreenBox.width).toBeLessThanOrEqual(1920);
    console.log('✅ ゲーム画面が1080P解像度内に収まる');
    
    // Canvas要素が適切なサイズであることを確認
    expect(canvasBox.width).toBeGreaterThan(200);
    expect(canvasBox.height).toBeGreaterThan(200);
    console.log('✅ Canvasが適切なサイズで表示');
    
    // サイドパネルが表示されていることを確認
    expect(sidePanelBox.width).toBeGreaterThan(100);
    expect(sidePanelBox.height).toBeGreaterThan(200);
    console.log('✅ サイドパネルが適切に表示');
    
    // テンキーが表示されていることを確認
    expect(numpadBox.width).toBeGreaterThan(100);
    expect(numpadBox.height).toBeGreaterThan(100);
    console.log('✅ テンキーが適切に表示');
    
    console.log('🎉 1080P レスポンシブデザイン確認完了');
  });
});