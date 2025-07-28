// 認証・ユーザーUI管理クラス
class AuthUIManager {
    constructor(userManager) {
        this.userManager = userManager;
        this.authCallback = null;
        this.initElements();
        this.setupEventListeners();
    }
    
    initElements() {
        this.screens = {
            user: document.getElementById('userScreen'),
            auth: document.getElementById('authScreen')
        };
        
        this.elements = {
            // ユーザー選択画面
            guestModeBtn: document.getElementById('guestModeBtn'),
            userModeBtn: document.getElementById('userModeBtn'),
            currentUserName: document.getElementById('currentUserName'),
            logoutBtn: document.getElementById('logoutBtn'),
            userInfo: document.getElementById('userInfo'),
            
            // 認証画面
            loginTab: document.getElementById('loginTab'),
            registerTab: document.getElementById('registerTab'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            loginUsername: document.getElementById('loginUsername'),
            loginSubmitBtn: document.getElementById('loginSubmitBtn'),
            registerUsername: document.getElementById('registerUsername'),
            registerSubmitBtn: document.getElementById('registerSubmitBtn'),
            existingUsers: document.getElementById('existingUsers'),
            backToUserSelectBtn: document.getElementById('backToUserSelectBtn'),
            importUserBtn: document.getElementById('importUserBtn'),
            
            // ユーザーヘッダー
            headerUserName: document.getElementById('headerUserName'),
            userSwitchBtn: document.getElementById('userSwitchBtn'),
            newUserBtn: document.getElementById('newUserBtn'),
            userMenuBtn: document.getElementById('userMenuBtn')
        };
    }
    
    setupEventListeners() {
        // ユーザー選択
        this.elements.guestModeBtn?.addEventListener('click', () => this.handleGuestMode());
        this.elements.userModeBtn?.addEventListener('click', () => this.showAuthScreen());
        this.elements.logoutBtn?.addEventListener('click', () => this.handleLogout());
        
        // 認証タブ切り替え
        this.elements.loginTab?.addEventListener('click', () => this.showLoginTab());
        this.elements.registerTab?.addEventListener('click', () => this.showRegisterTab());
        
        // フォーム送信
        this.elements.loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.registerForm?.addEventListener('submit', (e) => this.handleRegister(e));
        
        // 戻るボタン
        this.elements.backToUserSelectBtn?.addEventListener('click', () => this.showUserScreen());
        
        // ユーザーインポート
        this.elements.importUserBtn?.addEventListener('click', () => this.handleUserImport());
        
        // ヘッダーボタン
        this.elements.userSwitchBtn?.addEventListener('click', () => this.showUserScreen());
        this.elements.newUserBtn?.addEventListener('click', () => this.showAuthScreen());
    }
    
    // コールバック設定
    setAuthCallback(callback) {
        this.authCallback = callback;
    }
    
    // ユーザー画面表示
    showUserScreen() {
        this.hideAllScreens();
        this.screens.user?.classList.remove('hidden');
        this.updateUserInfo();
    }
    
    // 認証画面表示
    showAuthScreen() {
        this.hideAllScreens();
        this.screens.auth?.classList.remove('hidden');
        this.showLoginTab();
        this.updateExistingUsers();
    }
    
    // ゲストモード処理
    handleGuestMode() {
        this.userManager.switchToGuestMode();
        this.updateUserHeader();
        if (this.authCallback) {
            this.authCallback(true);
        }
    }
    
    // ログアウト処理
    handleLogout() {
        this.userManager.logoutUser();
        this.updateUserHeader();
        this.showUserScreen();
    }
    
    // ログインタブ表示
    showLoginTab() {
        this.elements.loginTab?.classList.add('active');
        this.elements.registerTab?.classList.remove('active');
        this.elements.loginForm?.classList.remove('hidden');
        this.elements.registerForm?.classList.add('hidden');
    }
    
    // 登録タブ表示
    showRegisterTab() {
        this.elements.registerTab?.classList.add('active');
        this.elements.loginTab?.classList.remove('active');
        this.elements.registerForm?.classList.remove('hidden');
        this.elements.loginForm?.classList.add('hidden');
    }
    
    // ログイン処理
    handleLogin(event) {
        event.preventDefault();
        const username = this.elements.loginUsername?.value.trim();
        
        if (!username) {
            this.showError('ユーザー名を入力してください');
            return;
        }
        
        try {
            this.userManager.loginUser(username);
            this.updateUserHeader();
            this.showSuccess('ログインしました');
            
            if (this.authCallback) {
                this.authCallback(true);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    // ユーザー登録処理
    handleRegister(event) {
        event.preventDefault();
        const username = this.elements.registerUsername?.value.trim();
        
        if (!username) {
            this.showError('ユーザー名を入力してください');
            return;
        }
        
        try {
            this.userManager.registerUser(username);
            this.userManager.loginUser(username);
            this.updateUserHeader();
            this.showSuccess('ユーザーを作成してログインしました');
            this.updateExistingUsers();
            
            if (this.authCallback) {
                this.authCallback(true);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }
    
    // ユーザーインポート処理
    async handleUserImport() {
        try {
            const user = await this.userManager.importUserData();
            this.showSuccess(`ユーザー "${user.username}" をインポートしました`);
            this.updateExistingUsers();
        } catch (error) {
            this.showError(`インポートエラー: ${error.message}`);
        }
    }
    
    // ユーザー情報更新
    updateUserInfo() {
        const currentUser = this.userManager.getCurrentUser();
        const isGuest = this.userManager.isGuest();
        
        if (this.elements.currentUserName) {
            this.elements.currentUserName.textContent = isGuest ? 'ゲスト' : currentUser?.username || 'ゲスト';
        }
        
        if (this.elements.userInfo) {
            if (isGuest) {
                this.elements.userInfo.innerHTML = `
                    <p>ゲストモードです</p>
                    <p>データは保存されません</p>
                `;
            } else if (currentUser) {
                const stats = this.userManager.getUserStats(currentUser.username);
                this.elements.userInfo.innerHTML = `
                    <p>プレイ回数: ${stats?.gamesPlayed || 0}回</p>
                    <p>総スコア: ${stats?.totalScore || 0}点</p>
                    <p>平均スコア: ${stats?.averageScore || 0}点</p>
                    <p>アイテム: ${stats?.itemCount || 0}個</p>
                `;
            }
        }
    }
    
    // ユーザーヘッダー更新
    updateUserHeader() {
        const currentUser = this.userManager.getCurrentUser();
        const isGuest = this.userManager.isGuest();
        
        if (this.elements.headerUserName) {
            this.elements.headerUserName.textContent = isGuest ? 'ゲスト' : currentUser?.username || 'ゲスト';
        }
    }
    
    // 既存ユーザー一覧更新
    updateExistingUsers() {
        if (!this.elements.existingUsers) return;
        
        const users = this.userManager.getUserList();
        if (users.length === 0) {
            this.elements.existingUsers.innerHTML = '<p>登録済みユーザーはありません</p>';
            return;
        }
        
        const usersList = users.map(username => {
            const stats = this.userManager.getUserStats(username);
            return `
                <div class="user-item" onclick="authUIManager.selectExistingUser('${username}')">
                    <span class="username">${username}</span>
                    <span class="user-stats">${stats?.gamesPlayed || 0}回プレイ</span>
                </div>
            `;
        }).join('');
        
        this.elements.existingUsers.innerHTML = `
            <h4>既存ユーザー</h4>
            <div class="users-list">${usersList}</div>
        `;
    }
    
    // 既存ユーザー選択
    selectExistingUser(username) {
        if (this.elements.loginUsername) {
            this.elements.loginUsername.value = username;
        }
        this.showLoginTab();
    }
    
    // エラー表示
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    // 成功表示
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    // 通知表示
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
            ${type === 'error' ? 'background: #e74c3c;' : 
              type === 'success' ? 'background: #27ae60;' : 
              'background: #3498db;'}
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 3秒後に削除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }
        }, 3000);
    }
    
    // 全画面非表示
    hideAllScreens() {
        Object.values(this.screens).forEach(screen => {
            screen?.classList.add('hidden');
        });
    }
    
    // 現在のユーザーを取得
    getCurrentUser() {
        return this.userManager.getCurrentUser();
    }
    
    // ゲストモードかどうか
    isGuestMode() {
        return this.userManager.isGuest();
    }
}

// グローバルインスタンス（他のスクリプトから参照可能）
window.authUIManager = null;