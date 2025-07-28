// 対戦ゲーム用ヘルパークラスとユーティリティ

// 対戦ゲーム設定クラス
class VersusGameConfig {
    constructor(mode, difficulty, training = null, cpuLevel = 'normal', playerNames = null) {
        this.mode = mode;
        this.difficulty = difficulty;
        this.training = training;
        this.cpuLevel = cpuLevel;
        this.playerNames = playerNames;
        
        // 設定の検証
        this.validate();
    }
    
    validate() {
        const validModes = [GameMode.VERSUS_CPU, GameMode.VERSUS_HUMAN];
        if (!validModes.includes(this.mode)) {
            throw new Error(`Invalid versus mode: ${this.mode}`);
        }
        
        const validDifficulties = ['easy', 'normal', 'hard'];
        if (!validDifficulties.includes(this.difficulty)) {
            throw new Error(`Invalid difficulty: ${this.difficulty}`);
        }
        
        if (this.mode === GameMode.VERSUS_CPU && !this.cpuLevel) {
            this.cpuLevel = 'normal';
        }
        
        if (this.mode === GameMode.VERSUS_HUMAN && !this.playerNames) {
            this.playerNames = { player1: 'プレイヤー1', player2: 'プレイヤー2' };
        }
    }
    
    // 設定を複製
    clone() {
        return new VersusGameConfig(
            this.mode,
            this.difficulty,
            this.training,
            this.cpuLevel,
            this.playerNames ? { ...this.playerNames } : null
        );
    }
    
    // 表示用の情報を取得
    getDisplayInfo() {
        return {
            mode: this.getModeDisplayName(),
            difficulty: this.getDifficultyDisplayName(),
            training: this.training ? this.getTrainingDisplayName() : 'なし',
            players: this.getPlayerDisplayNames()
        };
    }
    
    getModeDisplayName() {
        const names = {
            [GameMode.VERSUS_CPU]: 'CPU対戦',
            [GameMode.VERSUS_HUMAN]: '2P対戦'
        };
        return names[this.mode] || this.mode;
    }
    
    getDifficultyDisplayName() {
        const names = {
            'easy': 'やさしい',
            'normal': 'ふつう',
            'hard': 'むずかしい'
        };
        return names[this.difficulty] || this.difficulty;
    }
    
    getTrainingDisplayName() {
        const names = {
            'calculation': '計算特訓',
            'speed': 'スピード特訓',
            'accuracy': '正確性特訓'
        };
        return names[this.training] || this.training;
    }
    
    getPlayerDisplayNames() {
        if (this.mode === GameMode.VERSUS_CPU) {
            return { left: 'あなた', right: 'CPU' };
        } else {
            return {
                left: this.playerNames?.player1 || 'プレイヤー1',
                right: this.playerNames?.player2 || 'プレイヤー2'
            };
        }
    }
}

// 対戦ゲーム結果クラス
class VersusGameResult {
    constructor() {
        this.winner = null;
        this.leftPlayer = {
            score: 0,
            level: 1,
            combo: 0,
            time: 0,
            name: 'プレイヤー1'
        };
        this.rightPlayer = {
            score: 0,
            level: 1,
            combo: 0,
            time: 0,
            name: 'プレイヤー2'
        };
        this.matchTime = 0;
        this.endReason = null; // 'game_over', 'quit', 'timeout'
    }
    
    setWinner(winner) {
        this.winner = winner; // 'left', 'right', 'draw'
    }
    
    updatePlayerData(side, gameData) {
        const player = side === 'left' ? this.leftPlayer : this.rightPlayer;
        player.score = gameData.score || 0;
        player.level = gameData.level || 1;
        player.combo = gameData.combo || 0;
        player.time = gameData.gameTime || 0;
    }
    
    setPlayerNames(leftName, rightName) {
        this.leftPlayer.name = leftName;
        this.rightPlayer.name = rightName;
    }
    
    setMatchTime(time) {
        this.matchTime = time;
    }
    
    setEndReason(reason) {
        this.endReason = reason;
    }
    
    // 勝者を判定
    determineWinner() {
        if (this.leftPlayer.score > this.rightPlayer.score) {
            this.winner = 'left';
        } else if (this.rightPlayer.score > this.leftPlayer.score) {
            this.winner = 'right';
        } else {
            this.winner = 'draw';
        }
        return this.winner;
    }
    
    // 表示用の勝者名を取得
    getWinnerDisplayName() {
        if (this.winner === 'left') {
            return this.leftPlayer.name;
        } else if (this.winner === 'right') {
            return this.rightPlayer.name;
        } else {
            return '引き分け';
        }
    }
    
