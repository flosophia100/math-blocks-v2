// エントリーポイント - リファクタリング対応版
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log(`MathBlocks ${window.APP_INFO ? window.APP_INFO.VERSION : '1.3.0'} 初期化開始...`);
        
        // キャンバス要素を取得
        const canvas = document.getElementById('gameCanvas');
        
        if (!canvas) {
            throw createError.ui('ゲームキャンバスが見つかりません', { elementId: 'gameCanvas' });
        }
        
        // スコアマネージャーを初期化
        window.scoreManager = new ScoreManager();
        console.log('ScoreManager 初期化完了');
        
        // ユーザーマネージャーを初期化
        window.userManager = new UserManager();
        console.log('UserManager 初期化完了');
        
        // ゲームインスタンスを作成
        const game = new Game(canvas);
        window.game = game;
        
        // ユーザーマネージャーをゲームに渡す
        game.setUserManager(window.userManager);
        console.log('Game インスタンス作成完了');
        
        // リファクタリング後のUI管理システムを初期化
        if (typeof UIManagerRefactored !== 'undefined') {
            // 新しいUIマネージャーシステム
            window.authUIManager = new AuthUIManager(window.userManager);
            window.gameUIManager = new GameUIManager();
            window.versusUIManager = new VersusUIManager();
            window.uiManagerRefactored = new UIManagerRefactored(game, window.scoreManager, window.userManager);
            
            // 新しいシステムを使用
            window.uiManager = window.uiManagerRefactored;
            console.log('リファクタリング後のUI管理システム初期化完了');
            
            // 初期画面表示
            window.uiManagerRefactored.init();
            
        } else {
            // フォールバック: 従来のUIManager
            console.warn('リファクタリング後のUIManagerが利用できません。従来システムを使用します。');
            game.uiManager.setGameInstance(game);
        }
        
        // ゲームモードマネージャーを初期化
        if (typeof GameModeManager !== 'undefined') {
            // グローバルインスタンスは既に作成済み
            console.log('GameModeManager 利用可能');
        }
        
        // エラーハンドリング設定
        if (typeof globalErrorHandler !== 'undefined') {
            // ゲーム固有のエラーハンドリングを設定
            globalErrorHandler.onError(ErrorType.GAME_ERROR, (error) => {
                console.error('ゲームエラーを検出:', error.message);
                // 必要に応じて追加の処理
            });
            
            globalErrorHandler.onError(ErrorType.UI_ERROR, (error) => {
                console.error('UIエラーを検出:', error.message);
                // UI復旧処理
            });
            
            console.log('エラーハンドリング設定完了');
        }
        
        console.log(`MathBlocks ${window.APP_INFO ? window.APP_INFO.VERSION : '1.3.0'} 初期化完了`);
        
        // デバッグ情報
        if (DebugUtils && DebugUtils.isDebugMode()) {
            console.log('デバッグモード有効');
            console.log('利用可能なシステム:', {
                authUIManager: !!window.authUIManager,
                gameUIManager: !!window.gameUIManager,
                versusUIManager: !!window.versusUIManager,
                uiManagerRefactored: !!window.uiManagerRefactored,
                gameModeManager: !!window.gameModeManager,
                globalErrorHandler: !!window.globalErrorHandler
            });
        }
        
    } catch (error) {
        console.error('MathBlocks初期化エラー:', error);
        
        // エラーハンドラーが利用可能な場合は使用
        if (typeof globalErrorHandler !== 'undefined') {
            globalErrorHandler.handleError(error);
        } else {
            // フォールバック
            alert('ゲームの初期化に失敗しました。ページを再読み込みしてください。');
        }
    }
});