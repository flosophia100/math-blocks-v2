// 入力管理クラス
class InputManager {
    constructor() {
        this.currentInput = '';
        this.answerDisplay = null;
        this.onAnswer = null; // 答え確定時のコールバック
        this.onCButtonClick = null; // Cボタンクリック時のコールバック
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // DOMContentLoadedを待つ
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    init() {
        this.answerDisplay = document.getElementById('answerDisplay');
        
        // テンキーボタンのイベント
        const numpadButtons = document.querySelectorAll('.numpad-btn');
        numpadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                const action = e.target.dataset.action;
                
                if (value !== undefined) {
                    this.appendNumber(value);
                } else if (action === 'clear') {
                    this.clear();
                    // Cボタンクリックのコールバック
                    if (this.onCButtonClick) {
                        this.onCButtonClick();
                    }
                } else if (action === 'ok') {
                    this.submit();
                }
            });
        });
        
        // キーボードイベント
        document.addEventListener('keydown', (e) => {
            // ゲーム画面が表示されている時のみ
            const gameScreen = document.getElementById('gameScreen');
            if (!gameScreen || gameScreen.style.display === 'none') return;
            
            if (e.key >= '0' && e.key <= '9') {
                this.appendNumber(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clear();
            } else if (e.key === 'Enter') {
                this.submit();
            } else if (e.key === 'Escape') {
                // ESCキーは一時停止用に予約
                e.preventDefault();
            }
        });
    }
    
    appendNumber(num) {
        // 最大3桁まで
        if (this.currentInput.length < 3) {
            this.currentInput += num;
            this.updateDisplay();
        }
    }
    
    clear() {
        this.currentInput = '';
        this.updateDisplay();
    }
    
    submit() {
        if (this.currentInput && this.onAnswer) {
            const answer = parseInt(this.currentInput);
            this.onAnswer(answer);
            this.clear();
        }
    }
    
    updateDisplay() {
        if (this.answerDisplay) {
            this.answerDisplay.value = this.currentInput;
        }
    }
    
    setAnswerCallback(callback) {
        this.onAnswer = callback;
    }
    
    setCButtonCallback(callback) {
        this.onCButtonClick = callback;
    }
    
    reset() {
        this.clear();
    }
}