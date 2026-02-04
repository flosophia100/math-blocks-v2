// ユーザー管理システム（Supabase対応版）
class UserManager {
    constructor() {
        this.currentUser = null;
        this.isGuestMode = true;
        this.users = new Map();
        this.supabase = null;
        this.isOnline = navigator.onLine;

        // オンライン/オフライン監視
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('オンラインになりました');
            this.syncLocalData();
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('オフラインになりました');
        });

        // 初期化
        this.init();
    }

    async init() {
        // Supabase初期化
        this.supabase = getSupabase();

        // ローカルデータを読み込み
        this.loadLocalUsers();

        // オンラインならサーバーからも取得
        if (this.isOnline && this.supabase) {
            await this.fetchUsersFromServer();
        }
    }

    // サーバーからユーザー一覧を取得
    async fetchUsersFromServer() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // サーバーのデータでローカルを更新
            if (data) {
                data.forEach(user => {
                    this.users.set(user.username, this.convertFromDB(user));
                });
                this.saveLocalUsers();
            }

            console.log('サーバーからユーザーデータを取得しました');
        } catch (error) {
            console.error('ユーザーデータ取得エラー:', error);
        }
    }

    // DBフォーマットからアプリフォーマットに変換
    convertFromDB(dbUser) {
        return {
            id: dbUser.id,
            username: dbUser.username,
            createdAt: dbUser.created_at,
            totalScore: dbUser.total_score || 0,
            gamesPlayed: dbUser.total_games || 0,
            bestScore: dbUser.best_score || 0,
            bestCombo: dbUser.best_combo || 0,
            totalCorrect: dbUser.total_correct || 0,
            totalWrong: dbUser.total_wrong || 0,
            totalTime: 0,
            totalAnswerTime: 0,
            bestScores: {},
            gameHistory: [],
            items: [],
            achievements: [],
            preferences: { savePath: './' }
        };
    }

    // アプリフォーマットからDBフォーマットに変換
    convertToDB(user) {
        return {
            username: user.username,
            total_games: user.gamesPlayed || 0,
            total_score: user.totalScore || 0,
            best_score: user.bestScore || 0,
            best_combo: user.bestCombo || 0,
            total_correct: user.totalCorrect || 0,
            total_wrong: user.totalWrong || 0
        };
    }

    // ユーザー登録
    async registerUser(username) {
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
            bestScore: 0,
            bestCombo: 0,
            totalTime: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalAnswerTime: 0,
            bestScores: {},
            gameHistory: [],
            items: [],
            achievements: [],
            preferences: { savePath: './' }
        };

        // サーバーに登録
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('users')
                    .insert([{ username }])
                    .select()
                    .single();

                if (error) {
                    if (error.code === '23505') {
                        throw new Error('このユーザー名は既に使用されています');
                    }
                    throw error;
                }

                user.id = data.id;
                console.log('サーバーにユーザーを登録しました:', username);
            } catch (error) {
                console.error('サーバー登録エラー:', error);
                throw error;
            }
        }

        this.users.set(username, user);
        this.saveLocalUsers();
        return user;
    }

    // ユーザーログイン
    async loginUser(username) {
        let user = this.users.get(username);

        // ローカルにある場合はそのまま使用
        if (user) {
            this.currentUser = user;
            this.isGuestMode = false;
            this.saveCurrentSession();
            return user;
        }

        // ローカルにない場合はサーバーから取得
        if (this.isOnline && this.supabase) {
            try {
                const { data, error } = await this.supabase
                    .from('users')
                    .select('*')
                    .eq('username', username);

                if (error) throw error;

                if (data && data.length > 0) {
                    user = this.convertFromDB(data[0]);
                    this.users.set(username, user);
                    this.saveLocalUsers();
                }
            } catch (error) {
                console.error('ユーザー取得エラー:', error);
            }
        }

        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }

        this.currentUser = user;
        this.isGuestMode = false;
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
    async recordGameResult(gameData) {
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

        // ベストスコア更新
        if (gameData.score > (user.bestScore || 0)) {
            user.bestScore = gameData.score;
        }
        if (gameData.combo > (user.bestCombo || 0)) {
            user.bestCombo = gameData.combo;
        }

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

        if (!user.gameHistory) user.gameHistory = [];
        user.gameHistory.push(gameRecord);

        // 最高記録を更新
        const key = `${gameData.mode}-${gameData.difficulty}-${gameData.training || 'none'}`;
        if (!user.bestScores) user.bestScores = { score: {}, time: {}, combo: {} };

        if (!user.bestScores.score[key] || gameData.score > user.bestScores.score[key].score) {
            user.bestScores.score[key] = {
                score: gameData.score,
                timestamp: gameRecord.timestamp,
                level: gameData.level,
                combo: gameData.combo
            };
        }

        // サーバーに更新
        if (this.isOnline && this.supabase && user.id) {
            try {
                const { error } = await this.supabase
                    .from('users')
                    .update(this.convertToDB(user))
                    .eq('id', user.id);

                if (error) throw error;
                console.log('サーバーにユーザーデータを更新しました');
            } catch (error) {
                console.error('サーバー更新エラー:', error);
            }
        }

        // アイテム獲得チェック
        const newItems = this.checkItemUnlocks(user, gameData);

        // ローカルに保存
        this.saveLocalUsers();

        return newItems;
    }

    // アイテム解放チェック
    checkItemUnlocks(user, gameData) {
        const newItems = [];
        if (!user.items) user.items = [];

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
            user.items.push({ ...item, unlockedAt: new Date().toISOString(), isNew: true });
        }

        if (user.gamesPlayed >= 100 && !user.items.find(item => item.id === 'master_badge')) {
            const item = { id: 'master_badge', name: 'マスターバッジ', description: '100ゲーム達成' };
            newItems.push(item);
            user.items.push({ ...item, unlockedAt: new Date().toISOString(), isNew: true });
        }

        return newItems;
    }

    // ローカルデータをサーバーに同期
    async syncLocalData() {
        if (!this.isOnline || !this.supabase) return;

        console.log('ローカルデータをサーバーに同期中...');

        for (const [username, user] of this.users) {
            if (!user.id) {
                // サーバーにない場合は登録
                try {
                    const { data, error } = await this.supabase
                        .from('users')
                        .upsert([{
                            username: user.username,
                            ...this.convertToDB(user)
                        }], { onConflict: 'username' })
                        .select()
                        .single();

                    if (!error && data) {
                        user.id = data.id;
                    }
                } catch (error) {
                    console.error('同期エラー:', error);
                }
            }
        }

        this.saveLocalUsers();
        console.log('同期完了');
    }

    // ユーザー一覧を取得
    getUserList() {
        return Array.from(this.users.keys());
    }

    // ユーザーの詳細情報を取得
    getUserInfo(username) {
        return this.users.get(username);
    }

    // ローカルストレージからユーザーを読み込み
    loadLocalUsers() {
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
                }
            }
        } catch (error) {
            console.error('ローカルユーザーデータ読み込みエラー:', error);
            this.users = new Map();
        }
    }

    // ローカルストレージにユーザーを保存
    saveLocalUsers() {
        try {
            const usersObject = Object.fromEntries(this.users);
            localStorage.setItem('mathblocks_users', JSON.stringify(usersObject));
        } catch (error) {
            console.error('ローカルユーザーデータ保存エラー:', error);
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

    // ユーザーを削除
    async deleteUser(username) {
        if (!this.users.has(username)) {
            throw new Error('ユーザーが見つかりません');
        }

        const user = this.users.get(username);

        // サーバーから削除
        if (this.isOnline && this.supabase && user.id) {
            try {
                const { error } = await this.supabase
                    .from('users')
                    .delete()
                    .eq('id', user.id);

                if (error) throw error;
            } catch (error) {
                console.error('サーバー削除エラー:', error);
            }
        }

        if (this.currentUser && this.currentUser.username === username) {
            this.switchToGuestMode();
        }

        this.users.delete(username);
        this.saveLocalUsers();
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
            itemCount: (user.items || []).length,
            achievementCount: (user.achievements || []).length
        };
    }

    // 全ユーザーデータを取得
    getAllUsers() {
        const usersArray = Array.from(this.users.entries()).map(([username, data]) => ({
            username,
            ...data
        }));
        return usersArray;
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

    // ファイルダウンロード
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

    // JSONファイルからユーザーデータをインポート
    importFromJSON(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (!data.users || !Array.isArray(data.users)) {
                throw new Error('有効なユーザーデータが見つかりません');
            }

            let importedCount = 0;

            for (const userData of data.users) {
                if (!userData.username) continue;

                if (!this.users.has(userData.username)) {
                    this.users.set(userData.username, userData);
                    importedCount++;
                }
            }

            this.saveLocalUsers();

            return {
                success: true,
                imported: importedCount,
                message: `${importedCount}人のユーザーをインポートしました`
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
