// ブロッククラス
class Block {
    constructor(col, row, problem, color, isSpecial = false, isPenalty = false, isTimeStop = false, isHint = false) {
        this.id = Math.random().toString(36).substr(2, 9); // ユニークID生成
        this.col = col;
        this.row = row;
        this.problem = problem;
        this.color = color;
        this.isSpecial = isSpecial; // 特殊ブロック（点滅・連鎖爆発）
        this.isPenalty = isPenalty; // ペナルティブロック（計算式なし、特殊破壊のみ）
        this.isTimeStop = isTimeStop; // タイムストップブロック（破壊で時間停止）
        this.isHint = isHint; // ヒントブロック（計算ヒント表示）
        this.isDestroying = false;
        this.destroyAnimation = 0;
        this.y = row * CONFIG.GRID.CELL_SIZE; // ピクセル単位のY座標
        this.isFalling = false; // 重力による落下フラグ
        this.fallSpeed = 200; // 重力落下速度（ピクセル/秒）
        
        // 答え表示用
        this.showAnswer = false;
        this.answerDisplayTime = 0;
        this.answerDisplayDuration = 500; // 500ms間答えを表示
        
        // ヒント表示用
        this.showHint = false;
        this.hintText = '';
        this.hintDisplayTime = 0;
        this.hintDisplayDuration = 3000; // デフォルト3秒
        this.originalProblem = problem; // 元の計算式を保存
        this.hintAlpha = 0; // ヒントのフェード用（0=透明、1=不透明）
        this.fadeSpeed = 0.004; // フェード速度（ミリ秒あたり）
        this.fadePhase = 'none'; // 'none', 'fade_in_hint', 'display_hint', 'fade_out_hint'
        
        // 破壊アニメーション用のパーティクル
        this.particles = [];
    }
    
    update(deltaTime) {
        // ヒント表示時間の管理とフェードアニメーション
        if (this.showHint) {
            this.hintDisplayTime += deltaTime;
            
            // フェードアニメーション処理
            this.updateFadeAnimation(deltaTime);
            
            // ヒント表示時間が経過した場合の終了処理
            if (this.hintDisplayTime >= this.hintDisplayDuration && this.fadePhase === 'none') {
                this.showHint = false;
                this.isHint = false; // ヒントフラグもリセット
                this.hintText = ''; // ヒントテキストをクリア
                this.fadePhase = 'none';
                this.hintAlpha = 0;
                // 元の色に戻す
                this.color = this.originalColor || CONFIG.COLORS.BLOCKS[this.problem.operation] || '#95a5a6';
                console.log(`ヒント表示終了: showHint=${this.showHint}, isHint=${this.isHint}, color=${this.color}`);
            }
        }
        
        // 答え表示時間の管理
        if (this.showAnswer) {
            this.answerDisplayTime += deltaTime;
            if (this.answerDisplayTime >= this.answerDisplayDuration) {
                this.showAnswer = false;
                this.isDestroying = true; // 答え表示終了後に破壊開始
            }
        }
        
        if (this.isDestroying) {
            this.destroyAnimation += deltaTime / 300; // 300msでアニメーション
            
            // パーティクルを更新
            this.particles.forEach(particle => {
                particle.x += particle.vx * deltaTime / 1000;
                particle.y += particle.vy * deltaTime / 1000;
                particle.vy += 200 * deltaTime / 1000; // 重力
                particle.life -= deltaTime / 300;
            });
            
            // 寿命の尽きたパーティクルを削除
            this.particles = this.particles.filter(p => p.life > 0);
            
            if (this.destroyAnimation >= 1) {
                return true; // 削除可能
            }
        }
        
        // 重力による落下処理
        if (this.isFalling) {
            const targetY = this.row * CONFIG.GRID.CELL_SIZE;
            if (this.y < targetY) {
                this.y += (this.fallSpeed * deltaTime) / 1000;
                if (this.y >= targetY) {
                    this.y = targetY;
                    this.isFalling = false;
                }
            }
        }
        
        return false;
    }
    
    // フェードアニメーション更新処理
    updateFadeAnimation(deltaTime) {
        const fadeSpeedPerMs = this.fadeSpeed;
        const fadeAmount = fadeSpeedPerMs * deltaTime;
        
        switch (this.fadePhase) {
            case 'fade_in_hint':
                // ヒントをフェードイン
                this.hintAlpha += fadeAmount;
                if (this.hintAlpha >= 1) {
                    this.hintAlpha = 1;
                    this.fadePhase = 'display_hint';
                }
                break;
                
            case 'display_hint':
                // ヒント表示時間の終了チェック（80%経過でフェードアウト開始）
                if (this.hintDisplayTime >= this.hintDisplayDuration * 0.8) {
                    this.fadePhase = 'fade_out_hint';
                }
                break;
                
            case 'fade_out_hint':
                // ヒントをフェードアウト
                this.hintAlpha -= fadeAmount;
                if (this.hintAlpha <= 0) {
                    this.hintAlpha = 0;
                    this.fadePhase = 'none';
                }
                break;
        }
    }
    
