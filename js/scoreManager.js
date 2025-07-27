// スコア管理クラス
class ScoreManager {
    constructor() {
        this.scores = this.loadScores();
    }
    
    // ローカルストレージからスコアを読み込み
    loadScores() {
        try {
            const saved = localStorage.getItem('mathblocks_scores');
            const scores = saved ? JSON.parse(saved) : [];
            
            // 既存データの移行（gameTimeフィールドがない場合は0を設定）
            let needsSave = false;
            const migratedScores = scores.map(score => {
                if (score.gameTime === undefined) {
                    score.gameTime = 0;
                    needsSave = true;
                }
                return score;
            });
            
            // 移行が必要だった場合は保存
            if (needsSave) {
                localStorage.setItem('mathblocks_scores', JSON.stringify(migratedScores));
            }
            
            return migratedScores;
        } catch (error) {
            console.error('スコア読み込みエラー:', error);
            return [];
        }
    }
    
    // スコアをローカルストレージに保存
    saveScores() {
        try {
            localStorage.setItem('mathblocks_scores', JSON.stringify(this.scores));
        } catch (error) {
            console.error('スコア保存エラー:', error);
        }
    }
    
    // 新しいスコアを記録
    addScore(scoreData) {
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
            timestamp: new Date().toISOString(),
            clearTime: scoreData.clearTime || null,
            gameTime: scoreData.gameTime || 0,  // ゲーム時間を追加
            correctAnswers: scoreData.correctAnswers || 0,
            wrongAnswers: scoreData.wrongAnswers || 0,
            avgAnswerTime: scoreData.avgAnswerTime || 0,
            username: scoreData.username || 'ゲスト'
        };
        
        this.scores.push(record);
        
        // スコア順にソート（降順）
        this.scores.sort((a, b) => b.score - a.score);
        
        // 最大100件まで保持
        this.scores = this.scores.slice(0, 100);
        
        this.saveScores();
        
        // ログファイル形式でコンソールに出力（開発時確認用）
        this.logScoreToConsole(record);
        
        // ハイスコアかどうかを判定
        const isHighScore = scoreData.score > previousHighScore;
        
