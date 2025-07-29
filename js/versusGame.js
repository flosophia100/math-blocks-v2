// 対戦モード用ゲームクラス
class VersusGame {
    constructor(mode, difficulty, training = null, cpuLevel = 'normal', playerNames = null) {
        console.log('VersusGame constructor - difficulty:', difficulty);
        this.mode = mode; // 'versus_cpu' or 'versus_human'
        this.difficulty = difficulty;
        this.training = training;
        this.cpuLevel = cpuLevel;
        this.playerNames = playerNames; // プレイヤー名情報
        
        // 両プレイヤーのゲームインスタンス
        this.leftGame = null;
        this.rightGame = null;
        
        // 対戦結果
        this.winner = null;
        this.gameEnded = false;
        this.isRunning = false; // ゲームループ制御フラグ
        
        // CPU関連
        this.cpuPlayer = null;
        if (mode === GameMode.VERSUS_CPU) {
            this.cpuPlayer = new CPUPlayer(cpuLevel);
        }
        
        // 入力マネージャー（対戦用）
        this.leftInputManager = null;
        this.rightInputManager = null;
        
        this.setupCanvases();
        this.setupGames();
    }
    
    setupCanvases() {
        // 既存のキャンバス要素を使用
        this.leftCanvas = document.getElementById('leftGameCanvas');
        this.rightCanvas = document.getElementById('rightGameCanvas');
        
        if (!this.leftCanvas || !this.rightCanvas) {
            console.error('Versus game canvas elements not found');
            return;
        }
        
        // キャンバスサイズを設定
        this.leftCanvas.width = CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE;
        this.leftCanvas.height = CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;
        this.rightCanvas.width = CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE;
        this.rightCanvas.height = CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;
    }
    
    setupGames() {
        console.log('VersusGame: setupGames started');
        
        // 左側のゲーム（CPU対戦時はCPU、人間対戦時はプレイヤー1）
        this.leftGame = new Game(this.leftCanvas);
        if (!this.leftGame) {
            console.error('VersusGame: Failed to create left game');
            return;
        }
        this.leftGame.setVersusMode(true, 'left');
        
        // 対戦モード用にUIManagerを無効化（VersusGameが画面制御を行うため）
        this.leftGame.uiManager = null;
        
        // スコアマネージャーとユーザーマネージャーを設定
        if (window.userManager) {
            this.leftGame.setUserManager(window.userManager);
        }
        // グローバルScoreManagerを使用（新しいインスタンスは作らない）
        if (window.scoreManager) {
            this.leftGame.scoreManager = window.scoreManager;
            console.log('VersusGame: Left game using global scoreManager');
        } else {
            console.error('VersusGame: Global scoreManager not found');
        }
        console.log('VersusGame: Left game created');
        
        // 右側のゲーム（人間プレイヤー）
        this.rightGame = new Game(this.rightCanvas);
        if (!this.rightGame) {
            console.error('VersusGame: Failed to create right game');
            return;
        }
        this.rightGame.setVersusMode(true, 'right');
        
        // 対戦モード用にUIManagerを無効化（VersusGameが画面制御を行うため）
        this.rightGame.uiManager = null;
        
        // スコアマネージャーとユーザーマネージャーを設定
        if (window.userManager) {
            this.rightGame.setUserManager(window.userManager);
        }
        // グローバルScoreManagerを使用（新しいインスタンスは作らない）
        if (window.scoreManager) {
            this.rightGame.scoreManager = window.scoreManager;
            console.log('VersusGame: Right game using global scoreManager');
        } else {
            console.error('VersusGame: Global scoreManager not found');
        }
        console.log('VersusGame: Right game created');
        
        // 相互参照を設定（相手への攻撃用）
        this.leftGame.setOpponent(this.rightGame);
        this.rightGame.setOpponent(this.leftGame);
        console.log('VersusGame: Opponents set');
        
        // 入力マネージャーの設定
        this.setupInputManagers();
        console.log('VersusGame: Input managers setup complete');
        
        // ゲームオーバーコールバックの設定
        this.leftGame.setGameOverCallback(() => this.handleGameOver('right'));
        this.rightGame.setGameOverCallback(() => this.handleGameOver('left'));
        console.log('VersusGame: Game over callbacks set');
    }
    
