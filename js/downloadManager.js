// ダウンロード管理システム - 重複ダウンロード防止
class DownloadManager {
    constructor() {
        this.downloadQueue = [];
        this.isProcessing = false;
        this.lastDownloadTime = 0;
        this.downloadCooldown = 2000; // 2秒のクールダウン
        
        // 自動保存の状態管理
        this.autoSaveInProgress = false;
        this.autoSaveRequests = new Set();
    }
    
    // 自動保存の統合処理
    async triggerAutoSave() {
        // 自動保存設定を確認
        const autoSaveEnabled = localStorage.getItem('mathblocks_autosave') === 'true';
        if (!autoSaveEnabled) {
            console.log('DownloadManager: 自動保存は無効です');
            return;
        }
        
        // 既に自動保存が進行中の場合はスキップ
        if (this.autoSaveInProgress) {
            console.log('DownloadManager: 自動保存が既に進行中です');
            return;
        }
        
        // クールダウン期間中はスキップ
        const now = Date.now();
        if (now - this.lastDownloadTime < this.downloadCooldown) {
            console.log('DownloadManager: クールダウン期間中のためスキップ');
            return;
        }
        
        this.autoSaveInProgress = true;
        this.lastDownloadTime = now;
        
        try {
            // UIManagerを取得して統合データを保存
            if (window.game && window.game.uiManager) {
                await this.downloadIntegratedData(window.game.uiManager);
            } else {
                console.warn('DownloadManager: UIManagerが見つかりません');
            }
        } catch (error) {
            console.error('DownloadManager: 自動保存中にエラーが発生:', error);
        } finally {
            this.autoSaveInProgress = false;
            
            // 5秒後にフラグをリセット（確実なクールダウン）
            setTimeout(() => {
                this.autoSaveInProgress = false;
            }, 5000);
        }
    }
    
    // 統合データのダウンロード
    async downloadIntegratedData(uiManager) {
        try {
            // 統合データオブジェクトを作成
            const allData = {
                exportInfo: {
                    version: '2.0',
                    exportDate: new Date().toISOString(),
                    description: 'MathBlocks 統合データファイル（スコア・ユーザーデータ含む）'
                },
                scores: uiManager.scoreManager ? uiManager.scoreManager.getAllScores() : [],
                users: uiManager.userManager ? uiManager.userManager.getAllUsers() : []
            };
            
            // JSON文字列に変換
            const jsonString = JSON.stringify(allData, null, 2);
            
            // ファイル名を生成
            const now = new Date();
            const timestamp = Math.floor(now.getTime() / 1000);
            const timeStr = now.toISOString().replace(/[:.]/g, '-').split('T');
            const dateStr = timeStr[0];
            const timeOnly = timeStr[1].substring(0, 8);
            const filename = `mathblocks_data_${dateStr}_${timeOnly}.json`;
            
            // ダウンロード実行
            await this.executeDownload(jsonString, filename, 'application/json');
            
            console.log('DownloadManager: 統合データの自動保存が完了しました');
            
        } catch (error) {
            console.error('DownloadManager: 統合データの保存中にエラー:', error);
            throw error;
        }
    }
    
    // 実際のダウンロード処理
    async executeDownload(content, filename, contentType) {
        return new Promise((resolve, reject) => {
            try {
                const blob = new Blob([content], { type: contentType });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.href = url;
                link.download = filename;
                link.style.display = 'none';
                
                // ダウンロード完了を検知
                link.addEventListener('click', () => {
                    setTimeout(() => {
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                        resolve();
                    }, 100);
                });
                
                document.body.appendChild(link);
                link.click();
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    // 手動ダウンロード（ログなど）
    async manualDownload(content, filename, contentType = 'text/plain') {
        // 手動ダウンロードは制限なし
        await this.executeDownload(content, filename, contentType);
    }
    
    // 状態をリセット
    reset() {
        this.autoSaveInProgress = false;
        this.autoSaveRequests.clear();
        this.lastDownloadTime = 0;
        console.log('DownloadManager: 状態をリセットしました');
    }
    
    // 現在の状態を取得
    getStatus() {
        return {
            autoSaveInProgress: this.autoSaveInProgress,
            lastDownloadTime: this.lastDownloadTime,
            cooldownRemaining: Math.max(0, this.downloadCooldown - (Date.now() - this.lastDownloadTime))
        };
    }
}

// グローバルなダウンロードマネージャーインスタンスを作成
window.downloadManager = new DownloadManager();

console.log('DownloadManager: 初期化完了');