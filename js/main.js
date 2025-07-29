// エントリーポイント
document.addEventListener('DOMContentLoaded', () => {
    console.log('MathBlocks 初期化開始...');
    
    // キャンバス要素を取得
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('ゲームキャンバスが見つかりません');
        return;
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
    
    // UIManagerを初期化（従来システム）
    game.uiManager.setGameInstance(game);
    console.log('UIManager 初期化完了');
    
    console.log('MathBlocks 初期化完了');
});