    setupInputManagers() {
        if (this.mode === GameMode.VERSUS_HUMAN) {
            // 人間対戦時は左側プレイヤー用の特殊キーマッピング
            this.leftInputManager = new VersusInputManager('left');
            this.leftGame.inputManager = this.leftInputManager;
            // 答えコールバックを設定
            this.leftInputManager.setAnswerCallback((answer) => this.leftGame.handleAnswer(answer));
            // Cボタンコールバックも設定
            this.leftInputManager.setCButtonCallback(() => {
                if (this.leftGame.state === GameState.PLAYING) {
                    this.leftGame.uiManager.cButtonClickCount++;
                    clearTimeout(this.leftGame.uiManager.cButtonClickTimer);
                    this.leftGame.uiManager.cButtonClickTimer = setTimeout(() => {
                        this.leftGame.uiManager.cButtonClickCount = 0;
                    }, 2000);
                    if (this.leftGame.uiManager.cButtonClickCount >= 5) {
                        this.leftGame.uiManager.cButtonClickCount = 0;
                        this.leftGame.uiManager.showDebugPanel();
                    }
                }
            });
        }
        
        // 右側は通常の入力マネージャー（テンキー）
        this.rightInputManager = new VersusInputManager('right');
        this.rightGame.inputManager = this.rightInputManager;
        // 答えコールバックを設定
        this.rightInputManager.setAnswerCallback((answer) => this.rightGame.handleAnswer(answer));
        // Cボタンコールバックも設定
        this.rightInputManager.setCButtonCallback(() => {
            if (this.rightGame.state === GameState.PLAYING) {
                this.rightGame.uiManager.cButtonClickCount++;
                clearTimeout(this.rightGame.uiManager.cButtonClickTimer);
                this.rightGame.uiManager.cButtonClickTimer = setTimeout(() => {
                    this.rightGame.uiManager.cButtonClickCount = 0;
                }, 2000);
                if (this.rightGame.uiManager.cButtonClickCount >= 5) {
                    this.rightGame.uiManager.cButtonClickCount = 0;
                    this.rightGame.uiManager.showDebugPanel();
                }
            }
        });
    }
    
    start() {
        console.log('VersusGame: start() called');
        
        // ゲーム設定
        const settings = {
            mode: GameMode.SCORE, // 対戦モードでは常にスコアアタック
            difficulty: this.difficulty,
            training: this.training,
            operations: this.getOperations(),
            minNum: this.getMinNum(),
            maxNum: this.getMaxNum(),
            carryBorrow: this.training === 'sakuranbo',
            omiyageMode: this.training === 'omiyage'
        };
        
        console.log('VersusGame: Starting with settings:', settings);
        console.log('VersusGame: Difficulty object details:', {
            name: this.difficulty?.name,
            minNum: this.difficulty?.minNum,
            maxNum: this.difficulty?.maxNum,
            initialSpeed: this.difficulty?.initialSpeed,
            maxBlocks: this.difficulty?.maxBlocks
        });
        
        // 両ゲームを開始
        console.log('VersusGame: Starting left game');
        this.leftGame.startWithSettings(settings);
        console.log('VersusGame: Starting right game');
        this.rightGame.startWithSettings(settings);
        
        // 対戦モード用に入力コールバックを再設定（確実に設定するため）
        if (this.mode === GameMode.VERSUS_HUMAN && this.leftInputManager && this.leftGame) {
            this.leftInputManager.setAnswerCallback((answer) => {
                // ゲーム終了チェック
                if (this.gameEnded || !this.isRunning) {
                    console.log('VersusGame: Game ended, ignoring left player input');
                    return;
                }
                
                console.log('VersusGame: Left player answer:', answer);
                if (this.leftGame && this.leftGame.handleAnswer && this.leftGame.state === 'playing') {
                    this.leftGame.handleAnswer(answer);
                } else {
                    console.error('VersusGame: leftGame is null, missing handleAnswer method, or not playing', {
                        leftGameExists: !!this.leftGame,
                        hasHandleAnswer: !!(this.leftGame && this.leftGame.handleAnswer),
                        gameState: this.leftGame ? this.leftGame.state : 'null'
                    });
                }
            });
        }
        
        if (this.rightInputManager && this.rightGame) {
            this.rightInputManager.setAnswerCallback((answer) => {
                // ゲーム終了チェック
                if (this.gameEnded || !this.isRunning) {
                    console.log('VersusGame: Game ended, ignoring right player input');
                    return;
                }
                
                console.log('VersusGame: Right player answer:', answer);
                if (this.rightGame && this.rightGame.handleAnswer && this.rightGame.state === 'playing') {
                    this.rightGame.handleAnswer(answer);
                } else {
                    console.error('VersusGame: rightGame is null, missing handleAnswer method, or not playing', {
                        rightGameExists: !!this.rightGame,
                        hasHandleAnswer: !!(this.rightGame && this.rightGame.handleAnswer),
                        gameState: this.rightGame ? this.rightGame.state : 'null'
                    });
                }
            });
        }
        
        console.log('VersusGame: Input callbacks set');
        
        // CPU対戦の場合は初期化が完了してからCPUを開始
        if (this.mode === GameMode.VERSUS_CPU && this.cpuPlayer) {
            setTimeout(() => {
                if (!this.gameEnded && this.leftGame.state === 'playing') {
                    console.log('Starting CPU player');
                    this.cpuPlayer.start(this.leftGame);
                }
            }, 2000); // 2秒後にCPUを開始（十分な初期化時間を確保）
        }
        
        // ゲームループ開始
        this.isRunning = true;
        console.log('VersusGame: Starting game loop');
        this.gameLoop();
    }
    
