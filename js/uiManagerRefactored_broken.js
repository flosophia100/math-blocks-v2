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
        
        // ゲームUIからの対戦モード呼び出し統合
        const originalSelectMode = this.gameUI.selectMode.bind(this.gameUI);
        this.gameUI.selectMode = (mode) => {
            if (mode === 'versus_cpu') {
                this.versusUI.showCpuSetupScreen();
            } else if (mode === 'versus_human') {
                this.versusUI.showHumanSetupScreen();
            } else {
                originalSelectMode(mode);
            }
        };
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
        this.gameUI.showStartScreen();
    }
    
    backFromSettings() {
        this.gameUI.showStartScreen();
    }
    
    // ===== コレクション機能 =====
    
    updateCollectionDisplay() {
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser || this.userManager.isGuest()) {
            if (this.elements.itemsContainer) {
                this.elements.itemsContainer.innerHTML = '<p>ゲストモードではコレクションは利用できません</p>';
            }
            return;
        }
        
        const items = currentUser.items || [];
        if (this.elements.collectionCount) {
            this.elements.collectionCount.textContent = items.length;
        }
        
        if (this.elements.itemsContainer) {
            if (items.length === 0) {
                this.elements.itemsContainer.innerHTML = '<p>アイテムがありません</p>';
            } else {
                const itemsHTML = items.map(item => `
                    <div class=\"item ${item.isNew ? 'new-item' : ''}\">
                        <div class=\"item-icon\">${this.getItemIcon(item.id)}</div>
                        <div class=\"item-info\">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                            <small>獲得日: ${new Date(item.unlockedAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                `).join('');
                this.elements.itemsContainer.innerHTML = itemsHTML;
            }
        }
    }
    
    showNewItemsNotification(items) {
        if (!items || items.length === 0) return;
        
        if (this.elements.newItemsList) {
            const itemsHTML = items.map(item => `
                <div class=\"new-item-entry\">
                    <span class=\"item-icon\">${this.getItemIcon(item.id)}</span>
                    <span class=\"item-name\">${item.name}</span>
                </div>
            `).join('');
            this.elements.newItemsList.innerHTML = itemsHTML;
        }
        
        this.elements.newItemsNotification?.classList.remove('hidden');
        
        // 5秒後に自動で閉じる
        setTimeout(() => {
            this.closeNewItemsNotification();
        }, 5000);
    }
    
    closeNewItemsNotification() {
        this.elements.newItemsNotification?.classList.add('hidden');
        
        // アイテムのnewフラグを削除
        const currentUser = this.userManager.getCurrentUser();
        if (currentUser && currentUser.items) {
            currentUser.items.forEach(item => {
                if (item.isNew) {
                    item.isNew = false;
                }
            });
            this.userManager.saveUsers();
        }
    }
    
    getItemIcon(itemId) {
        const icons = {
            'bronze_medal': '🥉',
            'silver_medal': '🥈',
            'gold_medal': '🥇',
            'platinum_medal': '🏅',
            'diamond_medal': '💎',
            'combo_star': '⭐',
            'combo_crown': '👑',
            'combo_legend': '🏆',
            'veteran_badge': '🎖️',
            'master_badge': '🏅'
        };
        return icons[itemId] || '🎁';
    }
    
    // ===== ユーザー設定機能 =====
    
    updateUserSettingsDisplay() {
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser || this.userManager.isGuest()) {
            // ゲストモード用の表示
            Object.values(this.elements).forEach(element => {
                if (element && element.disabled !== undefined) {
                    element.disabled = true;
                }
            });
            return;
        }
        
        // ユーザー情報表示
        if (this.elements.profileUsername) {
            this.elements.profileUsername.value = currentUser.username;
        }
        
        if (this.elements.savePathInput) {
            this.elements.savePathInput.value = this.userManager.getSavePath();
        }
        
        // 統計情報表示
        const stats = this.userManager.getUserStats(currentUser.username);
        if (stats) {
            if (this.elements.statGamesPlayed) this.elements.statGamesPlayed.textContent = stats.gamesPlayed;
            if (this.elements.statTotalScore) this.elements.statTotalScore.textContent = stats.totalScore;
            if (this.elements.statTotalCorrect) this.elements.statTotalCorrect.textContent = currentUser.totalCorrect;
            if (this.elements.statTotalWrong) this.elements.statTotalWrong.textContent = currentUser.totalWrong;
            if (this.elements.statAvgAnswerTime) {
                const avgTime = currentUser.totalCorrect > 0 ? 
                    (currentUser.totalAnswerTime / currentUser.totalCorrect).toFixed(2) : 0;
                this.elements.statAvgAnswerTime.textContent = `${avgTime}秒`;
            }
        }
    }
    
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
            this.showNotification(`エクスポートエラー: ${error.message}`, 'error');
        }
    }
    
    exportUserScores() {
        try {
            if (window.downloadManager) {
                window.downloadManager.manualDownload(
                    this.scoreManager.exportToCSV(),
                    `mathblocks_scores_${new Date().toISOString().split('T')[0]}.csv`,
                    'text/csv'
                );
            } else {
                // フォールバック
                const csvContent = this.scoreManager.exportToCSV();
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `mathblocks_scores_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
            this.showNotification('スコアデータをエクスポートしました', 'success');
        } catch (error) {
            this.showNotification(`エクスポートエラー: ${error.message}`, 'error');
        }
    }
    
    deleteUser() {
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        if (confirm(`ユーザー "${currentUser.username}" を削除しますか？この操作は取り消せません。`)) {
            try {
                this.userManager.deleteUser(currentUser.username);
                this.showNotification('ユーザーを削除しました', 'success');
                this.authUI.showUserScreen();
            } catch (error) {
                this.showNotification(`削除エラー: ${error.message}`, 'error');
            }
        }
    }\n    \n    // ===== ゲーム状態監視 =====\n    \n    setupGameStateMonitoring() {\n        // ゲーム状態の変化を定期的に監視\n        setInterval(() => {\n            this.updateGameDisplay();\n        }, 100);\n    }\n    \n    updateGameDisplay() {\n        if (this.game && this.game.state === 'playing') {\n            const stats = {\n                score: this.game.score,\n                level: this.game.level,\n                combo: this.game.combo,\n                time: this.game.gameTime\n            };\n            this.gameUI.updateGameStats(stats);\n        }\n    }\n    \n    // ===== グローバルイベント処理 =====\n    \n    handleGlobalKeydown(event) {\n        // ESCキーで画面を戻る\n        if (event.key === 'Escape') {\n            this.handleEscapeKey();\n        }\n    }\n    \n    handleEscapeKey() {\n        // 現在表示中の画面に応じて適切な処理を実行\n        if (!this.screens.collection?.classList.contains('hidden')) {\n            this.backFromCollection();\n        } else if (!this.screens.userSettings?.classList.contains('hidden')) {\n            this.backFromSettings();\n        }\n    }\n    \n    // ===== ユーティリティメソッド =====\n    \n    hideAllScreens() {\n        // 各UIマネージャーの画面を非表示\n        if (this.authUI) {\n            this.authUI.hideAllScreens();\n        }\n        if (this.gameUI) {\n            this.gameUI.hideAllGameScreens();\n        }\n        if (this.versusUI) {\n            this.versusUI.hideAllVersusScreens();\n        }\n        \n        // 独自の画面も非表示\n        Object.values(this.screens).forEach(screen => {\n            screen?.classList.add('hidden');\n        });\n    }\n    \n    showNotification(message, type = 'info') {\n        // AuthUIManagerの通知機能を利用\n        if (this.authUI) {\n            this.authUI.showNotification(message, type);\n        }\n    }\n    \n    // ===== 後方互換性メソッド =====\n    \n    // 既存コードとの互換性を保つためのメソッド\n    showScreen(screenName) {\n        switch(screenName) {\n            case 'user':\n                this.authUI.showUserScreen();\n                break;\n            case 'auth':\n                this.authUI.showAuthScreen();\n                break;\n            case 'start':\n                this.gameUI.showStartScreen();\n                break;\n            case 'game':\n                this.gameUI.showGameScreen();\n                break;\n            case 'gameOver':\n                // ゲーム結果が必要\n                break;\n            case 'score':\n                this.gameUI.showScoreScreen();\n                break;\n            case 'collection':\n                this.showCollectionScreen();\n                break;\n            case 'userSettings':\n                this.showUserSettingsScreen();\n                break;\n            case 'versusCpuSetup':\n                this.versusUI.showCpuSetupScreen();\n                break;\n            case 'versusHumanSetup':\n                this.versusUI.showHumanSetupScreen();\n                break;\n        }\n    }\n    \n    // タイムストップ表示更新（元のUIManagerとの互換性）\n    updateTimeStopDisplay(timeStopStatus) {\n        // 必要に応じて実装\n        console.log('TimeStop status:', timeStopStatus);\n    }\n    \n    // エクスポート自動保存（元のUIManagerとの互換性）\n    exportAutoSave() {\n        if (window.downloadManager) {\n            window.downloadManager.triggerAutoSave();\n        }\n    }\n}\n\n// グローバルインスタンス\nwindow.uiManagerRefactored = null;