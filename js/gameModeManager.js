// ゲームモード管理クラス
class GameModeManager {
    constructor() {
        this.currentMode = null;
        this.modeHandlers = new Map();
        this.initializeModeHandlers();
    }
    
    initializeModeHandlers() {
        // 各モードのハンドラーを登録
        this.registerMode(GameMode.SCORE, {
            name: 'スコアアタック',
            description: '制限時間なしでハイスコアを目指す',
            icon: '🎯',
            handler: ScoreAttackMode
        });
        
        this.registerMode(GameMode.TIME, {
            name: 'タイムアタック',
            description: '3分間でスコアを競う',
            icon: '⏱️',
            handler: TimeAttackMode
        });
        
        this.registerMode(GameMode.VERSUS_CPU, {
            name: 'CPU対戦',
            description: 'コンピューターと対戦',
            icon: '🤖',
            handler: VersusCPUMode
        });
        
        this.registerMode(GameMode.VERSUS_HUMAN, {
            name: '2P対戦',
            description: '2人で対戦',
            icon: '👥',
            handler: VersusHumanMode
        });
    }
    
    registerMode(modeType, config) {
        this.modeHandlers.set(modeType, config);
    }
    
    getMode(modeType) {
        return this.modeHandlers.get(modeType);
    }
    
    getModeConfig(modeType) {
        const mode = this.getMode(modeType);
        return mode ? {
            name: mode.name,
            description: mode.description,
            icon: mode.icon
        } : null;
    }
    
    createModeInstance(modeType, gameSettings) {
        const mode = this.getMode(modeType);
        if (!mode || !mode.handler) {
            throw new Error(`Unknown game mode: ${modeType}`);
        }
        
        return new mode.handler(gameSettings);
    }
    
    isVersusMode(modeType) {
        return modeType === GameMode.VERSUS_CPU || modeType === GameMode.VERSUS_HUMAN;
    }
    
    isSinglePlayerMode(modeType) {
        return modeType === GameMode.SCORE || modeType === GameMode.TIME;
    }
    
    getAllModes() {
        const modes = [];
        this.modeHandlers.forEach((config, type) => {
            modes.push({
                type: type,
                ...config
            });
        });
        return modes;
    }
}

// 基底ゲームモードクラス
class BaseGameMode {
    constructor(settings) {
        this.settings = settings;
        this.game = null;
        this.isActive = false;
    }
    
    // 各モードで実装が必要なメソッド
    start() {
        throw new Error('start() must be implemented by subclass');
    }
    
    stop() {
        this.isActive = false;
        if (this.game) {
            this.game.stop();
        }
    }
    
    pause() {
        if (this.game) {
            this.game.togglePause();
        }
    }
    
    resume() {
        if (this.game) {
            this.game.togglePause();
        }
    }
    
    getStats() {
        if (this.game) {
            return {
                score: this.game.score,
                level: this.game.level,
                combo: this.game.combo,
                time: this.game.gameTime
            };
        }
        return null;
    }
}

// スコアアタックモード
class ScoreAttackMode extends BaseGameMode {
    constructor(settings) {
        super(settings);
        this.modeType = GameMode.SCORE;
    }
    
    start() {
        this.isActive = true;
        const canvas = document.getElementById('gameCanvas');
        this.game = new Game(canvas);
        
        // UIManagerを設定
        if (window.game && window.game.uiManager) {
            this.game.uiManager = window.game.uiManager;
            this.game.scoreManager = window.game.scoreManager;
            this.game.userManager = window.game.userManager;
        }
        
        this.game.mode = this.modeType;
        this.game.startGame();
    }
}

// タイムアタックモード
class TimeAttackMode extends BaseGameMode {
    constructor(settings) {
        super(settings);
        this.modeType = GameMode.TIME;
        this.duration = CONFIG.TIME_ATTACK.DURATION;
    }
    
    start() {
        this.isActive = true;
        const canvas = document.getElementById('gameCanvas');
        this.game = new Game(canvas);
        
        // UIManagerを設定
        if (window.game && window.game.uiManager) {
            this.game.uiManager = window.game.uiManager;
            this.game.scoreManager = window.game.scoreManager;
            this.game.userManager = window.game.userManager;
        }
        
        this.game.mode = this.modeType;
        this.game.startGame();
    }
    
    getRemainingTime() {
        if (this.game) {
            return Math.max(0, this.duration - this.game.gameTime);
        }
        return this.duration;
    }
}

// CPU対戦モード
class VersusCPUMode extends BaseGameMode {
    constructor(settings) {
        super(settings);
        this.modeType = GameMode.VERSUS_CPU;
        this.versusGame = null;
    }
    
    start() {
        this.isActive = true;
        // 難易度文字列をCONFIG.DIFFICULTYオブジェクトに変換
        const difficultyObj = CONFIG.DIFFICULTY[this.settings.difficulty] || CONFIG.DIFFICULTY['normal'];
        this.versusGame = new VersusGame(
            this.modeType,
            difficultyObj,
            this.settings.training,
            this.settings.cpuLevel
        );
        this.versusGame.start();
    }
    
    stop() {
        this.isActive = false;
        if (this.versusGame) {
            this.versusGame.quit();
        }
    }
    
    getStats() {
        if (this.versusGame) {
            return {
                leftScore: this.versusGame.leftGame?.score || 0,
                rightScore: this.versusGame.rightGame?.score || 0,
                winner: this.versusGame.winner
            };
        }
        return null;
    }
}

// 人間対戦モード
class VersusHumanMode extends BaseGameMode {
    constructor(settings) {
        super(settings);
        this.modeType = GameMode.VERSUS_HUMAN;
        this.versusGame = null;
        this.playerNames = settings.playerNames;
    }
    
    start() {
        this.isActive = true;
        // 難易度文字列をCONFIG.DIFFICULTYオブジェクトに変換
        const difficultyObj = CONFIG.DIFFICULTY[this.settings.difficulty] || CONFIG.DIFFICULTY['normal'];
        this.versusGame = new VersusGame(
            this.modeType,
            difficultyObj,
            this.settings.training,
            null,
            this.playerNames
        );
        this.versusGame.start();
    }
    
    stop() {
        this.isActive = false;
        if (this.versusGame) {
            this.versusGame.quit();
        }
    }
    
    getStats() {
        if (this.versusGame) {
            return {
                leftScore: this.versusGame.leftGame?.score || 0,
                rightScore: this.versusGame.rightGame?.score || 0,
                winner: this.versusGame.winner,
                player1: this.playerNames?.player1 || 'プレイヤー1',
                player2: this.playerNames?.player2 || 'プレイヤー2'
            };
        }
        return null;
    }
}

// グローバルインスタンス
window.gameModeManager = new GameModeManager();