    gameLoop() {
        // 対戦が終了していても結果表示まで継続
        if (!this.gameEnded) {
            // 両ゲームの更新は各自のgameLoopで行われる
            // 追加の対戦モード固有の処理があればここに記載
            
            // CPU対戦時はデバッグ情報を更新
            if (this.mode === GameMode.VERSUS_CPU && this.cpuPlayer) {
                this.updateCPUDebugDisplay();
            }
        }
        
        // ゲームが実行中の場合のみループを継続
        if (this.isRunning) {
            requestAnimationFrame(() => this.gameLoop());
        } else {
            console.log('VersusGame: Game loop stopped');
        }
    }
    
    updateCPUDebugDisplay() {
        // CPUデバッグ表示要素を取得または作成
        let debugDisplay = document.getElementById('cpuDebugDisplay');
        if (!debugDisplay) {
            debugDisplay = document.createElement('div');
            debugDisplay.id = 'cpuDebugDisplay';
            debugDisplay.style.cssText = `
                position: fixed;
                bottom: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-size: 12px;
                font-family: monospace;
                z-index: 1000;
                display: none;
            `;
            document.body.appendChild(debugDisplay);
        }
        
        // Shift + D でデバッグ表示切り替え
        if (!this.debugKeyListener) {
            this.debugKeyListener = (e) => {
                if (e.shiftKey && e.key === 'D') {
                    debugDisplay.style.display = debugDisplay.style.display === 'none' ? 'block' : 'none';
                }
            };
            document.addEventListener('keydown', this.debugKeyListener);
        }
        
        // デバッグ情報を更新
        if (debugDisplay.style.display !== 'none' && this.cpuPlayer) {
            const accuracy = this.cpuPlayer.totalAnswers > 0 
                ? (this.cpuPlayer.correctAnswers / this.cpuPlayer.totalAnswers * 100).toFixed(1)
                : '0.0';
            
            debugDisplay.innerHTML = `
                <strong>CPU Debug Info</strong><br>
                Level: ${this.cpuPlayer.level} (${this.cpuPlayer.config.name})<br>
                Config Accuracy: ${(this.cpuPlayer.config.accuracy * 100).toFixed(1)}%<br>
                Total Answers: ${this.cpuPlayer.totalAnswers}<br>
                Correct: ${this.cpuPlayer.correctAnswers}<br>
                Wrong: ${this.cpuPlayer.wrongAnswers}<br>
                Actual Accuracy: ${accuracy}%<br>
                <small>Press Shift+D to toggle</small>
            `;
        }
    }
    
    handleGameOver(winner) {
        console.log('VersusGame: handleGameOver called with winner:', winner, 'gameEnded:', this.gameEnded);
        
        // 重複実行を完全に防ぐ
        if (this.gameEnded) {
            console.log('VersusGame: handleGameOver already processed, ignoring');
            return;
        }
        
        console.log('VersusGame: Processing game over...');
        this.gameEnded = true;
        this.winner = winner;
        this.isRunning = false; // VersusGameのループも停止
        
        // CPUを停止
        if (this.cpuPlayer) {
            this.cpuPlayer.stop();
        }
        
        // 両ゲームのブロック処理を確実に停止
        if (this.leftGame) {
            this.leftGame.state = 'game_over';
            this.leftGame.isRunning = false;
            // ゲームループを確実に停止
            this.leftGame.stop();
            // ブロックマネージャーを停止
            if (this.leftGame.blockManager) {
                this.leftGame.blockManager.clear();
            }
        }
        if (this.rightGame) {
            this.rightGame.state = 'game_over';
            this.rightGame.isRunning = false;
            // ゲームループを確実に停止
            this.rightGame.stop();
            // ブロックマネージャーを停止
            if (this.rightGame.blockManager) {
                this.rightGame.blockManager.clear();
            }
        }
        
        // 対戦モードのスコアを記録
        this.recordVersusScores();
        
        // 対戦結果を表示
        this.showResult();
    }
    
