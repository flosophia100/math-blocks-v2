// MathBlocks 統一定数定義

// アプリケーション情報（重複回避）
if (typeof window.APP_INFO === 'undefined') {
    window.APP_INFO = {
        NAME: 'MathBlocks',
        VERSION: '1.3.0',
        DESCRIPTION: '計算ブロックゲーム（テトリス風計算パズル）',
        AUTHOR: 'MathBlocks Development Team',
        BUILD_DATE: '2025-01-27'
    };
}

// ゲームモード定数（重複回避）
if (typeof window.GameMode === 'undefined') {
    window.GameMode = {
        SCORE: 'score',           // スコアアタック
        TIME: 'time',            // タイムアタック
        VERSUS_CPU: 'versus_cpu', // CPU対戦
        VERSUS_HUMAN: 'versus_human' // 2P対戦
    };
}

// 難易度定数（重複回避）
if (typeof Difficulty === 'undefined') {
    const Difficulty = {
        EASY: 'easy',
        NORMAL: 'normal',
        HARD: 'hard'
    };
    window.Difficulty = Difficulty;
}

// 特訓モード定数（重複回避）
if (typeof TrainingMode === 'undefined') {
    const TrainingMode = {
        CALCULATION: 'calculation', // 計算特訓
        SPEED: 'speed',            // スピード特訓
        ACCURACY: 'accuracy'       // 正確性特訓
    };
    window.TrainingMode = TrainingMode;
}

// 演算タイプ定数（重複回避）
if (typeof OperationType === 'undefined') {
    const OperationType = {
        ADD: 'add',        // 足し算
        SUB: 'sub',        // 引き算
        MUL: 'mul',        // 掛け算
        DIV: 'div'         // 割り算
    };
    window.OperationType = OperationType;
}

// ゲーム状態定数（重複回避）
if (typeof GameState === 'undefined') {
    const GameState = {
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        GAME_OVER: 'game_over',
        FINISHED: 'finished'
    };
    window.GameState = GameState;
}

// UI画面定数
const ScreenType = {
    USER: 'user',
    AUTH: 'auth',
    START: 'start',
    GAME: 'game',
    GAME_OVER: 'gameOver',
    SCORE: 'score',
    COLLECTION: 'collection',
    USER_SETTINGS: 'userSettings',
    VERSUS_CPU_SETUP: 'versusCpuSetup',
    VERSUS_HUMAN_SETUP: 'versusHumanSetup',
    VERSUS_GAME: 'versusGame',
    VERSUS_RESULT: 'versusResult'
};

// 基本ゲーム設定
const GAME_CONFIG = {
    // グリッド設定
    GRID: {
        ROWS: 20,
        COLS: 10,
        CELL_SIZE: 30
    },
    
    // フレームレート
    TARGET_FPS: 60,
    FRAME_TIME: 1000 / 60,
    
    // 物理設定
    PHYSICS: {
        GRAVITY: 0.5,
        SOFT_DROP_SPEED: 5,
        HARD_DROP_SPEED: 20,
        LOCK_DELAY: 500 // ミリ秒
    },
    
    // スコア計算
    SCORING: {
        BASE_SCORE: 100,
        COMBO_MULTIPLIER: 1.5,
        LEVEL_MULTIPLIER: 1.2,
        DIFFICULTY_MULTIPLIERS: {
            [Difficulty.EASY]: 0.8,
            [Difficulty.NORMAL]: 1.0,
            [Difficulty.HARD]: 1.5
        }
    },
    
    // レベル進行
    LEVEL: {
        INITIAL: 1,
        MAX: 99,
        LINES_PER_LEVEL: 10,
        SPEED_INCREASE_RATE: 0.9 // 各レベルでの速度倍率
    },
    
    // コンボ設定
    COMBO: {
        MIN_CONSECUTIVE: 2,
        MAX_MULTIPLIER: 5.0,
        RESET_TIME: 3000 // ミリ秒
    }
};

