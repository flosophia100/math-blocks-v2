// 計算ヒントシステム
class HintSystem {
    constructor() {
        this.hintTypes = {
            ADDITION_ROUND: 'addition_round',
            MULTIPLICATION_SPLIT: 'multiplication_split',
            MULTIPLICATION_DISTRIBUTE: 'multiplication_distribute'
        };
    }
    
    // 計算式に対してヒントを生成
    generateHint(expression) {
        try {
            const parts = this.parseExpression(expression);
            if (!parts) return null;
            
            const { num1, operator, num2 } = parts;
            
            switch (operator) {
                case '+':
                    return this.generateAdditionHint(num1, num2);
                case '×':
                case '*':
                    return this.generateMultiplicationHint(num1, num2);
                case '-':
                    return this.generateSubtractionHint(num1, num2);
                case '÷':
                    return this.generateDivisionHint(num1, num2);
                default:
                    return null;
            }
        } catch (error) {
            console.warn('ヒント生成エラー:', error);
            return null;
        }
    }
    
    // 計算式を解析
    parseExpression(expression) {
        const cleaned = expression.replace(/\s/g, '');
        const operators = ['+', '-', '*', '÷'];
        
        for (const op of operators) {
            const index = cleaned.indexOf(op);
            if (index > 0) {
                const num1 = parseInt(cleaned.substring(0, index));
                const num2 = parseInt(cleaned.substring(index + 1));
                
                if (!isNaN(num1) && !isNaN(num2)) {
                    return { num1, operator: op, num2 };
                }
            }
        }
        return null;
    }
    
    // 足し算のヒント生成
    generateAdditionHint(num1, num2) {
        // 簡単すぎる計算は除外
        if ((num1 <= 5 && num2 <= 5) || (num1 + num2 <= 10)) {
            return null;
        }
        
        // 23+59 → 20+62 (一方を10の倍数に)
        if (num1 >= 10 && num2 >= 10) {
            const hints = [];
            
            // num1を10の倍数にする場合
            const remainder1 = num1 % 10;
            if (remainder1 !== 0 && remainder1 <= num2) {
                const newNum1 = num1 - remainder1;
                const newNum2 = num2 + remainder1;
                hints.push({
                    expression: `${newNum1}+${newNum2}`,
                    explanation: `${num1}を${newNum1}に、${num2}を${newNum2}に調整`
                });
            }
            
            // num2を10の倍数にする場合
            const remainder2 = num2 % 10;
            if (remainder2 !== 0 && remainder2 <= num1) {
                const newNum1 = num1 + remainder2;
                const newNum2 = num2 - remainder2;
                hints.push({
                    expression: `${newNum1}+${newNum2}`,
                    explanation: `${num2}を${newNum2}に、${num1}を${newNum1}に調整`
                });
            }
            
            if (hints.length > 0) {
                return hints[Math.floor(Math.random() * hints.length)];
            }
        }
        
        // 小さい数の場合のヒント（例: 7+8 → 7+3+5）
        if (num1 + num2 > 10 && num1 < 10 && num2 < 10) {
            // 10を作る
            const to10 = 10 - num1;
            if (to10 > 0 && to10 < num2) {
                const remaining = num2 - to10;
                return {
                    expression: `10+${remaining}`,
                    explanation: `${num1}+${to10}で10を作り、残り${remaining}を足す`
                };
            }
        }
        
        // 10 + n の形の場合は10の位を意識させるヒント
        if (num1 === 10 || num2 === 10) {
            const other = num1 === 10 ? num2 : num1;
            if (other < 10) {
                return {
                    expression: `10+${other}`,
                    explanation: `10の位が1になり、1の位が${other}になる`
                };
            }
        }
        
        // 数値の前後入れ替えはヒントとして出さない
        // （元のロジックを削除）
        
        // これ以上ヒントが生成できない場合はnullを返す
        return null;
    }
    
    // 引き算のヒント生成（最小の数値調整で一の位を0にする変換）
    generateSubtractionHint(num1, num2) {
        // 簡単な引き算は直接計算させる
        if ((num1 <= 10 && num2 <= 5) || (num1 - num2 <= 5)) {
            return null;
        }
        
        // 元の式から数値を入れ替えただけのものは除外
        if (num1 < num2) {
            return null;
        }
        
        const ones1 = num1 % 10;
        const ones2 = num2 % 10;
        
        // 一の位を0にするための最小調整ヒント生成
        // 64-19の場合: 60-15 または 65-20
        if (ones1 !== 0 || ones2 !== 0) {
            // パターン1: 被減数の一の位を0にする（例: 64-19 → 60-15）
            if (ones1 >= ones2) {
                const adjustedNum1 = num1 - ones1;
                const adjustedNum2 = num2 - ones2;
                if (adjustedNum1 > 0 && adjustedNum2 > 0 && adjustedNum1 !== num1 && adjustedNum2 !== num2) {
                    return {
                        expression: `${adjustedNum1}-${adjustedNum2}`,
                        explanation: `一の位を揃えて計算しやすく`
                    };
                }
            }
            
            // パターン2: 減数の一の位を0にする（例: 64-19 → 65-20）
            if (ones2 > 0) {
                const adjustment = 10 - ones2;
                const adjustedNum1 = num1 + adjustment;
                const adjustedNum2 = num2 + adjustment;
                
                // 調整後も妥当な範囲内で、元の計算より簡単になる場合のみ
                if (adjustedNum1 <= 99 && adjustedNum2 % 10 === 0 && adjustedNum1 !== num1) {
                    return {
                        expression: `${adjustedNum1}-${adjustedNum2}`,
                        explanation: `一の位を0にして計算しやすく`
                    };
                }
            }
            
            // パターン3: 被減数を切りの良い数にする（例: 47-23 → 50-26）
            if (ones1 > 0 && ones1 <= 5) {
                const adjustment = 10 - ones1;
                const adjustedNum1 = num1 + adjustment;
                const adjustedNum2 = num2 + adjustment;
                
                if (adjustedNum1 <= 99 && adjustedNum1 % 10 === 0 && adjustedNum1 !== num1) {
                    return {
                        expression: `${adjustedNum1}-${adjustedNum2}`,
                        explanation: `切りの良い数で計算しやすく`
                    };
                }
            }
        }
        
        return null;
    }
    