    recordVersusScores() {
        console.log('DEBUG: recordVersusScores called');
        console.log('DEBUG: mode:', this.mode);
        console.log('DEBUG: playerNames:', this.playerNames);
        
        // 両プレイヤーのスコアを記録
        if (this.leftGame && this.rightGame) {
            if (this.mode === GameMode.VERSUS_CPU) {
                // CPU対戦時：右側のプレイヤーのスコアのみ記録（左側はCPU）
                console.log('DEBUG: Recording player score (right side)');
                this.recordPlayerScore(this.rightGame, 'プレイヤー');
            } else if (this.mode === GameMode.VERSUS_HUMAN) {
                // 人間対戦時：左側はプレイヤー1、右側はプレイヤー2
                const leftPlayerName = this.playerNames && this.playerNames.player1 ? this.playerNames.player1 : 'プレイヤー1';
                const rightPlayerName = this.playerNames && this.playerNames.player2 ? this.playerNames.player2 : 'プレイヤー2';
                console.log('DEBUG: Recording left player score for:', leftPlayerName);
                this.recordPlayerScore(this.leftGame, leftPlayerName);
                console.log('DEBUG: Recording right player score for:', rightPlayerName);
                this.recordPlayerScore(this.rightGame, rightPlayerName);
            }
        }
    }
    
    recordPlayerScore(game, playerName) {
        try {
            // 対戦モード用のスコアデータを作成
            const versusMode = this.mode === GameMode.VERSUS_CPU ? 'CPU対戦' : '2P対戦';
            
            const scoreData = {
                score: game.score,
                maxCombo: game.maxCombo,
                level: game.level,
                mode: versusMode, // 対戦モードを識別
                operations: this.getOperations(),
                minNum: this.getMinNum(),
                maxNum: this.getMaxNum(),
                difficulty: this.difficulty?.name || 'normal', // 難易度名を文字列で保存
                training: this.training,
                correctAnswers: game.correctAnswers,
                wrongAnswers: game.wrongAnswers,
                avgAnswerTime: game.answerTimes.length > 0 ? 
                    game.answerTimes.reduce((a, b) => a + b, 0) / game.answerTimes.length : 0,
                gameTime: game.gameTime,
                username: playerName,
                timestamp: new Date().toISOString(),
                isGuest: true // 対戦モードでは全員ゲスト扱い
            };
            
            // スコアマネージャーに記録
            if (game.scoreManager) {
                console.log('DEBUG: Adding score to scoreManager for:', playerName);
                console.log('DEBUG: Score data being added:', scoreData);
                game.scoreManager.addScore(scoreData);
                
                // 実際に保存されたかを確認
                const allScores = game.scoreManager.getAllScores();
                const justAdded = allScores.find(s => 
                    s.score === scoreData.score && 
                    s.username === playerName && 
                    Math.abs(new Date(s.timestamp) - new Date(scoreData.timestamp)) < 1000
                );
                console.log('DEBUG: Score successfully saved?', !!justAdded);
                if (justAdded) {
                    console.log('DEBUG: Saved score data:', justAdded);
                }
            } else {
                console.log('ERROR: scoreManager not found for:', playerName);
            }
            
            // ユーザーマネージャーに記録
            if (game.userManager) {
                console.log('DEBUG: Recording game result to userManager for:', playerName);
                game.userManager.recordGameResult(scoreData);
            } else {
                console.log('ERROR: userManager not found for:', playerName);
            }
            
            console.log(`Versus score recorded for ${playerName}:`, scoreData);
        } catch (error) {
            console.error(`Error recording versus score for ${playerName}:`, error);
        }
    }
    
    showResult() {
        // 対戦結果をオーバーレイ表示
        const winnerText = this.winner === 'left' ? 
            (this.mode === GameMode.VERSUS_CPU ? 'CPU' : 'プレイヤー1') : 
            'プレイヤー2';
        
        // 結果をオーバーレイで表示
        this.showGameOverOverlay(winnerText, this.leftGame.score, this.rightGame.score);
    }
    
