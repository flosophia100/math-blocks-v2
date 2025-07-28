// 統一エラーハンドリングシステム

// エラータイプ定数
const ErrorType = {
    GAME_ERROR: 'GAME_ERROR',
    UI_ERROR: 'UI_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    STORAGE_ERROR: 'STORAGE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    USER_ERROR: 'USER_ERROR'
};

// エラー重要度レベル
const ErrorSeverity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

// カスタムエラークラス
class MathBlocksError extends Error {
    constructor(message, type = ErrorType.SYSTEM_ERROR, severity = ErrorSeverity.MEDIUM, context = {}) {
        super(message);
        this.name = 'MathBlocksError';
        this.type = type;
        this.severity = severity;
        this.context = context;
        this.timestamp = new Date().toISOString();
        this.stack = (new Error()).stack;
    }
    
    // エラー情報をオブジェクトとして取得
    toObject() {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            severity: this.severity,
            context: this.context,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

// 統一エラーハンドラークラス
class ErrorHandler {
    constructor() {
        this.errorCallbacks = new Map();
        this.errorHistory = [];
        this.maxHistorySize = 100;
        this.setupGlobalErrorHandling();
    }
    
    // グローバルエラーハンドリングを設定
    setupGlobalErrorHandling() {
        // JavaScriptエラー
        window.addEventListener('error', (event) => {
            this.handleError(new MathBlocksError(
                event.error?.message || event.message,
                ErrorType.SYSTEM_ERROR,
                ErrorSeverity.HIGH,
                {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error
                }
            ));
        });
        
        // Promise rejectionエラー
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(new MathBlocksError(
                event.reason?.message || 'Unhandled Promise Rejection',
                ErrorType.SYSTEM_ERROR,
                ErrorSeverity.HIGH,
                {
                    reason: event.reason,
                    promise: event.promise
                }
            ));
        });
        
        // リソース読み込みエラー
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError(new MathBlocksError(
                    `Failed to load resource: ${event.target.src || event.target.href}`,
                    ErrorType.NETWORK_ERROR,
                    ErrorSeverity.MEDIUM,
                    {
                        element: event.target.tagName,
                        src: event.target.src || event.target.href
                    }
                ));
            }
        }, true);
    }
    
    // エラーハンドリング
    handleError(error) {
        // エラーを正規化
        const normalizedError = this.normalizeError(error);
        
        // エラー履歴に追加
        this.addToHistory(normalizedError);
        
        // ログ出力
        this.logError(normalizedError);
        
        // エラーレベルに応じた処理
        this.processErrorBySeverity(normalizedError);
        
        // 登録されたコールバックを実行
        this.executeCallbacks(normalizedError);
        
        // ユーザー通知
        this.notifyUser(normalizedError);
        
        return normalizedError;
    }
    
    // エラーを正規化
    normalizeError(error) {
        if (error instanceof MathBlocksError) {
            return error;
        }
        
        if (error instanceof Error) {
            return new MathBlocksError(
                error.message,
                this.categorizeError(error),
                this.assessSeverity(error),
                { originalError: error }
            );
        }
        
        // 文字列や他の形式のエラー
        return new MathBlocksError(
            String(error),
            ErrorType.SYSTEM_ERROR,
            ErrorSeverity.MEDIUM
        );
    }
    
    // エラーをカテゴライズ
    categorizeError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('network') || message.includes('fetch')) {
            return ErrorType.NETWORK_ERROR;
        }
        if (message.includes('storage') || message.includes('quota')) {
            return ErrorType.STORAGE_ERROR;
        }
        if (message.includes('validation') || message.includes('invalid')) {
            return ErrorType.VALIDATION_ERROR;
        }
        if (message.includes('game') || message.includes('canvas')) {
            return ErrorType.GAME_ERROR;
        }
        if (message.includes('ui') || message.includes('element')) {
            return ErrorType.UI_ERROR;
        }
        
        return ErrorType.SYSTEM_ERROR;
    }
    
    // エラーの重要度を評価
    assessSeverity(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('critical') || message.includes('fatal')) {
            return ErrorSeverity.CRITICAL;
        }
        if (message.includes('security') || message.includes('permission')) {
            return ErrorSeverity.HIGH;
        }
        if (message.includes('warning') || message.includes('deprecated')) {
            return ErrorSeverity.LOW;
        }
        
        return ErrorSeverity.MEDIUM;
    }
    
    // 重要度に応じた処理
    processErrorBySeverity(error) {
        switch (error.severity) {
            case ErrorSeverity.CRITICAL:
                this.handleCriticalError(error);
                break;
            case ErrorSeverity.HIGH:
                this.handleHighError(error);
                break;
            case ErrorSeverity.MEDIUM:
                this.handleMediumError(error);
                break;
            case ErrorSeverity.LOW:
                this.handleLowError(error);
                break;
        }
    }
    
    // 重要なエラーの処理
    handleCriticalError(error) {
        console.error('CRITICAL ERROR:', error);
        
        // ゲームを停止
        if (window.game && window.game.stop) {
            try {
                window.game.stop();
            } catch (e) {
                console.error('Failed to stop game:', e);
            }
        }
        
        // 緊急データ保存
        this.emergencyDataSave();
        
        // ユーザーに警告
        this.showCriticalErrorDialog(error);
    }
    
    handleHighError(error) {
        console.error('HIGH ERROR:', error);
        
        // 自動復旧を試行
        this.attemptAutoRecovery(error);
    }
    
    handleMediumError(error) {
        console.warn('MEDIUM ERROR:', error);
        
        // 軽微な復旧処理
        this.attemptMinorRecovery(error);
    }
    
    handleLowError(error) {
        console.info('LOW ERROR:', error);
        // ログのみ
    }
    
    // エラーログ出力
    logError(error) {
        // コンソールログ
        const logMethod = this.getLogMethod(error.severity);
        logMethod(`[${error.type}] ${error.message}`, error.context);
        
        // ログシステムに記録
        if (window.logger) {
            window.logger.error(
                error.type,
                error.message,
                {
                    ...error.context,
                    severity: error.severity,
                    timestamp: error.timestamp
                }
            );
        }
    }
    
    // ログメソッドを取得
    getLogMethod(severity) {
        switch (severity) {
            case ErrorSeverity.CRITICAL:
            case ErrorSeverity.HIGH:
                return console.error;
            case ErrorSeverity.MEDIUM:
                return console.warn;
            case ErrorSeverity.LOW:
                return console.info;
            default:
                return console.log;
        }
    }
    
    // エラー履歴に追加
    addToHistory(error) {
        this.errorHistory.push(error.toObject());
        
        // 履歴サイズを制限
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
        }
    }
    
    // コールバック実行
    executeCallbacks(error) {
        const callbacks = this.errorCallbacks.get(error.type) || [];
        callbacks.forEach(callback => {
            try {
                callback(error);
            } catch (callbackError) {
                console.error('Error in error callback:', callbackError);
            }
        });
        
        // 汎用コールバック
        const generalCallbacks = this.errorCallbacks.get('*') || [];
        generalCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (callbackError) {
                console.error('Error in general error callback:', callbackError);
            }
        });
    }
    
    // ユーザー通知
    notifyUser(error) {
        if (error.severity === ErrorSeverity.LOW) {
            return; // 軽微なエラーは通知しない
        }
        
        const userMessage = this.getUserFriendlyMessage(error);
        const notificationType = this.getNotificationType(error.severity);
        
        if (window.DOMUtils) {
            window.DOMUtils.showNotification(userMessage, notificationType);
        } else {
            // フォールバック
            console.warn('User notification:', userMessage);
        }
    }
    
    // ユーザーフレンドリーなメッセージを生成
    getUserFriendlyMessage(error) {
        const typeMessages = {
            [ErrorType.GAME_ERROR]: 'ゲーム処理でエラーが発生しました',
            [ErrorType.UI_ERROR]: '画面表示でエラーが発生しました',
            [ErrorType.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
            [ErrorType.STORAGE_ERROR]: 'データ保存でエラーが発生しました',
            [ErrorType.VALIDATION_ERROR]: '入力データに問題があります',
            [ErrorType.USER_ERROR]: '操作に問題があります',
            [ErrorType.SYSTEM_ERROR]: 'システムエラーが発生しました'
        };
        
        let baseMessage = typeMessages[error.type] || 'エラーが発生しました';
        
        // 重要度に応じてメッセージを調整
        if (error.severity === ErrorSeverity.CRITICAL) {
            baseMessage = '重大なエラーが発生しました。' + baseMessage;
        }
        
        return baseMessage;
    }
    
    // 通知タイプを取得
    getNotificationType(severity) {
        switch (severity) {
            case ErrorSeverity.CRITICAL:
            case ErrorSeverity.HIGH:
                return 'error';
            case ErrorSeverity.MEDIUM:
                return 'warning';
            case ErrorSeverity.LOW:
                return 'info';
            default:
                return 'info';
        }
    }
    
    // 自動復旧を試行
    attemptAutoRecovery(error) {
        switch (error.type) {
            case ErrorType.STORAGE_ERROR:
                this.recoverStorageError();
                break;
            case ErrorType.GAME_ERROR:
                this.recoverGameError();
                break;
            case ErrorType.UI_ERROR:
                this.recoverUIError();
                break;
        }
    }
    
    // 軽微な復旧処理
    attemptMinorRecovery(error) {
        // 基本的なクリーンアップ
        this.performBasicCleanup();
    }
    
    // 緊急データ保存
    emergencyDataSave() {
        try {
            if (window.userManager && !window.userManager.isGuest()) {
                const currentUser = window.userManager.getCurrentUser();
                if (currentUser) {
                    // 緊急バックアップ作成
                    const emergencyData = {
                        timestamp: new Date().toISOString(),
                        user: currentUser,
                        reason: 'critical_error_emergency_save'
                    };
                    
                    localStorage.setItem('mathblocks_emergency_backup', JSON.stringify(emergencyData));
                }
            }
        } catch (e) {
            console.error('Failed to perform emergency save:', e);
        }
    }
    
    // 重大エラーダイアログ表示
    showCriticalErrorDialog(error) {
        const message = `重大なエラーが発生しました。\n\n${error.message}\n\nページを再読み込みしてください。`;
        alert(message);
    }
    
    // エラーコールバックを登録
    onError(errorType, callback) {
        if (!this.errorCallbacks.has(errorType)) {
            this.errorCallbacks.set(errorType, []);
        }
        this.errorCallbacks.get(errorType).push(callback);
    }
    
    // エラーコールバックを削除
    offError(errorType, callback) {
        if (this.errorCallbacks.has(errorType)) {
            const callbacks = this.errorCallbacks.get(errorType);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    // エラー履歴を取得
    getErrorHistory() {
        return [...this.errorHistory];
    }
    
    // エラー統計を取得
    getErrorStatistics() {
        const stats = {
            total: this.errorHistory.length,
            byType: {},
            bySeverity: {},
            recent: this.errorHistory.slice(-10)
        };
        
        this.errorHistory.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
        });
        
        return stats;
    }
    
    // エラー履歴をクリア
    clearErrorHistory() {
        this.errorHistory = [];
    }
    
    // 復旧処理メソッド
    recoverStorageError() {
        try {
            // ストレージの容量チェック
            if (window.StorageUtils) {
                const size = window.StorageUtils.getStorageSize();
                console.log(`Storage size: ${size} bytes`);
                
                // 古いデータの削除を試行
                this.cleanupOldData();
            }
        } catch (e) {
            console.error('Storage recovery failed:', e);
        }
    }
    
    recoverGameError() {
        try {
            // ゲーム状態のリセット
            if (window.game && window.game.reset) {
                window.game.reset();
            }
        } catch (e) {
            console.error('Game recovery failed:', e);
        }
    }
    
    recoverUIError() {
        try {
            // UI要素の再初期化
            this.reinitializeUI();
        } catch (e) {
            console.error('UI recovery failed:', e);
        }
    }
    
    performBasicCleanup() {
        // メモリクリーンアップ
        if (window.gc) {
            window.gc();
        }
    }
    
    cleanupOldData() {
        // 古いログデータの削除
        try {
            const oldLogs = localStorage.getItem('mathblocks-logs');
            if (oldLogs) {
                const logs = JSON.parse(oldLogs);
                if (logs.length > 50) {
                    const recentLogs = logs.slice(-50);
                    localStorage.setItem('mathblocks-logs', JSON.stringify(recentLogs));
                }
            }
        } catch (e) {
            console.error('Failed to cleanup old data:', e);
        }
    }
    
    reinitializeUI() {
        // UI要素の基本的な再初期化
        try {
            if (window.uiManager) {
                // 画面を安全な状態に戻す
                if (window.uiManager.showStartScreen) {
                    window.uiManager.showStartScreen();
                }
            }
        } catch (e) {
            console.error('UI reinitialization failed:', e);
        }
    }
}