    // 割り算のヒント生成
    generateDivisionHint(num1, num2) {
        // 簡単すぎる割り算は除外
        if ((num2 === 1) || (num2 === 2 && num1 <= 20) || (num1 / num2 <= 5 && num1 % num2 === 0)) {
            return null;
        }
        
        // 10の倍数で割る場合
        if (num2 === 10 || num2 === 100) {
            return null; // 簡単すぎるのでヒントなし
        }
        
        // 割り切れる場合のヒント
        if (num1 % num2 === 0) {
            // 分解できる場合（例: 84÷12 → 84÷4÷3）
            for (let i = 2; i <= Math.sqrt(num2); i++) {
                if (num2 % i === 0) {
                    const factor1 = i;
                    const factor2 = num2 / i;
                    
                    if (factor1 <= 10 && factor2 <= 10) {
                        const intermediate = num1 / factor1;
                        return {
                            expression: `${intermediate}÷${factor2}`,
                            explanation: `${num2}を${factor1}×${factor2}に分解、まず÷${factor1}`
                        };
                    }
                }
            }
            
            // 倍数関係のヒント（計算方法を示唆）
            const quotient = num1 / num2;
            if (quotient <= 10 && quotient > 1) {
                return {
                    expression: `${num2}×?`,
                    explanation: `${num2}を何倍すると${num1}になるか考える`
                };
            }
        }
        
        return null;
    }
    
    // かけ算のヒント生成
    generateMultiplicationHint(num1, num2) {
        // 簡単すぎる掛け算は除外
        if ((num1 <= 5 && num2 <= 5) || (num1 === 1 || num2 === 1) || (num1 === 10 || num2 === 10)) {
            return null;
        }
        
        const hints = [];
        
        // 簡単な九九でもヒントを出す場合（例: 6×7 → 6×5+6×2）
        if (num1 <= 10 && num2 <= 10 && num1 * num2 > 20) {
            if (num2 >= 5) {
                return {
                    expression: `${num1 * 5}+${num1 * (num2 - 5)}`,
                    explanation: `${num2}を5+${num2-5}に分解`
                };
            }
        }
        
        // 12*8 → 80+16 (桁ごとに分解)
        if (num1 >= 10 && num1 < 100 && num2 < 10) {
            const tens = Math.floor(num1 / 10);
            const ones = num1 % 10;
            
            if (tens > 0 && ones > 0) {
                const part1 = tens * 10 * num2;
                const part2 = ones * num2;
                hints.push({
                    expression: `${part1}+${part2}`,
                    explanation: `${num1}を${tens*10}+${ones}に分解`
                });
            }
        }
        
        // 28*7 → (30*7)-(2*7) = 210-14 (近い10の倍数を利用)
        if (num1 >= 10 && num1 < 100 && num2 < 10) {
            const nextTen = Math.ceil(num1 / 10) * 10;
            const diff = nextTen - num1;
            
            if (diff > 0 && diff < 5) {
                const part1 = nextTen * num2;
                const part2 = diff * num2;
                hints.push({
                    expression: `${part1}-${part2}`,
                    explanation: `${num1}を${nextTen}-${diff}として計算`
                });
            }
        }
        
        // num1とnum2を入れ替えて同様の処理
        if (num2 >= 10 && num2 < 100 && num1 < 10) {
            const tens = Math.floor(num2 / 10);
            const ones = num2 % 10;
            
            if (tens > 0 && ones > 0) {
                const part1 = tens * 10 * num1;
                const part2 = ones * num1;
                hints.push({
                    expression: `${part1}+${part2}`,
                    explanation: `${num2}を${tens*10}+${ones}に分解`
                });
            }
        }
        
        if (hints.length > 0) {
            return hints[Math.floor(Math.random() * hints.length)];
        }
        
        return null;
    }
    
    // ヒント表示時間を計算（式の複雑さに応じて）
    calculateHintDuration(expression) {
        const baseTime = 2000; // 基本2秒
        const complexity = this.calculateComplexity(expression);
        
        // 複雑さに応じて1.5秒〜4秒の範囲で調整
        return Math.min(Math.max(baseTime + (complexity * 500), 1500), 4000);
    }
    
    // 計算の複雑さを評価
    calculateComplexity(expression) {
        const parts = this.parseExpression(expression);
        if (!parts) return 1;
        
        const { num1, operator, num2 } = parts;
        let complexity = 0;
        
        // 数字の大きさで複雑さを判定
        const maxNum = Math.max(num1, num2);
        if (maxNum >= 100) complexity += 2;
        else if (maxNum >= 50) complexity += 1;
        
        // 演算子の種類で複雑さを判定
        if (operator === '*' || operator === '÷') complexity += 1;
        
        // 桁数で複雑さを判定
        if (num1 >= 10 || num2 >= 10) complexity += 1;
        
        return complexity;
    }
}