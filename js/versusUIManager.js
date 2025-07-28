// 対戦モードUI管理クラス
class VersusUIManager {
    constructor() {
        this.currentVersusGame = null;
        this.initElements();
        this.setupEventListeners();
    }
    
    initElements() {
        this.screens = {
            versusCpuSetup: document.getElementById('versusCpuSetupScreen'),
            versusHumanSetup: document.getElementById('versusHumanSetupScreen'),
            versusGame: document.getElementById('versusGameScreen'),
            versusResult: document.getElementById('versusResultScreen')
        };
        
        this.elements = {
            // CPU対戦セットアップ
            cpuDifficultyButtons: document.querySelectorAll('.cpu-difficulty-btn'),
            cpuLevelSlider: document.getElementById('cpuLevelSlider'),
            cpuLevelDisplay: document.getElementById('cpuLevelDisplay'),
            cpuTrainingMode: document.getElementById('cpuTrainingMode'),
            startVersusCpuBtn: document.getElementById('startVersusCpuBtn'),
            backFromCpuSetupBtn: document.getElementById('backFromCpuSetupBtn'),
            
            // 人間対戦セットアップ
            player1Name: document.getElementById('player1Name'),
            player2Name: document.getElementById('player2Name'),
            humanDifficultyButtons: document.querySelectorAll('.human-difficulty-btn'),
            humanTrainingMode: document.getElementById('humanTrainingMode'),
            startVersusHumanBtn: document.getElementById('startVersusHumanBtn'),
            backFromHumanSetupBtn: document.getElementById('backFromHumanSetupBtn'),
            
            // 対戦ゲーム画面
            leftPlayerName: document.getElementById('leftPlayerName'),
            rightPlayerName: document.getElementById('rightPlayerName'),
            leftScore: document.getElementById('leftScore'),
            rightScore: document.getElementById('rightScore'),
            leftLevel: document.getElementById('leftLevel'),
            rightLevel: document.getElementById('rightLevel'),
            leftCombo: document.getElementById('leftCombo'),
            rightCombo: document.getElementById('rightCombo'),
            gameTimer: document.getElementById('gameTimer'),
            versusQuitBtn: document.getElementById('versusQuitBtn'),
            
            // 対戦結果画面
            winnerName: document.getElementById('winnerName'),
            leftFinalScore: document.getElementById('leftFinalScore'),
            rightFinalScore: document.getElementById('rightFinalScore'),
            leftFinalLevel: document.getElementById('leftFinalLevel'),
            rightFinalLevel: document.getElementById('rightFinalLevel'),
            leftFinalCombo: document.getElementById('leftFinalCombo'),
            rightFinalCombo: document.getElementById('rightFinalCombo'),
            matchTime: document.getElementById('matchTime'),
            playAgainVersusBtn: document.getElementById('playAgainVersusBtn'),
            backToVersusMenuBtn: document.getElementById('backToVersusMenuBtn')
        };
        
        this.settings = {
            cpu: {
                difficulty: 'normal',
                level: 3,
                training: false
            },
            human: {
                difficulty: 'normal',
                training: false,
                player1Name: 'プレイヤー1',
                player2Name: 'プレイヤー2'
            }
        };
    }
    