// 便利なエラー作成関数
const createError = {
    game: (message, context = {}) => new MathBlocksError(message, ErrorType.GAME_ERROR, ErrorSeverity.MEDIUM, context),
    ui: (message, context = {}) => new MathBlocksError(message, ErrorType.UI_ERROR, ErrorSeverity.MEDIUM, context),
    network: (message, context = {}) => new MathBlocksError(message, ErrorType.NETWORK_ERROR, ErrorSeverity.MEDIUM, context),
    storage: (message, context = {}) => new MathBlocksError(message, ErrorType.STORAGE_ERROR, ErrorSeverity.MEDIUM, context),
    validation: (message, context = {}) => new MathBlocksError(message, ErrorType.VALIDATION_ERROR, ErrorSeverity.LOW, context),
    user: (message, context = {}) => new MathBlocksError(message, ErrorType.USER_ERROR, ErrorSeverity.LOW, context),
    critical: (message, context = {}) => new MathBlocksError(message, ErrorType.SYSTEM_ERROR, ErrorSeverity.CRITICAL, context)
};

// グローバルエラーハンドラーインスタンス
const globalErrorHandler = new ErrorHandler();

// グローバルエクスポート
window.ErrorType = ErrorType;
window.ErrorSeverity = ErrorSeverity;
window.MathBlocksError = MathBlocksError;
window.ErrorHandler = ErrorHandler;
window.createError = createError;
window.globalErrorHandler = globalErrorHandler;