    draw(ctx, offsetX, offsetY) {
        const x = offsetX + this.col * CONFIG.GRID.CELL_SIZE;
        const y = offsetY + this.y;
        const size = CONFIG.GRID.CELL_SIZE;
        
        if (this.isDestroying) {
            // パーティクルを描画（より見やすく）
            this.particles.forEach(particle => {
                ctx.globalAlpha = particle.life;
                ctx.fillStyle = particle.color;
                
                // 円形の大きめパーティクル
                ctx.beginPath();
                ctx.arc(offsetX + particle.x, offsetY + particle.y, 6, 0, Math.PI * 2);
                ctx.fill();
                
                // 光るエフェクト
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(offsetX + particle.x, offsetY + particle.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            ctx.globalAlpha = 1;
        } else {
            // 通常のブロック描画
            let blockColor = this.color;
            
            // 答え表示中は背景を明るくする
            if (this.showAnswer) {
                // 明るい緑の背景
                ctx.fillStyle = '#a8e6a3';
            } else if (this.showHint && this.hintText) {
                // ヒント表示中は薄い青の背景
                ctx.fillStyle = '#e8f4fd';
            } else {
                // 通常ブロックの背景（特殊ブロックも含む）
                ctx.fillStyle = this.color;
            }
            ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
            
            // 枠線の描画
            if (this.showAnswer) {
                // 答え表示中の特別な枠線（緑色で太く）
                ctx.strokeStyle = '#27ae60';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#27ae60';
                ctx.shadowBlur = 8;
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                ctx.shadowBlur = 0;
            } else if (this.showHint && this.hintText) {
                // ヒント表示中の枠線（青色）
                ctx.strokeStyle = '#3498db';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#3498db';
                ctx.shadowBlur = 8;
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                ctx.shadowBlur = 0;
            } else if (this.isTimeStop) {
                // タイムストップブロックの紫点滅光る点線枠線
                const time = Date.now() / 400;
                const intensity = (Math.sin(time) + 1) / 2;
                const glowIntensity = 0.6 + intensity * 0.4;
                
                ctx.strokeStyle = CONFIG.TIMESTOP.COLOR;
                ctx.lineWidth = 4;
                ctx.shadowColor = CONFIG.TIMESTOP.COLOR;
                ctx.shadowBlur = 8 + intensity * 12; // 点滅するグロー効果
                ctx.globalAlpha = glowIntensity;
                
                // 点線で描画（爆発ブロックのような光る効果）
                ctx.setLineDash([8, 4]);
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                ctx.setLineDash([]);
                
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            } else if (this.isSpecial) {
                // 特殊ブロックの点滅枠線
                const time = Date.now() / 300;
                const intensity = (Math.sin(time) + 1) / 2;
                const glowIntensity = 0.3 + intensity * 0.7;
                
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 4;
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 8 + intensity * 12; // 点滅するグロー効果
                ctx.globalAlpha = glowIntensity;
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            } else {
                // 通常の枠線
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
            }
            
            // 計算式または答えの表示
            if (this.isPenalty && !this.isDestroying) {
                // ペナルティブロックは×印を表示（破壊中でない場合のみ）
                ctx.fillStyle = '#666';
                ctx.font = 'bold 20px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('✕', x + size / 2, y + size / 2);
            } else if (this.showAnswer) {
                // 答えを大きく表示（緑色で強調）
                ctx.fillStyle = '#27ae60';
                ctx.font = 'bold 24px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 光るエフェクト
                ctx.shadowColor = '#27ae60';
                ctx.shadowBlur = 10;
                
                ctx.fillText(this.problem.answer.toString(), x + size / 2, y + size / 2);
                
                // シャドウをリセット
                ctx.shadowBlur = 0;
            } else if (this.showHint && this.hintText) {
                // ヒント表示中：元の計算式とヒントを両方表示
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 元の計算式を上部に表示（常に不透明）
                if (this.isTimeStop) {
                    // タイムストップブロックの場合
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = CONFIG.TIMESTOP.COLOR;
                    ctx.lineWidth = 2;
                    ctx.font = 'bold 16px sans-serif';
                    ctx.strokeText(this.problem.expression, x + size / 2, y + size / 2 - 10);
                    ctx.fillText(this.problem.expression, x + size / 2, y + size / 2 - 10);
                } else {
                    // 通常ブロック
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.fillText(this.problem.expression, x + size / 2, y + size / 2 - 10);
                }
                
                // ヒントテキストを下部に青字で表示（フェードアニメーション対応）
                if (this.hintAlpha > 0) {
                    ctx.save();
                    ctx.globalAlpha = this.hintAlpha;
                    
                    // ヒントを青字で少し小さく表示
                    ctx.fillStyle = '#3498db';
                    ctx.font = 'bold 13px sans-serif';
                    ctx.fillText(this.hintText, x + size / 2, y + size / 2 + 10);
                    
                    // ヒントマーク（小さな電球アイコン）
                    ctx.fillStyle = '#f39c12';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.fillText('💡', x + size - 15, y + 15);
                    
                    ctx.restore();
                }
            } else {
                // 通常の計算式表示
                if (this.isTimeStop) {
                    // タイムストップブロックの場合は計算式を白色で太字表示（視認性向上）
                    ctx.fillStyle = '#FFFFFF';
                    ctx.strokeStyle = CONFIG.TIMESTOP.COLOR;
                    ctx.lineWidth = 2;
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // 文字に紫の縁取りを追加
                    ctx.strokeText(this.problem.expression, x + size / 2, y + size / 2);
                    ctx.fillText(this.problem.expression, x + size / 2, y + size / 2);
                } else {
                    // 通常ブロック（黒色で読みやすく）
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this.problem.expression, x + size / 2, y + size / 2);
                }
            }
        }
    }
    
    destroy() {
        if (this.isPenalty) {
            // ペナルティブロックは即座に破壊開始
            this.isDestroying = true;
            this.destroyAnimation = 0;
            this.createParticles();
        } else {
            // 通常ブロックは答え表示後に破壊
            this.showAnswer = true;
            this.answerDisplayTime = 0;
            this.createParticles();
        }
    }
    
    createParticles() {
        const centerX = this.col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
        const centerY = this.y + CONFIG.GRID.CELL_SIZE / 2;
        
        // 特殊ブロックの場合はより多くのパーティクルを生成
        const particleCount = this.isSpecial ? 16 : 12;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = this.isSpecial ? 80 + Math.random() * 150 : 60 + Math.random() * 120;
            
            this.particles.push({
                x: centerX + (Math.random() - 0.5) * 30,
                y: centerY + (Math.random() - 0.5) * 30,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 80, // 上向きの初期速度
                color: this.isSpecial ? '#FFD700' : (this.isPenalty ? '#ff4444' : this.color),
                life: 1.0
            });
        }
    }
    
    moveDown(pixels) {
        this.y += pixels;
        this.row = Math.floor(this.y / CONFIG.GRID.CELL_SIZE);
    }
    
    snapToGrid() {
        this.y = this.row * CONFIG.GRID.CELL_SIZE;
    }
    
    // ヒント表示を開始
    showHintCalculation(hintData, duration = 3000) {
        if (!hintData) {
            console.log('ヒントデータがnullです');
            return;
        }
        
        this.showHint = true;
        this.hintText = hintData.expression;
        this.hintDisplayTime = 0;
        this.hintDisplayDuration = duration;
        
        // フェードアニメーション初期化
        this.fadePhase = 'fade_in_hint';
        this.hintAlpha = 0;
        
        console.log(`ヒント表示開始: isHint=${this.isHint}, showHint=${this.showHint}, hintText="${this.hintText}", originalProblem="${this.problem.expression}", fadePhase=${this.fadePhase}`);
    }
}

// ブロック管理クラス
class BlockManager {
    constructor(calculator) {
        this.calculator = calculator;
        this.blocks = [];
        this.grid = this.createEmptyGrid();
        this.nextBlockTimer = 0;
        this.blockInterval = 1000; // 初期ブロック生成間隔
        this.fallingSpeed = 50; // ピクセル/秒
        this.currentBlocks = []; // 現在落下中のブロック（複数対応）
        this.maxBlocks = 1; // 同時出現数（最大7まで）
        this.game = null; // ゲーム参照（タイムスタンプ記録用）
        
        // タイムストップ状態管理
        this.isTimeStopActive = false;
        this.timeStopEndTime = 0;
        
        // ヒントシステム
        this.hintSystem = new HintSystem();
        
        // ヒントブロック変化管理
        this.hintTransformTimer = 0;
        this.hintTransformInterval = 3000; // 3秒間隔でヒント変化をチェック（テスト用に短縮）
        this.hintTransformChance = 0.8; // 80%の確率でブロックがヒント化（テスト用に高確率）
    }
    
