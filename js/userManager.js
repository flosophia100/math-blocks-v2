// ユーザー管理システム
class UserManager {
    constructor() {
        this.currentUser = null;
        this.isGuestMode = true;
        this.users = new Map();
        this.loadUsers();
        this.defaultSavePath = './mathblocks_data/';
        this.userSavePath = localStorage.getItem('mathblocks_save_path') || this.defaultSavePath;
    }
    
    // ユーザー登録
    registerUser(username) {
        if (this.users.has(username)) {
            throw new Error('このユーザー名は既に使用されています');
        }
        
        if (username.length < 3 || username.length > 20) {
            throw new Error('ユーザー名は3文字以上20文字以下で入力してください');
        }
        
        const user = {
            username,
            createdAt: new Date().toISOString(),
            totalScore: 0,
            gamesPlayed: 0,
            totalTime: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalAnswerTime: 0,
            bestScores: {
                score: {},     // mode-difficulty-training別最高スコア
                time: {},      // mode-difficulty-training別最短時間
                combo: {}      // mode-difficulty-training別最高コンボ
            },
            gameHistory: [],
            items: [],
            achievements: [],
            preferences: {
                savePath: this.defaultSavePath
            }
        };
        
        this.users.set(username, user);
        this.saveUsers();
        return user;
    }
    
    // ユーザーログイン
    loginUser(username) {
        const user = this.users.get(username);
        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }
        
