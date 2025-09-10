// スコア・レベル・コンボの横並び配置確認テスト
import { test, expect } from '@playwright/test';

test.describe('スコア・レベル・コンボ横並び配置確認', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('スコア・レベル・コンボが横並びで表示されることを確認', async ({ page }) => {
    console.log('📊 スコア・レベル・コンボ横並び配置確認開始');
    
    // ゲーム画面まで移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="normal"]');
    await page.click('#startBtn');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    await page.waitForTimeout(1000);
    
    // 各要素の位置を取得
    const scoreDisplay = page.locator('.score-display');
    const levelDisplay = page.locator('.level-display');
    const comboDisplay = page.locator('.combo-display');
    
    const scoreBox = await scoreDisplay.boundingBox();
    const levelBox = await levelDisplay.boundingBox();
    const comboBox = await comboDisplay.boundingBox();
    
    console.log('📊 スコア表示位置:', scoreBox);
    console.log('📊 レベル表示位置:', levelBox);
    console.log('📊 コンボ表示位置:', comboBox);
    
    // 横並び配置の確認（Y座標が同じかほぼ同じ）
    const yPositionTolerance = 5; // 5px以内の誤差は許容
    const scoreY = scoreBox.y;
    const levelY = levelBox.y;
    const comboY = comboBox.y;
    
    console.log('📊 Y座標 - スコア:', scoreY, 'レベル:', levelY, 'コンボ:', comboY);
    
    // 横並びになっているかチェック
    const isHorizontallyAligned = 
      Math.abs(scoreY - levelY) <= yPositionTolerance &&
      Math.abs(levelY - comboY) <= yPositionTolerance &&
      Math.abs(scoreY - comboY) <= yPositionTolerance;
    
    console.log('📊 横並び配置確認:', isHorizontallyAligned);
    expect(isHorizontallyAligned).toBe(true);
    
    // 左から右の順序確認（スコア → レベル → コンボ）
    expect(scoreBox.x).toBeLessThan(levelBox.x);
    expect(levelBox.x).toBeLessThan(comboBox.x);
    console.log('✅ 左から右の順序が正しい（スコア → レベル → コンボ）');
    
    // 要素の幅確認（絶対値固定）
    console.log('📊 各要素の幅 - スコア:', scoreBox.width, 'レベル:', levelBox.width, 'コンボ:', comboBox.width);
    expect(scoreBox.width).toBeGreaterThanOrEqual(80);
    expect(scoreBox.width).toBeLessThanOrEqual(90);
    expect(levelBox.width).toBeGreaterThanOrEqual(80);
    expect(levelBox.width).toBeLessThanOrEqual(90);
    expect(comboBox.width).toBeGreaterThanOrEqual(80);
    expect(comboBox.width).toBeLessThanOrEqual(90);
    console.log('✅ 各要素の幅が絶対値で固定されている（80-90px）');
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: 'test-results/score-layout-fixed.png', 
      fullPage: true 
    });
    console.log('📸 修正後のレイアウトキャプチャ保存: test-results/score-layout-fixed.png');
    
    console.log('🎉 スコア・レベル・コンボの横並び配置確認完了');
  });

  test('異なるスコア値での横並び確認', async ({ page }) => {
    console.log('🔢 異なるスコア値での横並び確認開始');
    
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
    
    // いくつかテンキー操作を行って数値を変動させる
    await page.click('.numpad button[data-value="5"]');
    await page.click('.numpad button[data-value="5"]');
    await page.click('.numpad button[data-action="ok"]');
    await page.waitForTimeout(500);
    
    await page.click('.numpad button[data-value="1"]');
    await page.click('.numpad button[data-value="0"]');
    await page.click('.numpad button[data-action="ok"]');
    await page.waitForTimeout(500);
    
    // 再度位置確認
    const scoreDisplay = page.locator('.score-display');
    const levelDisplay = page.locator('.level-display');
    const comboDisplay = page.locator('.combo-display');
    
    const scoreBox = await scoreDisplay.boundingBox();
    const levelBox = await levelDisplay.boundingBox();
    const comboBox = await comboDisplay.boundingBox();
    
    // スコア値取得
    const scoreValue = await page.locator('#score').textContent();
    const levelValue = await page.locator('#level').textContent();
    const comboValue = await page.locator('#combo').textContent();
    
    console.log('🔢 現在の値 - スコア:', scoreValue, 'レベル:', levelValue, 'コンボ:', comboValue);
    
    // 横並び配置の再確認
    const yPositionTolerance = 5;
    const isHorizontallyAligned = 
      Math.abs(scoreBox.y - levelBox.y) <= yPositionTolerance &&
      Math.abs(levelBox.y - comboBox.y) <= yPositionTolerance;
    
    console.log('🔢 数値変動後も横並び配置維持:', isHorizontallyAligned);
    expect(isHorizontallyAligned).toBe(true);
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: 'test-results/score-layout-with-values.png', 
      fullPage: true 
    });
    console.log('📸 数値変動後のレイアウトキャプチャ保存: test-results/score-layout-with-values.png');
    
    console.log('🎉 異なるスコア値での横並び確認完了');
  });
});