    setGame(game) {
        this.game = game;
    }
    
    // ランダムヒント変化処理
    updateHintTransformation(deltaTime) {
        this.hintTransformTimer += deltaTime;
        
        if (this.hintTransformTimer >= this.hintTransformInterval) {
            this.hintTransformTimer = 0;
            console.log('ヒント変化タイマー発火');
            this.tryTransformBlocksToHint();
        }
    }
    
    // ブロックをヒント化を試行
    tryTransformBlocksToHint() {
        // 落下中のブロックと固定されたブロックの中から候補を選択
        const candidateBlocks = [];
        
        // 落下中のブロックを追加
        this.currentBlocks.forEach(block => {
            if (!block.isDestroying && !block.isPenalty && !block.isTimeStop && !block.isHint) {
                candidateBlocks.push(block);
            }
        });
        
        // 固定されたブロックを追加
        this.blocks.forEach(block => {
            if (!block.isDestroying && !block.isPenalty && !block.isTimeStop && !block.isHint) {
                candidateBlocks.push(block);
            }
        });
        
        console.log(`ヒント変化候補ブロック数: ${candidateBlocks.length}, 確率: ${this.hintTransformChance}`);
        
        if (candidateBlocks.length === 0) {
            console.log('ヒント変化候補ブロックなし');
            return;
        }
        
        // 難易度に基づいて候補を評価・フィルタリング
        const difficultBlocks = this.selectDifficultBlocks(candidateBlocks);
        
        const random = Math.random();
        console.log(`ランダム値: ${random}, 閾値: ${this.hintTransformChance}`);
        
        if (random < this.hintTransformChance) {
            if (difficultBlocks.length > 0) {
                // 難しい計算から選択
                const selectedBlock = difficultBlocks[Math.floor(Math.random() * difficultBlocks.length)];
                console.log(`ヒント変化対象ブロック選択（難しい計算）: ${selectedBlock.problem.expression}`);
                this.transformBlockToHint(selectedBlock);
            } else {
                // 難しい計算がない場合は全体から選択
                const randomBlock = candidateBlocks[Math.floor(Math.random() * candidateBlocks.length)];
                console.log(`ヒント変化対象ブロック選択（ランダム）: ${randomBlock.problem.expression}`);
                this.transformBlockToHint(randomBlock);
            }
        } else {
            console.log('ヒント変化確率に当選せず');
        }
    }
    
