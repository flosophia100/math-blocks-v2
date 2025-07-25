// UI管理クラス
class UIManager {
    constructor() {
        this.screens = {
            user: document.getElementById('userScreen'),
            auth: document.getElementById('authScreen'),
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            score: document.getElementById('scoreScreen'),
            collection: document.getElementById('collectionScreen'),
            userSettings: document.getElementById('userSettingsScreen')
        };
        
        this.elements = {
            // ユーザー選択画面
            guestModeBtn: document.getElementById('guestModeBtn'),
            userModeBtn: document.getElementById('userModeBtn'),
            currentUserName: document.getElementById('currentUserName'),
            logoutBtn: document.getElementById('logoutBtn'),
            userInfo: document.getElementById('userInfo'),
            
            // 認証画面
            loginTab: document.getElementById('loginTab'),
            registerTab: document.getElementById('registerTab'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            loginUsername: document.getElementById('loginUsername'),
            loginSubmitBtn: document.getElementById('loginSubmitBtn'),
            registerUsername: document.getElementById('registerUsername'),
            registerSubmitBtn: document.getElementById('registerSubmitBtn'),
            existingUsers: document.getElementById('existingUsers'),
            backToUserSelectBtn: document.getElementById('backToUserSelectBtn'),
            importUserBtn: document.getElementById('importUserBtn'),
            
            // ユーザーヘッダー（新しいスタイル）
            headerUserName: document.getElementById('headerUserName'),
            userSwitchBtn: document.getElementById('userSwitchBtn'),
            newUserBtn: document.getElementById('newUserBtn'),
            userMenuBtn: document.getElementById('userMenuBtn'),
            
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
            backFromSettingsBtn: document.getElementById('backFromSettingsBtn'),
            
            // スタート画面
            modeButtons: document.querySelectorAll('.mode-btn'),
            difficultyButtons: document.querySelectorAll('.difficulty-btn'),
            trainingButtons: document.querySelectorAll('.training-btn'),
            startButton: document.getElementById('startBtn'),
            operations: {
                add: document.getElementById('opAdd'),
                sub: document.getElementById('opSub'),
                mul: document.getElementById('opMul'),
                div: document.getElementById('opDiv')
            },
            minNum: document.getElementById('minNum'),
            maxNum: document.getElementById('maxNum'),
            
            // ゲーム画面
            currentMode: document.getElementById('currentMode'),
            currentDifficulty: document.getElementById('currentDifficulty'),
            currentTraining: document.getElementById('currentTraining'),
            trainingModeDisplay: document.getElementById('trainingModeDisplay'),
            score: document.getElementById('score'),
            level: document.getElementById('level'),
            combo: document.getElementById('combo'),
            time: document.getElementById('time'),
            timeDisplay: document.getElementById('timeDisplay'),
            pauseBtn: document.getElementById('pauseBtn'),
            quitBtn: document.getElementById('quitBtn'),
            viewScoresBtn: document.getElementById('viewScoresBtn'),
            
            // リアルタイム統計
            correctCount: document.getElementById('correctCount'),
            wrongCount: document.getElementById('wrongCount'),
            avgTime: document.getElementById('avgTime'),
            
            // タイムストップ表示
            timeStopDisplay: document.getElementById('timeStopDisplay'),
            
            // デバッグパネル
            debugPanel: document.getElementById('debugPanel'),
            fallSpeed: document.getElementById('fallSpeed'),
            fallSpeedValue: document.getElementById('fallSpeedValue'),
            blockInterval: document.getElementById('blockInterval'),
            blockIntervalValue: document.getElementById('blockIntervalValue'),
            maxBlocks: document.getElementById('maxBlocks'),
            maxBlocksValue: document.getElementById('maxBlocksValue'),
            applyDebug: document.getElementById('applyDebug'),
            closeDebug: document.getElementById('closeDebug'),
            
            // ヒントブロックデバッグ
            hintInterval: document.getElementById('hintInterval'),
            hintIntervalValue: document.getElementById('hintIntervalValue'),
            hintChance: document.getElementById('hintChance'),
            hintChanceValue: document.getElementById('hintChanceValue'),
            forceHintTransformBtn: document.getElementById('forceHintTransformBtn'),
            forceHintBlockBtn: document.getElementById('forceHintBlockBtn'),
            testExpression: document.getElementById('testExpression'),
            testHintBtn: document.getElementById('testHintBtn'),
            hintResult: document.getElementById('hintResult'),
            
            // ゲームオーバー画面
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            finalMaxCombo: document.getElementById('finalMaxCombo'),
            finalTime: document.getElementById('finalTime'),
            clearTime: document.getElementById('clearTime'),
            
            // 詳細記録要素
            gameTimeDetail: document.getElementById('gameTimeDetail'),
            correctDetail: document.getElementById('correctDetail'),
            wrongDetail: document.getElementById('wrongDetail'),
            avgTimeDetail: document.getElementById('avgTimeDetail'),
            modeDetail: document.getElementById('modeDetail'),
            difficultyDetail: document.getElementById('difficultyDetail'),
            
            retryBtn: document.getElementById('retryBtn'),
            backToMenuBtn: document.getElementById('backToMenuBtn'),
            viewScoresFromGameOverBtn: document.getElementById('viewScoresFromGameOverBtn'),
            
            // スコアボード画面
            scoresTable: document.getElementById('scoresTable'),
            sortFilter: document.getElementById('sortFilter'),
            exportScoresBtn: document.getElementById('exportScoresBtn'),
            backFromScoresBtn: document.getElementById('backFromScoresBtn'),
            
            // デバッグパネルのスコア削除・自動保存・インポート
            clearAllScoresDebug: document.getElementById('clearAllScoresDebug'),
            autoSaveEnabled: document.getElementById('autoSaveEnabled'),
            importScoresBtn: document.getElementById('importScoresBtn'),
            importUsersBtn: document.getElementById('importUsersBtn'),
            jsonFileInput: document.getElementById('jsonFileInput')
        };
        
        this.selectedMode = null;
        this.selectedDifficulty = null;
        this.selectedTraining = null;
        this.currentScreen = 'user'; // 現在の画面を追跡
        this.importType = null; // インポートタイプ ('scores' または 'users')
        this.onDebugApply = null; // デバッグ設定適用時のコールバック
        this.scoreManager = null; // スコアマネージャー参照
        this.userManager = null; // ユーザーマネージャー参照
        this.gameInstance = null; // ゲームインスタンス参照
        
        // 隠し機能用のクリックカウンタ
        this.scoreAttackClickCount = 0;
        this.cButtonClickCount = 0;
        this.scoreAttackClickTimer = null;
        this.cButtonClickTimer = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // ユーザー選択画面
        if (this.elements.guestModeBtn) {
            this.elements.guestModeBtn.addEventListener('click', () => this.selectGuestMode());
        }
        if (this.elements.userModeBtn) {
            this.elements.userModeBtn.addEventListener('click', () => this.selectUserMode());
        }
        if (this.elements.logoutBtn) {
            this.elements.logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // 認証画面
        if (this.elements.loginTab) {
            this.elements.loginTab.addEventListener('click', () => this.showLoginTab());
        }
        if (this.elements.registerTab) {
            this.elements.registerTab.addEventListener('click', () => this.showRegisterTab());
        }
        if (this.elements.loginSubmitBtn) {
            this.elements.loginSubmitBtn.addEventListener('click', () => this.handleLogin());
        }
        if (this.elements.registerSubmitBtn) {
            this.elements.registerSubmitBtn.addEventListener('click', () => this.handleRegister());
        }
        if (this.elements.backToUserSelectBtn) {
            this.elements.backToUserSelectBtn.addEventListener('click', () => this.showScreen('user'));
        }
        if (this.elements.importUserBtn) {
            this.elements.importUserBtn.addEventListener('click', () => this.handleImportUser());
        }
        
        // ユーザーヘッダー（新しいスタイル）
        if (this.elements.userSwitchBtn) {
            this.elements.userSwitchBtn.addEventListener('click', () => this.showScreen('auth'));
        }
        if (this.elements.newUserBtn) {
            this.elements.newUserBtn.addEventListener('click', () => this.showNewUserRegistration());
        }
        if (this.elements.userMenuBtn) {
            this.elements.userMenuBtn.addEventListener('click', () => this.showUserSettingsScreen());
        }
        
        // コレクション画面
        if (this.elements.backFromCollectionBtn) {
            this.elements.backFromCollectionBtn.addEventListener('click', () => this.showScreen('start'));
        }
        if (this.elements.closeNewItemsBtn) {
            this.elements.closeNewItemsBtn.addEventListener('click', () => this.hideNewItemsNotification());
        }
        
        // ユーザー設定画面
        if (this.elements.exportUserScoresBtn) {
            this.elements.exportUserScoresBtn.addEventListener('click', () => this.exportUserScores());
        }
        if (this.elements.exportDataBtn) {
            this.elements.exportDataBtn.addEventListener('click', () => this.exportUserData());
        }
        if (this.elements.deleteUserBtn) {
            this.elements.deleteUserBtn.addEventListener('click', () => this.deleteUser());
        }
        if (this.elements.backFromSettingsBtn) {
            this.elements.backFromSettingsBtn.addEventListener('click', () => this.showScreen('start'));
        }
        
        // モード選択
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectMode(e.target.dataset.mode);
            });
        });
        
        // 難易度選択
        this.elements.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectDifficulty(e.target.dataset.difficulty);
            });
        });
        
        // 特訓モード選択
        this.elements.trainingButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // クリックされた要素が子要素の場合、親のボタン要素のdata属性を取得
                const button = e.target.closest('.training-btn');
                if (button) {
                    this.selectTraining(button.dataset.training);
                }
            });
        });
        
        // 演算子チェックボックス（デバッグパネルのみ）
        Object.values(this.elements.operations).forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', () => this.checkStartEnabled());
            }
        });
        
        // 数値範囲（デバッグパネルのみ）
        if (this.elements.minNum) {
            this.elements.minNum.addEventListener('input', () => this.validateNumberRange());
        }
        if (this.elements.maxNum) {
            this.elements.maxNum.addEventListener('input', () => this.validateNumberRange());
        }
        
        // デバッグパネル
        this.elements.closeDebug.addEventListener('click', () => this.hideDebugPanel());
        this.elements.applyDebug.addEventListener('click', () => this.applyDebugSettings());
        
        // ヒントブロックデバッグ
        this.elements.hintInterval.addEventListener('input', () => this.updateHintInterval());
        this.elements.hintChance.addEventListener('input', () => this.updateHintChance());
        this.elements.forceHintTransformBtn.addEventListener('click', () => this.forceHintTransform());
        this.elements.forceHintBlockBtn.addEventListener('click', () => this.forceGenerateHintBlock());
        this.elements.testHintBtn.addEventListener('click', () => this.testHintGeneration());
        
        // スコアボード
        this.elements.viewScoresBtn.addEventListener('click', () => this.showScoreScreen());
        this.elements.viewScoresFromGameOverBtn.addEventListener('click', () => this.showScoreScreen());
        this.elements.sortFilter.addEventListener('change', () => this.updateScoreTable());
        this.elements.exportScoresBtn.addEventListener('click', () => this.exportScores());
        this.elements.backFromScoresBtn.addEventListener('click', () => this.backToMenu());
        
        // デバッグパネルのスコア削除・自動保存設定・インポート
        if (this.elements.clearAllScoresDebug) {
            this.elements.clearAllScoresDebug.addEventListener('click', () => this.clearScores());
        }
        if (this.elements.autoSaveEnabled) {
            this.elements.autoSaveEnabled.addEventListener('change', (e) => {
                if (this.scoreManager) {
                    this.scoreManager.setAutoSaveEnabled(e.target.checked);
                }
            });
        }
        
        // JSONインポート機能
        if (this.elements.importScoresBtn) {
            this.elements.importScoresBtn.addEventListener('click', () => this.showImportDialog('scores'));
        }
        if (this.elements.importUsersBtn) {
            this.elements.importUsersBtn.addEventListener('click', () => this.showImportDialog('users'));
        }
        if (this.elements.jsonFileInput) {
            this.elements.jsonFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        }
        
        // デバッグスライダーの値表示更新
        if (this.elements.fallSpeed) {
            this.elements.fallSpeed.addEventListener('input', (e) => {
                this.elements.fallSpeedValue.textContent = e.target.value;
            });
        }
        if (this.elements.blockInterval) {
            this.elements.blockInterval.addEventListener('input', (e) => {
                this.elements.blockIntervalValue.textContent = e.target.value;
            });
        }
        if (this.elements.maxBlocks) {
            this.elements.maxBlocks.addEventListener('input', (e) => {
                this.elements.maxBlocksValue.textContent = e.target.value;
            });
        }
    }
    
    selectMode(mode) {
        this.selectedMode = mode;
        this.elements.modeButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.mode === mode);
        });
        this.checkStartEnabled();
        
        // スコアアタックモードで5回クリックの隠し機能
        if (mode === 'score') {
            this.scoreAttackClickCount++;
            console.log('スコアアタッククリック回数:', this.scoreAttackClickCount);
            
            // タイマーリセット
            clearTimeout(this.scoreAttackClickTimer);
            this.scoreAttackClickTimer = setTimeout(() => {
                this.scoreAttackClickCount = 0;
                console.log('スコアアタッククリックカウントリセット');
            }, 2000); // 2秒以内に5回クリック
            
            if (this.scoreAttackClickCount >= 5) {
                console.log('デバッグパネルを開きます（スコアアタック5回クリック）');
                this.scoreAttackClickCount = 0;
                this.showDebugPanel();
            }
        } else {
            this.scoreAttackClickCount = 0;
        }
    }
    
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        this.elements.difficultyButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.difficulty === difficulty);
        });
        // 特訓モードの選択状態は維持
        this.checkStartEnabled();
    }
    
    selectTraining(training) {
        if (this.selectedTraining === training) {
            // 同じ特訓モードをクリックした場合は解除
            this.selectedTraining = null;
            this.elements.trainingButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
        } else {
            this.selectedTraining = training;
            this.elements.trainingButtons.forEach(btn => {
                btn.classList.toggle('selected', btn.dataset.training === training);
            });
        }
        this.checkStartEnabled();
    }
    
    validateNumberRange() {
        if (!this.elements.minNum || !this.elements.maxNum) return;
        
        const min = parseInt(this.elements.minNum.value) || 1;
        const max = parseInt(this.elements.maxNum.value) || 10;
        
        if (min > max) {
            this.elements.maxNum.value = min;
        }
        
        this.checkStartEnabled();
    }
    
    checkStartEnabled() {
        // スタートボタンの有効/無効を判定
        const hasMode = this.selectedMode !== null;
        const hasDifficulty = this.selectedDifficulty !== null;
        // デフォルトで全ての演算が有効になっているため、常にtrue
        const hasOperation = true;
        const validRange = true; // デフォルト値で有効
        
        if (this.elements.startButton) {
            this.elements.startButton.disabled = !(hasMode && hasDifficulty && hasOperation && validRange);
        }
    }
    
    getGameSettings() {
        // 特訓モードが選択されている場合はその設定を使用
        if (this.selectedTraining && CONFIG.TRAINING_MODES[this.selectedTraining]) {
            const trainingMode = CONFIG.TRAINING_MODES[this.selectedTraining];
            return {
                mode: this.selectedMode,
                difficulty: this.selectedDifficulty,
                training: this.selectedTraining,
                operations: trainingMode.operations,
                minNum: trainingMode.minNum,
                maxNum: trainingMode.maxNum,
                carryBorrow: trainingMode.carryBorrow || false,
                omiyageMode: trainingMode.omiyageMode || false
            };
        }
        
        // 通常モード：デバッグパネルの設定値を使用（デフォルトは全て有効）
        return {
            mode: this.selectedMode,
            difficulty: this.selectedDifficulty,
            training: null,
            operations: {
                add: this.elements.operations.add ? this.elements.operations.add.checked : true,
                sub: this.elements.operations.sub ? this.elements.operations.sub.checked : true,
                mul: this.elements.operations.mul ? this.elements.operations.mul.checked : true,
                div: this.elements.operations.div ? this.elements.operations.div.checked : true
            },
            minNum: this.elements.minNum ? parseInt(this.elements.minNum.value) : 1,
            maxNum: this.elements.maxNum ? parseInt(this.elements.maxNum.value) : 10,
            carryBorrow: false,
            omiyageMode: false
        };
    }
    
    showScreen(screenName) {
        Object.keys(this.screens).forEach(name => {
            if (this.screens[name]) {
                this.screens[name].style.display = name === screenName ? 'block' : 'none';
            }
        });
        
        // 現在の画面を更新
        this.currentScreen = screenName;
        
        // ゲーム画面の場合、ゲーム設定を表示
        if (screenName === 'game') {
            this.updateGameModeDisplay();
            
            // タイムアタックモードの時間表示を切り替え
            if (this.selectedMode === 'time') {
                this.elements.timeDisplay.style.display = 'block';
            } else {
                this.elements.timeDisplay.style.display = 'none';
            }
        }
    }
    
    updateScore(score) {
        this.elements.score.textContent = score;
    }
    
    updateLevel(level) {
        this.elements.level.textContent = level;
    }
    
    updateCombo(combo) {
        this.elements.combo.textContent = combo;
        
        // コンボエフェクト
        if (combo >= 5) {
            this.elements.combo.classList.add('combo-glow');
            setTimeout(() => {
                this.elements.combo.classList.remove('combo-glow');
            }, 500);
        }
    }
    
    updateTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        this.elements.time.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    
    updateStats(correctAnswers, wrongAnswers, answerTimes) {
        this.elements.correctCount.textContent = correctAnswers;
        this.elements.wrongCount.textContent = wrongAnswers;
        
        // 平均時間を計算・表示
        if (answerTimes.length > 0) {
            const avgTime = answerTimes.reduce((a, b) => a + b, 0) / answerTimes.length;
            this.elements.avgTime.textContent = `${avgTime.toFixed(1)}s`;
        } else {
            this.elements.avgTime.textContent = '-';
        }
    }
    
    updateTimeStopDisplay(timeStopStatus) {
        if (!this.elements.timeStopDisplay) {
            // タイムストップ表示要素がない場合は動的に作成
            this.elements.timeStopDisplay = document.createElement('div');
            this.elements.timeStopDisplay.id = 'timeStopDisplay';
            this.elements.timeStopDisplay.style.cssText = `
                position: absolute;
                top: 10px;
                left: 50%;
                transform: translateX(-50%);
                background: ${CONFIG.TIMESTOP.COLOR};
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 16px;
                z-index: 1000;
                display: none;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            `;
            document.body.appendChild(this.elements.timeStopDisplay);
        }
        
        if (timeStopStatus.active) {
            this.elements.timeStopDisplay.style.display = 'block';
            this.elements.timeStopDisplay.innerHTML = `${CONFIG.TIMESTOP.ICON} TIME STOP: ${timeStopStatus.remainingSeconds}s`;
        } else {
            this.elements.timeStopDisplay.style.display = 'none';
        }
    }
    
    updateGameModeDisplay() {
        // モード表示
        const modeNames = {
            'score': 'スコアアタック',
            'time': 'タイムアタック'
        };
        this.elements.currentMode.textContent = modeNames[this.selectedMode] || '-';
        
        // 難易度表示
        if (this.selectedDifficulty && CONFIG.DIFFICULTY[this.selectedDifficulty]) {
            this.elements.currentDifficulty.textContent = CONFIG.DIFFICULTY[this.selectedDifficulty].name;
        } else {
            this.elements.currentDifficulty.textContent = '-';
        }
        
        // 特訓モード表示
        if (this.selectedTraining && CONFIG.TRAINING_MODES[this.selectedTraining]) {
            this.elements.currentTraining.textContent = CONFIG.TRAINING_MODES[this.selectedTraining].name;
            this.elements.trainingModeDisplay.style.display = 'block';
        } else {
            this.elements.trainingModeDisplay.style.display = 'none';
        }
    }
    
    showGameOver(stats) {
        this.elements.finalScore.textContent = stats.score;
        this.elements.finalLevel.textContent = stats.level;
        this.elements.finalMaxCombo.textContent = stats.maxCombo;
        
        // 自動保存はスコアボード表示時に実行（showScoreScreenメソッドに移動）
        
        if (stats.mode === 'time' && stats.clearTime) {
            this.elements.finalTime.style.display = 'block';
            const minutes = Math.floor(stats.clearTime / 60);
            const seconds = Math.floor(stats.clearTime % 60);
            this.elements.clearTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            this.elements.finalTime.style.display = 'none';
        }
        
        // 詳細記録を表示
        if (stats.gameData) {
            const data = stats.gameData;
            
            // ゲーム時間をフォーマット
            const gameTimeStr = data.gameTime ? 
                `${Math.floor(data.gameTime / 60)}:${String(data.gameTime % 60).padStart(2, '0')}` : '0:00';
            this.elements.gameTimeDetail.textContent = gameTimeStr;
            
            // 基本統計
            this.elements.correctDetail.textContent = data.correctAnswers || 0;
            this.elements.wrongDetail.textContent = data.wrongAnswers || 0;
            
            // 平均回答時間
            const avgTimeStr = data.avgAnswerTime ? `${data.avgAnswerTime.toFixed(1)}s` : '0.0s';
            this.elements.avgTimeDetail.textContent = avgTimeStr;
            
            // ゲーム設定
            this.elements.modeDetail.textContent = data.mode || '-';
            this.elements.difficultyDetail.textContent = data.difficulty || '-';
        }
        
        // ハイスコア達成時の強調表示
        if (stats.isHighScore) {
            this.showHighScoreNotification();
            this.addHighScoreEffects();
        } else {
            this.removeHighScoreEffects();
        }
        
        this.showScreen('gameOver');
    }
    
    showLevelUp(level) {
        // レベルアップ通知（簡易実装）
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.textContent = `レベル ${level}!`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: bold;
            color: #27ae60;
            background: rgba(255, 255, 255, 0.9);
            padding: 20px 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: fadeInOut 1.5s ease-in-out;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 1500);
    }
    
    showDebugPanel() {
        console.log('showDebugPanel呼び出し');
        console.log('debugPanel要素:', this.elements.debugPanel);
        
        if (this.elements.debugPanel) {
            console.log('デバッグパネル要素が存在します。表示設定を適用中...');
            
            // まず非表示状態をクリア
            this.elements.debugPanel.style.display = '';
            
            // クラスベースで表示を制御
            this.elements.debugPanel.classList.remove('debug-panel-hidden');
            this.elements.debugPanel.classList.add('debug-panel-visible');
            
            // 自動保存設定を読み込み
            if (this.elements.autoSaveEnabled && this.scoreManager) {
                this.elements.autoSaveEnabled.checked = this.scoreManager.getAutoSaveEnabled();
            }
            
            console.log('デバッグパネル表示完了');
            console.log('クラスリスト:', this.elements.debugPanel.classList.toString());
            console.log('現在のスタイル:', this.elements.debugPanel.style.cssText);
        } else {
            console.error('デバッグパネル要素が見つかりません！');
        }
    }
    
    hideDebugPanel() {
        if (this.elements.debugPanel) {
            this.elements.debugPanel.classList.remove('debug-panel-visible');
            this.elements.debugPanel.classList.add('debug-panel-hidden');
        }
    }
    
    applyDebugSettings() {
        if (this.onDebugApply) {
            const debugParams = {
                fallSpeed: this.elements.fallSpeed ? parseInt(this.elements.fallSpeed.value) : 50,
                blockInterval: this.elements.blockInterval ? parseInt(this.elements.blockInterval.value) : 1000,
                maxBlocks: this.elements.maxBlocks ? parseInt(this.elements.maxBlocks.value) : 1,
                minNum: this.elements.minNum ? parseInt(this.elements.minNum.value) : 1,
                maxNum: this.elements.maxNum ? parseInt(this.elements.maxNum.value) : 10,
                operations: {
                    add: this.elements.operations.add ? this.elements.operations.add.checked : true,
                    sub: this.elements.operations.sub ? this.elements.operations.sub.checked : true,
                    mul: this.elements.operations.mul ? this.elements.operations.mul.checked : true,
                    div: this.elements.operations.div ? this.elements.operations.div.checked : true
                }
            };
            this.onDebugApply(debugParams);
        }
        this.hideDebugPanel();
    }
    
    setDebugCallback(callback) {
        this.onDebugApply = callback;
    }
    
    // ヒントブロックデバッグ関連メソッド
    updateHintInterval() {
        if (this.elements.hintInterval && this.elements.hintIntervalValue) {
            const value = this.elements.hintInterval.value;
            this.elements.hintIntervalValue.textContent = value;
            
            // BlockManagerに設定
            if (this.gameInstance && this.gameInstance.blockManager) {
                this.gameInstance.blockManager.hintTransformInterval = parseInt(value) * 1000; // 秒をミリ秒に変換
                console.log(`デバッグ: ヒント変化間隔を${value}秒に設定`);
            }
        }
    }
    
    updateHintChance() {
        if (this.elements.hintChance && this.elements.hintChanceValue) {
            const value = this.elements.hintChance.value;
            this.elements.hintChanceValue.textContent = value;
            
            // BlockManagerに設定
            if (this.gameInstance && this.gameInstance.blockManager) {
                this.gameInstance.blockManager.hintTransformChance = parseInt(value) / 100; // パーセントを小数に変換
                console.log(`デバッグ: ヒント変化確率を${value}%に設定`);
            }
        }
    }
    
    forceHintTransform() {
        if (this.gameInstance && this.gameInstance.blockManager) {
            this.gameInstance.blockManager.tryTransformBlocksToHint();
            this.elements.hintResult.textContent = '強制ヒント変化を実行しました';
            this.elements.hintResult.style.color = '#27ae60';
            console.log('デバッグ: 強制ヒント変化実行');
        }
    }
    
    forceGenerateHintBlock() {
        if (this.gameInstance && this.gameInstance.blockManager) {
            // 強制的にヒントブロックを生成
            const availableCols = [];
            for (let col = 0; col < CONFIG.GRID.COLS; col++) {
                if (!this.gameInstance.blockManager.grid[0][col] && !this.gameInstance.blockManager.isColumnOccupied(col)) {
                    availableCols.push(col);
                }
            }
            
            if (availableCols.length === 0) {
                this.elements.hintResult.textContent = 'エラー: 利用可能な列がありません';
                this.elements.hintResult.style.color = '#e74c3c';
                return;
            }
            
            const col = availableCols[Math.floor(Math.random() * availableCols.length)];
            const problem = this.gameInstance.calculator.generateProblem(this.gameInstance.level);
            const newBlock = new Block(col, 0, problem, '#3498db', false, false, false, true);
            
            // ヒントを適用
            const hintData = this.gameInstance.blockManager.hintSystem.generateHint(problem.expression);
            if (hintData) {
                const duration = this.gameInstance.blockManager.hintSystem.calculateHintDuration(problem.expression);
                newBlock.showHintCalculation(hintData, duration);
                this.elements.hintResult.textContent = `強制生成成功: ${problem.expression} → ${hintData.expression}`;
                this.elements.hintResult.style.color = '#27ae60';
            } else {
                this.elements.hintResult.textContent = `ヒント生成失敗: ${problem.expression}`;
                this.elements.hintResult.style.color = '#e67e22';
            }
            
            this.gameInstance.blockManager.currentBlocks.push(newBlock);
            console.log('デバッグ: 強制ヒントブロック生成');
        }
    }
    
    testHintGeneration() {
        const expression = this.elements.testExpression.value.trim();
        if (!expression) {
            this.elements.hintResult.textContent = '計算式を入力してください';
            this.elements.hintResult.style.color = '#e74c3c';
            return;
        }
        
        // HintSystemを使ってヒントを生成
        const hintSystem = new HintSystem();
        const hintData = hintSystem.generateHint(expression);
        
        if (hintData) {
            const duration = hintSystem.calculateHintDuration(expression);
            this.elements.hintResult.innerHTML = `
                <strong>元の式:</strong> ${expression}<br>
                <strong>ヒント:</strong> ${hintData.expression}<br>
                <strong>説明:</strong> ${hintData.explanation}<br>
                <strong>表示時間:</strong> ${duration}ms
            `;
            this.elements.hintResult.style.color = '#27ae60';
        } else {
            this.elements.hintResult.textContent = `ヒント生成失敗: この計算式にはヒントを生成できません`;
            this.elements.hintResult.style.color = '#e67e22';
        }
    }
    
    setScoreManager(scoreManager) {
        this.scoreManager = scoreManager;
    }
    
    showScoreScreen() {
        this.showScreen('score');
        this.updateScoreTable();
        
        // スコアボード表示時に統合データの自動保存実行
        this.autoSaveAllData();
    }
    
    getSortFunction(sortType) {
        switch (sortType) {
            case 'score':
                return (a, b) => b.score - a.score;
            case 'date':
                return (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
            case 'mode':
                return (a, b) => a.mode.localeCompare(b.mode);
            case 'difficulty':
                return (a, b) => a.difficulty.localeCompare(b.difficulty);
            case 'gameTime':
                return (a, b) => (b.gameTime || 0) - (a.gameTime || 0);
            case 'level':
                return (a, b) => b.level - a.level;
            default:
                return (a, b) => b.score - a.score;
        }
    }
    
    updateScoreTable() {
        if (!this.scoreManager) return;
        
        let scores = this.scoreManager.getAllScores(); // 全データを取得
        
        // 並び替え
        const sortType = this.elements.sortFilter.value;
        console.log('Sorting scores:', { sortType, totalScores: scores.length });
        
        const sortFunction = this.getSortFunction(sortType);
        scores.sort(sortFunction);
        
        // 表示件数を20件に制限
        scores = scores.slice(0, 20);
        
        const tbody = this.elements.scoresTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            
            // 操作名を短縮形式で表示
            const operations = score.operations ? 
                Object.entries(score.operations)
                    .filter(([_, enabled]) => enabled)
                    .map(([op, _]) => op)
                    .join('+') || '不明' : '不明';
            
            // 日時をフォーマット（月日のみ）
            const date = new Date(score.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            
            // 平均時間をフォーマット（小数点1桁、秒）
            const avgTimeStr = score.avgAnswerTime ? `${score.avgAnswerTime.toFixed(1)}s` : '-';
            
            // ゲーム時間をフォーマット（分:秒）
            const gameTimeStr = (score.gameTime !== undefined && score.gameTime !== null) ? 
                `${Math.floor(score.gameTime / 60)}:${String(score.gameTime % 60).padStart(2, '0')}` : '0:00';
            
            // 特訓モード表示用の文字列を生成
            let trainingModeStr = '-';
            if (score.training) {
                // CONFIG.TRAINING_MODESから名前を取得
                const trainingConfig = CONFIG.TRAINING_MODES[score.training];
                trainingModeStr = trainingConfig?.name || score.training;
            }
            
            // デバッグ用：ゲーム時間があるかチェック
            if (index === 0) console.log('First score gameTime:', score.gameTime, 'formatted:', gameTimeStr);
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score.username || 'ゲスト'}</td>
                <td>${score.score.toLocaleString()}</td>
                <td>${score.maxCombo}</td>
                <td>${score.level}</td>
                <td>${score.correctAnswers || 0}</td>
                <td>${score.wrongAnswers || 0}</td>
                <td>${avgTimeStr}</td>
                <td>${gameTimeStr}</td>
                <td>${score.mode}</td>
                <td>${score.difficulty}</td>
                <td>${trainingModeStr}</td>
                <td>${dateStr}</td>
            `;
            
            // 上位3位はハイライト
            if (index < 3) {
                row.classList.add(`rank-${index + 1}`);
            }
            
            tbody.appendChild(row);
        });
    }
    
    
    exportScores() {
        if (!this.scoreManager) return;
        
        const csvContent = this.scoreManager.exportToCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mathblocks_scores_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // 統合データの自動保存
    autoSaveAllData() {
        // 自動保存設定を確認
        const autoSaveEnabled = localStorage.getItem('mathblocks_autosave') === 'true';
        if (!autoSaveEnabled) {
            console.log('統合データ自動保存は無効です');
            return;
        }
        
        try {
            // 統合データオブジェクトを作成
            const allData = {
                exportInfo: {
                    version: '2.0',
                    exportDate: new Date().toISOString(),
                    description: 'MathBlocks 統合データファイル（スコア・ユーザーデータ含む）'
                },
                scores: this.scoreManager ? this.scoreManager.getAllScores() : [],
                users: this.userManager ? this.userManager.getAllUsers() : []
            };
            
            // JSON文字列に変換
            const jsonString = JSON.stringify(allData, null, 2);
            
            // ファイル名を生成（タイムスタンプ付き）
            const now = new Date();
            const timestamp = Math.floor(now.getTime() / 1000);
            const timeStr = now.toISOString().replace(/[:.]/g, '-').split('T');
            const dateStr = timeStr[0];
            const timeOnly = timeStr[1].substring(0, 8);
            const filename = `mathblocks_data_${dateStr}_${timeOnly}.json`;
            
            // Blobを作成してダウンロード
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log(`統合データ自動バックアップ完了: ${filename}`);
            
            // 統合保存通知を表示
            this.showAutoSaveNotification('統合データ');
            
        } catch (error) {
            console.error('統合データ自動保存エラー:', error);
        }
    }
    
    // 自動保存通知表示
    showAutoSaveNotification(dataType = 'データ') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: opacity 0.3s;
        `;
        notification.innerHTML = `💾 ${dataType}を自動保存しました`;
        
        document.body.appendChild(notification);
        
        // 3秒後にフェードアウト
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    clearScores() {
        if (!this.scoreManager) return;
        
        if (confirm('本当に全てのスコアを削除しますか？この操作は取り消せません。')) {
            this.scoreManager.clearAllScores();
            this.updateScoreTable();
            alert('全てのスコアを削除しました。');
        }
    }
    
    backToMenu() {
        this.showScreen('start');
    }
    
    // JSONインポート用ダイアログ表示
    showImportDialog(type) {
        this.importType = type; // 'scores' または 'users'
        
        // ファイル選択ダイアログを開く
        if (this.elements.jsonFileInput) {
            this.elements.jsonFileInput.value = ''; // リセット
            this.elements.jsonFileInput.click();
        }
    }
    
    // ファイルインポート処理
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // ファイル形式チェック
        if (!file.type.includes('json') && !file.name.toLowerCase().endsWith('.json')) {
            alert('JSONファイルを選択してください。');
            return;
        }
        
        try {
            // ファイルを読み込み
            const text = await this.readFileAsText(file);
            let result;
            
            // インポートタイプに応じて処理
            if (this.importType === 'scores') {
                if (!this.scoreManager) {
                    alert('スコアマネージャーが利用できません。');
                    return;
                }
                result = this.scoreManager.importFromJSON(text);
            } else if (this.importType === 'users') {
                if (!this.userManager) {
                    alert('ユーザーマネージャーが利用できません。');
                    return;
                }
                result = this.userManager.importFromJSON(text);
            } else {
                alert('不正なインポートタイプです。');
                return;
            }
            
            // 結果を表示
            if (result.success) {
                alert(`インポート成功！\n\n${result.message}`);
                
                // スコアボード表示中なら更新
                if (this.currentScreen === 'score') {
                    this.updateScoreTable();
                }
                
                console.log(`${this.importType}インポート結果:`, result);
            } else {
                alert(`インポート失敗：\n${result.message}`);
                console.error(`${this.importType}インポートエラー:`, result);
            }
            
        } catch (error) {
            console.error('ファイル読み込みエラー:', error);
            alert(`ファイルの読み込みに失敗しました：\n${error.message}`);
        }
        
        // ファイル入力をリセット
        event.target.value = '';
    }
    
    // ファイルをテキストとして読み込む
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = (e) => {
                reject(new Error('ファイル読み込みエラー'));
            };
            
            reader.readAsText(file, 'UTF-8');
        });
    }
    
    reset() {
        this.updateScore(0);
        this.updateLevel(1);
        this.updateCombo(0);
        this.updateTime(0);
    }
    
    showHighScoreNotification() {
        // ハイスコア達成通知
        const notification = document.createElement('div');
        notification.className = 'high-score-notification';
        notification.innerHTML = `
            <div class="high-score-title">🎉 NEW HIGH SCORE! 🎉</div>
            <div class="high-score-subtitle">この条件での最高記録を更新しました！</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #FFD700, #FFA500);
            color: #8B4513;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.8);
            z-index: 10000;
            text-align: center;
            border: 3px solid #FF6347;
            animation: highScorePulse 2s ease-in-out infinite alternate;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
    
    addHighScoreEffects() {
        // 最終スコア表示に特別なエフェクトを追加
        this.elements.finalScore.classList.add('high-score-glow');
        
        // ゲームオーバー画面全体にエフェクト
        const gameOverScreen = this.screens.gameOver;
        gameOverScreen.classList.add('high-score-background');
    }
    
    removeHighScoreEffects() {
        // ハイスコアエフェクトを削除
        this.elements.finalScore.classList.remove('high-score-glow');
        
        const gameOverScreen = this.screens.gameOver;
        gameOverScreen.classList.remove('high-score-background');
    }
    
    // ユーザーマネージャーを設定
    setUserManager(userManager) {
        this.userManager = userManager;
    }
    
    // ゲームインスタンスを設定
    setGameInstance(gameInstance) {
        this.gameInstance = gameInstance;
    }
    
    // ユーザー選択画面のメソッド
    selectGuestMode() {
        if (this.userManager) {
            this.userManager.switchToGuestMode();
            this.updateUserDisplay();
            this.showScreen('start');
        }
    }
    
    selectUserMode() {
        this.showScreen('auth');
        this.updateExistingUsersList();
    }
    
    logout() {
        if (this.userManager) {
            this.userManager.logoutUser();
            this.updateUserDisplay();
            this.showScreen('user');
        }
    }
    
    updateUserDisplay() {
        if (!this.userManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        const isGuest = this.userManager.isGuest();
        
        // ユーザー選択画面の表示更新
        if (this.elements.currentUserName) {
            this.elements.currentUserName.textContent = isGuest ? 'ゲスト' : (currentUser?.username || 'ゲスト');
        }
        
        // ユーザー情報の表示/非表示
        if (this.elements.userInfo) {
            this.elements.userInfo.style.display = !isGuest && currentUser ? 'block' : 'none';
        }
        
        // ヘッダーのユーザー名更新
        if (this.elements.headerUserName) {
            this.elements.headerUserName.textContent = isGuest ? 'ゲスト' : (currentUser?.username || 'ゲスト');
        }
    }
    
    // 認証画面のメソッド
    showLoginTab() {
        if (this.elements.loginTab) this.elements.loginTab.classList.add('active');
        if (this.elements.registerTab) this.elements.registerTab.classList.remove('active');
        if (this.elements.loginForm) this.elements.loginForm.style.display = 'block';
        if (this.elements.registerForm) this.elements.registerForm.style.display = 'none';
        this.updateExistingUsersList();
    }
    
    showRegisterTab() {
        if (this.elements.registerTab) this.elements.registerTab.classList.add('active');
        if (this.elements.loginTab) this.elements.loginTab.classList.remove('active');
        if (this.elements.registerForm) this.elements.registerForm.style.display = 'block';
        if (this.elements.loginForm) this.elements.loginForm.style.display = 'none';
    }
    
    showNewUserRegistration() {
        this.showScreen('auth');
        this.showRegisterTab();
    }
    
    handleLogin() {
        if (!this.userManager || !this.elements.loginUsername) return;
        
        const username = this.elements.loginUsername.value.trim();
        if (!username) {
            alert('ユーザー名を入力してください。');
            return;
        }
        
        try {
            this.userManager.loginUser(username);
            this.updateUserDisplay();
            this.showScreen('start');
            this.elements.loginUsername.value = '';
        } catch (error) {
            alert(error.message);
        }
    }
    
    handleRegister() {
        if (!this.userManager || !this.elements.registerUsername) return;
        
        const username = this.elements.registerUsername.value.trim();
        
        if (!username) {
            alert('ユーザー名を入力してください。');
            return;
        }
        
        try {
            this.userManager.registerUser(username);
            this.userManager.loginUser(username);
            this.updateUserDisplay();
            this.showScreen('start');
            this.elements.registerUsername.value = '';
        } catch (error) {
            alert(error.message);
        }
    }
    
    updateExistingUsersList() {
        if (!this.userManager || !this.elements.existingUsers) return;
        
        const userList = this.userManager.getUserList();
        this.elements.existingUsers.innerHTML = '';
        
        userList.forEach(username => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.textContent = username;
            userItem.addEventListener('click', () => {
                if (this.elements.loginUsername) {
                    this.elements.loginUsername.value = username;
                }
            });
            this.elements.existingUsers.appendChild(userItem);
        });
    }
    
    async handleImportUser() {
        if (!this.userManager) return;
        
        try {
            const user = await this.userManager.importUserData();
            alert(`ユーザー「${user.username}」をインポートしました。`);
            this.updateExistingUsersList();
        } catch (error) {
            alert(`インポートエラー: ${error.message}`);
        }
    }
    
    // ユーザーメニュー表示
    showUserMenu() {
        // 簡易的なメニュー実装
        const menu = document.createElement('div');
        menu.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
            min-width: 150px;
        `;
        
        const collectionsOption = document.createElement('div');
        collectionsOption.textContent = 'コレクション';
        collectionsOption.style.cssText = 'padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;';
        collectionsOption.addEventListener('click', () => {
            this.showCollectionScreen();
            document.body.removeChild(menu);
        });
        
        const settingsOption = document.createElement('div');
        settingsOption.textContent = '設定';
        settingsOption.style.cssText = 'padding: 10px; cursor: pointer;';
        settingsOption.addEventListener('click', () => {
            this.showUserSettingsScreen();
            document.body.removeChild(menu);
        });
        
        menu.appendChild(collectionsOption);
        menu.appendChild(settingsOption);
        document.body.appendChild(menu);
        
        // メニュー外クリックで閉じる
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    document.body.removeChild(menu);
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    
    // コレクション画面表示
    showCollectionScreen() {
        this.showScreen('collection');
        this.updateCollectionDisplay();
    }
    
    updateCollectionDisplay() {
        if (!this.userManager || !this.elements.itemsContainer) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        // アイテム数の表示
        if (this.elements.collectionCount) {
            this.elements.collectionCount.textContent = `${currentUser.items.length}/20`;
        }
        
        // アイテムの表示
        this.elements.itemsContainer.innerHTML = '';
        
        // 全アイテムの定義（実際のアイテムデータベース）
        const allItems = [
            { id: 'bronze_medal', name: 'ブロンズメダル', description: '初回1000点達成', icon: '🥉' },
            { id: 'silver_medal', name: 'シルバーメダル', description: '5000点達成', icon: '🥈' },
            { id: 'gold_medal', name: 'ゴールドメダル', description: '10000点達成', icon: '🥇' },
            { id: 'platinum_medal', name: 'プラチナメダル', description: '25000点達成', icon: '🏆' },
            { id: 'diamond_medal', name: 'ダイヤモンドメダル', description: '50000点達成', icon: '💎' },
            { id: 'combo_star', name: 'コンボスター', description: '10連続正解達成', icon: '⭐' },
            { id: 'combo_crown', name: 'コンボクラウン', description: '25連続正解達成', icon: '👑' },
            { id: 'combo_legend', name: 'コンボレジェンド', description: '50連続正解達成', icon: '🏅' },
            { id: 'veteran_badge', name: 'ベテランバッジ', description: '10ゲーム達成', icon: '🎖️' },
            { id: 'master_badge', name: 'マスターバッジ', description: '100ゲーム達成', icon: '🎗️' }
        ];
        
        allItems.forEach(itemDef => {
            const userItem = currentUser.items.find(item => item.id === itemDef.id);
            const isUnlocked = !!userItem;
            const isNew = userItem?.isNew || false;
            
            const itemCard = document.createElement('div');
            itemCard.className = `item-card ${isUnlocked ? 'unlocked' : 'locked'} ${isNew ? 'new' : ''}`;
            
            itemCard.innerHTML = `
                <div class="item-icon">${isUnlocked ? itemDef.icon : '🔒'}</div>
                <div class="item-name">${isUnlocked ? itemDef.name : '???'}</div>
                <div class="item-desc">${isUnlocked ? itemDef.description : 'まだ解放されていません'}</div>
            `;
            
            if (isNew) {
                itemCard.addEventListener('click', () => {
                    userItem.isNew = false;
                    this.userManager.saveUsers();
                    itemCard.classList.remove('new');
                });
            }
            
            this.elements.itemsContainer.appendChild(itemCard);
        });
    }
    
    hideNewItemsNotification() {
        if (this.elements.newItemsNotification) {
            this.elements.newItemsNotification.style.display = 'none';
        }
    }
    
    // ユーザー設定画面表示
    showUserSettingsScreen() {
        this.showScreen('userSettings');
        this.updateUserSettingsDisplay();
    }
    
    updateUserSettingsDisplay() {
        if (!this.userManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        // プロファイル情報の表示
        if (this.elements.profileUsername) {
            this.elements.profileUsername.value = currentUser.username;
        }
        
        // ユーザーデータ統計の表示
        if (this.elements.statGamesPlayed) {
            this.elements.statGamesPlayed.textContent = currentUser.gamesPlayed || 0;
        }
        if (this.elements.statTotalScore) {
            this.elements.statTotalScore.textContent = (currentUser.totalScore || 0).toLocaleString();
        }
        if (this.elements.statTotalCorrect) {
            this.elements.statTotalCorrect.textContent = currentUser.totalCorrect || 0;
        }
        if (this.elements.statTotalWrong) {
            this.elements.statTotalWrong.textContent = currentUser.totalWrong || 0;
        }
        if (this.elements.statAvgAnswerTime) {
            const avgTime = currentUser.totalCorrect > 0 ? 
                (currentUser.totalAnswerTime / currentUser.totalCorrect).toFixed(1) : 0.0;
            this.elements.statAvgAnswerTime.textContent = `${avgTime}s`;
        }
    }
    
    exportUserScores() {
        if (!this.userManager || !this.scoreManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        // 自分のハイスコアデータを取得
        const allScores = this.scoreManager.getTopScores(1000); // 大きめの数で全件取得
        const userScores = allScores.filter(score => score.username === currentUser.username);
        
        if (userScores.length === 0) {
            alert('エクスポートするハイスコアデータがありません。');
            return;
        }
        
        // CSVヘッダー
        const headers = [
            '順位', 'スコア', '最大コンボ', 'レベル', '正解数', '誤答数', 
            '平均時間', 'モード', '難易度', '演算', '数値範囲', '日時'
        ];
        
        // CSVデータ作成
        let csvContent = headers.join(',') + '\n';
        
        userScores.forEach((score, index) => {
            const operations = Object.entries(score.operations)
                .filter(([_, enabled]) => enabled)
                .map(([op, _]) => op)
                .join('+');
            
            const range = `${score.minNum}-${score.maxNum}`;
            const date = new Date(score.timestamp).toLocaleString('ja-JP');
            
            const row = [
                index + 1,
                score.score,
                score.maxCombo,
                score.level,
                score.correctAnswers || 0,
                score.wrongAnswers || 0,
                score.avgAnswerTime ? score.avgAnswerTime.toFixed(2) + 's' : '-',
                score.mode === 'score' ? 'スコア' : 'タイム',
                score.difficulty,
                operations,
                range,
                `"${date}"`
            ];
            
            csvContent += row.join(',') + '\n';
        });
        
        // ファイルダウンロード
        const filename = `mathblocks_highscores_${currentUser.username}_${new Date().toISOString().split('T')[0]}.csv`;
        this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8');
    }
    
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    exportUserData() {
        if (!this.userManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        try {
            this.userManager.exportUserData(currentUser.username);
        } catch (error) {
            alert(`エクスポートエラー: ${error.message}`);
        }
    }
    
    deleteUser() {
        if (!this.userManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        if (confirm(`ユーザー「${currentUser.username}」を削除しますか？この操作は取り消せません。`)) {
            try {
                this.userManager.deleteUser(currentUser.username);
                alert('ユーザーを削除しました。');
                this.showScreen('user');
            } catch (error) {
                alert(`削除エラー: ${error.message}`);
            }
        }
    }
    
    // 新規ユーザー登録を表示
    showNewUserRegistration() {
        this.showScreen('auth');
        this.showRegisterTab();
    }
    
    // 新しい統計表示メソッド
    updateUserSettingsDisplay() {
        if (!this.userManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) return;
        
        // プロファイル情報の表示
        if (this.elements.profileUsername) {
            this.elements.profileUsername.value = currentUser.username;
        }
        
        // 統計情報の表示
        if (this.elements.statGamesPlayed) this.elements.statGamesPlayed.textContent = currentUser.gamesPlayed || 0;
        if (this.elements.statTotalScore) this.elements.statTotalScore.textContent = (currentUser.totalScore || 0).toLocaleString();
        if (this.elements.statTotalCorrect) this.elements.statTotalCorrect.textContent = currentUser.totalCorrect || 0;
        if (this.elements.statTotalWrong) this.elements.statTotalWrong.textContent = currentUser.totalWrong || 0;
        
        // 総平均正答時間を計算
        const avgAnswerTime = currentUser.gamesPlayed > 0 ? 
            (currentUser.totalAnswerTime || 0) / currentUser.gamesPlayed : 0;
        if (this.elements.statAvgAnswerTime) {
            this.elements.statAvgAnswerTime.textContent = `${avgAnswerTime.toFixed(1)}s`;
        }
    }
    
    // ユーザーのハイスコアCSVエクスポート
    exportUserScores() {
        if (!this.userManager || !this.scoreManager) return;
        
        const currentUser = this.userManager.getCurrentUser();
        if (!currentUser) {
            alert('ユーザーが選択されていません。');
            return;
        }
        
        // 全スコアから自分のデータのみをフィルタ
        const allScores = this.scoreManager.scores || [];
        const userScores = allScores.filter(score => score.username === currentUser.username);
        
        if (userScores.length === 0) {
            alert('エクスポートするスコアデータがありません。');
            return;
        }
        
        // CSVヘッダー
        const headers = [
            'スコア', '最大コンボ', 'レベル', 'モード', '難易度', 
            '正解数', '誤答数', '平均時間', '演算', '数値範囲', '日時'
        ];
        
        // CSVデータ作成
        let csvContent = headers.join(',') + '\n';
        
        userScores.forEach(score => {
            const operations = Object.entries(score.operations)
                .filter(([_, enabled]) => enabled)
                .map(([op, _]) => op)
                .join('+');
            
            const date = new Date(score.timestamp);
            const dateStr = date.toLocaleDateString('ja-JP');
            const avgTimeStr = score.avgAnswerTime ? `${score.avgAnswerTime.toFixed(1)}s` : '-';
            
            const row = [
                score.score,
                score.maxCombo,
                score.level,
                score.mode,
                score.difficulty,
                score.correctAnswers || 0,
                score.wrongAnswers || 0,
                avgTimeStr,
                operations,
                `${score.minNum}-${score.maxNum}`,
                dateStr
            ];
            
            csvContent += row.join(',') + '\n';
        });
        
        // ファイルダウンロード
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `mathblocks_${currentUser.username}_scores_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// CSS アニメーション追加
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
    }
    
    @keyframes highScorePulse {
        0% { 
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 8px 32px rgba(255, 215, 0, 0.8);
        }
        100% { 
            transform: translate(-50%, -50%) scale(1.05);
            box-shadow: 0 12px 40px rgba(255, 215, 0, 1);
        }
    }
    
    @keyframes highScoreGlow {
        0% { 
            color: #2c3e50;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
        50% { 
            color: #FFD700;
            text-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 30px rgba(255, 215, 0, 0.8);
        }
        100% { 
            color: #2c3e50;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }
    }
    
    .high-score-glow {
        animation: highScoreGlow 2s ease-in-out infinite;
    }
    
    .high-score-background {
        background: linear-gradient(135deg, #fff9e6, #fffbf0) !important;
        border: 3px solid #FFD700 !important;
        box-shadow: 0 0 30px rgba(255, 215, 0, 0.5) !important;
    }
    
    .high-score-title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .high-score-subtitle {
        font-size: 16px;
        font-weight: normal;
    }
    
    /* スコアボードのスタイル */
    .rank-1 {
        background-color: #FFD700 !important;
        font-weight: bold;
    }
    
    .rank-2 {
        background-color: #C0C0C0 !important;
        font-weight: bold;
    }
    
    .rank-3 {
        background-color: #CD7F32 !important;
        font-weight: bold;
    }
    
    #scoresTable {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }
    
    #scoresTable th,
    #scoresTable td {
        padding: 8px 12px;
        text-align: center;
        border: 1px solid #ddd;
    }
    
    #scoresTable th {
        background-color: #f2f2f2;
        font-weight: bold;
        position: sticky;
        top: 0;
    }
    
    #scoresTable tbody tr:nth-child(even) {
        background-color: #f9f9f9;
    }
    
    #scoresTable tbody tr:hover {
        background-color: #e6f3ff;
    }
    
    .scores-container {
        max-height: 400px;
        overflow-y: auto;
        border: 1px solid #ddd;
        border-radius: 5px;
    }
    
    .score-controls {
        margin-bottom: 20px;
        text-align: center;
    }
    
    .score-controls button {
        margin: 0 10px;
        padding: 10px 20px;
        font-size: 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    
    #exportScoresBtn {
        background-color: #27ae60;
        color: white;
    }
    
    #exportScoresBtn:hover {
        background-color: #219a52;
    }
    
    #backFromScoresBtn {
        background-color: #3498db;
        color: white;
    }
    
    #backFromScoresBtn:hover {
        background-color: #2980b9;
    }
`;
document.head.appendChild(style);