// タイムアタック設定
const TIME_ATTACK = {
    DURATION: 180, // 3分（秒）
    WARNING_TIME: 30, // 残り30秒で警告
    COUNTDOWN_TIME: 10 // 残り10秒でカウントダウン
};

// CPU対戦設定
const CPU_CONFIG = {
    LEVELS: {
        1: { speed: 0.3, accuracy: 0.6, thinkTime: 2000 },
        2: { speed: 0.5, accuracy: 0.7, thinkTime: 1500 },
        3: { speed: 0.7, accuracy: 0.8, thinkTime: 1000 },
        4: { speed: 0.9, accuracy: 0.85, thinkTime: 800 },
        5: { speed: 1.0, accuracy: 0.9, thinkTime: 600 }
    },
    DEFAULT_LEVEL: 3,
    MAX_LEVEL: 5
};

// ストレージキー定数
const STORAGE_KEYS = {
    SCORES: 'mathblocks_scores',
    USERS: 'mathblocks_users',
    SESSION: 'mathblocks_session',
    SETTINGS: 'mathblocks_settings',
    SAVE_PATH: 'mathblocks_save_path',
    AUTOSAVE: 'mathblocks_autosave',
    DEBUG: 'mathblocks_debug',
    LOGS: 'mathblocks-logs',
    EMERGENCY_BACKUP: 'mathblocks_emergency_backup'
};

// ファイル名パターン
const FILE_PATTERNS = {
    SCORE_BACKUP: 'mathblocks_backup_{timestamp}.json',
    USER_DATA: 'mathblocks_{username}_{date}.json',
    USER_EXPORT: 'mathblocks_export_{username}_{date}.json',
    SCORE_CSV: 'mathblocks_scores_{date}.csv',
    LOG_FILE: 'mathblocks-log-{timestamp}.txt',
    EMERGENCY_BACKUP: 'mathblocks_emergency_{timestamp}.json'
};

// UI設定
const UI_CONFIG = {
    // 通知表示時間
    NOTIFICATION: {
        SUCCESS: 3000,
        ERROR: 5000,
        WARNING: 4000,
        INFO: 3000
    },
    
    // アニメーション時間
    ANIMATION: {
        FADE: 300,
        SLIDE: 250,
        BOUNCE: 400
    },
    
    // カラーテーマ
    COLORS: {
        PRIMARY: '#3498db',
        SUCCESS: '#27ae60',
        WARNING: '#f39c12',
        ERROR: '#e74c3c',
        INFO: '#3498db',
        DARK: '#2c3e50',
        LIGHT: '#ecf0f1'
    },
    
    // Z-index レイヤー
    Z_INDEX: {
        BACKGROUND: 1,
        CONTENT: 10,
        OVERLAY: 100,
        MODAL: 1000,
        NOTIFICATION: 10000,
        DEBUG: 99999
    }
};

// 数値範囲設定
const NUMBER_RANGES = {
    DEFAULT: { min: 1, max: 10 },
    EASY: { min: 1, max: 5 },
    NORMAL: { min: 1, max: 10 },
    HARD: { min: 1, max: 20 },
    EXPERT: { min: 1, max: 50 }
};

// 演算設定
const OPERATION_CONFIG = {
    DEFAULT: {
        [OperationType.ADD]: true,
        [OperationType.SUB]: true,
        [OperationType.MUL]: false,
        [OperationType.DIV]: false
    },
    
    EASY: {
        [OperationType.ADD]: true,
        [OperationType.SUB]: false,
        [OperationType.MUL]: false,
        [OperationType.DIV]: false
    },
    
    NORMAL: {
        [OperationType.ADD]: true,
        [OperationType.SUB]: true,
        [OperationType.MUL]: false,
        [OperationType.DIV]: false
    },
    
    HARD: {
        [OperationType.ADD]: true,
        [OperationType.SUB]: true,
        [OperationType.MUL]: true,
        [OperationType.DIV]: false
    },
    
    EXPERT: {
        [OperationType.ADD]: true,
        [OperationType.SUB]: true,
        [OperationType.MUL]: true,
        [OperationType.DIV]: true
    }
};

