// 1080P解像度での問題をデバッグするためのテスト
import { test, expect } from '@playwright/test';

test.describe('1080P解像度デバッグ', () => {
  test.beforeEach(async ({ page }) => {
    // 1080P解像度を設定
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // コンソールログを監視
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  });

  test('1080P解像度でのデバッグ - ステップバイステップ検証', async ({ page }) => {
    console.log('🔍 デバッグテスト開始: 1080P解像度');
    
    // 1. サイトに移動
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    console.log('✅ サイト読み込み完了');

    // 2. ページの基本情報を確認
    const title = await page.title();
    console.log('📄 ページタイトル:', title);

    // 3. 全ての画面要素の存在確認
    const screens = ['userScreen', 'startScreen', 'gameScreen', 'gameOverScreen', 'scoreScreen'];
    for (const screenId of screens) {
      const screen = page.locator(`#${screenId}`);
      const exists = await screen.count() > 0;
      const visible = exists ? await screen.isVisible() : false;
      console.log(`📺 ${screenId}: 存在=${exists}, 表示=${visible}`);
    }

    // 4. ゲストボタンをクリック
    const guestBtn = page.locator('#guestModeBtn');
    const guestExists = await guestBtn.count() > 0;
    console.log('🎮 ゲストボタン存在:', guestExists);
    
    if (guestExists) {
      await guestBtn.click();
      console.log('🖱️ ゲストボタンをクリック');
      
      // 少し待機
      await page.waitForTimeout(1000);
      
      // 画面状態を再確認
      for (const screenId of screens) {
        const screen = page.locator(`#${screenId}`);
        const visible = await screen.isVisible();
        console.log(`📺 クリック後 ${screenId}: 表示=${visible}`);
      }
    }

    // 5. モード選択ボタンの確認
    const modeButtons = await page.locator('button[data-mode]').all();
    console.log('🎯 モードボタン数:', modeButtons.length);
    
    for (let i = 0; i < modeButtons.length; i++) {
      const button = modeButtons[i];
      const mode = await button.getAttribute('data-mode');
      const text = await button.textContent();
      const visible = await button.isVisible();
      console.log(`🎯 モードボタン ${i}: mode=${mode}, text=${text}, visible=${visible}`);
    }

    // 6. スコアアタックボタンをクリック（存在する場合）
    const scoreBtn = page.locator('button[data-mode="score"]');
    const scoreBtnExists = await scoreBtn.count() > 0;
    console.log('🏆 スコアアタックボタン存在:', scoreBtnExists);
    
    if (scoreBtnExists && await scoreBtn.isVisible()) {
      await scoreBtn.click();
      console.log('🖱️ スコアアタックボタンをクリック');
      
      await page.waitForTimeout(1000);
      
      // 難易度選択の表示確認
      const difficultyArea = page.locator('.difficulty-selection');
      const difficultyVisible = await difficultyArea.isVisible();
      console.log('⚡ 難易度選択エリア表示:', difficultyVisible);
      
      if (difficultyVisible) {
        const difficultyButtons = await page.locator('.difficulty-selection button[data-difficulty]').all();
        console.log('⚡ 難易度ボタン数:', difficultyButtons.length);
        
        for (let i = 0; i < difficultyButtons.length; i++) {
          const button = difficultyButtons[i];
          const difficulty = await button.getAttribute('data-difficulty');
          const text = await button.textContent();
          const visible = await button.isVisible();
          console.log(`⚡ 難易度ボタン ${i}: difficulty=${difficulty}, text=${text}, visible=${visible}`);
        }
        
        // ノーマル難易度をクリック
        const normalBtn = page.locator('.difficulty-selection button[data-difficulty="normal"]');
        const normalExists = await normalBtn.count() > 0;
        console.log('⚡ ノーマル難易度ボタン存在:', normalExists);
        
        if (normalExists && await normalBtn.isVisible()) {
          await normalBtn.click();
          console.log('🖱️ ノーマル難易度ボタンをクリック');
          
          await page.waitForTimeout(2000); // 長めに待機
          
          // 最終的な画面状態を確認
          for (const screenId of screens) {
            const screen = page.locator(`#${screenId}`);
            const visible = await screen.isVisible();
            const display = await screen.evaluate(el => window.getComputedStyle(el).display);
            console.log(`📺 最終状態 ${screenId}: visible=${visible}, display=${display}`);
          }
          
          // JavaScriptエラーがないかチェック
          const jsErrors = await page.evaluate(() => {
            return window.onerror ? 'JS errors detected' : 'No JS errors';
          });
          console.log('🔧 JavaScriptエラー状態:', jsErrors);
          
          // ゲーム画面の詳細確認
          const gameScreen = page.locator('#gameScreen');
          if (await gameScreen.count() > 0) {
            const gameScreenHTML = await gameScreen.innerHTML();
            console.log('🎮 ゲーム画面HTML長さ:', gameScreenHTML.length);
            
            // Canvas要素の確認
            const canvas = page.locator('#gameScreen canvas');
            const canvasExists = await canvas.count() > 0;
            console.log('🖼️ Canvas存在:', canvasExists);
            
            if (canvasExists) {
              const canvasVisible = await canvas.isVisible();
              console.log('🖼️ Canvas表示:', canvasVisible);
            }
          }
        }
      }
    }

    console.log('🔍 デバッグテスト完了');
  });
});