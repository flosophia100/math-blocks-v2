// Supabase設定
const SUPABASE_URL = 'https://yvhcelombhpdtxqxdacw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2aGNlbG9tYmhwZHR4cXhkYWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzQ1ODUsImV4cCI6MjA4NTc1MDU4NX0.pvwH9izmqE3HMkUaFilwJfkt0WEYfcLWT2xKKtSu3gg';

// Supabaseクライアント初期化
let supabase = null;

function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    } else {
        console.error('Supabase SDK not loaded');
        return false;
    }
}

// Supabaseクライアントを取得
function getSupabase() {
    if (!supabase) {
        initSupabase();
    }
    return supabase;
}
