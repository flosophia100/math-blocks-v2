// 計算問題生成クラス
class Calculator {
    constructor() {
        this.operations = {
            add: true,
            sub: true,
            mul: true,
            div: true
        };
        this.minNum = 1;
        this.maxNum = 10;
        this.carryBorrow = false; // さくらんぼ算モード
        this.numberRangeIncrease = 3; // 難易度による数値範囲増加率
        this.isTrainingMode = false; // 特訓モードフラグ
        this.omiyageMode = false; // おみやげ算モード
    }
    
    setOperations(ops) {
        this.operations = ops;
    }
    
    setRange(min, max) {
        this.minNum = Math.max(1, min);
        this.maxNum = Math.min(999, max);
    }
    
    setCarryBorrow(enabled) {
        this.carryBorrow = enabled;
    }
    
    setNumberRangeIncrease(increase) {
        this.numberRangeIncrease = increase;
    }
    
    setTrainingMode(enabled) {
        this.isTrainingMode = enabled;
    }
    
    setOmiyageMode(enabled) {
        this.omiyageMode = enabled;
    }
    
    adjustDifficultyForLevel(level) {
        // 特訓モードの場合は数値範囲を絶対に固定（レベルの影響を受けない）
        if (this.isTrainingMode) {
            return { min: this.minNum, max: this.maxNum };
        }
        
        // 通常モード：レベルが上がるごとに数値範囲を拡大（難易度による増加率の違い）
        const rangeIncrease = Math.floor((level - 1) / 2);
        const currentMax = Math.min(this.maxNum + rangeIncrease * this.numberRangeIncrease, 999);
        return { min: this.minNum, max: currentMax };
    }
    
    generateProblem(level = 1) {
        // 有効な演算子を取得
        const enabledOps = [];
        if (this.operations.add) enabledOps.push('add');
        if (this.operations.sub) enabledOps.push('sub');
        if (this.operations.mul) enabledOps.push('mul');
        if (this.operations.div) enabledOps.push('div');
        
        if (enabledOps.length === 0) {
            throw new Error('少なくとも1つの演算を選択してください');
        }
        
        // ランダムに演算子を選択
        const operation = enabledOps[Math.floor(Math.random() * enabledOps.length)];
        
        // 数値範囲を取得（特訓モードでは固定範囲、通常モードではレベル調整）
        const range = this.isTrainingMode ? 
            { min: this.minNum, max: this.maxNum } : 
            this.adjustDifficultyForLevel(level);
            
        
        let num1, num2, answer, displayOp;
        
        switch (operation) {
            case 'add':
                if (this.carryBorrow) {
                    // さくらんぼ算：必ず繰り上がりが発生する足し算
                    do {
                        num1 = this.randomInt(range.min, range.max);
                        num2 = this.randomInt(range.min, range.max);
                        answer = num1 + num2;
                    } while (!this.hasCarry(num1, num2));
                } else {
                    num1 = this.randomInt(range.min, range.max);
                    num2 = this.randomInt(range.min, range.max);
                    answer = num1 + num2;
                }
                displayOp = '+';
                break;
                
            case 'sub':
                if (this.carryBorrow) {
                    // さくらんぼ算：必ず繰り下がりが発生する引き算
                    do {
                        num1 = this.randomInt(range.min, range.max);
                        num2 = this.randomInt(range.min, Math.min(num1, range.max));
                        answer = num1 - num2;
                    } while (!this.hasBorrow(num1, num2) || answer <= 0);
                } else {
                    // 結果が負にならないようにする
                    num1 = this.randomInt(range.min, range.max);
                    num2 = this.randomInt(range.min, Math.min(num1, range.max));
                    answer = num1 - num2;
                }
                displayOp = '-';
                break;
                
            case 'mul':
                if (this.omiyageMode) {
                    // おみやげ算：両方とも10-19の数
                    num1 = this.randomInt(10, 19);
                    num2 = this.randomInt(10, 19);
                    answer = num1 * num2;
                } else if (this.isTrainingMode) {
                    // 特訓モード（九九等）：設定された範囲をそのまま使用
                    num1 = this.randomInt(range.min, range.max);
                    num2 = this.randomInt(range.min, range.max);
                    answer = num1 * num2;
                } else {
                    // 通常の掛け算は少し小さめの数値で
                    const mulMax = Math.min(Math.floor(range.max / 2), 50);
                    num1 = this.randomInt(range.min, mulMax);
                    num2 = this.randomInt(range.min, mulMax);
                    answer = num1 * num2;
                }
                displayOp = '×';
                break;
                
            case 'div':
                // 割り切れる問題のみ生成
                const divMax = Math.min(range.max, 50);
                num2 = this.randomInt(range.min, divMax);
                answer = this.randomInt(range.min, divMax);
                num1 = num2 * answer;
                displayOp = '÷';
                break;
        }
        
        return {
            expression: `${num1} ${displayOp} ${num2}`,
            answer: answer,
            num1: num1,
            num2: num2,
            operation: displayOp
        };
    }
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    checkAnswer(userAnswer, correctAnswer) {
        return parseInt(userAnswer) === correctAnswer;
    }
    
    // 繰り上がりの判定（任意の桁で繰り上がりが発生するかチェック）
    hasCarry(num1, num2) {
        let carry = 0;
        const str1 = num1.toString().split('').reverse();
        const str2 = num2.toString().split('').reverse();
        const maxLength = Math.max(str1.length, str2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const digit1 = parseInt(str1[i] || '0');
            const digit2 = parseInt(str2[i] || '0');
            const sum = digit1 + digit2 + carry;
            
            if (sum >= 10) {
                return true; // 繰り上がりが発生
            }
            carry = Math.floor(sum / 10);
        }
        return false;
    }
    
    // 繰り下がりの判定（任意の桁で繰り下がりが発生するかチェック）
    hasBorrow(num1, num2) {
        const str1 = num1.toString().split('').reverse();
        const str2 = num2.toString().split('').reverse();
        const maxLength = Math.max(str1.length, str2.length);
        
        for (let i = 0; i < maxLength; i++) {
            const digit1 = parseInt(str1[i] || '0');
            const digit2 = parseInt(str2[i] || '0');
            
            if (digit1 < digit2) {
                return true; // 繰り下がりが発生
            }
        }
        return false;
    }
}