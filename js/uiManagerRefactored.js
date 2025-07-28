// リファクタリング後のUIManager - 各専門UIマネージャーを統合
class UIManagerRefactored {
    // 静的フラグ（後方互換性のため保持）
    static isQuittingVersusGame = false;
    
    constructor(game, scoreManager, userManager) {
        this.game = game;
        this.scoreManager = scoreManager;
        this.userManager = userManager;
        
        // 専門UIマネージャーを初期化
        this.authUI = new AuthUIManager(userManager);
        this.gameUI = new GameUIManager();
        this.versusUI = new VersusUIManager();
        
        // その他のUI要素
        this.initOtherElements();
        this.setupIntegration();
        this.setupGlobalEventListeners();
    }
    
    initOtherElements() {
        // コレクション画面など、まだ専門クラスに移していない要素
        this.elements = {
            // コレクション画面
            collectionCount: document.getElementById('collectionCount'),
            itemsContainer: document.getElementById('itemsContainer'),
            backFromCollectionBtn: document.getElementById('backFromCollectionBtn'),
            newItemsNotification: document.getElementById('newItemsNotification'),
            newItemsList: document.getElementById('newItemsList'),
            closeNewItemsBtn: document.getElementById('closeNewItemsBtn'),
            
            // ユーザー設定画面
            profileUsername: document.getElementById('profileUsername'),
            profileDisplayName: document.getElementById('profileDisplayName'),
            updateProfileBtn: document.getElementById('updateProfileBtn'),
            savePathInput: document.getElementById('savePathInput'),
            setSavePathBtn: document.getElementById('setSavePathBtn'),
            exportDataBtn: document.getElementById('exportDataBtn'),
            deleteUserBtn: document.getElementById('deleteUserBtn'),
            statGamesPlayed: document.getElementById('statGamesPlayed'),
            statTotalScore: document.getElementById('statTotalScore'),
            statTotalCorrect: document.getElementById('statTotalCorrect'),
            statTotalWrong: document.getElementById('statTotalWrong'),
            statAvgAnswerTime: document.getElementById('statAvgAnswerTime'),
            exportUserScoresBtn: document.getElementById('exportUserScoresBtn'),
            backFromSettingsBtn: document.getElementById('backFromSettingsBtn')
        };
        
        this.screens = {
            collection: document.getElementById('collectionScreen'),
            userSettings: document.getElementById('userSettingsScreen')
        };
    }
    
    setupIntegration() {
        // 認証成功時のコールバック設定
        this.authUI.setAuthCallback((success) => {
            if (success) {
                this.gameUI.showStartScreen();
            }
        });
        
        // ゲームUIの対戦モード処理はGameUIManager内で完結させる
        // ここではオーバーライドしない
    }
    
    setupGlobalEventListeners() {
        // コレクション画面
        this.elements.backFromCollectionBtn?.addEventListener('click', () => this.backFromCollection());
        this.elements.closeNewItemsBtn?.addEventListener('click', () => this.closeNewItemsNotification());
        
        // ユーザー設定画面
        this.elements.updateProfileBtn?.addEventListener('click', () => this.updateUserProfile());
        this.elements.setSavePathBtn?.addEventListener('click', () => this.setSavePath());
        this.elements.exportDataBtn?.addEventListener('click', () => this.exportUserData());
        this.elements.deleteUserBtn?.addEventListener('click', () => this.deleteUser());
        this.elements.exportUserScoresBtn?.addEventListener('click', () => this.exportUserScores());
        this.elements.backFromSettingsBtn?.addEventListener('click', () => this.backFromSettings());
        
        // グローバルキーボードイベント
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        
        // ゲーム状態変化の監視
        this.setupGameStateMonitoring();
    }
    
    // 初期化とスタート
    init() {
        // ユーザー認証状態を確認
        if (this.userManager.isGuest()) {
            this.authUI.showUserScreen();
        } else {
            this.authUI.updateUserHeader();
            this.gameUI.showStartScreen();
        }
    }
    
    // ===== 画面遷移メソッド =====
    
    showCollectionScreen() {
        this.hideAllScreens();
        this.screens.collection?.classList.remove('hidden');
        this.updateCollectionDisplay();
    }
    
    showUserSettingsScreen() {
        this.hideAllScreens();
        this.screens.userSettings?.classList.remove('hidden');
        this.updateUserSettingsDisplay();
    }
    
    backFromCollection() {
        // 選択状態をクリア
        if (this.gameUI.clearGameSettings) {
            this.gameUI.clearGameSettings();
        }
        
        // レガシーUIManagerの選択状態もクリア
        if (window.uiManager && window.uiManager.clearSelections) {
            window.uiManager.clearSelections();
        }
        
        this.gameUI.showStartScreen();
    }
    
    backFromSettings() {
        // 選択状態をクリア
        if (this.gameUI.clearGameSettings) {
            this.gameUI.clearGameSettings();
        }
        
        // レガシーUIManagerの選択状態もクリア
        if (window.uiManager && window.uiManager.clearSelections) {
            window.uiManager.clearSelections();
        }
        
        this.gameUI.showStartScreen();
    }
    
    // ===== ユーザー設定機能 =====
    
