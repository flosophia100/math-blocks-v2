// 幅拡大後のサイドパネル横並び確認テスト
import { test, expect } from '@playwright/test';

test.describe('幅拡大サイドパネル横並び確認', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('20%拡大後のサイドパネルでスコア・レベル・コンボが横並び', async ({ page }) => {
    console.log('📊 20%拡大サイドパネル横並び確認開始');
    
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
    
    // サイドパネル全体の幅確認
    const sidePanel = page.locator('.side-panel');
    const sidePanelBox = await sidePanel.boundingBox();
    console.log('📐 拡大後サイドパネルサイズ:', sidePanelBox);
    
    // 1080Pでは360px（300px + 20%）になることを確認
    expect(sidePanelBox.width).toBeGreaterThanOrEqual(350);
    expect(sidePanelBox.width).toBeLessThanOrEqual(370);
    console.log('✅ サイドパネルが20%拡大されている:', sidePanelBox.width + 'px');
    
    // 各要素の位置を取得
    const scoreDisplay = page.locator('.score-display');
    const levelDisplay = page.locator('.level-display');
    const comboDisplay = page.locator('.combo-display');
    
    const scoreBox = await scoreDisplay.boundingBox();
    const levelBox = await levelDisplay.boundingBox();
    const comboBox = await comboDisplay.boundingBox();
    
    console.log('📊 拡大後 スコア表示位置:', scoreBox);
    console.log('📊 拡大後 レベル表示位置:', levelBox);
    console.log('📊 拡大後 コンボ表示位置:', comboBox);
    
    // 横並び配置の確認（Y座標が同じかほぼ同じ）
    const yPositionTolerance = 5;
    const scoreY = scoreBox.y;
    const levelY = levelBox.y;
    const comboY = comboBox.y;
    
    console.log('📊 Y座標 - スコア:', scoreY, 'レベル:', levelY, 'コンボ:', comboY);
    
    const isHorizontallyAligned = 
      Math.abs(scoreY - levelY) <= yPositionTolerance &&
      Math.abs(levelY - comboY) <= yPositionTolerance &&
      Math.abs(scoreY - comboY) <= yPositionTolerance;
    
    console.log('📊 横並び配置確認:', isHorizontallyAligned);
    expect(isHorizontallyAligned).toBe(true);
    
    // 左から右の順序確認
    expect(scoreBox.x).toBeLessThan(levelBox.x);
    expect(levelBox.x).toBeLessThan(comboBox.x);
    console.log('✅ 左から右の順序が正しい');
    
    // 拡大した要素の幅確認（100-110px）
    console.log('📊 各要素の幅 - スコア:', scoreBox.width, 'レベル:', levelBox.width, 'コンボ:', comboBox.width);
    expect(scoreBox.width).toBeGreaterThanOrEqual(100);
    expect(scoreBox.width).toBeLessThanOrEqual(120);
    console.log('✅ 各要素の幅が拡大されている（100-120px範囲）');
    
    // 要素間の余裕確認
    const availableWidth = sidePanelBox.width - 16; // パディング考慮
    const totalElementsWidth = scoreBox.width + levelBox.width + comboBox.width;
    const hasEnoughSpace = availableWidth >= totalElementsWidth;
    console.log('📐 利用可能幅:', availableWidth, '要素合計幅:', totalElementsWidth, '余裕:', hasEnoughSpace);
    expect(hasEnoughSpace).toBe(true);
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: 'test-results/wide-panel-layout.png', 
      fullPage: true 
    });
    console.log('📸 20%拡大レイアウトキャプチャ保存: test-results/wide-panel-layout.png');
    
    console.log('🎉 20%拡大サイドパネルの横並び確認完了');
  });

  test('拡大サイドパネルでゲーム全体レイアウト確認', async ({ page }) => {
    console.log('🎮 拡大サイドパネルでのゲーム全体レイアウト確認');
    
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
    
    // ゲーム画面全体の確認
    const gameScreen = page.locator('#gameScreen');
    const gameScreenBox = await gameScreen.boundingBox();
    
    const canvas = page.locator('#gameScreen canvas');
    const canvasBox = await canvas.boundingBox();
    
    const sidePanel = page.locator('.side-panel');
    const sidePanelBox = await sidePanel.boundingBox();
    
    console.log('🎮 ゲーム画面全体:', gameScreenBox);
    console.log('🖼️ Canvas部分:', canvasBox);
    console.log('📊 拡大サイドパネル:', sidePanelBox);
    
    // 900px制限内に収まっているかチェック
    expect(gameScreenBox.height).toBeLessThanOrEqual(900);
    
    // Canvas + サイドパネル + gap が画面内に収まっているかチェック
    const totalWidth = canvasBox.width + sidePanelBox.width + 50; // gap考慮
    expect(totalWidth).toBeLessThanOrEqual(gameScreenBox.width);
    console.log('✅ Canvas + 拡大サイドパネルが画面内に収まっている');
    
    // スクリーンショット保存
    await page.screenshot({ 
      path: 'test-results/wide-panel-full-game.png', 
      fullPage: true 
    });
    console.log('📸 拡大パネル全体ゲーム画面: test-results/wide-panel-full-game.png');
    
    console.log('🎉 拡大サイドパネルでのゲーム全体レイアウト確認完了');
  });
});