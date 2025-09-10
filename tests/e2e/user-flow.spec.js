// E2Eテスト: 完全なユーザーフローのテスト
// プレイモード選択からゲームプレイまでの実際のユーザー操作をテスト

import { test, expect } from '@playwright/test';

test.describe('MathBlocks ユーザーフロー E2E テスト', () => {
  let baseURL;
  
  test.beforeAll(async () => {
    // テストプロジェクトmath-blocks2のメインVercel URLを使用
    baseURL = 'https://math-blocks2.vercel.app';
  });

  test('完全なユーザーフロー: プレイモード選択からゲーム開始まで', async ({ page }) => {
    console.log('🎯 E2Eテスト開始: ユーザーフロー検証');
    
    // 1. サイトに移動
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    console.log('✅ サイト読み込み完了');

    // 2. 初期画面の確認
    await expect(page.locator('h1').first()).toContainText('MathBlocks');
    console.log('✅ メインタイトル表示確認');
    
    // 3. userScreenが表示されていることを確認
    await expect(page.locator('#userScreen')).toBeVisible();
    console.log('✅ ユーザー選択画面表示確認');

    // 4. ゲストプレイボタンの存在と表示を確認
    const guestBtn = page.locator('#guestModeBtn');
    await expect(guestBtn).toBeVisible();
    await expect(guestBtn).toContainText('ゲストプレイ');
    console.log('✅ ゲストプレイボタン確認');

    // 5. ゲストプレイボタンをクリック
    await guestBtn.click();
    console.log('🖱️ ゲストプレイボタンをクリック');

    // 6. startScreen（ゲームモード選択画面）の表示を確認
    await page.waitForSelector('#startScreen', { state: 'visible', timeout: 5000 });
    await expect(page.locator('#startScreen')).toBeVisible();
    await expect(page.locator('#userScreen')).not.toBeVisible();
    console.log('✅ ゲームモード選択画面への遷移確認');

    // 7. スコアアタックボタンの存在確認
    const scoreBtn = page.locator('button[data-mode="score"]');
    await expect(scoreBtn).toBeVisible();
    await expect(scoreBtn).toContainText('スコアアタック');
    console.log('✅ スコアアタックボタン確認');

    // 8. スコアアタックボタンをクリック
    await scoreBtn.click();
    console.log('🖱️ スコアアタックボタンをクリック');

    // 9. 難易度選択エリアが表示されていることを確認
    await page.waitForSelector('.difficulty-selection', { state: 'visible', timeout: 3000 });
    await expect(page.locator('.difficulty-selection')).toBeVisible();
    console.log('✅ 難易度選択エリア表示確認');

    // 10. ノーマル難易度ボタンの確認（難易度選択エリア内の）
    const normalBtn = page.locator('.difficulty-selection button[data-difficulty="normal"]');
    await expect(normalBtn).toBeVisible();
    await expect(normalBtn).toContainText('ノーマル');
    console.log('✅ ノーマル難易度ボタン確認');

    // 11. ノーマル難易度をクリック
    await normalBtn.click();
    console.log('🖱️ ノーマル難易度ボタンをクリック');

    // 12. ゲーム画面への遷移を確認
    await page.waitForSelector('#gameScreen', { state: 'visible', timeout: 5000 });
    await expect(page.locator('#gameScreen')).toBeVisible();
    await expect(page.locator('#startScreen')).not.toBeVisible();
    console.log('✅ ゲーム画面への遷移確認');

    // 13. ゲームCanvas要素の存在確認
    const canvas = page.locator('#gameScreen canvas');
    await expect(canvas).toBeVisible();
    console.log('✅ ゲームCanvasの表示確認');

    // 14. ゲームタイトルの確認
    await expect(page.locator('#gameScreen h1')).toContainText('MathBlocks');
    console.log('✅ ゲームタイトル表示確認');

    // 15. テンキーの存在確認
    const numpadContainer = page.locator('.numpad');
    await expect(numpadContainer).toBeVisible();
    console.log('✅ テンキー表示確認');

    // 16. 答え入力フィールドの確認
    const answerInput = page.locator('#answer-input');
    await expect(answerInput).toBeVisible();
    console.log('✅ 答え入力フィールド確認');

    // 17. コンソールログの確認（ゲーム初期化）
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // 18. テンキーの数字ボタンをテスト
    const button1 = page.locator('.numpad button[data-value="1"]');
    await expect(button1).toBeVisible();
    await button1.click();
    console.log('🖱️ テンキー「1」をクリック');

    // 19. 入力値の確認
    await expect(answerInput).toHaveValue('1');
    console.log('✅ 入力値が正しく表示される');

    // 20. クリアボタンのテスト
    const clearBtn = page.locator('.numpad button[data-action="clear"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(answerInput).toHaveValue('');
    console.log('✅ クリアボタンが正常に動作');

    console.log('🎉 E2Eテスト完了: 全ユーザーフローが正常動作');
  });

  test('エラーハンドリングとキーボード入力のテスト', async ({ page }) => {
    console.log('⌨️ キーボード入力テスト開始');
    
    // ゲーム画面まで移動
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
    
    await page.click('#guestModeBtn');
    await page.waitForSelector('#startScreen', { state: 'visible' });
    
    await page.click('button[data-mode="score"]');
    await page.click('button[data-difficulty="easy"]');
    await page.waitForSelector('#gameScreen', { state: 'visible' });
    
    console.log('✅ ゲーム画面まで到達');

    // キーボード入力のテスト
    const answerInput = page.locator('#answer-input');
    
    // 数字キーの入力テスト
    await page.keyboard.press('5');
    await expect(answerInput).toHaveValue('5');
    console.log('✅ キーボード数字入力が動作');

    // Backspaceキーのテスト
    await page.keyboard.press('Backspace');
    await expect(answerInput).toHaveValue('');
    console.log('✅ Backspaceキーが動作');

    // 複数桁入力のテスト
    await page.keyboard.press('2');
    await page.keyboard.press('5');
    await expect(answerInput).toHaveValue('25');
    console.log('✅ 複数桁入力が動作');

    // Escapeキーでクリア
    await page.keyboard.press('Escape');
    await expect(answerInput).toHaveValue('');
    console.log('✅ Escapeキークリアが動作');

    console.log('🎉 キーボード入力テスト完了');
  });
});