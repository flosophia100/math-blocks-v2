// Firebase設定 - 環境変数対応テンプレート
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your_api_key_here",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your_project.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your_project-default-rtdb.firebaseio.com/",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your_project_id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your_project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your_sender_id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your_app_id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "your_measurement_id"
};

class FirebaseService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.functions = getFunctions(this.app);
    
    // 開発環境ではエミュレーターに接続
    if (this.isLocalDevelopment()) {
      this.connectEmulators();
    }
  }

  isLocalDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '::1' ||
      window.location.hostname.endsWith('.local') ||
      import.meta.env.MODE === 'development'
    );
  }

  connectEmulators() {
    try {
      if (!this.auth._delegate?._authCredentials) {
        connectAuthEmulator(this.auth, 'http://localhost:9099');
      }
      if (!this.db._delegate?._databaseId) {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
      }
      if (!this.functions._region) {
        connectFunctionsEmulator(this.functions, 'localhost', 5001);
      }
      console.log('🔧 Firebase エミュレーターに接続しました');
    } catch (error) {
      console.log('⚠️ エミュレーター接続をスキップ:', error.message);
    }
  }

  // 基本的なFirebaseメソッド
  onAuthStateChanged(callback) {
    return this.auth.onAuthStateChanged(callback);
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async signOut() {
    try {
      await this.auth.signOut();
      console.log('✅ サインアウト完了');
    } catch (error) {
      console.error('❌ サインアウトエラー:', error);
      throw error;
    }
  }
}

// シングルトンインスタンス
const firebaseService = new FirebaseService();
window.firebaseService = firebaseService;

export default firebaseService;