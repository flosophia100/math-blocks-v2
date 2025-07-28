// MathBlocks共通ヘルパー関数とユーティリティ

// 時間関連ユーティリティ
class TimeUtils {
    // 秒を MM:SS 形式にフォーマット
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 秒を HH:MM:SS 形式にフォーマット
    static formatLongTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return TimeUtils.formatTime(seconds);
    }
    
    // ミリ秒を秒に変換
    static msToSeconds(milliseconds) {
        return milliseconds / 1000;
    }
    
    // 現在のタイムスタンプを取得
    static now() {
        return Date.now();
    }
    
    // ISO文字列を日本語日時に変換
    static formatJapaneseDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('ja-JP');
    }
    
    // 経過時間を計算（開始時間からの経過）
    static getElapsedTime(startTime, endTime = null) {
        const end = endTime || Date.now();
        return (end - startTime) / 1000;
    }
}

// 数値関連ユーティリティ
class NumberUtils {
    // 数値を3桁区切りでフォーマット
    static formatNumber(number) {
        return number.toLocaleString('ja-JP');
    }
    
    // パーセンテージを計算
    static calculatePercentage(part, total) {
        if (total === 0) return 0;
        return Math.round((part / total) * 100);
    }
    
    // 範囲内の値に制限
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // ランダムな整数を生成
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // ランダムな実数を生成
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // 配列からランダムな要素を選択
    static randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    // 数値を指定桁数で丸める
    static roundToDecimals(number, decimals) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
    
    // スコアに基づくランクを計算
    static calculateRank(score) {
        if (score >= 50000) return { rank: 'S', name: 'マスター' };
        if (score >= 25000) return { rank: 'A', name: 'エキスパート' };
        if (score >= 10000) return { rank: 'B', name: 'アドバンス' };
        if (score >= 5000) return { rank: 'C', name: 'インターミディエイト' };
        if (score >= 1000) return { rank: 'D', name: 'ビギナー' };
        return { rank: 'E', name: 'ルーキー' };
    }
}

// DOM操作ユーティリティ
class DOMUtils {
    // 要素を安全に取得
    static getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    }
    
    // 要素を作成
    static createElement(tagName, className = null, textContent = null) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
    
    // 要素に安全にテキストを設定
    static setElementText(elementOrId, text) {
        const element = typeof elementOrId === 'string' ? 
            DOMUtils.getElement(elementOrId) : elementOrId;
        
        if (element) {
            element.textContent = text;
        }
    }
    
    // 要素のクラスを安全に操作
    static toggleClass(elementOrId, className, force = null) {
        const element = typeof elementOrId === 'string' ? 
            DOMUtils.getElement(elementOrId) : elementOrId;
        
        if (element) {
            if (force !== null) {
                element.classList.toggle(className, force);
            } else {
                element.classList.toggle(className);
            }
        }
    }
    
    // 複数要素のクラスを操作
    static setActiveElement(elements, activeElement) {
        elements.forEach(element => {
            element.classList.remove('active');
        });
        if (activeElement) {
            activeElement.classList.add('active');
        }
    }
    
    // 要素を非表示/表示
    static setVisible(elementOrId, visible) {
        const element = typeof elementOrId === 'string' ? 
            DOMUtils.getElement(elementOrId) : elementOrId;
        
        if (element) {
            element.classList.toggle('hidden', !visible);
        }
    }
    
    // 通知を表示
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = DOMUtils.createElement('div', `notification ${type}`);
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            opacity: 0;
            transition: opacity 0.3s ease;
            ${type === 'error' ? 'background: #e74c3c;' : 
              type === 'success' ? 'background: #27ae60;' : 
              type === 'warning' ? 'background: #f39c12;' :
              'background: #3498db;'}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // フェードイン
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10);
        
        // 自動削除
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
        
        return notification;
    }
}

// ローカルストレージユーティリティ
class StorageUtils {
    // 安全にデータを保存
    static setItem(key, value) {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }
    
    // 安全にデータを取得
    static getItem(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            
            // JSONパースを試行
            try {
                return JSON.parse(item);
            } catch {
                // パースに失敗した場合はそのまま返す
                return item;
            }
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }
    
    // アイテムを削除
    static removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }
    
    // 全てのアイテムをクリア
    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
    
    // ストレージサイズを取得
    static getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }
    
    // ストレージサイズを人間が読める形式で取得
    static getStorageSizeFormatted() {
        const bytes = StorageUtils.getStorageSize();
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
}

// ファイル操作ユーティリティ
class FileUtils {
    // ファイルをダウンロード
    static downloadFile(content, filename, contentType = 'text/plain') {
        try {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Failed to download file:', error);
            return false;
        }
    }
    
