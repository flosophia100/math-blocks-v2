// メインゲームクラス
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // キャンバスサイズ設定
        this.canvas.width = CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE;
        this.canvas.height = CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;
        
        // ゲーム設定
        this.mode = null;
        this.difficulty = null;
        this.state = GameState.MENU;
        
        // ゲームオブジェクト
        this.calculator = new Calculator();
        this.blockManager = new BlockManager(this.calculator);
        this.inputManager = new InputManager();
        this.uiManager = new UIManager();
        this.scoreManager = new ScoreManager();
        this.userManager = null; // ユーザーマネージャー参照
        
        // ゲーム統計
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.gameTime = 0;
        this.pausedTime = 0;
        this.lastTime = 0;
        
        // 回答時間追跡
        this.answerTimes = []; // 各問題の回答時間を記録
        this.blockCreationTimes = new Map(); // ブロックID -> 作成時刻
        
        // アニメーション管理
        this.animations = [];
        this.wrongAnswerEffect = null;
        
        // タイムアタック用
        this.questionsAnswered = 0;
        this.startTime = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // 入力マネージャーのコールバック設定
        this.inputManager.setAnswerCallback((answer) => this.handleAnswer(answer));
        
        // Cボタン5回クリックでデバッグパネル表示
        this.inputManager.setCButtonCallback(() => {
            if (this.state === GameState.PLAYING) {
                this.uiManager.cButtonClickCount++;
                
                // タイマーリセット
                clearTimeout(this.uiManager.cButtonClickTimer);
                this.uiManager.cButtonClickTimer = setTimeout(() => {
                    this.uiManager.cButtonClickCount = 0;
                }, 2000); // 2秒以内に5回クリック
                
                if (this.uiManager.cButtonClickCount >= 5) {
                    this.uiManager.cButtonClickCount = 0;
                    this.uiManager.showDebugPanel();
                }
            }
        });
        
        // UIボタンのイベント
        this.uiManager.elements.startButton.addEventListener('click', () => this.startGame());
        this.uiManager.elements.pauseBtn.addEventListener('click', () => this.togglePause());
        this.uiManager.elements.quitBtn.addEventListener('click', () => this.quitGame());
        this.uiManager.elements.retryBtn.addEventListener('click', () => this.retry());
        this.uiManager.elements.backToMenuBtn.addEventListener('click', () => this.backToMenu());
        
        // デバッグコールバック設定
        this.uiManager.setDebugCallback((params) => this.applyDebugSettings(params));
        
        // スコアマネージャーを設定
        this.uiManager.setScoreManager(this.scoreManager);
    }
    
    // ユーザーマネージャーを設定
    setUserManager(userManager) {
        this.userManager = userManager;
        this.uiManager.setUserManager(userManager);
        
        // 初期画面の決定
        this.updateInitialScreen();
    }
    
    // 初期画面を決定
    updateInitialScreen() {
        if (!this.userManager) return;
        
        // ユーザー表示を更新
        this.uiManager.updateUserDisplay();
        
        // 適切な画面を表示
        if (this.userManager.isGuest() && !this.userManager.getCurrentUser()) {
            this.uiManager.showScreen('user');
        } else {
            this.uiManager.showScreen('start');
        }
        
        // ESCキーで一時停止、Gキーでゲームオーバーテスト
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state === GameState.PLAYING) {
                this.togglePause();
            }
            // デバッグ用：Gキーでゲームオーバーテスト
            if (e.key === 'g' || e.key === 'G') {
                console.log('Manual game over triggered for testing');
                this.gameOver();
            }
        });
    }
    
    startGame() {
        // ゲーム設定を取得
        const settings = this.uiManager.getGameSettings();
        this.mode = settings.mode;
        this.difficulty = CONFIG.DIFFICULTY[settings.difficulty];
        
        // 計算機の設定
        this.calculator.setOperations(settings.operations);
        
        // 数値範囲の設定
        let initialMaxNum = settings.maxNum;
        let initialMinNum = settings.minNum;
        
        // 特訓モードの場合は設定値を強制的に使用（難易度の影響を受けない）
        if (settings.training) {
            // 特訓モードでは必ず設定通りの範囲を使用
            console.log(`特訓モード [${settings.training}]: 数値範囲 ${initialMinNum}-${initialMaxNum} で固定`);
        } else {
            // 通常モード：ハード・エクストリーム難易度では最初から数値範囲を拡大
            if (this.difficulty.name === 'ハード') {
                initialMaxNum = Math.min(settings.maxNum + 10, 99); // 最初から+10
            } else if (this.difficulty.name === 'エクストリーム') {
                initialMaxNum = Math.min(settings.maxNum + 20, 99); // 最初から+20
            }
        }
        
        this.calculator.setRange(initialMinNum, initialMaxNum);
        this.calculator.setCarryBorrow(settings.carryBorrow || false);
        this.calculator.setNumberRangeIncrease(this.difficulty.numberRangeIncrease);
        this.calculator.setTrainingMode(settings.training !== null);
        this.calculator.setOmiyageMode(settings.omiyageMode || false);
        
        // ブロックマネージャーの難易度設定
        this.blockManager.setDifficulty(this.difficulty, settings.training);
        this.blockManager.setGame(this);
        
        
        // ゲーム状態をリセット
        this.reset();
        
        // ゲーム画面を表示
        this.uiManager.showScreen('game');
        this.state = GameState.PLAYING;
        
        // ゲームループ開始
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop() {
        if (this.state !== GameState.PLAYING && this.state !== GameState.PAUSED && this.state !== GameState.GAME_OVER) {
            return;
        }
        
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (this.state === GameState.PLAYING) {
            this.update(deltaTime);
            this.render();
        } else if (this.state === GameState.PAUSED) {
            // 一時停止時は描画のみ継続（一時停止画面表示）
            this.render();
        } else if (this.state === GameState.GAME_OVER && this.gameOverExplosion) {
            // ゲームオーバー時でも爆発エフェクト中はアニメーション更新
            this.updateAnimations(deltaTime);
            this.render();
        }
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // ゲーム時間更新
        this.gameTime += deltaTime / 1000;
        
        // タイムアタックモードの時間表示とタイムアップチェック
        if (this.mode === GameMode.TIME) {
            const remainingTime = CONFIG.TIME_ATTACK.DURATION - this.gameTime;
            this.uiManager.updateTime(Math.max(0, remainingTime));
            
            // 時間切れチェック
            if (remainingTime <= 0) {
                this.gameComplete();
                return;
            }
        }
        
        // ブロックの更新
        const result = this.blockManager.update(deltaTime, this.level);
        
        // タイムストップ状態の更新
        const timeStopStatus = this.blockManager.getTimeStopStatus();
        this.uiManager.updateTimeStopDisplay(timeStopStatus);
        
        // アニメーションの更新
        this.updateAnimations(deltaTime);
        
        if (result === 'game_over') {
            console.log('Game over triggered by block manager update');
            this.gameOver();
        }
    }
    
    render() {
        // キャンバスをクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 一時停止中は画面を隠して計算式を見えなくする
        if (this.state === GameState.PAUSED) {
            this.renderPauseScreen();
            return;
        }
        
        // ブロックを描画
        this.blockManager.draw(this.ctx, 0, 0);
        
        // アニメーションを描画
        this.renderAnimations();
    }
    
    handleAnswer(answer) {
        if (this.state !== GameState.PLAYING) return;
        
        // 答えをチェック
        const destroyedBlocks = this.blockManager.checkAnswer(answer);
        
        if (destroyedBlocks.length > 0) {
            // 回答時間を計算（最初に破壊されたブロックの作成時刻から現在まで）
            const currentTime = performance.now();
            const firstBlock = destroyedBlocks[0];
            if (this.blockCreationTimes.has(firstBlock.id)) {
                const creationTime = this.blockCreationTimes.get(firstBlock.id);
                const answerTime = (currentTime - creationTime) / 1000; // 秒に変換
                this.answerTimes.push(answerTime);
                // 破壊されたブロックの記録を削除
                this.blockCreationTimes.delete(firstBlock.id);
            }
            
            // 特殊ブロックが破壊された場合は連鎖爆発
            const specialBlocks = destroyedBlocks.filter(block => block.isSpecial);
            let allDestroyedBlocks = [...destroyedBlocks];
            
            specialBlocks.forEach(specialBlock => {
                const chainBlocks = this.blockManager.chainExplosion(specialBlock);
                // 重複を避けて追加
                chainBlocks.forEach(chainBlock => {
                    if (!allDestroyedBlocks.includes(chainBlock)) {
                        allDestroyedBlocks.push(chainBlock);
                    }
                });
            });
            
            // 正解処理
            this.correctAnswers += allDestroyedBlocks.length;
            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            
            // スコア計算（複数ブロック破壊ボーナス）
            allDestroyedBlocks.forEach(block => {
                this.calculateScore(block);
                // 特殊ブロックの破壊ボーナス
                if (block.isSpecial) {
                    this.score += 100; // 特殊ブロックボーナス
                }
            });
            
            // 複数ブロック破壊ボーナス
            if (allDestroyedBlocks.length > 1) {
                this.score += allDestroyedBlocks.length * 50; // ボーナススコア
            }
            
            // 連鎖爆発ボーナス
            if (specialBlocks.length > 0) {
                this.score += specialBlocks.length * 200; // 連鎖ボーナス
                this.showChainExplosionEffect(specialBlocks.length);
            }
            
            // UI更新
            this.uiManager.updateScore(this.score);
            this.uiManager.updateCombo(this.combo);
            this.uiManager.updateStats(this.correctAnswers, this.wrongAnswers, this.answerTimes);
            
            // コンボエフェクト
            if (this.combo >= 5) {
                this.showComboEffect(this.combo);
            }
            
            // レベルアップチェック
            this.checkLevelUp();
        } else {
            // 不正解
            this.wrongAnswers++;
            this.combo = 0;
            this.uiManager.updateCombo(0);
            
            // スコア減点（現在スコアの10%、最低10点）
            const penalty = Math.max(10, Math.floor(this.score * 0.1));
            this.score = Math.max(0, this.score - penalty);
            this.uiManager.updateScore(this.score);
            
            // ペナルティブロック追加
            const penaltyResult = this.blockManager.addPenaltyBlocks();
            if (penaltyResult === 'game_over') {
                console.log('Game over triggered by penalty blocks');
                this.gameOver();
                return;
            }
            
            // 統計更新
            this.uiManager.updateStats(this.correctAnswers, this.wrongAnswers, this.answerTimes);
            
            // ×印エフェクトを表示
            this.showWrongAnswerEffect();
        }
    }
    
    calculateScore(block) {
        let points = CONFIG.SCORE.BASE;
        
        // レベルボーナス
        points *= Math.pow(CONFIG.SCORE.LEVEL_MULTIPLIER, this.level - 1);
        
        // コンボボーナス
        const comboMultipliers = CONFIG.SCORE.COMBO_MULTIPLIERS;
        for (const [threshold, multiplier] of Object.entries(comboMultipliers).reverse()) {
            if (this.combo >= parseInt(threshold)) {
                points *= multiplier;
                break;
            }
        }
        
        // 速度ボーナス（ブロックが上の方にある時に答えた）
        const speedBonus = Math.max(0, (CONFIG.GRID.ROWS - block.row - 1) * CONFIG.SCORE.SPEED_BONUS);
        points += speedBonus;
        
        this.score += Math.floor(points);
    }
    
    checkLevelUp() {
        // 5問正解ごとにレベルアップ
        const levelUpThreshold = this.difficulty.levelUpInterval * this.level;
        
        if (this.correctAnswers >= levelUpThreshold) {
            this.level++;
            this.uiManager.updateLevel(this.level);
            this.uiManager.showLevelUp(this.level);
            
            // 速度調整とブロック数調整
            this.blockManager.adjustSpeedForLevel(this.level, this.difficulty.speedIncrease);
            this.blockManager.adjustBlocksForLevel(this.level, this.difficulty.maxBlocks);
        }
    }
    
    togglePause() {
        if (this.state === GameState.PLAYING) {
            this.state = GameState.PAUSED;
            this.pausedTime = performance.now();
            this.uiManager.elements.pauseBtn.textContent = '再開';
        } else if (this.state === GameState.PAUSED) {
            this.state = GameState.PLAYING;
            // 一時停止していた時間を調整
            const pauseDuration = performance.now() - this.pausedTime;
            this.lastTime += pauseDuration;
            this.uiManager.elements.pauseBtn.textContent = '一時停止';
        }
    }
    
    gameOver() {
        console.log('GameOver called, gameTime:', this.gameTime);
        this.state = GameState.GAME_OVER;
        
        // スコアを記録
        const scoreData = this.createScoreData();
        const scoreResult = this.scoreManager.addScore(scoreData);
        
        // ユーザーデータを記録
        this.recordUserGameResult(scoreData);
        
        const stats = {
            score: this.score,
            level: this.level,
            maxCombo: this.maxCombo,
            mode: this.mode,
            ranking: scoreResult.ranking,
            isHighScore: scoreResult.isHighScore,
            gameData: scoreData // 詳細記録用
        };
        
        // 爆発エフェクトを開始してから画面を表示
        this.showGameOverExplosion(() => {
            this.uiManager.showGameOver(stats);
        });
    }
    
    gameComplete() {
        this.state = GameState.GAME_OVER;
        
        // スコアを記録
        const scoreData = this.createScoreData(this.gameTime);
        const scoreResult = this.scoreManager.addScore(scoreData);
        
        // ユーザーデータを記録
        this.recordUserGameResult(scoreData);
        
        const stats = {
            score: this.score,
            level: this.level,
            maxCombo: this.maxCombo,
            mode: this.mode,
            clearTime: this.gameTime,
            ranking: scoreResult.ranking,
            isHighScore: scoreResult.isHighScore,
            gameData: scoreData // 詳細記録用
        };
        
        // 爆発エフェクトを開始（gameCompleteでも統一）
        this.showGameOverExplosion(() => {
            this.uiManager.showGameOver(stats);
        });
    }
    
    createScoreData(clearTime = null) {
        const settings = this.uiManager.getGameSettings();
        
        // 平均回答時間を計算
        const avgAnswerTime = this.answerTimes.length > 0 ? 
            this.answerTimes.reduce((a, b) => a + b, 0) / this.answerTimes.length : 0;
        
        // ユーザー名を取得
        const currentUser = this.userManager ? this.userManager.getCurrentUser() : null;
        const isGuest = this.userManager ? this.userManager.isGuest() : true;
        const username = isGuest ? 'ゲスト' : (currentUser?.username || 'ゲスト');
        
        // ゲーム時間を記録（clearTimeがあればそれを使用、なければ現在の経過時間）
        const gameTimeInSeconds = clearTime || this.gameTime;
        console.log('Game time recording:', {
            clearTime: clearTime,
            gameTime: this.gameTime,
            finalGameTimeInSeconds: gameTimeInSeconds
        });
        
        return {
            score: this.score,
            maxCombo: this.maxCombo,
            level: this.level,
            mode: this.mode,
            operations: settings.operations || { add: true, sub: true, mul: true, div: true },
            minNum: settings.minNum || 1,
            maxNum: settings.maxNum || 10,
            difficulty: settings.difficulty || 'normal',
            training: settings.training || null, // 特訓モード
            clearTime: clearTime,
            gameTime: Math.round(gameTimeInSeconds), // ゲーム時間（秒）
            correctAnswers: this.correctAnswers,
            wrongAnswers: this.wrongAnswers,
            avgAnswerTime: avgAnswerTime,
            username: username
        };
    }
    
    // ユーザーゲーム結果を記録
    recordUserGameResult(scoreData) {
        if (!this.userManager || this.userManager.isGuest()) return;
        
        const gameData = {
            mode: scoreData.mode,
            difficulty: scoreData.difficulty,
            training: this.uiManager.selectedTraining,
            score: scoreData.score,
            level: scoreData.level,
            combo: scoreData.maxCombo,
            time: scoreData.clearTime || this.gameTime,
            correctAnswers: scoreData.correctAnswers,
            wrongAnswers: scoreData.wrongAnswers,
            avgTime: scoreData.avgAnswerTime
        };
        
        // ゲーム結果を記録（アイテム解放チェック込み）
        const newItems = this.userManager.recordGameResult(gameData);
        
        // 新しいアイテムがあった場合の通知
        if (newItems && newItems.length > 0) {
            this.showNewItemsNotification(newItems);
        }
    }
    
    // 新アイテム通知表示
    showNewItemsNotification(newItems) {
        // アイテム通知のHTML要素取得
        const notification = this.uiManager.elements.newItemsNotification;
        const itemsList = this.uiManager.elements.newItemsList;
        
        if (!notification || !itemsList) return;
        
        // アイテムリストを作成
        itemsList.innerHTML = '';
        newItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.style.cssText = 'margin: 10px 0; text-align: center;';
            itemDiv.innerHTML = `
                <div style="font-size: 32px; margin-bottom: 5px;">🎁</div>
                <div style="font-weight: bold; margin-bottom: 3px;">${item.name}</div>
                <div style="font-size: 12px; color: #666;">${item.description}</div>
            `;
            itemsList.appendChild(itemDiv);
        });
        
        // 通知を表示
        notification.style.display = 'block';
        
        // 5秒後に自動で閉じる
        setTimeout(() => {
            if (notification.style.display === 'block') {
                notification.style.display = 'none';
            }
        }, 5000);
    }
    
    quitGame() {
        this.state = GameState.MENU;
        this.backToMenu();
    }
    
    retry() {
        this.reset();
        this.startGame();
    }
    
    backToMenu() {
        this.state = GameState.MENU;
        this.uiManager.showScreen('start');
        this.reset();
    }
    
    reset() {
        this.score = 0;
        this.level = 1;
        this.combo = 0;
        this.maxCombo = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.gameTime = 0;
        this.questionsAnswered = 0;
        this.answerTimes = [];
        this.blockCreationTimes.clear();
        
        this.blockManager.resetForNewGame();
        this.inputManager.reset();
        this.uiManager.reset();
        
        this.uiManager.elements.pauseBtn.textContent = '一時停止';
    }
    
    applyDebugSettings(params) {
        this.blockManager.setDebugParams(params);
    }
    
    // アニメーション管理メソッド
    updateAnimations(deltaTime) {
        // 間違い答えエフェクト
        if (this.wrongAnswerEffect) {
            this.wrongAnswerEffect.time += deltaTime;
            if (this.wrongAnswerEffect.time >= 1000) { // 1秒で消える
                this.wrongAnswerEffect = null;
            }
        }
        
        // その他のアニメーション更新
        this.animations = this.animations.filter(animation => {
            animation.time += deltaTime;
            return animation.time < animation.duration;
        });
        
        // タイムストップエフェクト更新
        if (this.timeStopEffect) {
            this.timeStopEffect.time += deltaTime;
            if (this.timeStopEffect.time >= this.timeStopEffect.duration) {
                this.timeStopEffect = null;
            }
        }
        
        // ゲームオーバー爆発エフェクト更新
        if (this.gameOverExplosion) {
            this.gameOverExplosion.time += deltaTime;
            
            // パーティクル更新
            this.gameOverExplosion.particles.forEach(particle => {
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
                particle.life -= deltaTime / this.gameOverExplosion.duration;
            });
            
            if (this.gameOverExplosion.time >= this.gameOverExplosion.duration) {
                const callback = this.gameOverExplosion.callback;
                this.gameOverExplosion = null;
                if (callback) {
                    callback();
                }
            }
        }
    }
    
    renderAnimations() {
        // 間違い答えエフェクト（×印）
        if (this.wrongAnswerEffect) {
            const alpha = 1 - (this.wrongAnswerEffect.time / 1000);
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 64px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('×', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.globalAlpha = 1;
        }
        
        // コンボエフェクト
        this.animations.forEach(animation => {
            if (animation.type === 'combo') {
                const progress = animation.time / animation.duration;
                const scale = 1 + Math.sin(progress * Math.PI * 4) * 0.3;
                const alpha = 1 - progress;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = `hsl(${(animation.combo * 30) % 360}, 70%, 50%)`;
                this.ctx.font = `bold ${32 * scale}px sans-serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    `${animation.combo} COMBO!`,
                    this.canvas.width / 2,
                    this.canvas.height / 3
                );
                this.ctx.restore();
            } else if (animation.type === 'chain') {
                const progress = animation.time / animation.duration;
                const scale = 1 + Math.sin(progress * Math.PI * 6) * 0.5;
                const alpha = 1 - progress;
                
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = '#FFD700';
                this.ctx.strokeStyle = '#FF6600';
                this.ctx.lineWidth = 3;
                this.ctx.font = `bold ${48 * scale}px sans-serif`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const text = `CHAIN EXPLOSION! ×${animation.chainCount}`;
                this.ctx.strokeText(text, this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.restore();
            }
        });
        
        // タイムストップエフェクト
        if (this.timeStopEffect) {
            const progress = this.timeStopEffect.time / this.timeStopEffect.duration;
            const alpha = 1 - progress;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            
            // 背景にブルーフィルター効果
            this.ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 中央にアイコンと文字を表示
            this.ctx.fillStyle = CONFIG.TIMESTOP.COLOR;
            this.ctx.font = `bold ${64}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(CONFIG.TIMESTOP.ICON, this.canvas.width / 2, this.canvas.height / 2 - 40);
            
            this.ctx.font = `bold ${24}px sans-serif`;
            this.ctx.fillText('TIME STOP!', this.canvas.width / 2, this.canvas.height / 2 + 20);
            
            this.ctx.restore();
        }
        
        // ゲームオーバー爆発エフェクト
        if (this.gameOverExplosion) {
            const progress = this.gameOverExplosion.time / this.gameOverExplosion.duration;
            
            // 画面全体を赤くする
            this.ctx.save();
            this.ctx.globalAlpha = 0.3 + progress * 0.4; // 徐々に強くなる
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
            
            // パーティクル描画
            this.ctx.save();
            this.gameOverExplosion.particles.forEach(particle => {
                if (particle.life > 0) {
                    this.ctx.globalAlpha = particle.life;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, 3 + (1 - particle.life) * 5, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            });
            this.ctx.restore();
            
            // 中央に「GAME OVER」テキスト（点滅）
            if (progress > 0.5) {
                const textAlpha = Math.sin((this.gameOverExplosion.time - this.gameOverExplosion.duration * 0.5) / 100) * 0.5 + 0.5;
                this.ctx.save();
                this.ctx.globalAlpha = textAlpha;
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = '#ff0000';
                this.ctx.lineWidth = 4;
                this.ctx.font = 'bold 48px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.strokeText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
                this.ctx.restore();
            }
        }
    }
    
    showWrongAnswerEffect() {
        this.wrongAnswerEffect = {
            time: 0
        };
    }
    
    showComboEffect(combo) {
        this.animations.push({
            type: 'combo',
            combo: combo,
            time: 0,
            duration: 2000 // 2秒間表示
        });
    }
    
    showChainExplosionEffect(chainCount) {
        this.animations.push({
            type: 'chain',
            chainCount: chainCount,
            time: 0,
            duration: 3000 // 3秒間表示
        });
    }
    
    showTimeStopEffect() {
        this.timeStopEffect = {
            time: 0,
            duration: 2000 // 2秒間表示
        };
    }
    
    showGameOverExplosion(callback = null) {
        this.gameOverExplosion = {
            time: 0,
            duration: 2000, // 2秒間のエフェクト
            callback: callback,
            particles: []
        };
        
        // パーティクルを生成
        for (let i = 0; i < 50; i++) {
            this.gameOverExplosion.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 400,
                life: 1.0,
                color: `hsl(${Math.random() * 60}, 70%, 50%)` // 赤〜オレンジ系
            });
        }
    }
    
    // 一時停止画面の描画
    renderPauseScreen() {
        // 背景を半透明の黒で覆う
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 一時停止メッセージを表示
        this.ctx.save();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 3;
        this.ctx.font = 'bold 48px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // メッセージに縁取りを追加
        this.ctx.strokeText('一時停止中', centerX, centerY - 40);
        this.ctx.fillText('一時停止中', centerX, centerY - 40);
        
        // 再開方法を表示
        this.ctx.font = 'bold 24px sans-serif';
        this.ctx.strokeText('「再開」ボタンまたはESCキーで再開', centerX, centerY + 20);
        this.ctx.fillText('「再開」ボタンまたはESCキーで再開', centerX, centerY + 20);
        
        // 一時停止アイコンを表示
        this.ctx.font = 'bold 64px sans-serif';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.strokeStyle = '#ff8c00';
        this.ctx.lineWidth = 2;
        this.ctx.strokeText('⏸️', centerX, centerY - 120);
        this.ctx.fillText('⏸️', centerX, centerY - 120);
        
        this.ctx.restore();
    }
}