        return {
            ranking: this.scores.indexOf(record) + 1,
            isHighScore: isHighScore
        };
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
            `OPERATIONS: ${Object.entries(record.operations).filter(([_, enabled]) => enabled).map(([op, _]) => op).join(',')}`,
            `RANGE: ${record.minNum}-${record.maxNum}`,
            record.clearTime ? `TIME: ${this.formatTime(record.clearTime)}` : ''
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
        return ops1.add === ops2.add &&
               ops1.sub === ops2.sub &&
               ops1.mul === ops2.mul &&
               ops1.div === ops2.div;
    }
    
    // スコアデータをエクスポート（CSVファイル用）
    exportToCSV() {
        const headers = [
            'Date', 'Score', 'MaxCombo', 'Level', 'Mode', 'Difficulty',
            'Training', 'Operations', 'MinNum', 'MaxNum', 'GameTime', 'ClearTime'
        ];
        
        const rows = this.scores.map(record => [
            new Date(record.timestamp).toLocaleString(),
            record.score,
            record.maxCombo,
            record.level,
            record.mode,
            record.difficulty,
            record.training || '-',
            Object.entries(record.operations).filter(([_, enabled]) => enabled).map(([op, _]) => op).join('+'),
            record.minNum,
            record.maxNum,
            record.gameTime ? this.formatTime(record.gameTime) : '0:00',
            record.clearTime ? this.formatTime(record.clearTime) : ''
        ]);
        
        const csvContent = [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        return csvContent;
    }
    
    // 全スコアを取得
    getAllScores() {
        return [...this.scores]; // 配列のコピーを返す
    }
    
    // スコアリセット
    clearAllScores() {
        this.scores = [];
        this.saveScores();
    }
    
    // 自動ファイル保存機能（DownloadManagerに統合されたため無効化）
    autoSaveToFile() {
        console.log('ScoreManager: 個別の自動保存は無効化されています。DownloadManagerを使用してください。');
        return;
        
        try {
            // 現在の日時を取得
            const now = new Date();
            const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD形式
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS形式
            
            // 保存データを準備
            const saveData = {
                exportDate: now.toISOString(),
                version: "MathBlocks v1.3.0",
                totalScores: this.scores.length,
                scores: this.scores,
                userInfo: {
                    currentUser: localStorage.getItem('mathblocks_current_user') || 'ゲスト',
                    exportedAt: now.toLocaleString('ja-JP')
                }
            };
            
            // JSONファイルとして自動ダウンロード
            const jsonContent = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `mathblocks_backup_${timestamp}_${timeStr}.json`;
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log(`自動バックアップ完了: mathblocks_backup_${timestamp}_${timeStr}.json`);
            
            // 成功通知（控えめに）
            this.showAutoSaveNotification();
            
        } catch (error) {
            console.error('自動保存エラー:', error);
        }
    }
    
    // 自動保存通知表示
    showAutoSaveNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: opacity 0.3s;
        `;
        notification.innerHTML = '💾 データを自動保存しました';
        
        document.body.appendChild(notification);
        
        // 3秒後に消去
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 自動保存設定の取得
    getAutoSaveEnabled() {
        return localStorage.getItem('mathblocks_autosave') === 'true';
    }
    
    // 自動保存設定の変更
    setAutoSaveEnabled(enabled) {
        localStorage.setItem('mathblocks_autosave', enabled.toString());
        console.log(`自動保存設定: ${enabled ? '有効' : '無効'}`);
    }
    
    // JSONファイルからスコアをインポート
    importFromJSON(jsonData) {
        try {
            // 文字列の場合はパース
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // バージョン確認（警告のみ）
            if (data.version && !data.version.includes('MathBlocks')) {
                console.warn('このファイルはMathBlocks以外で作成された可能性があります');
            }
            
            // スコアデータの検証
            if (!data.scores || !Array.isArray(data.scores)) {
                throw new Error('有効なスコアデータが見つかりません');
            }
            
            // 既存のスコアと重複チェック
            const existingTimestamps = new Set(this.scores.map(s => s.timestamp));
            const newScores = [];
            let duplicateCount = 0;
            
            for (const score of data.scores) {
                // 必須フィールドの確認
                if (!score.timestamp || score.score === undefined) {
                    console.warn('不完全なスコアデータをスキップしました:', score);
                    continue;
                }
                
                // 重複チェック
                if (existingTimestamps.has(score.timestamp)) {
                    duplicateCount++;
                    continue;
                }
                
                // スコアデータの正規化
                const normalizedScore = {
                    timestamp: score.timestamp,
                    score: score.score,
                    level: score.level || 1,
                    maxCombo: score.maxCombo || 0,
                    mode: score.mode || 'score',
                    difficulty: score.difficulty || 'normal',
                    correctAnswers: score.correctAnswers || 0,
                    wrongAnswers: score.wrongAnswers || 0,
                    avgAnswerTime: score.avgAnswerTime || 0,
                    gameTime: score.gameTime || 0,
                    operations: score.operations || {},
                    training: score.training || null,
                    numberRange: score.numberRange || { min: 1, max: 10 },
                    username: score.username || 'ゲスト'
                };
                
                newScores.push(normalizedScore);
            }
            
            // インポート結果の確認
            if (newScores.length === 0 && duplicateCount === 0) {
                throw new Error('インポート可能なスコアが見つかりませんでした');
            }
            
            // スコアを追加
            this.scores = [...this.scores, ...newScores];
            
            // 100件を超える場合は古いものから削除
            if (this.scores.length > 100) {
                this.scores.sort((a, b) => b.timestamp - a.timestamp);
                this.scores = this.scores.slice(0, 100);
            }
            
            // 保存
            this.saveScores();
            
            // 結果を返す
            const result = {
                success: true,
                imported: newScores.length,
                duplicates: duplicateCount,
                total: this.scores.length,
                message: `${newScores.length}件のスコアをインポートしました${duplicateCount > 0 ? `（${duplicateCount}件は重複のためスキップ）` : ''}`
            };
            
            console.log('スコアインポート完了:', result);
            return result;
            
        } catch (error) {
            console.error('スコアインポートエラー:', error);
            return {
                success: false,
                error: error.message,
                message: `インポートに失敗しました: ${error.message}`
            };
        }
    }
}