    // JSONファイルをダウンロード
    static downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        return FileUtils.downloadFile(jsonString, filename, 'application/json');
    }
    
    // CSVファイルをダウンロード
    static downloadCSV(data, filename) {
        return FileUtils.downloadFile(data, filename, 'text/csv');
    }
    
    // ファイルを読み込み
    static readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    // ファイル選択ダイアログを表示
    static selectFile(accept = '*') {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = accept;
            
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('No file selected'));
                }
            };
            
            input.click();
        });
    }
    
    // 安全なファイル名を生成
    static sanitizeFilename(filename) {
        return filename.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
    }
    
    // タイムスタンプ付きファイル名を生成
    static generateTimestampedFilename(baseName, extension) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${baseName}_${timestamp}.${extension}`;
    }
}

// バリデーションユーティリティ
class ValidationUtils {
    // 文字列が空でないかチェック
    static isNotEmpty(str) {
        return typeof str === 'string' && str.trim().length > 0;
    }
    
    // 数値が範囲内かチェック
    static isInRange(value, min, max) {
        return typeof value === 'number' && value >= min && value <= max;
    }
    
    // 配列が空でないかチェック
    static isNotEmptyArray(arr) {
        return Array.isArray(arr) && arr.length > 0;
    }
    
    // オブジェクトが空でないかチェック
    static isNotEmptyObject(obj) {
        return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
    }
    
    // ユーザー名のバリデーション
    static validateUsername(username) {
        if (!ValidationUtils.isNotEmpty(username)) {
            return { valid: false, message: 'ユーザー名を入力してください' };
        }
        
        if (username.length < 3) {
            return { valid: false, message: 'ユーザー名は3文字以上で入力してください' };
        }
        
        if (username.length > 20) {
            return { valid: false, message: 'ユーザー名は20文字以下で入力してください' };
        }
        
        if (!/^[a-zA-Z0-9_\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/.test(username)) {
            return { valid: false, message: 'ユーザー名には英数字、ひらがな、カタカナ、漢字、アンダースコアのみ使用できます' };
        }
        
        return { valid: true, message: 'OK' };
    }
    
    // スコアデータのバリデーション
    static validateScoreData(data) {
        const required = ['score', 'level', 'timestamp'];
        for (const field of required) {
            if (!(field in data)) {
                return { valid: false, message: `必須フィールド '${field}' がありません` };
            }
        }
        
        if (typeof data.score !== 'number' || data.score < 0) {
            return { valid: false, message: 'スコアは0以上の数値である必要があります' };
        }
        
        if (typeof data.level !== 'number' || data.level < 1) {
            return { valid: false, message: 'レベルは1以上の数値である必要があります' };
        }
        
        return { valid: true, message: 'OK' };
    }
}

// エラーハンドリングユーティリティ
class ErrorUtils {
    // エラーを安全にログ出力
    static logError(context, error, additionalData = null) {
        const errorInfo = {
            context: context,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        if (additionalData) {
            errorInfo.additionalData = additionalData;
        }
        
        console.error(`[${context}]`, errorInfo);
        
        // ログシステムがあれば記録
        if (window.logger) {
            window.logger.error(context, error.message, errorInfo);
        }
        
        return errorInfo;
    }
    
    // ユーザーフレンドリーなエラーメッセージを生成
    static getUserFriendlyMessage(error, context = '') {
        const commonErrors = {
            'NetworkError': 'ネットワークエラーが発生しました',
            'QuotaExceededError': 'ストレージの容量が不足しています',
            'SecurityError': 'セキュリティエラーが発生しました',
            'TypeError': 'データの形式が正しくありません',
            'SyntaxError': 'データの解析に失敗しました'
        };
        
        for (const [errorType, message] of Object.entries(commonErrors)) {
            if (error.name === errorType || error.message.includes(errorType)) {
                return message;
            }
        }
        
        // コンテキスト固有のメッセージ
        if (context.includes('save')) {
            return 'データの保存に失敗しました';
        }
        if (context.includes('load')) {
            return 'データの読み込みに失敗しました';
        }
        if (context.includes('game')) {
            return 'ゲーム処理でエラーが発生しました';
        }
        
        return 'エラーが発生しました';
    }
    
    // 非同期関数を安全に実行
    static async safeAsync(asyncFunction, fallbackValue = null, context = '') {
        try {
            return await asyncFunction();
        } catch (error) {
            ErrorUtils.logError(context, error);
            return fallbackValue;
        }
    }
    
    // 同期関数を安全に実行
    static safeSync(syncFunction, fallbackValue = null, context = '') {
        try {
            return syncFunction();
        } catch (error) {
            ErrorUtils.logError(context, error);
            return fallbackValue;
        }
    }
}

// デバッグユーティリティ
class DebugUtils {
    static isDebugMode() {
        return StorageUtils.getItem('mathblocks_debug', false);
    }
    
    static setDebugMode(enabled) {
        StorageUtils.setItem('mathblocks_debug', enabled);
    }
    
    static debugLog(...args) {
        if (DebugUtils.isDebugMode()) {
            console.log('[DEBUG]', ...args);
        }
    }
    
    static debugTable(data) {
        if (DebugUtils.isDebugMode()) {
            console.table(data);
        }
    }
    
    static measurePerformance(name, fn) {
        if (DebugUtils.isDebugMode()) {
            const start = performance.now();
            const result = fn();
            const end = performance.now();
            console.log(`[PERF] ${name}: ${(end - start).toFixed(2)}ms`);
            return result;
        }
        return fn();
    }
}

// グローバルエクスポート
window.TimeUtils = TimeUtils;
window.NumberUtils = NumberUtils;
window.DOMUtils = DOMUtils;
window.StorageUtils = StorageUtils;
window.FileUtils = FileUtils;
window.ValidationUtils = ValidationUtils;
window.ErrorUtils = ErrorUtils;
window.DebugUtils = DebugUtils;