// アイテム・実績設定
const ITEM_CONFIG = {
    TYPES: {
        MEDAL: 'medal',
        BADGE: 'badge',
        TROPHY: 'trophy',
        SPECIAL: 'special'
    },
    
    RARITY: {
        COMMON: 'common',
        RARE: 'rare',
        EPIC: 'epic',
        LEGENDARY: 'legendary'
    },
    
    UNLOCK_CONDITIONS: {
        SCORE: [1000, 5000, 10000, 25000, 50000],
        COMBO: [10, 25, 50, 100],
        GAMES: [10, 50, 100, 500, 1000],
        TIME: [60, 120, 180] // 秒単位での最短クリア時間
    }
};

// バリデーション設定
const VALIDATION = {
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 20,
        PATTERN: /^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/
    },
    
    SCORE: {
        MIN: 0,
        MAX: 999999999
    },
    
    LEVEL: {
        MIN: 1,
        MAX: 99
    },
    
    NUMBER_RANGE: {
        MIN: 1,
        MAX: 100
    }
};

// デバッグ設定
const DEBUG_CONFIG = {
    LOG_LEVELS: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
    MAX_LOG_ENTRIES: 1000,
    AUTO_CLEAR_LOGS: true,
    PERFORMANCE_MONITORING: false,
    
    FEATURES: {
        SHOW_FPS: false,
        SHOW_GRID: false,
        SHOW_HITBOXES: false,
        GOD_MODE: false,
        SKIP_ANIMATIONS: false
    }
};

// キーバインド設定
const KEY_BINDINGS = {
    SINGLE_PLAYER: {
        MOVE_LEFT: ['ArrowLeft', 'a', 'A'],
        MOVE_RIGHT: ['ArrowRight', 'd', 'D'],
        ROTATE_LEFT: ['q', 'Q'],
        ROTATE_RIGHT: ['ArrowUp', 'w', 'W', 'e', 'E'],
        SOFT_DROP: ['ArrowDown', 's', 'S'],
        HARD_DROP: [' ', 'Space'],
        PAUSE: ['p', 'P', 'Escape']
    },
    
    VERSUS_PLAYER1: {
        MOVE_LEFT: ['a', 'A'],
        MOVE_RIGHT: ['d', 'D'],
        ROTATE_LEFT: ['q', 'Q'],
        ROTATE_RIGHT: ['e', 'E'],
        SOFT_DROP: ['s', 'S'],
        HARD_DROP: ['w', 'W']
    },
    
    VERSUS_PLAYER2: {
        MOVE_LEFT: ['ArrowLeft'],
        MOVE_RIGHT: ['ArrowRight'],
        ROTATE_LEFT: ['/'],
        ROTATE_RIGHT: ['Shift'],
        SOFT_DROP: ['ArrowDown'],
        HARD_DROP: ['ArrowUp']
    }
};

// エクスポート設定
const EXPORT_CONFIG = {
    FORMATS: {
        JSON: 'json',
        CSV: 'csv',
        TXT: 'txt'
    },
    
    COMPRESSION: {
        ENABLED: false,
        LEVEL: 6
    },
    
    ENCRYPTION: {
        ENABLED: false,
        ALGORITHM: 'AES-256'
    }
};

// パフォーマンス設定
const PERFORMANCE_CONFIG = {
    MAX_PARTICLES: 100,
    MAX_ANIMATIONS: 50,
    GARBAGE_COLLECTION_INTERVAL: 30000, // 30秒
    FRAME_SKIP_THRESHOLD: 5,
    
    OPTIMIZATION: {
        REDUCE_EFFECTS: false,
        LIMIT_PARTICLES: false,
        SKIP_BACKGROUNDS: false,
        SIMPLE_RENDERING: false
    }
};

