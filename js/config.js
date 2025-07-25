// ゲーム設定定数
const CONFIG = {
    GRID: {
        COLS: 7,
        ROWS: 10,
        CELL_SIZE: 80 // 7列に対応してサイズ調整
    },
    DIFFICULTY: {
        veryeasy: {
            name: '入門',
            initialSpeed: 1500,
            speedIncrease: 0.98,
            levelUpInterval: 5,
            maxBlocks: 2,
            numberRangeIncrease: 1
        },
        easy: { 
            name: 'イージー',
            initialSpeed: 1200, 
            speedIncrease: 0.96,
            levelUpInterval: 5,
            maxBlocks: 3,
            numberRangeIncrease: 2
        },
        normal: { 
            name: 'ノーマル',
            initialSpeed: 900, 
            speedIncrease: 0.93,
            levelUpInterval: 5,
            maxBlocks: 4,
            numberRangeIncrease: 3
        },
        hard: { 
            name: 'ハード',
            initialSpeed: 600, 
            speedIncrease: 0.94,  // より緩やかなスピード上昇
            levelUpInterval: 5,
            maxBlocks: 6,         // 最初から多いブロック数
            numberRangeIncrease: 6 // より大きな数値範囲
        },
        veryhard: {
            name: 'エクストリーム',
            initialSpeed: 400,     // より速い初期スピード
            speedIncrease: 0.92,   // より緩やかなスピード上昇
            levelUpInterval: 5,
            maxBlocks: 7,          // 最大ブロック数
            numberRangeIncrease: 8 // さらに大きな数値範囲
        }
    },
    TRAINING_MODES: {
        kuku: {
            name: '九九',
            operations: { add: false, sub: false, mul: true, div: false },
            minNum: 1,
            maxNum: 9,
            description: '掛け算の九九を覚えよう'
        },
        omiyage: {
            name: 'おみやげ算',
            operations: { add: false, sub: false, mul: true, div: false },
            minNum: 1,
            maxNum: 19,
            omiyageMode: true, // 特別なおみやげ算モード
            description: '10番台同士の掛け算に挑戦'
        },
        sakuranbo: {
            name: 'さくらんぼ算',
            operations: { add: true, sub: true, mul: false, div: false },
            minNum: 10,
            maxNum: 99,
            carryBorrow: true,
            description: '繰り上がり・繰り下がりの計算'
        },
        addition_only: {
            name: '足し算のみ',
            operations: { add: true, sub: false, mul: false, div: false },
            minNum: 1,
            maxNum: 100,
            description: '足し算の特訓'
        },
        subtraction_only: {
            name: '引き算のみ',
            operations: { add: false, sub: true, mul: false, div: false },
            minNum: 1,
            maxNum: 100,
            description: '引き算の特訓'
        },
        multiplication_only: {
            name: '掛け算のみ',
            operations: { add: false, sub: false, mul: true, div: false },
            minNum: 1,
            maxNum: 50,
            description: '掛け算の特訓'
        },
        division_only: {
            name: '割り算のみ',
            operations: { add: false, sub: false, mul: false, div: true },
            minNum: 1,
            maxNum: 500,
            description: '割り算の特訓'
        }
    },
    SCORE: {
        BASE: 10,
        COMBO_MULTIPLIERS: {
            2: 1.2,
            3: 1.5,
            5: 2.0,
            10: 3.0
        },
        SPEED_BONUS: 5, // 早く答えるほどボーナス
        LEVEL_MULTIPLIER: 1.1 // レベルごとに1.1倍
    },
    COLORS: {
        BLOCKS: {
            '+': '#4ECDC4', // 青緑 - 足し算
            '-': '#FF6B6B', // 赤 - 引き算
            '×': '#F7DC6F', // 黄 - 掛け算
            '÷': '#BB8FCE'  // 紫 - 割り算
        },
        GRID_LINE: '#ddd',
        GRID_BG: '#f9f9f9',
        WARNING_BG: '#ffb3ba' // 7段目以上積み上がった列の警告色（ピンク）
    },
    TIME_ATTACK: {
        DURATION: 60 // タイムアタックモードの制限時間（秒）
    },
    PENALTY: {
        // ペナルティブロック機能の設定
        ENABLED_DIFFICULTIES: ['ノーマル', 'ハード', 'エクストリーム'], // ノーマル以上で有効
        MIN_BLOCKS: 1,
        MAX_BLOCKS: 7,
        // 難易度別の多数ブロック出現確率（レベル1基準）
        PROBABILITY_WEIGHTS: {
            'ノーマル': [0.4, 0.3, 0.2, 0.1, 0.0, 0.0, 0.0], // 1～7個の出現確率
            'ハード': [0.3, 0.3, 0.2, 0.15, 0.05, 0.0, 0.0],
            'エクストリーム': [0.2, 0.25, 0.25, 0.15, 0.1, 0.03, 0.02]
        },
        // レベルごとの追加重み（高レベルほど多数ブロックが出やすい）
        LEVEL_MODIFIER: 0.05 // レベル1上がるごとに5%ずつ高い数のブロック確率が上昇
    },
    TIMESTOP: {
        // タイムストップブロック設定
        SPAWN_RATE: 0.05, // 5%の確率で出現
        DURATION: 10000, // 10秒間（ミリ秒）
        COLOR: '#9B59B6', // 紫色
        ICON: '⏰' // 時計アイコン
    }
};

// ゲーム状態
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// ゲームモード
const GameMode = {
    SCORE: 'score',
    TIME: 'time'
};