    showGameOverOverlay(winner, leftScore, rightScore) {
        // CPUデバッグ情報を取得
        let cpuDebugHTML = '';
        if (this.mode === GameMode.VERSUS_CPU && this.cpuPlayer) {
            const report = this.cpuPlayer.getDebugReport();
            if (report && report !== 'デバッグログがありません。') {
                cpuDebugHTML = `
                    <div class="cpu-debug-info" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px; font-size: 14px;">
                        <h4>CPU デバッグ情報</h4>
                        <p>レベル: ${report.summary.level} (${report.summary.configName})</p>
                        <p>総回答数: ${report.summary.totalAnswers}</p>
                        <p>正解数: ${report.summary.correctAnswers} (実際: ${report.summary.actualAccuracy})</p>
                        <p>間違い数: ${report.summary.wrongAnswers}</p>
                        <p>設定正答率: ${report.summary.configuredAccuracy}</p>
                        <button id="showDetailedDebugLog" style="margin-top: 10px; padding: 5px 10px;">詳細ログを表示</button>
                    </div>
                `;
            }
        }
        
        // オーバーレイ要素を作成
        const overlay = document.createElement('div');
        overlay.className = 'versus-result-overlay';
        overlay.innerHTML = `
            <div class="versus-result-content">
                <div class="fireworks-container">
                    <div class="firework"></div>
                    <div class="firework"></div>
                    <div class="firework"></div>
                    <div class="firework"></div>
                </div>
                <div class="trophy-icon">🏆</div>
                <h1 class="result-title">対戦結果</h1>
                <div class="versus-winner winner-animation">
                    <div class="crown">👑</div>
                    <h2 class="winner-text">勝者: ${winner}</h2>
                    <div class="celebration-text">おめでとうございます！</div>
                </div>
                <div class="versus-final-scores">
                    <div class="final-score-item ${winner === (this.mode === GameMode.VERSUS_CPU ? 'CPU' : 'プレイヤー1') ? 'winner-score' : ''}">
                        <h3>${this.mode === GameMode.VERSUS_CPU ? 'CPU' : 'プレイヤー1'}</h3>
                        <div class="score-number">${leftScore}</div>
                    </div>
                    <div class="vs-divider">VS</div>
                    <div class="final-score-item ${winner === 'プレイヤー2' ? 'winner-score' : ''}">
                        <h3>プレイヤー2</h3>
                        <div class="score-number">${rightScore}</div>
                    </div>
                </div>
                ${cpuDebugHTML}
                <div class="confetti">
                    ${Array.from({length: 20}, (_, i) => `<div class="confetti-piece" style="left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 3}s;"></div>`).join('')}
                </div>
                <div class="versus-result-actions">
                    <button class="versus-rematch-btn animated-button">🔄 再戦</button>
                    <button class="versus-back-btn animated-button">🏠 メニューに戻る</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // DOMが更新されるのを待ってからイベントを設定
        setTimeout(() => {
            const rematchBtn = overlay.querySelector('.versus-rematch-btn');
            const backBtn = overlay.querySelector('.versus-back-btn');
            const debugLogBtn = overlay.querySelector('#showDetailedDebugLog');
            
            if (rematchBtn) {
                rematchBtn.addEventListener('click', () => {
                    console.log('Rematch button clicked');
                    document.body.removeChild(overlay);
                    this.restart();
                });
            }
            
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    console.log('Back button clicked');
                    document.body.removeChild(overlay);
                    // VersusGameインスタンスを破棄
                    this.destroy();
                    // 対戦画面を非表示にしてメニューに戻る
                    document.getElementById('versusGameScreen').style.display = 'none';
                    document.getElementById('startScreen').style.display = 'block';
                    
                    // 選択状態をクリア
                    if (window.gameUIManager && window.gameUIManager.clearGameSettings) {
                        window.gameUIManager.clearGameSettings();
                    }
                    if (window.uiManager && window.uiManager.clearSelections) {
                        window.uiManager.clearSelections();
                    }
                });
            }
            
            if (debugLogBtn && this.cpuPlayer) {
                debugLogBtn.addEventListener('click', () => {
                    console.log('\n===== CPU 詳細デバッグログ =====');
                    if (this.cpuPlayer) {
                        this.cpuPlayer.printDebugStats();
                        const report = this.cpuPlayer.getDebugReport();
                        console.log('全詳細ログ:');
                        console.table(report.details);
                    }
                    alert('詳細ログをコンソールに出力しました。\nF12キーでコンソールを開いて確認してください。');
                });
            }
        }, 100);
    }
    
    restart() {
        console.log('VersusGame: restart() called');
        
        // ゲーム状態をリセット
        this.gameEnded = false;
        this.winner = null;
        
        // CPUを停止
        if (this.cpuPlayer) {
            this.cpuPlayer.stop();
            this.cpuPlayer = null;
        }
        
        // CPU対戦の場合は新しいCPUプレイヤーを作成
        if (this.mode === GameMode.VERSUS_CPU) {
            this.cpuPlayer = new CPUPlayer(this.cpuLevel);
        }
        
        // 既存のゲームをリセット
        this.resetGames();
        
        // 新しいゲームを即座に開始
        this.start();
        
        console.log('VersusGame: restart completed, new game started');
    }
    
    resetGames() {
        // ゲームインスタンスをリセット
        if (this.leftGame) {
            this.leftGame.reset();
        }
        if (this.rightGame) {
            this.rightGame.reset();
        }
        
        // キャンバスをクリア
        if (this.leftCanvas) {
            const ctx = this.leftCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.leftCanvas.width, this.leftCanvas.height);
        }
        if (this.rightCanvas) {
            const ctx = this.rightCanvas.getContext('2d');
            ctx.clearRect(0, 0, this.rightCanvas.width, this.rightCanvas.height);
        }
        
        // スコア表示をリセット
        this.resetVersusDisplay();
    }
    
    resetVersusDisplay() {
        // 左プレイヤーのスコア表示をリセット
        const leftScore = document.getElementById('leftScore');
        const leftCombo = document.getElementById('leftCombo');
        const leftAnswerDisplay = document.getElementById('leftAnswerDisplay');
        
        if (leftScore) leftScore.textContent = '0';
        if (leftCombo) leftCombo.textContent = '0';
        if (leftAnswerDisplay) leftAnswerDisplay.value = '';
        
        // 右プレイヤーのスコア表示をリセット
        const rightScore = document.getElementById('rightScore');
        const rightCombo = document.getElementById('rightCombo');
        const rightAnswerDisplay = document.getElementById('rightAnswerDisplay');
        
        if (rightScore) rightScore.textContent = '0';
        if (rightCombo) rightCombo.textContent = '0';
        if (rightAnswerDisplay) rightAnswerDisplay.value = '';
    }
    
    getOperations() {
        if (this.training) {
            const trainingConfig = CONFIG.TRAINING_MODES[this.training];
            return trainingConfig?.operations || { add: true, sub: true, mul: true, div: true };
        }
        return { add: true, sub: true, mul: true, div: true };
    }
    
    getMinNum() {
        if (this.training) {
            const trainingConfig = CONFIG.TRAINING_MODES[this.training];
            return trainingConfig?.minNum || 1;
        }
        // 難易度に基づいて数値範囲を決定
        if (this.difficulty && this.difficulty.minNum !== undefined) {
            return this.difficulty.minNum;
        }
        return 1;
    }
    
    getMaxNum() {
        if (this.training) {
            const trainingConfig = CONFIG.TRAINING_MODES[this.training];
            return trainingConfig?.maxNum || 10;
        }
        // 難易度に基づいて数値範囲を決定
        if (this.difficulty && this.difficulty.maxNum !== undefined) {
            return this.difficulty.maxNum;
        }
        return 10;
    }
    
    pause() {
        this.leftGame.togglePause();
        this.rightGame.togglePause();
    }
    
    quit() {
        this.gameEnded = true;
        if (this.cpuPlayer) {
            this.cpuPlayer.stop();
        }
        
        // ゲームインスタンスを停止
        if (this.leftGame) {
            this.leftGame.stop();
        }
        if (this.rightGame) {
            this.rightGame.stop();
        }
        
        console.log('VersusGame: quit() - games stopped');
    }
    
    // VersusGameインスタンス自体を停止
    destroy() {
        console.log('VersusGame: destroy() called');
        
        // ゲーム終了フラグを設定
        this.gameEnded = true;
        this.isRunning = false;
        
        // CPUプレイヤーを停止
        if (this.cpuPlayer) {
            this.cpuPlayer.stop();
            this.cpuPlayer = null;
        }
        
        // 左右のゲームインスタンスを完全に停止
        if (this.leftGame) {
            this.leftGame.isRunning = false;
            this.leftGame.state = 'game_over';
            if (this.leftGame.blockManager) {
                this.leftGame.blockManager.clear();
            }
            if (this.leftGame.hintSystem && this.leftGame.hintSystem.stop) {
                this.leftGame.hintSystem.stop();
            }
            this.leftGame = null;
        }
        
        if (this.rightGame) {
            this.rightGame.isRunning = false;
            this.rightGame.state = 'game_over';
            if (this.rightGame.blockManager) {
                this.rightGame.blockManager.clear();
            }
            if (this.rightGame.hintSystem && this.rightGame.hintSystem.stop) {
                this.rightGame.hintSystem.stop();
            }
            this.rightGame = null;
        }
        
        // 入力マネージャーをクリーンアップ
        if (this.leftInputManager && this.leftInputManager.destroy) {
            this.leftInputManager.destroy();
        }
        this.leftInputManager = null;
        
        if (this.rightInputManager && this.rightInputManager.destroy) {
            this.rightInputManager.destroy();
        }
        this.rightInputManager = null;
        
        // その他のプロパティをクリア
        this.winner = null;
        this.playerNames = null;
        
        console.log('VersusGame: destroyed completely');
    }
}

// 対戦用入力マネージャー
class VersusInputManager extends InputManager {
    constructor(side) {
        super();
        this.side = side; // 'left' or 'right'
        this.setupAnswerDisplay();
        this.setupVersusEventListeners();
    }
    
    setupAnswerDisplay() {
        // 対戦モード用の入力表示を設定
        if (this.side === 'left') {
            this.answerDisplay = document.getElementById('leftAnswerDisplay');
        } else {
            this.answerDisplay = document.getElementById('rightAnswerDisplay');
        }
    }
    
    updateDisplay() {
        if (this.answerDisplay) {
            this.answerDisplay.value = this.currentInput;
        }
    }
    
    setupVersusEventListeners() {
        // 対戦画面のボタンクリックイベントを設定
        this.setupButtonEventListeners();
        
        if (this.side === 'left') {
            // 左側プレイヤー用の特殊キーマッピング
            this.keydownHandler = (e) => {
                // ゲーム画面が表示されている時のみ
                const versusScreen = document.getElementById('versusGameScreen');
                if (!versusScreen || versusScreen.style.display === 'none') return;
                
                const keyMappings = CONFIG.VERSUS.LEFT_PLAYER_KEYS;
                
                // 数字キーのマッピング
                for (const [num, keys] of Object.entries(keyMappings)) {
                    if (keys.includes(e.key)) {
                        if (num === 'ok') {
                            this.submit();
                        } else if (num === 'clear') {
                            this.clear();
                            if (this.onCButtonClick) {
                                this.onCButtonClick();
                            }
                        } else {
                            this.appendNumber(num);
                        }
                        e.preventDefault();
                        break;
                    }
                }
            };
            document.addEventListener('keydown', this.keydownHandler);
        } else {
            // 右側プレイヤーのテンキー入力
            this.keydownHandler = (e) => {
                // ゲーム画面が表示されている時のみ
                const versusScreen = document.getElementById('versusGameScreen');
                if (!versusScreen || versusScreen.style.display === 'none') return;
                
                // 標準のテンキー入力をサポート
                if (e.key >= '0' && e.key <= '9') {
                    this.appendNumber(e.key);
                    e.preventDefault();
                } else if (e.key === 'Enter') {
                    this.submit();
                    e.preventDefault();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    this.clear();
                    if (this.onCButtonClick) {
                        this.onCButtonClick();
                    }
                    e.preventDefault();
                }
            };
            document.addEventListener('keydown', this.keydownHandler);
        }
    }
    
    setupButtonEventListeners() {
        // 新しいHTMLレイアウトではボタンクリックイベントは不要
        // キーボード入力のみを使用
    }
    
    // 入力マネージャーのクリーンアップ
    destroy() {
        console.log(`VersusInputManager[${this.side}]: Destroying and removing event listeners`);
        
        // キーイベントリスナーを削除
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        
        // answerCallbackをクリア
        this.answerCallback = null;
        
        // 表示要素をクリア
        this.answerDisplay = null;
        
        console.log(`VersusInputManager[${this.side}]: Destroyed successfully`);
    }
}

// CPUプレイヤークラス
class CPUPlayer {
    constructor(level) {
        this.level = level;
        this.config = CONFIG.VERSUS.CPU_DIFFICULTY[level];
        if (!this.config) {
            console.error(`CPU Level "${level}" not found in CONFIG.VERSUS.CPU_DIFFICULTY`);
            // デフォルト設定を使用
            this.config = CONFIG.VERSUS.CPU_DIFFICULTY.normal;
        }
        this.active = false;
        this.game = null;
        this.currentBlock = null;
        this.thinkingTimeout = null;
        
        // 統計追跡
        this.totalAnswers = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        
        // デバッグログ機能
        this.debugLog = [];
        this.enableDebugLog = true;
    }
    
    start(game) {
        this.game = game;
        this.active = true;
        
        // 起動時に設定情報をログ出力（簡潔に）
        console.log(`[CPU] Starting Level ${this.level} (${(this.config.accuracy * 100).toFixed(1)}% accuracy)`);
        
        this.think();
    }
    
    stop() {
        this.active = false;
        if (this.thinkingTimeout) {
            clearTimeout(this.thinkingTimeout);
            this.thinkingTimeout = null;
        }
    }
    
    think() {
        if (!this.active || !this.game) {
            return;
        }
        
        // ゲームが開始されており、ゲームオーバーしていないかチェック
        if (this.game.state !== 'playing') {
            setTimeout(() => this.think(), 300);
            return;
        }
        
        // ブロックマネージャーが存在し、正常に動作しているかチェック
        if (!this.game.blockManager) {
            setTimeout(() => this.think(), 300);
            return;
        }
        
        // 答えられるブロックを探す
        const blocks = this.game.blockManager.getAnswerableBlocks();
        if (blocks && blocks.length > 0) {
            // ランダムに一つ選ぶ（上の方を優先）
            const targetBlock = this.selectTargetBlock(blocks);
            
            if (targetBlock) {
                // 反応時間を計算
                const [minTime, maxTime] = this.config.responseTime;
                const responseTime = Math.random() * (maxTime - minTime) + minTime;
                
                this.thinkingTimeout = setTimeout(() => {
                    this.answerBlock(targetBlock);
                }, responseTime);
                
                return;
            }
        }
        
        // 次の思考サイクル
        setTimeout(() => this.think(), 300);
    }
    
    selectTargetBlock(blocks) {
        // 上の方にあるブロックを優先的に選ぶ
        blocks.sort((a, b) => b.row - a.row);
        
        // 難易度に応じて選択
        if (this.level === 'hard') {
            // ハードは常に最上部のブロックを選ぶ
            return blocks[0];
        } else {
            // それ以外はある程度ランダムに
            const index = Math.floor(Math.random() * Math.min(3, blocks.length));
            return blocks[index];
        }
    }
    
    answerBlock(block) {
        if (!this.active || !this.game) return;
        
        // ブロックがまだ存在するか確認
        const currentBlocks = this.game.blockManager.getAnswerableBlocks();
        const blockStillExists = currentBlocks.some(b => 
            b.row === block.row && 
            b.col === block.col && 
            b.problem.answer === block.problem.answer
        );
        
        if (!blockStillExists) {
            // ブロックが既に破壊されている場合はログ出力せずに次の思考へ
            setTimeout(() => this.think(), 100);
            return;
        }
        
        const answer = block.problem.answer;
        const randomValue = Math.random();
        
        this.totalAnswers++;
        
        const logEntry = {
            timestamp: new Date().toISOString(),
            problem: `${block.problem.num1} ${block.problem.operation} ${block.problem.num2}`,
            correctAnswer: answer,
            randomValue: randomValue,
            accuracy: this.config.accuracy,
            shouldBeCorrect: randomValue < this.config.accuracy
        };
        
        // 正答率に基づいて正解するか決定
        let actualResult;
        if (randomValue < this.config.accuracy) {
            // 正解を入力する予定
            logEntry.result = 'correct_intended';
            logEntry.inputAnswer = answer;
            actualResult = this.inputAnswer(answer);
        } else {
            // わざと間違える
            const wrongAnswer = answer + (Math.random() > 0.5 ? 1 : -1);
            logEntry.result = 'wrong_intended';
            logEntry.inputAnswer = Math.max(0, wrongAnswer);
            actualResult = this.inputAnswer(Math.max(0, wrongAnswer));
        }
        
        // 簡単な統計更新
        if (randomValue < this.config.accuracy) {
            this.correctAnswers++;
        } else {
            this.wrongAnswers++;
        }
        
        // 20回ごとに統計表示（ログ削減）
        if (this.totalAnswers % 20 === 0) {
            console.log(`[CPU-STATS] ${this.totalAnswers}回答済み - 正答率: ${(this.correctAnswers/this.totalAnswers*100).toFixed(1)}%`);
        }
        
        // デバッグログに追加
        if (this.enableDebugLog) {
            this.debugLog.push(logEntry);
        }
        
        
        // 次の思考サイクルは入力完了後に実行
        // 200msは削除して、入力完了後に再開
    }
    
    inputAnswer(answer) {
        if (!this.game || !this.game.inputManager) return;
        
        // 答えを入力
        const answerStr = answer.toString();
        for (const digit of answerStr) {
            this.game.inputManager.appendNumber(digit);
        }
        
        // 少し待ってから確定し、完了後に次の思考を開始
        setTimeout(() => {
            this.game.inputManager.submit();
            // 入力完了後、少し待ってから次の思考サイクルを開始
            setTimeout(() => this.think(), 500);
        }, 50);
    }
    
    printDebugStats() {
        if (!this.debugLog.length) return;
        
        console.log('\n===== CPU デバッグ統計 =====');
        console.log(`総回答数: ${this.totalAnswers}`);
        console.log(`正解数: ${this.correctAnswers} (${(this.correctAnswers / this.totalAnswers * 100).toFixed(1)}%)`);
        console.log(`間違い数: ${this.wrongAnswers} (${(this.wrongAnswers / this.totalAnswers * 100).toFixed(1)}%)`);
        console.log(`設定正答率: ${(this.config.accuracy * 100).toFixed(1)}%`);
        
        // 直近10回の詳細
        const recent = this.debugLog.slice(-10);
        console.log('\n直近10回の詳細:');
        recent.forEach((log, i) => {
            console.log(`${i+1}. ${log.problem} = ${log.correctAnswer}`);
            console.log(`   乱数: ${log.randomValue.toFixed(3)}, 閾値: ${log.accuracy}, 結果: ${log.result}, 入力: ${log.inputAnswer}`);
        });
        console.log('==========================\n');
    }
    
    getDebugReport() {
        if (!this.debugLog.length) return 'デバッグログがありません。';
        
        const report = {
            summary: {
                totalAnswers: this.totalAnswers,
                correctAnswers: this.correctAnswers,
                wrongAnswers: this.wrongAnswers,
                actualAccuracy: (this.correctAnswers / this.totalAnswers * 100).toFixed(1) + '%',
                configuredAccuracy: (this.config.accuracy * 100).toFixed(1) + '%',
                level: this.level,
                configName: this.config.name
            },
            details: this.debugLog.slice(-20) // 直近20件の詳細
        };
        
        return report;
    }
}