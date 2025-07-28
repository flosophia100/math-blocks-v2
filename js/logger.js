// ログファイル出力システム
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // 最大ログ数
        this.logLevel = 'DEBUG'; // DEBUG, INFO, WARN, ERROR
        this.enableFileLog = true;
        
        // エラーハンドラーを設定
        this.setupErrorHandlers();
        
        // 定期的にファイルに書き出し
        this.startPeriodicSave();
    }
    
    setupErrorHandlers() {
        // 一時的にエラーハンドリングを無効化（無限ループ防止のため）
        console.log('Logger: Error handlers temporarily disabled to prevent infinite loops');
        
        // オリジナルのコンソール関数を保存
        this.originalConsoleError = console.error;
        this.originalConsoleWarn = console.warn;
        this.loggingInProgress = false;
        
        // 安全なエラーハンドリングのみ有効化
        window.addEventListener('error', (event) => {
            // 無限ループ防止のため最低限のログのみ
            try {
                this.logs.push({
                    timestamp: new Date().toISOString(),
                    level: 'ERROR',
                    category: 'JavaScript Error',
                    message: event.message,
                    data: { filename: event.filename, line: event.lineno }
                });
            } catch (e) {
                // ログ記録でエラーが発生してもスルー
            }
        });
    }
    
    log(level, category, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        this.logs.push(logEntry);
        
        // ログ数制限
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }
        
        // 一時的にコンソール出力を無効化（無限ループ防止のため）
        // const consoleMessage = `[${timestamp}] [${level}] ${category}: ${message}`;
        // コンソール出力は無効化中
    }
    
    debug(category, message, data = null) {
        if (this.logLevel === 'DEBUG') {
            this.log('DEBUG', category, message, data);
        }
    }
    
    info(category, message, data = null) {
        this.log('INFO', category, message, data);
    }
    
    warn(category, message, data = null) {
        this.log('WARN', category, message, data);
    }
    
    error(category, message, data = null) {
        this.log('ERROR', category, message, data);
    }
    
    // ログをファイル形式の文字列に変換
    formatLogsForFile() {
        return this.logs.map(log => {
            const dataStr = log.data ? JSON.stringify(log.data) : '';
            return `${log.timestamp} [${log.level}] ${log.category}: ${log.message} ${dataStr}`;
        }).join('\n');
    }
    
    // ログをダウンロード
    downloadLogs() {
        console.log('Logger: downloadLogs called, logs count:', this.logs.length);
        console.log('Logger: First few logs:', this.logs.slice(0, 3));
        
        // ログが空の場合はテストログを生成
        if (this.logs.length === 0) {
            console.log('Logger: No logs found, generating test logs');
            this.info('Logger', 'Test log entry 1 - Logger system is working');
            this.info('Logger', 'Test log entry 2 - Download function called');
            this.error('Logger', 'Test error log to verify functionality');
            console.log('Logger: Test logs generated, new count:', this.logs.length);
        }
        
        const logContent = this.formatLogsForFile();
        console.log('Logger: Formatted log content length:', logContent.length);
        console.log('Logger: First 200 chars of content:', logContent.substring(0, 200));
        
        const filename = `mathblocks-log-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
        
        // DownloadManagerを使用
        if (window.downloadManager) {
            console.log('Logger: Using DownloadManager');
            window.downloadManager.manualDownload(logContent, filename, 'text/plain');
        } else {
            console.log('Logger: Using fallback download method');
            // フォールバック
            const blob = new Blob([logContent], { type: 'text/plain' });
            console.log('Logger: Blob size:', blob.size);
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    // LocalStorageに保存
    saveToStorage() {
        try {
            const recentLogs = this.logs.slice(-100); // 最新100件のみ保存
            localStorage.setItem('mathblocks-logs', JSON.stringify(recentLogs));
        } catch (error) {
            console.error('Failed to save logs to localStorage:', error);
        }
    }
    
    // LocalStorageから読み込み
    loadFromStorage() {
        try {
            const savedLogs = localStorage.getItem('mathblocks-logs');
            if (savedLogs) {
                const logs = JSON.parse(savedLogs);
                this.logs = [...logs, ...this.logs];
            }
        } catch (error) {
            console.error('Failed to load logs from localStorage:', error);
        }
    }
    
    // 定期的に保存
    startPeriodicSave() {
        setInterval(() => {
            this.saveToStorage();
        }, 10000); // 10秒ごと
    }
    
    // ログをクリア
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('mathblocks-logs');
    }
    
    // 統計情報を取得
    getStats() {
        const stats = {
            total: this.logs.length,
            errors: this.logs.filter(log => log.level === 'ERROR').length,
            warnings: this.logs.filter(log => log.level === 'WARN').length,
            info: this.logs.filter(log => log.level === 'INFO').length,
            debug: this.logs.filter(log => log.level === 'DEBUG').length
        };
        
        return stats;
    }
    
    // 最新のエラーを取得
    getRecentErrors(count = 10) {
        return this.logs
            .filter(log => log.level === 'ERROR')
            .slice(-count)
            .reverse();
    }
}

// グローバルロガーインスタンス
window.logger = new Logger();

// 初期化時にStorageから読み込み
window.logger.loadFromStorage();

// ページ読み込み完了時にログ管理UIを追加
document.addEventListener('DOMContentLoaded', () => {
    addLogManagementUI();
});

// ログ管理UIを追加
function addLogManagementUI() {
    const logPanel = document.createElement('div');
    logPanel.id = 'logManagementPanel';
    logPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 10000;
        display: none;
        max-width: 300px;
    `;
    
    logPanel.innerHTML = `
        <h4>ログ管理</h4>
        <div id="logStats"></div>
        <button onclick="window.logger.downloadLogs()">ログダウンロード</button>
        <button onclick="window.logger.clearLogs()">ログクリア</button>
        <button onclick="toggleLogPanel()">閉じる</button>
        <div id="recentErrors" style="margin-top: 10px; max-height: 200px; overflow-y: auto;"></div>
    `;
    
    document.body.appendChild(logPanel);
    
    // ログパネル表示ボタン
    const toggleButton = document.createElement('button');
    toggleButton.id = 'logToggleButton';
    toggleButton.textContent = 'LOG';
    toggleButton.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #ff4444;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 3px;
        cursor: pointer;
        z-index: 9999;
        font-size: 10px;
    `;
    toggleButton.onclick = toggleLogPanel;
    
    document.body.appendChild(toggleButton);
    
    // 定期的にログ統計を更新
    setInterval(updateLogStats, 5000);
    updateLogStats();
}

function toggleLogPanel() {
    const panel = document.getElementById('logManagementPanel');
    const button = document.getElementById('logToggleButton');
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        button.style.display = 'none';
        updateRecentErrors();
    } else {
        panel.style.display = 'none';
        button.style.display = 'block';
    }
}

function updateLogStats() {
    const stats = window.logger.getStats();
    const statsElement = document.getElementById('logStats');
    const button = document.getElementById('logToggleButton');
    
    if (statsElement) {
        statsElement.innerHTML = `
            総ログ数: ${stats.total}<br>
            エラー: ${stats.errors}<br>
            警告: ${stats.warnings}<br>
            情報: ${stats.info}<br>
            デバッグ: ${stats.debug}
        `;
    }
    
    if (button) {
        // エラーがある場合は赤、警告のみの場合は黄色
        if (stats.errors > 0) {
            button.style.background = '#ff4444';
            button.textContent = `LOG(${stats.errors})`;
        } else if (stats.warnings > 0) {
            button.style.background = '#ffaa44';
            button.textContent = `LOG(${stats.warnings})`;
        } else {
            button.style.background = '#44ff44';
            button.textContent = 'LOG';
        }
    }
}

function updateRecentErrors() {
    const recentErrors = window.logger.getRecentErrors(5);
    const errorsElement = document.getElementById('recentErrors');
    
    if (errorsElement) {
        if (recentErrors.length === 0) {
            errorsElement.innerHTML = '<div>最近のエラーはありません</div>';
        } else {
            errorsElement.innerHTML = '<h5>最新のエラー:</h5>' + 
                recentErrors.map(error => `
                    <div style="margin: 5px 0; padding: 5px; background: rgba(255,0,0,0.2); border-radius: 3px;">
                        <div><strong>${error.category}</strong></div>
                        <div style="font-size: 11px;">${error.message}</div>
                        <div style="font-size: 10px; color: #ccc;">${error.timestamp}</div>
                    </div>
                `).join('');
        }
    }
}