    // 難しい計算のブロックを選択
    selectDifficultBlocks(candidateBlocks) {
        const blocksWithComplexity = candidateBlocks.map(block => ({
            block: block,
            complexity: this.hintSystem.calculateComplexity(block.problem.expression),
            canGenerateHint: this.hintSystem.generateHint(block.problem.expression) !== null
        })).filter(item => item.canGenerateHint); // ヒント生成可能なもののみ
        
        if (blocksWithComplexity.length === 0) {
            return [];
        }
        
        // 複雑さでソート（難しい順）
        blocksWithComplexity.sort((a, b) => b.complexity - a.complexity);
        
        // 最も複雑な計算の複雑さ値を取得
        const maxComplexity = blocksWithComplexity[0].complexity;
        
        // 複雑さが高い（最大値の80%以上）ブロックを選択
        const complexityThreshold = maxComplexity * 0.8;
        const difficultBlocks = blocksWithComplexity
            .filter(item => item.complexity >= complexityThreshold)
            .map(item => item.block);
        
        console.log(`難しい計算ブロック数: ${difficultBlocks.length}/${candidateBlocks.length}, 最大複雑さ: ${maxComplexity}, 閾値: ${complexityThreshold}`);
        
        return difficultBlocks;
    }
    
    // ブロックをヒント化
    transformBlockToHint(block) {
        console.log(`transformBlockToHint開始: ${block.problem.expression}`);
        const hintData = this.hintSystem.generateHint(block.problem.expression);
        
        if (hintData) {
            const duration = this.hintSystem.calculateHintDuration(block.problem.expression);
            
            // 元の色を保存
            block.originalColor = block.color;
            
            // ヒント化フラグを設定
            block.isHint = true;
            block.color = '#3498db'; // ヒントブロック色に変更
            block.showHintCalculation(hintData, duration);
            
            console.log(`ブロックヒント化成功: ${block.problem.expression} → ${hintData.expression} (${duration}ms)`);
            console.log(`ブロック状態: isHint=${block.isHint}, showHint=${block.showHint}, color=${block.color}`);
        } else {
            console.log(`ヒント生成失敗: ${block.problem.expression}`);
        }
    }
    