// 表示名マッピング
const DISPLAY_NAMES = {
    MODES: {
        [GameMode.SCORE]: 'スコアアタック',
        [GameMode.TIME]: 'タイムアタック',
        [GameMode.VERSUS_CPU]: 'CPU対戦',
        [GameMode.VERSUS_HUMAN]: '2P対戦'
    },
    
    DIFFICULTIES: {
        [Difficulty.EASY]: 'やさしい',
        [Difficulty.NORMAL]: 'ふつう',
        [Difficulty.HARD]: 'むずかしい'
    },
    
    TRAINING_MODES: {
        [TrainingMode.CALCULATION]: '計算特訓',
        [TrainingMode.SPEED]: 'スピード特訓',
        [TrainingMode.ACCURACY]: '正確性特訓'
    },
    
    OPERATIONS: {
        [OperationType.ADD]: '足し算',
        [OperationType.SUB]: '引き算',
        [OperationType.MUL]: '掛け算',
        [OperationType.DIV]: '割り算'
    }
};

// バージョン互換性情報
const VERSION_COMPATIBILITY = {
    CURRENT: window.APP_INFO.VERSION,
    SUPPORTED: ['1.0.0', '1.1.0', '1.2.0', '1.3.0'],
    DEPRECATED: ['0.9.0'],
    
    MIGRATION: {
        '1.0.0': '1.3.0',
        '1.1.0': '1.3.0',
        '1.2.0': '1.3.0'
    }
};

// 統一設定オブジェクト（後方互換性のため）
// 既存のCONFIGと重複する場合はスキップ
if (typeof window.CONFIG === 'undefined') {
    window.CONFIG_REFACTORED = {
        ...GAME_CONFIG,
        TIME_ATTACK,
        CPU: CPU_CONFIG,
        UI: UI_CONFIG,
        DEBUG: DEBUG_CONFIG
    };
}

// フリーズして変更を防ぐ
Object.freeze(window.APP_INFO);
Object.freeze(GameMode);
Object.freeze(Difficulty);
Object.freeze(TrainingMode);
Object.freeze(OperationType);
Object.freeze(GameState);
Object.freeze(ScreenType);
Object.freeze(GAME_CONFIG);
Object.freeze(TIME_ATTACK);
Object.freeze(CPU_CONFIG);
Object.freeze(STORAGE_KEYS);
Object.freeze(FILE_PATTERNS);
Object.freeze(UI_CONFIG);
Object.freeze(NUMBER_RANGES);
Object.freeze(OPERATION_CONFIG);
Object.freeze(ITEM_CONFIG);
Object.freeze(VALIDATION);
Object.freeze(DEBUG_CONFIG);
Object.freeze(KEY_BINDINGS);
Object.freeze(EXPORT_CONFIG);
Object.freeze(PERFORMANCE_CONFIG);
Object.freeze(DISPLAY_NAMES);
Object.freeze(VERSION_COMPATIBILITY);
Object.freeze(CONFIG);

// グローバルエクスポート
// APP_INFO はすでにwindow.APP_INFOとして定義済み
window.Difficulty = Difficulty;
window.TrainingMode = TrainingMode;
window.OperationType = OperationType;
window.GameState = GameState;
window.ScreenType = ScreenType;
window.GAME_CONFIG = GAME_CONFIG;
window.TIME_ATTACK = TIME_ATTACK;
window.CPU_CONFIG = CPU_CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS;
window.FILE_PATTERNS = FILE_PATTERNS;
window.UI_CONFIG = UI_CONFIG;
window.NUMBER_RANGES = NUMBER_RANGES;
window.OPERATION_CONFIG = OPERATION_CONFIG;
window.ITEM_CONFIG = ITEM_CONFIG;
window.VALIDATION = VALIDATION;
window.DEBUG_CONFIG = DEBUG_CONFIG;
window.KEY_BINDINGS = KEY_BINDINGS;
window.EXPORT_CONFIG = EXPORT_CONFIG;
window.PERFORMANCE_CONFIG = PERFORMANCE_CONFIG;
window.DISPLAY_NAMES = DISPLAY_NAMES;
window.VERSION_COMPATIBILITY = VERSION_COMPATIBILITY;