    setupEventListeners() {
        // CPU対戦セットアップ
        this.elements.cpuDifficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectCpuDifficulty(btn.dataset.difficulty));
        });
        
        if (this.elements.cpuLevelSlider) {
            this.elements.cpuLevelSlider.addEventListener('input', () => this.updateCpuLevel());
        }
        
        if (this.elements.cpuTrainingMode) {
            this.elements.cpuTrainingMode.addEventListener('change', () => this.updateCpuTraining());
        }
        
        this.elements.startVersusCpuBtn?.addEventListener('click', () => this.startCpuMatch());
        this.elements.backFromCpuSetupBtn?.addEventListener('click', () => this.backToGameMenu());
        
        // 人間対戦セットアップ
        this.elements.humanDifficultyButtons.forEach(btn => {
            btn.addEventListener('click', () => this.selectHumanDifficulty(btn.dataset.difficulty));
        });
        
        if (this.elements.humanTrainingMode) {
            this.elements.humanTrainingMode.addEventListener('change', () => this.updateHumanTraining());
        }
        
        if (this.elements.player1Name) {
            this.elements.player1Name.addEventListener('change', () => this.updatePlayerNames());
        }
        
        if (this.elements.player2Name) {
            this.elements.player2Name.addEventListener('change', () => this.updatePlayerNames());
        }
        
        this.elements.startVersusHumanBtn?.addEventListener('click', () => this.startHumanMatch());
        this.elements.backFromHumanSetupBtn?.addEventListener('click', () => this.backToGameMenu());
        
        // 対戦ゲーム画面
        this.elements.versusQuitBtn?.addEventListener('click', () => this.quitVersusGame());
        
        // 対戦結果画面
        this.elements.playAgainVersusBtn?.addEventListener('click', () => this.playAgainVersus());
        this.elements.backToVersusMenuBtn?.addEventListener('click', () => this.backToGameMenu());
    }
    
    // CPU対戦セットアップ画面表示
    showCpuSetupScreen() {
        this.hideAllVersusScreens();
        this.screens.versusCpuSetup?.classList.remove('hidden');
        this.updateCpuSetupDisplay();
    }
    
    // 人間対戦セットアップ画面表示
    showHumanSetupScreen() {
        this.hideAllVersusScreens();
        this.screens.versusHumanSetup?.classList.remove('hidden');
        this.updateHumanSetupDisplay();
    }
    
    // 対戦ゲーム画面表示
    showVersusGameScreen(versusGame) {
        this.currentVersusGame = versusGame;
        this.hideAllVersusScreens();
        this.screens.versusGame?.classList.remove('hidden');
        this.initializeVersusGameDisplay(versusGame);
    }
    
    // 対戦結果画面表示
    showVersusResultScreen(result) {
        this.hideAllVersusScreens();
        this.screens.versusResult?.classList.remove('hidden');
        this.updateVersusResultDisplay(result);
    }
    
    // CPU設定更新
    selectCpuDifficulty(difficulty) {
        this.settings.cpu.difficulty = difficulty;
        this.updateCpuDifficultyButtons();
    }
    
    updateCpuLevel() {
        this.settings.cpu.level = parseInt(this.elements.cpuLevelSlider?.value) || 3;
        if (this.elements.cpuLevelDisplay) {
            this.elements.cpuLevelDisplay.textContent = this.settings.cpu.level;
        }
    }
    
    updateCpuTraining() {
        this.settings.cpu.training = this.elements.cpuTrainingMode?.checked || false;
    }
    
    updateCpuDifficultyButtons() {
        this.elements.cpuDifficultyButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.settings.cpu.difficulty);
        });
    }
    
    updateCpuSetupDisplay() {
        // 難易度はメイン画面で選択されたものを使用するため、ボタン更新は不要
        // this.updateCpuDifficultyButtons();
        this.updateCpuLevel();
        this.updateCpuTraining();
        
        // 現在の難易度を画面に表示
        const difficultyDisplay = document.getElementById('versusDifficultyDisplay');
        if (difficultyDisplay) {
            const difficultyName = {
                'easy': 'やさしい',
                'normal': 'ふつう',
                'hard': 'むずかしい'
            };
            difficultyDisplay.textContent = difficultyName[this.settings.cpu.difficulty] || this.settings.cpu.difficulty;
        }
        
        // 現在の難易度を表示（デバッグ用）
        console.log('CPU対戦画面 - 現在の難易度:', this.settings.cpu.difficulty);
    }
    
    // 人間対戦設定更新
    selectHumanDifficulty(difficulty) {
        this.settings.human.difficulty = difficulty;
        this.updateHumanDifficultyButtons();
    }
    
    updateHumanTraining() {
        this.settings.human.training = this.elements.humanTrainingMode?.checked || false;
    }
    
    updatePlayerNames() {
        this.settings.human.player1Name = this.elements.player1Name?.value.trim() || 'プレイヤー1';
        this.settings.human.player2Name = this.elements.player2Name?.value.trim() || 'プレイヤー2';
    }
    
    updateHumanDifficultyButtons() {
        this.elements.humanDifficultyButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.settings.human.difficulty);
        });
    }
    
    updateHumanSetupDisplay() {
        // 難易度はメイン画面で選択されたものを使用するため、ボタン更新は不要
        // this.updateHumanDifficultyButtons();
        this.updateHumanTraining();
        
        if (this.elements.player1Name) {
            this.elements.player1Name.value = this.settings.human.player1Name;
        }
        if (this.elements.player2Name) {
            this.elements.player2Name.value = this.settings.human.player2Name;
        }
        
        // 現在の難易度を画面に表示（人間対戦用の表示要素があれば）
        const difficultyDisplay = document.getElementById('versusHumanDifficultyDisplay');
        if (difficultyDisplay) {
            const difficultyName = {
                'easy': 'やさしい',
                'normal': 'ふつう',
                'hard': 'むずかしい'
            };
            difficultyDisplay.textContent = difficultyName[this.settings.human.difficulty] || this.settings.human.difficulty;
        }
        
        console.log('人間対戦画面 - 現在の難易度:', this.settings.human.difficulty);
    }
    
    // 対戦開始
    startCpuMatch() {
        try {
            // 難易度文字列をCONFIG.DIFFICULTYオブジェクトに変換
            const difficultyObj = CONFIG.DIFFICULTY[this.settings.cpu.difficulty] || CONFIG.DIFFICULTY['normal'];
            
            const versusGame = new VersusGame(
                GameMode.VERSUS_CPU,
                difficultyObj,
                this.settings.cpu.training,
                this.settings.cpu.level
            );
            
            versusGame.start();
            this.showVersusGameScreen(versusGame);
            
        } catch (error) {
            console.error('CPU対戦開始エラー:', error);
            this.showError('CPU対戦を開始できませんでした');
        }
    }
    
    startHumanMatch() {
        try {
            // 難易度文字列をCONFIG.DIFFICULTYオブジェクトに変換
            const difficultyObj = CONFIG.DIFFICULTY[this.settings.human.difficulty] || CONFIG.DIFFICULTY['normal'];
            
            const playerNames = {
                player1: this.settings.human.player1Name,
                player2: this.settings.human.player2Name
            };
            
            const versusGame = new VersusGame(
                GameMode.VERSUS_HUMAN,
                difficultyObj,
                this.settings.human.training,
                null,
                playerNames
            );
            
            versusGame.start();
            this.showVersusGameScreen(versusGame);
            
        } catch (error) {
            console.error('人間対戦開始エラー:', error);
            this.showError('人間対戦を開始できませんでした');
        }
    }
    
    // 対戦ゲーム画面初期化
    initializeVersusGameDisplay(versusGame) {
        const isHumanMode = versusGame.mode === GameMode.VERSUS_HUMAN;
        
        if (this.elements.leftPlayerName) {
            this.elements.leftPlayerName.textContent = isHumanMode ? 
                versusGame.playerNames?.player1 || 'プレイヤー1' : 'あなた';
        }
        
        if (this.elements.rightPlayerName) {
            this.elements.rightPlayerName.textContent = isHumanMode ? 
                versusGame.playerNames?.player2 || 'プレイヤー2' : 'CPU';
        }
        
        // 初期値をリセット
        this.updateVersusGameStats({
            leftScore: 0, rightScore: 0,
            leftLevel: 1, rightLevel: 1,
            leftCombo: 0, rightCombo: 0,
            time: 0
        });
    }
    
    // 対戦ゲーム状態更新
    updateVersusGameStats(stats) {
        if (this.elements.leftScore) this.elements.leftScore.textContent = stats.leftScore || 0;
        if (this.elements.rightScore) this.elements.rightScore.textContent = stats.rightScore || 0;
        if (this.elements.leftLevel) this.elements.leftLevel.textContent = stats.leftLevel || 1;
        if (this.elements.rightLevel) this.elements.rightLevel.textContent = stats.rightLevel || 1;
        if (this.elements.leftCombo) this.elements.leftCombo.textContent = stats.leftCombo || 0;
        if (this.elements.rightCombo) this.elements.rightCombo.textContent = stats.rightCombo || 0;
        if (this.elements.gameTimer) this.elements.gameTimer.textContent = this.formatTime(stats.time || 0);
    }
    
    // 対戦結果表示更新
    updateVersusResultDisplay(result) {
        if (this.elements.winnerName) {
            this.elements.winnerName.textContent = result.winner || '引き分け';
        }
        
        if (this.elements.leftFinalScore) this.elements.leftFinalScore.textContent = result.leftScore || 0;
        if (this.elements.rightFinalScore) this.elements.rightFinalScore.textContent = result.rightScore || 0;
        if (this.elements.leftFinalLevel) this.elements.leftFinalLevel.textContent = result.leftLevel || 1;
        if (this.elements.rightFinalLevel) this.elements.rightFinalLevel.textContent = result.rightLevel || 1;
        if (this.elements.leftFinalCombo) this.elements.leftFinalCombo.textContent = result.leftCombo || 0;
        if (this.elements.rightFinalCombo) this.elements.rightFinalCombo.textContent = result.rightCombo || 0;
        if (this.elements.matchTime) this.elements.matchTime.textContent = this.formatTime(result.time || 0);
    }
    
    // イベントハンドラー
    quitVersusGame() {
        if (this.currentVersusGame) {
            // 静的フラグを設定して他の処理をブロック
            UIManager.isQuittingVersusGame = true;
            
            try {
                this.currentVersusGame.quit();
            } catch (error) {
                console.error('対戦ゲーム終了エラー:', error);
            } finally {
                // フラグをリセット
                setTimeout(() => {
                    UIManager.isQuittingVersusGame = false;
                }, 1000);
            }
            
            this.currentVersusGame = null;
        }
        this.backToGameMenu();
    }
    
    playAgainVersus() {
        if (this.currentVersusGame) {
            const mode = this.currentVersusGame.mode;
            if (mode === GameMode.VERSUS_CPU) {
                this.showCpuSetupScreen();
            } else if (mode === GameMode.VERSUS_HUMAN) {
                this.showHumanSetupScreen();
            }
        }
    }
    
    backToGameMenu() {
        this.hideAllVersusScreens();
        // ゲームメニューに戻る（GameUIManagerが管理）
        if (window.gameUIManager) {
            // 選択状態をクリア
            if (window.gameUIManager.clearGameSettings) {
                window.gameUIManager.clearGameSettings();
            }
            window.gameUIManager.showStartScreen();
        }
        
        // レガシーUIManagerの選択状態もクリア
        if (window.uiManager && window.uiManager.clearSelections) {
            window.uiManager.clearSelections();
        }
    }
    
    // ユーティリティメソッド
    hideAllVersusScreens() {
        Object.values(this.screens).forEach(screen => {
            screen?.classList.add('hidden');
        });
    }
    
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    showError(message) {
        console.error(message);
        alert(message);
    }
    
    // 現在の対戦ゲームを取得
    getCurrentVersusGame() {
        return this.currentVersusGame;
    }
    
    // 設定を取得
    getSettings() {
        return {
            cpu: { ...this.settings.cpu },
            human: { ...this.settings.human }
        };
    }
}

// グローバルインスタンス
window.versusUIManager = null;