    createEmptyGrid() {
        const grid = [];
        for (let row = 0; row < CONFIG.GRID.ROWS; row++) {
            grid[row] = new Array(CONFIG.GRID.COLS).fill(null);
        }
        return grid;
    }
    
    update(deltaTime, level) {
        // タイムストップ状態チェック
        const currentTime = performance.now();
        if (this.isTimeStopActive && currentTime >= this.timeStopEndTime) {
            this.isTimeStopActive = false;
            console.log('Time Stop ended');
        }
        
        // タイムストップ中は新しいブロック生成と落下を停止
        if (!this.isTimeStopActive) {
            // ブロック生成タイマー更新
            this.nextBlockTimer += deltaTime;
            
            // 新しいブロックの生成
            if (this.currentBlocks.length < this.maxBlocks && this.nextBlockTimer >= this.blockInterval) {
                this.spawnBlock(level);
                this.nextBlockTimer = 0;
            }
            
            // ランダムヒント変化処理
            this.updateHintTransformation(deltaTime);
        }
        
        // 現在のブロックの落下処理
        this.currentBlocks = this.currentBlocks.filter(currentBlock => {
            // 破壊アニメーション更新
            if (currentBlock.update(deltaTime)) {
                // 破壊アニメーション完了 → 削除
                return false;
            }
            
            // 破壊中の場合は落下処理をスキップ
            if (currentBlock.isDestroying) {
                return true; // 継続
            }
            
            // タイムストップ中は落下を停止
            if (!this.isTimeStopActive) {
                const fallDistance = (this.fallingSpeed * deltaTime) / 1000;
                currentBlock.moveDown(fallDistance);
            }
            
            // 下のブロックまたは底に到達したかチェック
            const nextRow = Math.floor((currentBlock.y + CONFIG.GRID.CELL_SIZE) / CONFIG.GRID.CELL_SIZE);
            
            if (nextRow >= CONFIG.GRID.ROWS || 
                (nextRow < CONFIG.GRID.ROWS && this.grid[nextRow][currentBlock.col])) {
                // グリッドに固定
                currentBlock.snapToGrid();
                this.grid[currentBlock.row][currentBlock.col] = currentBlock;
                this.blocks.push(currentBlock);
                
                // ゲームオーバーチェック
                if (this.checkGameOver()) {
                    return false; // 削除
                }
                
                return false; // 削除
            }
            
            return true; // 継続
        });
        
        // 破壊アニメーションの更新
        let blocksDestroyed = false;
        this.blocks = this.blocks.filter(block => {
            if (block.update(deltaTime)) {
                // ブロックを削除（グリッドからも確実に削除）
                if (this.grid[block.row] && this.grid[block.row][block.col] === block) {
                    this.grid[block.row][block.col] = null;
                }
                blocksDestroyed = true;
                return false;
            }
            return true;
        });
        
        // ブロックが破壊された場合、上のブロックを落下させる
        if (blocksDestroyed) {
            this.applyGravity();
        }
        
        // ゲームオーバーチェック
        if (this.checkGameOver()) {
            return 'game_over';
        }
        
        return 'playing';
    }
    
    spawnBlock(level) {
        // 利用可能な列を取得（現在落下中でない列）
        const availableCols = [];
        for (let col = 0; col < CONFIG.GRID.COLS; col++) {
            // 列が空いており、かつ現在落下中のブロックがその列にない
            if (!this.grid[0][col] && !this.isColumnOccupied(col)) {
                availableCols.push(col);
            }
        }
        
        // 利用可能な列がない場合はスキップ
        if (availableCols.length === 0) {
            return;
        }
        
        // ランダムに列を選択
        const col = availableCols[Math.floor(Math.random() * availableCols.length)];
        
        // 問題を生成
        const problem = this.calculator.generateProblem(level);
        
        // 演算子に応じた色を選択
        const color = CONFIG.COLORS.BLOCKS[problem.operation] || '#95a5a6';
        
        // 特殊ブロック判定：5%の確率で特殊ブロック、5%の確率でタイムストップブロック
        const random = Math.random();
        const isSpecial = random < 0.05;
        const isTimeStop = random >= 0.05 && random < 0.1; // 5-10%の範囲
        
        // ブロック色の決定
        let blockColor = color;
        if (isTimeStop) {
            blockColor = CONFIG.TIMESTOP.COLOR;
        }
        
        // ブロックを生成（通常ブロックとして生成、ヒント化は後でランダムに発生）
        const newBlock = new Block(col, 0, problem, blockColor, isSpecial, false, isTimeStop, false);
        
        this.currentBlocks.push(newBlock);
        
        // ゲームにブロック作成時刻を記録
        if (this.game && this.game.blockCreationTimes) {
            this.game.blockCreationTimes.set(newBlock.id, performance.now());
        }
    }
    