    // 結果をJSON形式で取得
    toJSON() {
        return {
            winner: this.winner,
            winnerName: this.getWinnerDisplayName(),
            leftPlayer: { ...this.leftPlayer },
            rightPlayer: { ...this.rightPlayer },
            matchTime: this.matchTime,
            endReason: this.endReason,
            timestamp: new Date().toISOString()
        };
    }
}

// 対戦ゲーム状態管理クラス
class VersusGameState {
    constructor() {
        this.state = 'setup'; // 'setup', 'playing', 'paused', 'finished'
        this.startTime = null;
        this.endTime = null;
        this.pauseTime = null;
        this.totalPauseTime = 0;
        this.stateChangeCallbacks = new Map();
    }
    
    // 状態変更コールバックを登録
    onStateChange(state, callback) {
        if (!this.stateChangeCallbacks.has(state)) {
            this.stateChangeCallbacks.set(state, []);
        }
        this.stateChangeCallbacks.get(state).push(callback);
    }
    
    // 状態を変更
    setState(newState) {
        const oldState = this.state;
        this.state = newState;
        
        // 特別な処理
        switch (newState) {
            case 'playing':
                if (!this.startTime) {
                    this.startTime = Date.now();
                } else if (this.pauseTime) {
                    // ポーズから復帰
                    this.totalPauseTime += Date.now() - this.pauseTime;
                    this.pauseTime = null;
                }
                break;
            case 'paused':
                this.pauseTime = Date.now();
                break;
            case 'finished':
                this.endTime = Date.now();
                break;
        }
        
        // コールバックを実行
        if (this.stateChangeCallbacks.has(newState)) {
            this.stateChangeCallbacks.get(newState).forEach(callback => {
                try {
                    callback(newState, oldState);
                } catch (error) {
                    console.error('State change callback error:', error);
                }
            });
        }
    }
    
    // 経過時間を取得（ポーズ時間を除く）
    getElapsedTime() {
        if (!this.startTime) return 0;
        
        const now = this.endTime || Date.now();
        const pauseTime = this.state === 'paused' ? 
            (Date.now() - this.pauseTime) : 0;
        
        return (now - this.startTime - this.totalPauseTime - pauseTime) / 1000;
    }
    
    // 現在の状態を確認
    isState(state) {
        return this.state === state;
    }
    
    // プレイ中かどうか
    isPlaying() {
        return this.state === 'playing';
    }
    
    // ポーズ中かどうか
    isPaused() {
        return this.state === 'paused';
    }
    
    // 終了したかどうか
    isFinished() {
        return this.state === 'finished';
    }
}

// 対戦入力管理ユーティリティ（リファクタリング版）
class VersusInputManagerRefactored {
    constructor() {
        this.inputMappings = new Map();
        this.activeInputs = new Set();
        this.keydownHandler = this.handleKeydown.bind(this);
        this.keyupHandler = this.handleKeyup.bind(this);
    }
    
    // 入力マッピングを登録
    registerInputMapping(playerId, keyMapping) {
        this.inputMappings.set(playerId, keyMapping);
    }
    
    // イベントリスナーを開始
    startListening() {
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
    }
    
    // イベントリスナーを停止
    stopListening() {
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        this.activeInputs.clear();
    }
    
    // キーダウンハンドラー
    handleKeydown(event) {
        const key = event.key.toLowerCase();
        
        // 既に押されているキーは無視
        if (this.activeInputs.has(key)) return;
        
        this.activeInputs.add(key);
        
        // 各プレイヤーの入力をチェック
        this.inputMappings.forEach((mapping, playerId) => {
            const action = this.getActionForKey(mapping, key);
            if (action) {
                this.triggerPlayerAction(playerId, action, event);
            }
        });
    }
    
    // キーアップハンドラー
    handleKeyup(event) {
        const key = event.key.toLowerCase();
        this.activeInputs.delete(key);
    }
    
    // キーに対応するアクションを取得
    getActionForKey(mapping, key) {
        for (const [action, mappedKey] of Object.entries(mapping)) {
            if (mappedKey === key) {
                return action;
            }
        }
        return null;
    }
    
    // プレイヤーアクションをトリガー
    triggerPlayerAction(playerId, action, event) {
        const customEvent = new CustomEvent('versusPlayerAction', {
            detail: {
                playerId: playerId,
                action: action,
                originalEvent: event
            }
        });
        document.dispatchEvent(customEvent);
    }
    
