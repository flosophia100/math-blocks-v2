// スコア管理クラス（Supabase対応版）
class ScoreManager {
    constructor() {
        this.scores = [];
        this.supabase = null;
        this.isOnline = navigator.onLine;

        // オンライン/オフライン監視
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.syncLocalScores();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });

        // 初期化
        this.init();
    }

    async init() {
        // Supabase初期化
        this.supabase = getSupabase();

        // ローカルスコアを読み込み
        this.loadLocalScores();

        // オンラインならサーバーからも取得
        if (this.isOnline && this.supabase) {
            await this.fetchScoresFromServer();
        }
    }

    // サーバーからスコアを取得
    async fetchScoresFromServer() {
        try {
            const { data, error } = await this.supabase
                .from('scores')
                .select('*')
                .order('score', { ascending: false })
                .limit(100);

            if (error) throw error;

            if (data) {
                // サーバーのスコアをローカル形式に変換してマージ
                const serverScores = data.map(s => this.convertFromDB(s));
                this.mergeScores(serverScores);
                this.saveLocalScores();
            }

            console.log('サーバーからスコアを取得しました');
        } catch (error) {
            console.error('スコア取得エラー:', error);
        }
    }

    // DBフォーマットからアプリフォーマットに変換
    convertFromDB(dbScore) {
        return {
            id: dbScore.id,
            score: dbScore.score,
            maxCombo: dbScore.max_combo,
            level: dbScore.level,
            mode: dbScore.mode,
            difficulty: dbScore.difficulty,
            training: dbScore.training,
            correctAnswers: dbScore.correct_answers,
            wrongAnswers: dbScore.wrong_answers,
            gameTime: dbScore.game_time,
            timestamp: dbScore.created_at,
            username: dbScore.username,
            synced: true
        };
    }

    // アプリフォーマットからDBフォーマットに変換
    convertToDB(score, userId = null) {
        return {
            user_id: userId,
            username: score.username || 'ゲスト',
            score: score.score,
            level: score.level || 1,
            max_combo: score.maxCombo || 0,
            mode: score.mode,
            difficulty: score.difficulty,
            training: score.training || null,
            correct_answers: score.correctAnswers || 0,
            wrong_answers: score.wrongAnswers || 0,
            game_time: score.gameTime || 0
        };
    }

    // スコアをマージ（重複排除）
    mergeScores(serverScores) {
        const existingIds = new Set(this.scores.filter(s => s.id).map(s => s.id));
        const existingTimestamps = new Set(this.scores.map(s => s.timestamp));

        for (const score of serverScores) {
            if (score.id && existingIds.has(score.id)) continue;
            if (score.timestamp && existingTimestamps.has(score.timestamp)) continue;
            this.scores.push(score);
        }

        // スコア順にソート
        this.scores.sort((a, b) => b.score - a.score);

        // 上位100件に制限
        this.scores = this.scores.slice(0, 100);
    }

    // ローカルストレージからスコアを読み込み
    loadLocalScores() {
        try {
            const saved = localStorage.getItem('mathblocks_scores');
            this.scores = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('スコア読み込みエラー:', error);
            this.scores = [];
        }
    }

    // ローカルストレージにスコアを保存
    saveLocalScores() {
        try {
            localStorage.setItem('mathblocks_scores', JSON.stringify(this.scores));
        } catch (error) {
            console.error('スコア保存エラー:', error);
        }
    }

    // 新しいスコアを記録
    async addScore(scoreData) {
        // 同条件での過去の最高スコアを取得
        const previousHighScore = this.getHighScoreForConditions(
            scoreData.operations,
            scoreData.minNum,
            scoreData.maxNum,
            scoreData.difficulty,
            scoreData.mode
        );

        const record = {
            score: scoreData.score,
            maxCombo: scoreData.maxCombo,
            level: scoreData.level,
            mode: scoreData.mode,
            operations: scoreData.operations,
            minNum: scoreData.minNum,
            maxNum: scoreData.maxNum,
            difficulty: scoreData.difficulty,
            training: scoreData.training || null,
            timestamp: new Date().toISOString(),
            clearTime: scoreData.clearTime || null,
            gameTime: scoreData.gameTime || 0,
            correctAnswers: scoreData.correctAnswers || 0,
            wrongAnswers: scoreData.wrongAnswers || 0,
            avgAnswerTime: scoreData.avgAnswerTime || 0,
            username: scoreData.username || 'ゲスト',
            synced: false
        };

        // サーバーに保存
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('scores')
                    .insert([this.convertToDB(record, scoreData.userId)])
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    record.id = data.id;
                    record.synced = true;
                    console.log('スコアをサーバーに保存しました');
                }
            } catch (error) {
                console.error('サーバー保存エラー:', error);
            }
        }

        this.scores.push(record);

        // スコア順にソート（降順）
        this.scores.sort((a, b) => b.score - a.score);

        // 最大100件まで保持
        this.scores = this.scores.slice(0, 100);

        this.saveLocalScores();

        // ログ出力
        this.logScoreToConsole(record);

        // ハイスコアかどうかを判定
        const isHighScore = scoreData.score > previousHighScore;

        return {
            ranking: this.scores.indexOf(record) + 1,
            isHighScore: isHighScore
        };
    }

    // ローカルの未同期スコアをサーバーに同期
    async syncLocalScores() {
        if (!this.isOnline || !this.supabase) return;

        const unsyncedScores = this.scores.filter(s => !s.synced);

        for (const score of unsyncedScores) {
            try {
                const { data, error } = await this.supabase
                    .from('scores')
                    .insert([this.convertToDB(score)])
                    .select()
                    .single();

                if (!error && data) {
                    score.id = data.id;
                    score.synced = true;
                }
            } catch (error) {
                console.error('スコア同期エラー:', error);
            }
        }

        this.saveLocalScores();
        console.log('スコア同期完了');
    }

    // ログファイル形式でコンソール出力
    logScoreToConsole(record) {
        const logEntry = [
            `[${record.timestamp}]`,
            `SCORE: ${record.score}`,
            `COMBO: ${record.maxCombo}`,
            `LEVEL: ${record.level}`,
            `MODE: ${record.mode}`,
            `DIFFICULTY: ${record.difficulty}`,
            `USER: ${record.username}`
        ].filter(Boolean).join(' | ');

        console.log('MathBlocks Score Log:', logEntry);
    }

    // 時間をフォーマット
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // トップスコアを取得
    getTopScores(limit = 10) {
        return this.scores.slice(0, limit);
    }

    // 最高スコアを取得
    getHighScore() {
        return this.scores.length > 0 ? this.scores[0].score : 0;
    }

    // 特定条件での最高スコアを取得
    getHighScoreForConditions(operations, minNum, maxNum, difficulty, mode) {
        const filtered = this.scores.filter(record => {
            return record.mode === mode &&
                   record.difficulty === difficulty &&
                   record.minNum === minNum &&
                   record.maxNum === maxNum &&
                   this.operationsMatch(record.operations, operations);
        });

        return filtered.length > 0 ? filtered[0].score : 0;
    }

    // 演算設定が一致するかチェック
    operationsMatch(ops1, ops2) {
        if (!ops1 || !ops2) return false;
        return ops1.add === ops2.add &&
               ops1.sub === ops2.sub &&
               ops1.mul === ops2.mul &&
               ops1.div === ops2.div;
    }

    // スコアデータをエクスポート（CSVファイル用）
    exportToCSV() {
        const headers = [
            'Date', 'Score', 'MaxCombo', 'Level', 'Mode', 'Difficulty',
            'Training', 'Operations', 'MinNum', 'MaxNum', 'GameTime', 'ClearTime', 'Username'
        ];

        const rows = this.scores.map(record => [
            new Date(record.timestamp).toLocaleString(),
            record.score,
            record.maxCombo,
            record.level,
            record.mode,
            record.difficulty,
            record.training || '-',
            record.operations ? Object.entries(record.operations).filter(([_, enabled]) => enabled).map(([op, _]) => op).join('+') : '',
            record.minNum,
            record.maxNum,
            record.gameTime ? this.formatTime(record.gameTime) : '0:00',
            record.clearTime ? this.formatTime(record.clearTime) : '',
            record.username || 'ゲスト'
        ]);

        const csvContent = [headers, ...rows].map(row =>
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');

        return csvContent;
    }

    // 全スコアを取得
    getAllScores() {
        return [...this.scores];
    }

    // スコアリセット
    clearAllScores() {
        this.scores = [];
        this.saveLocalScores();
    }

    // JSONファイルからスコアをインポート
    importFromJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (!data.scores || !Array.isArray(data.scores)) {
                throw new Error('有効なスコアデータが見つかりません');
            }

            const existingTimestamps = new Set(this.scores.map(s => s.timestamp));
            let importedCount = 0;

            for (const score of data.scores) {
                if (!score.timestamp || score.score === undefined) continue;
                if (existingTimestamps.has(score.timestamp)) continue;

                score.synced = false;
                this.scores.push(score);
                importedCount++;
            }

            this.scores.sort((a, b) => b.score - a.score);
            this.scores = this.scores.slice(0, 100);
            this.saveLocalScores();

            // 同期を試みる
            if (this.isOnline) {
                this.syncLocalScores();
            }

            return {
                success: true,
                imported: importedCount,
                message: `${importedCount}件のスコアをインポートしました`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: `インポートに失敗しました: ${error.message}`
            };
        }
    }
}