    // 指定された列に現在落下中のブロックがあるかチェック
    isColumnOccupied(col) {
        return this.currentBlocks.some(block => block.col === col);
    }
    
    checkAnswer(answer) {
        const destroyedBlocks = [];
        
        // 現在落下中のブロックをチェック
        this.currentBlocks.forEach(currentBlock => {
            if (!currentBlock.isPenalty && !currentBlock.isTimeStop && this.calculator.checkAnswer(answer, currentBlock.problem.answer)) {
                currentBlock.destroy();
                destroyedBlocks.push(currentBlock);
            } else if (currentBlock.isTimeStop && this.calculator.checkAnswer(answer, currentBlock.problem.answer)) {
                // タイムストップブロックの場合、効果を発動してから破壊
                this.activateTimeStop();
                currentBlock.destroy();
                destroyedBlocks.push(currentBlock);
            }
        });
        
        // 破壊されたブロックはすぐには削除しない（アニメーション完了まで描画継続）
        
        // すでに落ちているブロックをチェック
        this.blocks.forEach(block => {
            if (!block.isDestroying && !block.isPenalty && !block.isTimeStop && this.calculator.checkAnswer(answer, block.problem.answer)) {
                block.destroy();
                destroyedBlocks.push(block);
            } else if (!block.isDestroying && block.isTimeStop && this.calculator.checkAnswer(answer, block.problem.answer)) {
                // タイムストップブロックの場合、効果を発動してから破壊
                this.activateTimeStop();
                block.destroy();
                destroyedBlocks.push(block);
            }
        });
        
        return destroyedBlocks;
    }
    
    
    checkGameOver() {
        // 最上段に固定されたブロックがあるかチェック
        for (let col = 0; col < CONFIG.GRID.COLS; col++) {
            if (this.grid[0][col] && !this.grid[0][col].isDestroying) {
                return true;
            }
        }
        return false;
    }
    
    setDifficulty(difficulty, trainingMode = null) {
        this.difficulty = difficulty;
        this.blockInterval = difficulty.initialSpeed;
        this.fallingSpeed = 50 / (difficulty.initialSpeed / 1000);
        
        // 特訓モード・通常モード問わず、難易度に応じた複数ブロック生成を適用
        if (difficulty.name === 'ノーマル') {
            this.maxBlocks = Math.min(2, difficulty.maxBlocks); // 最初から2個
        } else if (difficulty.name === 'ハード') {
            this.maxBlocks = Math.min(3, difficulty.maxBlocks); // 最初から3個
        } else if (difficulty.name === 'エクストリーム') {
            this.maxBlocks = Math.min(4, difficulty.maxBlocks); // 最初から4個
        }
        // イージー、入門は元の設定（1個）のまま
    }
    
    adjustSpeedForLevel(level, speedIncrease) {
        this.blockInterval *= speedIncrease;
        this.fallingSpeed /= speedIncrease;
    }
    
    adjustBlocksForLevel(level, maxBlocksForDifficulty) {
        // レベルが上がるごとに同時落下数を増加（難易度の最大値まで）
        const blocksForLevel = Math.min(
            Math.floor(1 + (level - 1) / 3), // 3レベルごとに1個増加
            maxBlocksForDifficulty // 難易度の最大値でキャップ
        );
        // 現在の値より大きい場合のみ更新（減らないようにする）
        this.maxBlocks = Math.max(this.maxBlocks, blocksForLevel);
    }
    
    draw(ctx, offsetX, offsetY) {
        // グリッドの背景（各セルごとに警告色をチェック）
        for (let row = 0; row < CONFIG.GRID.ROWS; row++) {
            for (let col = 0; col < CONFIG.GRID.COLS; col++) {
                const x = offsetX + col * CONFIG.GRID.CELL_SIZE;
                const y = offsetY + row * CONFIG.GRID.CELL_SIZE;
                
                // 7段目以上積み上がっているかチェック
                const isWarning = this.isColumnWarning(col);
                ctx.fillStyle = isWarning ? CONFIG.COLORS.WARNING_BG : CONFIG.COLORS.GRID_BG;
                ctx.fillRect(x, y, CONFIG.GRID.CELL_SIZE, CONFIG.GRID.CELL_SIZE);
            }
        }
        
        // グリッド線
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 1;
        
        // 縦線
        for (let col = 0; col <= CONFIG.GRID.COLS; col++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + col * CONFIG.GRID.CELL_SIZE, offsetY);
            ctx.lineTo(offsetX + col * CONFIG.GRID.CELL_SIZE, 
                      offsetY + CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE);
            ctx.stroke();
        }
        