    updateUserProfile() {
        // 現在のUIでは名前変更は実装しない
        this.showNotification('プロフィール更新機能は今後実装予定です', 'info');
    }
    
    setSavePath() {
        const newPath = this.elements.savePathInput?.value.trim();
        if (newPath) {
            this.userManager.setSavePath(newPath);
            this.showNotification('保存パスを更新しました', 'success');
        }
    }
    
    exportUserData() {
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        try {
            this.userManager.exportUserData(currentUser.username);
            this.showNotification('ユーザーデータをエクスポートしました', 'success');
        } catch (error) {
            this.showNotification('エクスポートエラー: ' + error.message, 'error');
        }
    }
    
    exportUserScores() {
        try {
            const csvContent = this.scoreManager.exportToCSV();
            const filename = 'mathblocks_scores_' + new Date().toISOString().split('T')[0] + '.csv';
            
            if (window.downloadManager) {
                window.downloadManager.manualDownload(csvContent, filename, 'text/csv');
            } else {
                // フォールバック
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            this.showNotification('スコアデータをエクスポートしました', 'success');
        } catch (error) {
            this.showNotification('エクスポートエラー: ' + error.message, 'error');
        }
    }
    
    deleteUser() {
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        if (confirm('ユーザー "' + currentUser.username + '" を削除しますか？この操作は取り消せません。')) {
            try {
                this.userManager.deleteUser(currentUser.username);
                this.showNotification('ユーザーを削除しました', 'success');
                this.authUI.showUserScreen();
            } catch (error) {
                this.showNotification('削除エラー: ' + error.message, 'error');
            }
        }
    }
    
    // ===== ゲーム状態監視 =====
    
    setupGameStateMonitoring() {
        // ゲーム状態の変化を定期的に監視
        setInterval(() => {
            this.updateGameDisplay();
        }, 100);
    }
    
    updateGameDisplay() {
        if (this.game && this.game.state === 'playing') {
            const stats = {
                score: this.game.score,
                level: this.game.level,
                combo: this.game.combo,
                time: this.game.gameTime
            };
            this.gameUI.updateGameStats(stats);
        }
    }
    
    // ===== グローバルイベント処理 =====
    
    handleGlobalKeydown(event) {
        // ESCキーで画面を戻る
        if (event.key === 'Escape') {
            this.handleEscapeKey();
        }
    }
    
    handleEscapeKey() {
        // 現在表示中の画面に応じて適切な処理を実行
        if (!this.screens.collection?.classList.contains('hidden')) {
            this.backFromCollection();
        } else if (!this.screens.userSettings?.classList.contains('hidden')) {
            this.backFromSettings();
        }
    }
    
    // ===== ユーティリティメソッド =====
    
    hideAllScreens() {
        // 各UIマネージャーの画面を非表示
        if (this.authUI) {
            this.authUI.hideAllScreens();
        }
        if (this.gameUI) {
            this.gameUI.hideAllGameScreens();
        }
        if (this.versusUI) {
            this.versusUI.hideAllVersusScreens();
        }
        
        // 独自の画面も非表示
        Object.values(this.screens).forEach(screen => {
            screen?.classList.add('hidden');
        });
    }
    
    showNotification(message, type = 'info') {
        // AuthUIManagerの通知機能を利用
        if (this.authUI) {
            this.authUI.showNotification(message, type);
        }
    }
    
    // ===== 後方互換性メソッド =====
    
    // レガシーコードとの互換性：clearSelectionsメソッド
    clearSelections() {
        console.log('UIManagerRefactored: clearSelections called');
        
        // GameUIManagerの選択状態をクリア
        if (this.gameUI && this.gameUI.clearGameSettings) {
            this.gameUI.clearGameSettings();
        }
        
        // AuthUIManagerの状態もクリア（必要に応じて）
        // VersusUIManagerの状態もクリア（必要に応じて）
        
        console.log('UIManagerRefactored: clearSelections completed');
    }
    
    // 既存コードとの互換性を保つためのメソッド
    showScreen(screenName) {
        switch(screenName) {
            case 'user':
                this.authUI.showUserScreen();
                break;
            case 'auth':
                this.authUI.showAuthScreen();
                break;
            case 'start':
                this.gameUI.showStartScreen();
                break;
            case 'game':
                this.gameUI.showGameScreen();
                break;
            case 'gameOver':
                // ゲーム結果が必要
                break;
            case 'score':
                this.gameUI.showScoreScreen();
                break;
            case 'collection':
                this.showCollectionScreen();
                break;
            case 'userSettings':
                this.showUserSettingsScreen();
                break;
            case 'versusCpuSetup':
                this.versusUI.showCpuSetupScreen();
                break;
            case 'versusHumanSetup':
                this.versusUI.showHumanSetupScreen();
                break;
        }
    }
    
    // タイムストップ表示更新（元のUIManagerとの互換性）
    updateTimeStopDisplay(timeStopStatus) {
        // 必要に応じて実装
        console.log('TimeStop status:', timeStopStatus);
    }
    
    // エクスポート自動保存（元のUIManagerとの互換性）
    exportAutoSave() {
        if (window.downloadManager) {
            window.downloadManager.triggerAutoSave();
        }
    }
}

// グローバルインスタンス
window.uiManagerRefactored = null;