        this.currentUser = user;
        this.isGuestMode = false;
        this.userSavePath = user.preferences.savePath || this.defaultSavePath;
        this.saveCurrentSession();
        return user;
    }
    
    // ゲストモードに切り替え
    switchToGuestMode() {
        this.currentUser = null;
        this.isGuestMode = true;
        this.saveCurrentSession();
    }
    
    // ユーザーログアウト
    logoutUser() {
        this.switchToGuestMode();
    }
    
    // 現在のユーザー情報を取得
    getCurrentUser() {
        return this.currentUser;
    }
    
    // ゲストモードかどうか
    isGuest() {
        return this.isGuestMode;
    }
    
    // ゲーム結果を記録
    recordGameResult(gameData) {
        if (this.isGuestMode) return;
        
        const user = this.currentUser;
        if (!user) return;
        
        // 基本統計を更新
        user.totalScore += gameData.score;
        user.gamesPlayed++;
        user.totalTime += gameData.time || 0;
        user.totalCorrect += gameData.correctAnswers || 0;
        user.totalWrong += gameData.wrongAnswers || 0;
        user.totalAnswerTime += gameData.avgTime || 0;
        
        // ゲーム履歴に追加
        const gameRecord = {
            timestamp: new Date().toISOString(),
            mode: gameData.mode,
            difficulty: gameData.difficulty,
            training: gameData.training,
            score: gameData.score,
            level: gameData.level,
            combo: gameData.combo,
            time: gameData.time,
            correctAnswers: gameData.correctAnswers,
            wrongAnswers: gameData.wrongAnswers,
            avgTime: gameData.avgTime
        };
        
        user.gameHistory.push(gameRecord);
        
        // 最高記録を更新
        const key = `${gameData.mode}-${gameData.difficulty}-${gameData.training || 'none'}`;
        
        if (!user.bestScores.score[key] || gameData.score > user.bestScores.score[key].score) {
            user.bestScores.score[key] = {
                score: gameData.score,
                timestamp: gameRecord.timestamp,
                level: gameData.level,
                combo: gameData.combo
            };
        }
        
        if (gameData.time && (!user.bestScores.time[key] || gameData.time < user.bestScores.time[key].time)) {
            user.bestScores.time[key] = {
                time: gameData.time,
                timestamp: gameRecord.timestamp,
                score: gameData.score
            };
        }
        
        if (!user.bestScores.combo[key] || gameData.combo > user.bestScores.combo[key].combo) {
            user.bestScores.combo[key] = {
                combo: gameData.combo,
                timestamp: gameRecord.timestamp,
                score: gameData.score
            };
        }
        
        // アイテム獲得チェック
        const newItems = this.checkItemUnlocks(user, gameData);
        
        // ユーザーデータを保存（LocalStorageのみ）
        this.saveUsers();
        // JSON自動保存は無効化 - 手動保存のみ
        
        // 新しく獲得したアイテムを返す
        return newItems;
    }
    
    // アイテム解放チェック
    checkItemUnlocks(user, gameData) {
        const newItems = [];
        
        // スコアベースアイテム
        const scoreThresholds = [
            { score: 1000, item: { id: 'bronze_medal', name: 'ブロンズメダル', description: '初回1000点達成' }},
            { score: 5000, item: { id: 'silver_medal', name: 'シルバーメダル', description: '5000点達成' }},
            { score: 10000, item: { id: 'gold_medal', name: 'ゴールドメダル', description: '10000点達成' }},
            { score: 25000, item: { id: 'platinum_medal', name: 'プラチナメダル', description: '25000点達成' }},
            { score: 50000, item: { id: 'diamond_medal', name: 'ダイヤモンドメダル', description: '50000点達成' }}
        ];
        
        scoreThresholds.forEach(threshold => {
            if (gameData.score >= threshold.score && !user.items.find(item => item.id === threshold.item.id)) {
                newItems.push(threshold.item);
                user.items.push({
                    ...threshold.item,
                    unlockedAt: new Date().toISOString(),
                    isNew: true
                });
            }
        });
        
        // コンボベースアイテム
        const comboThresholds = [
            { combo: 10, item: { id: 'combo_star', name: 'コンボスター', description: '10連続正解達成' }},
            { combo: 25, item: { id: 'combo_crown', name: 'コンボクラウン', description: '25連続正解達成' }},
            { combo: 50, item: { id: 'combo_legend', name: 'コンボレジェンド', description: '50連続正解達成' }}
        ];
        
        comboThresholds.forEach(threshold => {
            if (gameData.combo >= threshold.combo && !user.items.find(item => item.id === threshold.item.id)) {
                newItems.push(threshold.item);
                user.items.push({
                    ...threshold.item,
                    unlockedAt: new Date().toISOString(),
                    isNew: true
                });
            }
        });
        
        // ゲーム数ベースアイテム
        if (user.gamesPlayed >= 10 && !user.items.find(item => item.id === 'veteran_badge')) {
            const item = { id: 'veteran_badge', name: 'ベテランバッジ', description: '10ゲーム達成' };
            newItems.push(item);
            user.items.push({
                ...item,
                unlockedAt: new Date().toISOString(),
                isNew: true
            });
        }
        
        if (user.gamesPlayed >= 100 && !user.items.find(item => item.id === 'master_badge')) {
            const item = { id: 'master_badge', name: 'マスターバッジ', description: '100ゲーム達成' };
            newItems.push(item);
            user.items.push({
                ...item,
                unlockedAt: new Date().toISOString(),
                isNew: true
            });
        }
        
        return newItems;
    }
    
    // ユーザーデータをローカルファイルに保存
    async saveUserDataToFile(user) {
        const data = {
            user: user,
            exportedAt: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const filename = `mathblocks_${user.username}_${new Date().toISOString().split('T')[0]}.json`;
        const jsonString = JSON.stringify(data, null, 2);
        
        try {
            // File System Access APIを使用（対応ブラウザの場合）
            if ('showSaveFilePicker' in window) {
                const fileHandle = await window.showSaveFilePicker({
                    suggestedName: filename,
                    types: [{
                        description: 'JSON files',
                        accept: { 'application/json': ['.json'] }
                    }]
                });
                const writable = await fileHandle.createWritable();
                await writable.write(jsonString);
                await writable.close();
            } else {
                // フォールバック: ダウンロードリンクを使用
                this.downloadFile(jsonString, filename, 'application/json');
            }
        } catch (error) {
            console.error('ファイル保存エラー:', error);
            // エラー時もフォールバック
            this.downloadFile(jsonString, filename, 'application/json');
        }
    }
    
    // ファイルダウンロード（フォールバック）
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // 保存パスを設定
    setSavePath(path) {
        this.userSavePath = path;
        localStorage.setItem('mathblocks_save_path', path);
        
        if (this.currentUser) {
            this.currentUser.preferences.savePath = path;
            this.saveUsers();
        }
    }
    
    // 保存パスを取得
    getSavePath() {
        return this.userSavePath;
    }
    
    // ユーザー一覧を取得
    getUserList() {
        return Array.from(this.users.keys());
    }
    
    // ユーザーの詳細情報を取得
    getUserInfo(username) {
        return this.users.get(username);
    }
    
    // ユーザーデータをLocalStorageから読み込み
    loadUsers() {
        try {
            const userData = localStorage.getItem('mathblocks_users');
            if (userData) {
                const users = JSON.parse(userData);
                this.users = new Map(Object.entries(users));
            }
            
            // 前回のセッション情報を復元
            const sessionData = localStorage.getItem('mathblocks_session');
            if (sessionData) {
                const session = JSON.parse(sessionData);
                if (session.username && this.users.has(session.username)) {
                    this.currentUser = this.users.get(session.username);
                    this.isGuestMode = false;
                    this.userSavePath = this.currentUser.preferences.savePath || this.defaultSavePath;
                }
            }
        } catch (error) {
            console.error('ユーザーデータ読み込みエラー:', error);
            this.users = new Map();
        }
    }
    
    // ユーザーデータをLocalStorageに保存
    saveUsers() {
        try {
            const usersObject = Object.fromEntries(this.users);
            localStorage.setItem('mathblocks_users', JSON.stringify(usersObject));
        } catch (error) {
            console.error('ユーザーデータ保存エラー:', error);
        }
    }
    
    // 現在のセッション情報を保存
    saveCurrentSession() {
        try {
            const sessionData = {
                username: this.currentUser?.username || null,
                isGuestMode: this.isGuestMode,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('mathblocks_session', JSON.stringify(sessionData));
        } catch (error) {
            console.error('セッション保存エラー:', error);
        }
    }
    
    // ユーザーデータをエクスポート
    exportUserData(username) {
        const user = this.users.get(username);
        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }
        
        const exportData = {
            user: user,
            exportedAt: new Date().toISOString(),
            version: '2.0.0'
        };
        
        const filename = `mathblocks_export_${username}_${new Date().toISOString().split('T')[0]}.json`;
        this.downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
    }
    
    // ユーザーデータをインポート
    async importUserData() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            return new Promise((resolve, reject) => {
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        reject(new Error('ファイルが選択されていません'));
                        return;
                    }
                    
                    try {
                        const text = await file.text();
                        const data = JSON.parse(text);
                        
                        if (!data.user || !data.user.username) {
                            throw new Error('無効なファイル形式です');
                        }
                        
                        const user = data.user;
                        this.users.set(user.username, user);
                        this.saveUsers();
                        
                        resolve(user);
                    } catch (error) {
                        reject(error);
                    }
                };
                
                input.click();
            });
        } catch (error) {
            throw new Error(`インポートエラー: ${error.message}`);
        }
    }
    
    // ユーザーを削除
    deleteUser(username) {
        if (!this.users.has(username)) {
            throw new Error('ユーザーが見つかりません');
        }
        
        if (this.currentUser && this.currentUser.username === username) {
            this.switchToGuestMode();
        }
        
        this.users.delete(username);
        this.saveUsers();
    }
    
    // 統計情報を取得
    getUserStats(username) {
        const user = this.users.get(username);
        if (!user) return null;
        
        return {
            totalScore: user.totalScore,
            gamesPlayed: user.gamesPlayed,
            totalTime: user.totalTime,
            averageScore: user.gamesPlayed > 0 ? Math.round(user.totalScore / user.gamesPlayed) : 0,
            averageTime: user.gamesPlayed > 0 ? Math.round(user.totalTime / user.gamesPlayed) : 0,
            bestScores: user.bestScores,
            itemCount: user.items.length,
            achievementCount: user.achievements.length
        };
    }
    
    // 全ユーザーデータを取得
    getAllUsers() {
        // MapオブジェクトからArray形式に変換
        const usersArray = Array.from(this.users.entries()).map(([username, data]) => ({
            username,
            ...data
        }));
        return usersArray;
    }
    
    // 自動ユーザーデータ保存機能（DownloadManagerに統合されたため無効化）
    autoSaveUserDataToFile() {
        console.log('UserManager: 個別の自動保存は無効化されています。DownloadManagerを使用してください。');
        return;
        
        // ゲストモードの場合は保存しない
        if (this.isGuestMode) {
            console.log('ゲストモードのため、ユーザーデータは保存されません');
            return;
        }
        
        try {
            // 現在の日時を取得
            const now = new Date();
            const timestamp = now.toISOString().split('T')[0]; // YYYY-MM-DD形式
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS形式
            
            // 全ユーザーデータを配列に変換
            const usersArray = Array.from(this.users.entries()).map(([username, data]) => ({
                username,
                ...data
            }));
            
            // 保存データを準備
            const saveData = {
                exportDate: now.toISOString(),
                version: "MathBlocks v1.3.0",
                totalUsers: usersArray.length,
                currentUser: this.currentUser ? this.currentUser.username : null,
                users: usersArray,
                exportInfo: {
                    exportedBy: this.currentUser ? this.currentUser.username : 'ゲスト',
                    exportedAt: now.toLocaleString('ja-JP')
                }
            };
            
            // JSONファイルとして自動ダウンロード
            const jsonContent = JSON.stringify(saveData, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `mathblocks_users_${timestamp}_${timeStr}.json`;
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            console.log(`ユーザーデータ自動バックアップ完了: mathblocks_users_${timestamp}_${timeStr}.json`);
            
        } catch (error) {
            console.error('ユーザーデータ自動保存エラー:', error);
        }
    }
    
    // JSONファイルからユーザーデータをインポート
    importFromJSON(jsonData) {
        try {
            // 文字列の場合はパース
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // バージョン確認（警告のみ）
            if (data.version && !data.version.includes('MathBlocks')) {
                console.warn('このファイルはMathBlocks以外で作成された可能性があります');
            }
            
            // ユーザーデータの検証
            if (!data.users || !Array.isArray(data.users)) {
                throw new Error('有効なユーザーデータが見つかりません');
            }
            
            // 既存のユーザーと重複チェック
            const existingUsers = new Set(Array.from(this.users.keys()));
            const newUsers = [];
            const updatedUsers = [];
            let duplicateCount = 0;
            
            for (const userData of data.users) {
                // 必須フィールドの確認
                if (!userData.username) {
                    console.warn('ユーザー名がないデータをスキップしました:', userData);
                    continue;
                }
                
                // ユーザーデータの正規化
                const normalizedUser = {
                    username: userData.username,
                    createdAt: userData.createdAt || new Date().toISOString(),
                    totalScore: userData.totalScore || 0,
                    gamesPlayed: userData.gamesPlayed || 0,
                    totalTime: userData.totalTime || 0,
                    totalCorrect: userData.totalCorrect || 0,
                    totalWrong: userData.totalWrong || 0,
                    totalAnswerTime: userData.totalAnswerTime || 0,
                    bestScores: userData.bestScores || {},
                    items: userData.items || [],
                    achievements: userData.achievements || []
                };
                
                // 重複チェック（既存ユーザーは更新確認）
                if (existingUsers.has(userData.username)) {
                    duplicateCount++;
                    
                    // 既存ユーザーのデータと比較（より良い記録を保持）
                    const existingUser = this.users.get(userData.username);
                    const shouldUpdate = this.shouldUpdateUser(existingUser, normalizedUser);
                    
                    if (shouldUpdate) {
                        updatedUsers.push(userData.username);
                        // より良い記録をマージ
                        this.mergeUserData(existingUser, normalizedUser);
                    }
                    continue;
                }
                
                // 新規ユーザーとして追加
                this.users.set(normalizedUser.username, normalizedUser);
                newUsers.push(normalizedUser.username);
            }
            
            // インポート結果の確認
            if (newUsers.length === 0 && updatedUsers.length === 0) {
                if (duplicateCount > 0) {
                    return {
                        success: true,
                        imported: 0,
                        updated: 0,
                        duplicates: duplicateCount,
                        total: this.users.size,
                        message: `${duplicateCount}件の既存ユーザーが見つかりましたが、更新は不要でした`
                    };
                }
                throw new Error('インポート可能なユーザーが見つかりませんでした');
            }
            
            // 保存
            this.saveUsers();
            
            // 結果を返す
            const result = {
                success: true,
                imported: newUsers.length,
                updated: updatedUsers.length,
                duplicates: duplicateCount,
                total: this.users.size,
                message: `${newUsers.length}人の新規ユーザーをインポート${updatedUsers.length > 0 ? `、${updatedUsers.length}人のデータを更新` : ''}しました`
            };
            
            console.log('ユーザーインポート完了:', result);
            return result;
            
        } catch (error) {
            console.error('ユーザーインポートエラー:', error);
            return {
                success: false,
                error: error.message,
                message: `インポートに失敗しました: ${error.message}`
            };
        }
    }
    
    // 既存ユーザーを更新すべきか判定
    shouldUpdateUser(existing, imported) {
        // より良いスコアがあるか
        return imported.totalScore > existing.totalScore ||
               imported.gamesPlayed > existing.gamesPlayed ||
               imported.items.length > existing.items.length;
    }
    
    // ユーザーデータをマージ（より良い記録を保持）
    mergeUserData(existing, imported) {
        existing.totalScore = Math.max(existing.totalScore, imported.totalScore);
        existing.gamesPlayed = Math.max(existing.gamesPlayed, imported.gamesPlayed);
        existing.totalTime = Math.max(existing.totalTime, imported.totalTime);
        existing.totalCorrect = Math.max(existing.totalCorrect, imported.totalCorrect);
        existing.totalWrong = Math.max(existing.totalWrong, imported.totalWrong);
        existing.totalAnswerTime = Math.max(existing.totalAnswerTime, imported.totalAnswerTime);
        
        // アイテムをマージ（重複削除）
        const itemSet = new Set([...existing.items, ...imported.items]);
        existing.items = Array.from(itemSet);
        
        // 実績をマージ（重複削除）
        const achievementSet = new Set([...existing.achievements, ...imported.achievements]);
        existing.achievements = Array.from(achievementSet);
        
        // ベストスコアをマージ（より良い記録を保持）
        for (const [key, value] of Object.entries(imported.bestScores || {})) {
            if (!existing.bestScores[key] || value > existing.bestScores[key]) {
                existing.bestScores[key] = value;
            }
        }
    }
}