    // デフォルトの入力マッピングを取得
    static getDefaultInputMapping() {
        return {
            left: {
                'moveLeft': 'a',
                'moveRight': 'd',
                'rotateLeft': 'q',
                'rotateRight': 'e',
                'softDrop': 's',
                'hardDrop': 'w'
            },
            right: {
                'moveLeft': 'arrowleft',
                'moveRight': 'arrowright',
                'rotateLeft': '/',
                'rotateRight': 'shift',
                'softDrop': 'arrowdown',
                'hardDrop': 'arrowup'
            }
        };
    }
}

// 対戦ゲームユーティリティ関数
class VersusGameUtils {
    // キャンバス要素を設定
    static setupVersusCanvases() {
        const leftCanvas = document.getElementById('leftGameCanvas');
        const rightCanvas = document.getElementById('rightGameCanvas');
        
        if (!leftCanvas || !rightCanvas) {
            console.error('Versus canvas elements not found');
            return null;
        }
        
        // キャンバスサイズを設定
        const width = CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE;
        const height = CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;
        
        leftCanvas.width = width;
        leftCanvas.height = height;
        rightCanvas.width = width;
        rightCanvas.height = height;
        
        return { leftCanvas, rightCanvas };
    }
    
    // ゲームインスタンスを作成
    static createVersusGameInstance(canvas, side, config) {
        const game = new Game(canvas);
        
        // 対戦モード設定
        game.setVersusMode(true, side);
        game.uiManager = null; // UIManagerを無効化
        
        // ゲーム設定を適用
        game.mode = config.mode;
        game.difficulty = config.difficulty;
        game.training = config.training;
        
        // マネージャー設定
        if (window.userManager) {
            game.setUserManager(window.userManager);
        }
        
        if (!game.scoreManager) {
            game.scoreManager = new ScoreManager();
        }
        
        return game;
    }
    
    // プレイヤー名を取得
    static getPlayerNames(config) {
        if (config.mode === GameMode.VERSUS_CPU) {
            return { left: 'あなた', right: 'CPU' };
        } else {
            return {
                left: config.playerNames?.player1 || 'プレイヤー1',
                right: config.playerNames?.player2 || 'プレイヤー2'
            };
        }
    }
    
    // 時間をフォーマット
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // スコア差を計算
    static calculateScoreDifference(leftScore, rightScore) {
        return {
            difference: Math.abs(leftScore - rightScore),
            leader: leftScore > rightScore ? 'left' : rightScore > leftScore ? 'right' : 'tie'
        };
    }
    
    // 対戦結果の統計を生成
    static generateMatchStatistics(result) {
        const stats = {
            totalPoints: result.leftPlayer.score + result.rightPlayer.score,
            scoreDifference: Math.abs(result.leftPlayer.score - result.rightPlayer.score),
            averageLevel: (result.leftPlayer.level + result.rightPlayer.level) / 2,
            maxCombo: Math.max(result.leftPlayer.combo, result.rightPlayer.combo),
            matchDuration: VersusGameUtils.formatTime(result.matchTime)
        };
        
        return stats;
    }
    
    // エラーハンドリング
    static handleVersusGameError(error, context = '') {
        console.error(`Versus Game Error ${context}:`, error);
        
        // ユーザーフレンドリーなエラーメッセージ
        const userMessage = VersusGameUtils.getUserFriendlyErrorMessage(error);
        
        // エラーログ
        if (window.logger) {
            window.logger.error('VersusGame', `${context}: ${error.message}`, {
                stack: error.stack,
                context: context
            });
        }
        
        return userMessage;
    }
    
    // ユーザーフレンドリーなエラーメッセージを生成
    static getUserFriendlyErrorMessage(error) {
        const errorMessages = {
            'Canvas not found': 'ゲーム画面を初期化できませんでした',
            'Invalid mode': '不正なゲームモードが指定されました',
            'CPU initialization failed': 'CPUプレイヤーを初期化できませんでした',
            'Input setup failed': '入力設定に失敗しました'
        };
        
        for (const [key, message] of Object.entries(errorMessages)) {
            if (error.message.includes(key)) {
                return message;
            }
        }
        
        return '対戦ゲームでエラーが発生しました';
    }
}

// グローバルエクスポート
window.VersusGameConfig = VersusGameConfig;
window.VersusGameResult = VersusGameResult;
window.VersusGameState = VersusGameState;
window.VersusInputManagerRefactored = VersusInputManagerRefactored;
window.VersusGameUtils = VersusGameUtils;