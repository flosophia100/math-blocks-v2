// ゲームUI管理クラス
class GameUIManager {
    constructor() {
        this.gameSettings = {
            mode: null,
            difficulty: null,
            training: null,
            operations: { add: true, sub: true, mul: false, div: false },
            minNum: 1,
            maxNum: 10
        };
        
        this.initElements();
        this.setupEventListeners();
    }
    
    initElements() {
        this.screens = {
            start: document.getElementById('startScreen'),
            game: document.getElementById('gameScreen'),
            gameOver: document.getElementById('gameOverScreen'),
            score: document.getElementById('scoreScreen')
        };
        
        this.elements = {
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
            
            // ゲームオーバー画面
            finalScore: document.getElementById('finalScore'),
            finalLevel: document.getElementById('finalLevel'),
            finalCombo: document.getElementById('finalCombo'),
            finalTime: document.getElementById('finalTime'),
            highScoreText: document.getElementById('highScoreText'),
            ranking: document.getElementById('ranking'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            backToMenuBtn: document.getElementById('backToMenuBtn'),
            viewScoresFromGameOverBtn: document.getElementById('viewScoresFromGameOverBtn'),
            
            // スコア画面
            scoresContainer: document.getElementById('scoresContainer'),
            backFromScoresBtn: document.getElementById('backFromScoresBtn')
        };
    }
    
    setupEventListeners() {
        // モード選択
        this.elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectMode(btn.dataset.mode));
        });
        
        // 難易度選択
        this.elements.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectDifficulty(btn.dataset.difficulty));
        });
        
        // 特訓モード選択
        this.elements.trainingButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectTraining(btn.dataset.training));
        });
        
        // 演算選択
        Object.entries(this.elements.operations).forEach(([op, element]) => {
            element?.addEventListener('change', () => this.updateOperations());
        });
        
        // 数値範囲
        this.elements.minNum?.addEventListener('change', () => this.updateNumberRange());
        this.elements.maxNum?.addEventListener('change', () => this.updateNumberRange());
        
        // ゲーム開始
        this.elements.startButton?.addEventListener('click', () => this.startGame());
        
        // ゲーム中のボタン
        this.elements.pauseBtn?.addEventListener('click', () => this.togglePause());
        this.elements.quitBtn?.addEventListener('click', () => this.quitGame());
        this.elements.viewScoresBtn?.addEventListener('click', () => this.showScoreScreen());
        
        // ゲームオーバー画面
        this.elements.playAgainBtn?.addEventListener('click', () => this.playAgain());
        this.elements.backToMenuBtn?.addEventListener('click', () => this.backToMenu());
        this.elements.viewScoresFromGameOverBtn?.addEventListener('click', () => this.showScoreScreen());
        
        // スコア画面
        this.elements.backFromScoresBtn?.addEventListener('click', () => this.backFromScores());
    }
    
    // モード選択
    selectMode(mode) {
        console.log('GameUIManager: selectMode called with:', mode);
        this.gameSettings.mode = mode;
        this.updateModeButtons();
        this.updateStartButton();
        console.log('GameUIManager: Current settings:', this.gameSettings);
        
        // 対戦モードの場合は、スタートボタンが押された時にshowVersusSetupを呼ぶ
        // ここでは呼ばない（モード選択とゲーム開始を分離）
    }
    
    // 難易度選択
    selectDifficulty(difficulty) {
        console.log('GameUIManager: selectDifficulty called with:', difficulty);
        this.gameSettings.difficulty = difficulty;
        this.updateDifficultyButtons();
        this.updateStartButton();
        console.log('GameUIManager: Current settings:', this.gameSettings);
    }
    
    // 特訓モード選択
    selectTraining(training) {
        this.gameSettings.training = training === this.gameSettings.training ? null : training;
        this.updateTrainingButtons();
        this.updateStartButton();
    }
    
    // 演算設定更新
    updateOperations() {
        Object.entries(this.elements.operations).forEach(([op, element]) => {
            if (element) {
                this.gameSettings.operations[op] = element.checked;
            }
        });
        this.updateStartButton();
    }
    
    // 数値範囲更新
    updateNumberRange() {
        const min = parseInt(this.elements.minNum?.value) || 1;
        const max = parseInt(this.elements.maxNum?.value) || 10;
        
        if (min > max) {
            this.elements.minNum.value = max;
            this.elements.maxNum.value = min;
        }
        
        this.gameSettings.minNum = Math.min(min, max);
        this.gameSettings.maxNum = Math.max(min, max);
        this.updateStartButton();
    }
    
    // UI更新メソッド
    updateModeButtons() {
        this.elements.modeButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.mode === this.gameSettings.mode);
        });
    }
    
    updateDifficultyButtons() {
        this.elements.difficultyButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.difficulty === this.gameSettings.difficulty);
        });
    }
    
    updateTrainingButtons() {
        this.elements.trainingButtons.forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.training === this.gameSettings.training);
        });
    }
    
    updateStartButton() {
        const hasMode = this.gameSettings.mode !== null;
        const hasDifficulty = this.gameSettings.difficulty !== null;
        const hasOperation = Object.values(this.gameSettings.operations).some(op => op);
        const canStart = hasMode && hasDifficulty && hasOperation && this.gameSettings.minNum <= this.gameSettings.maxNum;
        
        console.log('GameUIManager: updateStartButton - hasMode:', hasMode, 'hasDifficulty:', hasDifficulty, 'hasOperation:', hasOperation, 'canStart:', canStart);
        
        if (this.elements.startButton) {
            this.elements.startButton.disabled = !canStart;
            // ボタンのテキストは常に「ゲーム開始」のまま
            this.elements.startButton.textContent = 'ゲーム開始';
            console.log('GameUIManager: Start button disabled:', this.elements.startButton.disabled);
        } else {
            console.warn('GameUIManager: startButton element not found');
        }
    }
    
    // ゲーム開始
    startGame() {
        // 対戦モードの場合はshowVersusSetupを呼ぶ
        if (this.gameSettings.mode === 'versus_cpu' || this.gameSettings.mode === 'versus_human') {
            console.log('GameUIManager: Starting versus mode setup');
            this.showVersusSetup(this.gameSettings.mode);
            return;
        }
        
        if (window.gameModeManager) {
            try {
                const modeInstance = window.gameModeManager.createModeInstance(
                    this.gameSettings.mode,
                    this.gameSettings
                );
                modeInstance.start();
                this.showGameScreen();
            } catch (error) {
                console.error('ゲーム開始エラー:', error);
                this.showError('ゲームを開始できませんでした');
            }
        } else {
            // フォールバック: 従来の方法
            this.startTraditionalGame();
        }
    }
    
    // 従来のゲーム開始方法（フォールバック）
    startTraditionalGame() {
        if (this.gameSettings.mode === 'versus_cpu' || this.gameSettings.mode === 'versus_human') {
            // 対戦モードは別処理
            return;
        }
        
        const canvas = document.getElementById('gameCanvas');
        if (window.game) {
            window.game.stop();
        }
        
        window.game = new Game(canvas);
        window.game.mode = this.gameSettings.mode;
        window.game.difficulty = this.gameSettings.difficulty;
        window.game.training = this.gameSettings.training;
        
        // 設定を適用
        Object.assign(window.game.operations, this.gameSettings.operations);
        window.game.minNum = this.gameSettings.minNum;
        window.game.maxNum = this.gameSettings.maxNum;
        
        window.game.startGame();
        this.showGameScreen();
    }
    
    // 対戦セットアップ画面表示
    showVersusSetup(mode) {
        console.log(`対戦モード設定画面: ${mode}`, 'Current settings:', this.gameSettings);
        
        // versusUIManagerに現在の設定を渡す
        if (window.versusUIManager) {
            const currentDifficulty = this.gameSettings.difficulty;
            const currentTraining = this.gameSettings.training;
            
            // 難易度が選択されていない場合はエラー
            if (!currentDifficulty) {
                console.error('Difficulty not selected');
                this.showError('難易度を選択してください');
                return;
            }
            
            if (mode === 'versus_cpu') {
                // CPU対戦の設定を更新（デフォルト値を使わない）
                window.versusUIManager.settings.cpu.difficulty = currentDifficulty;
                window.versusUIManager.settings.cpu.training = currentTraining || false;
                console.log('CPU対戦設定更新:', window.versusUIManager.settings.cpu);
                window.versusUIManager.showCpuSetupScreen();
            } else if (mode === 'versus_human') {
                // 人間対戦の設定を更新（デフォルト値を使わない）
                window.versusUIManager.settings.human.difficulty = currentDifficulty;
                window.versusUIManager.settings.human.training = currentTraining || false;
                console.log('人間対戦設定更新:', window.versusUIManager.settings.human);
                window.versusUIManager.showHumanSetupScreen();
            }
        } else {
            console.error('versusUIManager not found');
        }
    }
    
    // 画面表示メソッド
    showStartScreen() {
        this.hideAllGameScreens();
        this.screens.start?.classList.remove('hidden');
        this.updateAllButtons();
    }
    
    showGameScreen() {
        this.hideAllGameScreens();
        this.screens.game?.classList.remove('hidden');
        this.updateGameDisplay();
    }
    
    showGameOverScreen(gameResult) {
        this.hideAllGameScreens();
        this.screens.gameOver?.classList.remove('hidden');
        this.updateGameOverDisplay(gameResult);
    }
    
    showScoreScreen() {
        this.hideAllGameScreens();
        this.screens.score?.classList.remove('hidden');
        this.updateScoreDisplay();
    }
    
    // ゲーム中の表示更新
    updateGameDisplay() {
        const game = window.game;
        if (!game) return;
        
        if (this.elements.currentMode) {
            this.elements.currentMode.textContent = this.getModeDisplayName(game.mode);
        }
        if (this.elements.currentDifficulty) {
            this.elements.currentDifficulty.textContent = this.getDifficultyDisplayName(game.difficulty);
        }
        if (this.elements.currentTraining) {
            this.elements.currentTraining.textContent = game.training ? 
                this.getTrainingDisplayName(game.training) : 'なし';
        }
    }
    
    // ゲーム状態更新
    updateGameStats(stats) {
        if (this.elements.score) this.elements.score.textContent = stats.score || 0;
        if (this.elements.level) this.elements.level.textContent = stats.level || 1;
        if (this.elements.combo) this.elements.combo.textContent = stats.combo || 0;
        if (this.elements.time) this.elements.time.textContent = this.formatTime(stats.time || 0);
    }
    
    // ゲームオーバー表示更新
    updateGameOverDisplay(result) {
        if (this.elements.finalScore) this.elements.finalScore.textContent = result.score || 0;
        if (this.elements.finalLevel) this.elements.finalLevel.textContent = result.level || 1;
        if (this.elements.finalCombo) this.elements.finalCombo.textContent = result.maxCombo || 0;
        if (this.elements.finalTime) this.elements.finalTime.textContent = this.formatTime(result.time || 0);
        
        if (result.isHighScore && this.elements.highScoreText) {
            this.elements.highScoreText.classList.remove('hidden');
        }
        
        if (this.elements.ranking) {
            this.elements.ranking.textContent = result.ranking ? `第${result.ranking}位` : '';
        }
    }
    
    // スコア画面更新
    updateScoreDisplay() {
        if (!this.elements.scoresContainer || !window.scoreManager) return;
        
        const scores = window.scoreManager.getTopScores(10);
        if (scores.length === 0) {
            this.elements.scoresContainer.innerHTML = '<p>スコアがありません</p>';
            return;
        }
        
        const scoresHTML = scores.map((score, index) => `
            <div class="score-item ${index === 0 ? 'top-score' : ''}">
                <span class="rank">${index + 1}</span>
                <span class="score">${score.score}</span>
                <span class="level">Lv.${score.level}</span>
                <span class="combo">${score.maxCombo}combo</span>
                <span class="date">${new Date(score.timestamp).toLocaleDateString()}</span>
            </div>
        `).join('');
        
        this.elements.scoresContainer.innerHTML = scoresHTML;
    }
    
    // イベントハンドラー
    togglePause() {
        if (window.game && window.game.togglePause) {
            window.game.togglePause();
        }
    }
    
    quitGame() {
        console.log('GameUIManager: quitGame called');
        if (window.game && window.game.stop) {
            window.game.stop();
        }
        
        // 選択状態をクリア
        this.clearGameSettings();
        
        // レガシーUIManagerの選択状態もクリア
        if (window.uiManager && window.uiManager.clearSelections) {
            console.log('GameUIManager: Calling window.uiManager.clearSelections');
            window.uiManager.clearSelections();
        } else {
            console.log('GameUIManager: window.uiManager.clearSelections not available');
        }
        
        this.showStartScreen();
        console.log('GameUIManager: quitGame completed');
    }
    
    playAgain() {
        this.startGame();
    }
    
    // 選択状態をクリア
    clearGameSettings() {
        console.log('GameUIManager: clearGameSettings called');
        this.gameSettings.mode = null;
        this.gameSettings.difficulty = null;
        this.gameSettings.training = null;
        
        // UIボタンの選択状態もクリア
        this.updateModeButtons();
        this.updateDifficultyButtons();
        this.updateTrainingButtons();
        this.updateStartButton();
        
        // 強制的にDOMボタンの状態をクリア
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        document.querySelectorAll('.training-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        console.log('GameUIManager: clearGameSettings completed');
    }

    backToMenu() {
        console.log('GameUIManager: backToMenu called');
        // 選択状態をクリア
        this.clearGameSettings();
        
        // レガシーUIManagerの選択状態もクリア
        if (window.uiManager && window.uiManager.clearSelections) {
            console.log('GameUIManager: Calling window.uiManager.clearSelections from backToMenu');
            window.uiManager.clearSelections();
        } else {
            console.log('GameUIManager: window.uiManager.clearSelections not available in backToMenu');
        }
        
        this.showStartScreen();
        console.log('GameUIManager: backToMenu completed');
    }
    
    backFromScores() {
        // 前の画面に戻る（ゲーム中かメニューかを判定）
        if (window.game && window.game.state === 'game_over') {
            this.showGameOverScreen(window.game.getResult());
        } else {
            this.showStartScreen();
        }
    }
    
    // ユーティリティメソッド
    hideAllGameScreens() {
        Object.values(this.screens).forEach(screen => {
            screen?.classList.add('hidden');
        });
    }
    
    updateAllButtons() {
        this.updateModeButtons();
        this.updateDifficultyButtons();
        this.updateTrainingButtons();
        this.updateStartButton();
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    getModeDisplayName(mode) {
        const names = {
            'score': 'スコアアタック',
            'time': 'タイムアタック',
            'versus_cpu': 'CPU対戦',
            'versus_human': '2P対戦'
        };
        return names[mode] || mode;
    }
    
    getDifficultyDisplayName(difficulty) {
        const names = {
            'easy': 'やさしい',
            'normal': 'ふつう',
            'hard': 'むずかしい'
        };
        return names[difficulty] || difficulty;
    }
    
    getTrainingDisplayName(training) {
        const names = {
            'calculation': '計算特訓',
            'speed': 'スピード特訓',
            'accuracy': '正確性特訓'
        };
        return names[training] || training;
    }
    
    showError(message) {
        console.error(message);
        // 簡単なエラー表示
        alert(message);
    }
    
    // 現在の設定を取得
    getCurrentSettings() {
        return { ...this.gameSettings };
    }
    
    // 設定を更新
    updateSettings(newSettings) {
        Object.assign(this.gameSettings, newSettings);
        this.updateAllButtons();
    }
}

// グローバルインスタンス
window.gameUIManager = null;