        // 横線
        for (let row = 0; row <= CONFIG.GRID.ROWS; row++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + row * CONFIG.GRID.CELL_SIZE);
            ctx.lineTo(offsetX + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE,
                      offsetY + row * CONFIG.GRID.CELL_SIZE);
            ctx.stroke();
        }
        
        // ブロックを描画
        this.blocks.forEach(block => block.draw(ctx, offsetX, offsetY));
        this.currentBlocks.forEach(block => block.draw(ctx, offsetX, offsetY));
    }
    
    // 列が7段目以上積み上がっているかチェック
    isColumnWarning(col) {
        // 下から7段目（row = 3）以上にブロックがあるかチェック
        for (let row = 0; row <= 3; row++) {
            if (this.grid[row][col]) {
                return true;
            }
        }
        return false;
    }
    
    reset() {
        this.blocks = [];
        this.grid = this.createEmptyGrid();
        this.currentBlocks = [];
        this.nextBlockTimer = 0;
        this.hintTransformTimer = 0; // ヒント変化タイマーリセット
    }
    
    // ゲーム開始時の初期化
    resetForNewGame() {
        this.reset();
    }
    
    // 重力適用（上のブロックを下に落下させる）
    applyGravity() {
        let changed = true;
        
        while (changed) {
            changed = false;
            
            // 下の行から上の行へ向かってチェック
            for (let row = CONFIG.GRID.ROWS - 2; row >= 0; row--) {
                for (let col = 0; col < CONFIG.GRID.COLS; col++) {
                    if (this.grid[row][col] && !this.grid[row + 1][col]) {
                        // ブロックがあり、下が空いている場合
                        const block = this.grid[row][col];
                        
                        // どこまで落ちるかを計算
                        let targetRow = row + 1;
                        while (targetRow < CONFIG.GRID.ROWS - 1 && !this.grid[targetRow + 1][col]) {
                            targetRow++;
                        }
                        
                        // ブロックを移動
                        this.grid[row][col] = null;
                        this.grid[targetRow][col] = block;
                        
                        // 落下アニメーション設定
                        block.row = targetRow;
                        block.isFalling = true;
                        
                        changed = true;
                    }
                }
            }
        }
    }
    
    // 誤答時のペナルティブロック追加
    addPenaltyBlocks() {
        // 難易度チェック：ノーマル以上でのみペナルティブロック機能有効
        const difficultyName = this.difficulty?.name || '';
        console.log('Difficulty check:', difficultyName, 'Enabled:', CONFIG.PENALTY.ENABLED_DIFFICULTIES);
        
        if (!CONFIG.PENALTY.ENABLED_DIFFICULTIES.includes(difficultyName)) {
            console.log('Penalty blocks disabled for difficulty:', difficultyName);
            return [];
        }
        
        const penaltyBlocks = [];
        
        // まず全ての列で最上段チェック（ゲームオーバー判定）
        for (let col = 0; col < CONFIG.GRID.COLS; col++) {
            if (this.grid[0][col] && !this.grid[0][col].isDestroying) {
                return 'game_over';
            }
        }
        
        // ペナルティブロック数を決定（1～7個、難易度・レベル依存）
        const penaltyBlockCount = this.calculatePenaltyBlockCount();
        
        // 各列の既存ブロックを一段上げる（下から上へ処理）
        for (let col = 0; col < CONFIG.GRID.COLS; col++) {
            for (let row = 0; row < CONFIG.GRID.ROWS - 1; row++) {
                if (this.grid[row + 1][col]) {
                    const block = this.grid[row + 1][col];
                    this.grid[row + 1][col] = null;
                    block.row = row;
                    block.y = row * CONFIG.GRID.CELL_SIZE;
                    this.grid[row][col] = block;
                }
            }
        }
        
        // 最下段をクリア
        for (let col = 0; col < CONFIG.GRID.COLS; col++) {
            this.grid[CONFIG.GRID.ROWS - 1][col] = null;
        }
        
        // ランダムに選択した列にペナルティブロックを配置
        const selectedCols = this.getRandomColumns(penaltyBlockCount);
        selectedCols.forEach(col => {
            const penaltyBlock = new Block(
                col, 
                CONFIG.GRID.ROWS - 1, 
                { expression: '', answer: null }, 
                '#8b8b8b', 
                false, 
                true
            );
            
            this.grid[CONFIG.GRID.ROWS - 1][col] = penaltyBlock;
            this.blocks.push(penaltyBlock);
            penaltyBlocks.push(penaltyBlock);
        });
        
        // ペナルティブロック追加後に重力を適用
        this.applyGravity();
        
        return penaltyBlocks;
    }
    
    // ペナルティブロック数を計算（難易度・レベル依存）
    calculatePenaltyBlockCount() {
        const difficultyName = this.difficulty?.name || 'ノーマル';
        const baseWeights = CONFIG.PENALTY.PROBABILITY_WEIGHTS[difficultyName] || CONFIG.PENALTY.PROBABILITY_WEIGHTS['ノーマル'];
        
        // レベルによる重み調整（高レベルほど多数ブロックが出やすい）
        const level = this.game?.level || 1;
        const levelModifier = CONFIG.PENALTY.LEVEL_MODIFIER * (level - 1);
        
        // 重みを調整（後ろの要素ほど確率を上げる）
        const adjustedWeights = baseWeights.map((weight, index) => {
            const adjustment = index * levelModifier;
            return weight + adjustment;
        });
        
        // 確率の正規化
        const totalWeight = adjustedWeights.reduce((sum, weight) => sum + Math.max(0, weight), 0);
        const normalizedWeights = adjustedWeights.map(weight => Math.max(0, weight) / totalWeight);
        
        // 重み付きランダム選択
        const random = Math.random();
        let cumulative = 0;
        for (let i = 0; i < normalizedWeights.length; i++) {
            cumulative += normalizedWeights[i];
            if (random <= cumulative) {
                return i + 1; // 1～7個
            }
        }
        
        return 1; // フォールバック
    }
    
    // ランダムに列を選択
    getRandomColumns(count) {
        const cols = [];
        const availableCols = Array.from({length: CONFIG.GRID.COLS}, (_, i) => i);
        
        for (let i = 0; i < Math.min(count, CONFIG.GRID.COLS); i++) {
            const randomIndex = Math.floor(Math.random() * availableCols.length);
            cols.push(availableCols.splice(randomIndex, 1)[0]);
        }
        
        return cols.sort((a, b) => a - b);
    }
    
    // 特殊ブロック破壊時の連鎖爆発（ペナルティブロック対応）
    chainExplosion(specialBlock) {
        const destroyedBlocks = [specialBlock];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],  // 上段
            [0, -1],           [0, 1],   // 左右
            [1, -1],  [1, 0],  [1, 1]    // 下段
        ];
        
        directions.forEach(([rowOffset, colOffset]) => {
            const newRow = specialBlock.row + rowOffset;
            const newCol = specialBlock.col + colOffset;
            
            // グリッド範囲内かチェック
            if (newRow >= 0 && newRow < CONFIG.GRID.ROWS && 
                newCol >= 0 && newCol < CONFIG.GRID.COLS) {
                
                const adjacentBlock = this.grid[newRow][newCol];
                if (adjacentBlock && !adjacentBlock.isDestroying) {
                    adjacentBlock.destroy();
                    destroyedBlocks.push(adjacentBlock);
                }
            }
        });
        
        return destroyedBlocks;
    }
    
    // 新しいゲームオーバー判定
    checkGameOverNew() {
        // 最上段（row 0）にブロックがあり、新しいブロックが生成されようとしている場合
        for (let col = 0; col < CONFIG.GRID.COLS; col++) {
            if (this.grid[0][col] && !this.grid[0][col].isDestroying) {
                // さらにその上にブロックを置く必要がある場合（落下中ブロックのチェック）
                const hasBlockAbove = this.currentBlocks.some(block => 
                    block.col === col && block.row <= 0
                );
                
                if (hasBlockAbove) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // タイムストップ効果を発動
    activateTimeStop() {
        this.isTimeStopActive = true;
        this.timeStopEndTime = performance.now() + CONFIG.TIMESTOP.DURATION;
        console.log('Time Stop activated for', CONFIG.TIMESTOP.DURATION, 'ms');
        
        // ゲームにタイムストップ効果を通知
        if (this.game && this.game.showTimeStopEffect) {
            this.game.showTimeStopEffect();
        }
    }
    
    // タイムストップ状態を取得
    getTimeStopStatus() {
        if (!this.isTimeStopActive) {
            return { active: false, remaining: 0 };
        }
        
        const currentTime = performance.now();
        const remaining = Math.max(0, this.timeStopEndTime - currentTime);
        return { 
            active: true, 
            remaining: remaining,
            remainingSeconds: Math.ceil(remaining / 1000)
        };
    }
    
    // デバッグ用メソッド
    setDebugParams(params) {
        this.fallingSpeed = params.fallSpeed;
        this.blockInterval = params.blockInterval;
        this.maxBlocks = Math.min(params.maxBlocks, 4); // 最大4個まで制限
        this.calculator.setRange(params.minNum, params.maxNum);
        this.calculator.setOperations(params.operations);
    }
}