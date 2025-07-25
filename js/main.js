// エントリーポイント
document.addEventListener('DOMContentLoaded', () => {
    // キャンバス要素を取得
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // ユーザーマネージャーを初期化
    window.userManager = new UserManager();
    
    // ゲームインスタンスを作成
    const game = new Game(canvas);
    
    // ユーザーマネージャーをゲームに渡す（初期画面の決定も含む）
    game.setUserManager(window.userManager);
    
    console.log('MathBlocks v2.0 initialized');
});