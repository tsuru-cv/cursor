class ReversiGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 1; // 1: 黒, 2: 白
        this.boardSize = 8;
        this.gameOver = false;
        this.validMoves = [];
        // 1: 黒, 2: 白。trueなら人間、falseならAI
        this.isHuman = { 1: true, 2: false };

        this.initializeBoard();
        this.setupEventListeners();
        this.updateDisplay();
        this.findValidMoves();
        this.maybeAIMove();
    }
    
    initializeBoard() {
        // 8x8のボードを初期化
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = 0; // 0: 空, 1: 黒, 2: 白
            }
        }
        
        // 初期配置（中央に4つの石を配置）
        const center = this.boardSize / 2 - 1;
        this.board[center][center] = 2;     // 白
        this.board[center][center + 1] = 1; // 黒
        this.board[center + 1][center] = 1; // 黒
        this.board[center + 1][center + 1] = 2; // 白
    }
    
    setupEventListeners() {
        const gameBoard = document.getElementById('game-board');
        const resetBtn = document.getElementById('reset-btn');
        
        // ゲームボードのクリックイベント
        gameBoard.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                const row = parseInt(e.target.dataset.row);
                const col = parseInt(e.target.dataset.col);
                // 人間の手番のみクリックを受け付ける
                if (this.isHuman[this.currentPlayer] && !this.gameOver) {
                    this.makeMove(row, col);
                }
            }
        });
        
        // リセットボタンのクリックイベント
        resetBtn.addEventListener('click', () => {
            this.resetGame();
        });
    }
    
    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.board[i][j] !== 0) {
                    const stone = document.createElement('div');
                    stone.className = `stone ${this.board[i][j] === 1 ? 'black-stone' : 'white-stone'}`;
                    cell.appendChild(stone);
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    findValidMoves() {
        this.validMoves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    for (const [dx, dy] of directions) {
                        if (this.isValidMove(i, j, dx, dy)) {
                            this.validMoves.push([i, j]);
                            break;
                        }
                    }
                }
            }
        }
    }
    
    isValidMove(row, col, dx, dy) {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        let x = row + dx;
        let y = col + dy;
        let hasOpponent = false;
        
        // 隣接するマスが相手の石かチェック
        while (this.isValidPosition(x, y) && this.board[x][y] === opponent) {
            hasOpponent = true;
            x += dx;
            y += dy;
        }
        
        // その先に自分の石があるかチェック
        return hasOpponent && this.isValidPosition(x, y) && this.board[x][y] === this.currentPlayer;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
    }
    
    makeMove(row, col) {
        if (this.gameOver) return;
        
        // 有効な手かチェック
        const isValidMove = this.validMoves.some(([r, c]) => r === row && c === col);
        if (!isValidMove) return;
        
        // 石を配置
        this.board[row][col] = this.currentPlayer;
        
        // 石を反転
        this.flipStones(row, col);
        
        // プレイヤーを交代
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        
        // 表示を更新
        this.updateDisplay();
        
        // 次の有効な手を探す
        this.findValidMoves();
        
        // ゲーム終了チェック
        if (this.validMoves.length === 0) {
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            this.findValidMoves();
            
            if (this.validMoves.length === 0) {
                this.endGame();
                return;
            }
        }
        
        this.updateDisplay();
        this.maybeAIMove();
    }
    
    maybeAIMove() {
        if (this.gameOver) return;
        if (!this.isHuman[this.currentPlayer]) {
            // 少し待ってからAIの手を打つ（UI更新のため）
            setTimeout(() => {
                this.aiMove();
            }, 500);
        }
    }
    
    aiMove() {
        if (this.gameOver) return;
        if (this.validMoves.length === 0) return;
        // ランダムな有効手を選ぶ
        const idx = Math.floor(Math.random() * this.validMoves.length);
        const [row, col] = this.validMoves[idx];
        this.makeMove(row, col);
    }
    
    flipStones(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dx, dy] of directions) {
            this.flipStonesInDirection(row, col, dx, dy);
        }
    }
    
    flipStonesInDirection(row, col, dx, dy) {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        let x = row + dx;
        let y = col + dy;
        const stonesToFlip = [];
        
        // 反転する石を収集
        while (this.isValidPosition(x, y) && this.board[x][y] === opponent) {
            stonesToFlip.push([x, y]);
            x += dx;
            y += dy;
        }
        
        // その先に自分の石がある場合のみ反転
        if (this.isValidPosition(x, y) && this.board[x][y] === this.currentPlayer) {
            for (const [flipRow, flipCol] of stonesToFlip) {
                this.board[flipRow][flipCol] = this.currentPlayer;
            }
        }
    }
    
    updateDisplay() {
        this.createBoard();
        this.updateScores();
        this.updateTurnIndicator();
        this.highlightValidMoves();
        this.updateGameStatus();
    }
    
    updateScores() {
        let blackScore = 0;
        let whiteScore = 0;
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 1) blackScore++;
                else if (this.board[i][j] === 2) whiteScore++;
            }
        }
        
        document.getElementById('black-score').textContent = blackScore;
        document.getElementById('white-score').textContent = whiteScore;
    }
    
    updateTurnIndicator() {
        const turnStone = document.getElementById('current-turn-stone');
        turnStone.className = `stone ${this.currentPlayer === 1 ? 'black-stone' : 'white-stone'}`;
    }
    
    highlightValidMoves() {
        const cells = document.querySelectorAll('.cell');
        
        // 既存のハイライトを削除
        cells.forEach(cell => cell.classList.remove('valid-move'));
        
        // 有効な手をハイライト
        for (const [row, col] of this.validMoves) {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('valid-move');
            }
        }
    }
    
    updateGameStatus() {
        const gameStatus = document.getElementById('game-status');
        
        if (this.gameOver) {
            const blackScore = parseInt(document.getElementById('black-score').textContent);
            const whiteScore = parseInt(document.getElementById('white-score').textContent);
            
            if (blackScore > whiteScore) {
                gameStatus.textContent = `ゲーム終了！黒の勝利 (${blackScore} - ${whiteScore})`;
                gameStatus.className = 'game-status winner';
            } else if (whiteScore > blackScore) {
                gameStatus.textContent = `ゲーム終了！白の勝利 (${blackScore} - ${whiteScore})`;
                gameStatus.className = 'game-status winner';
            } else {
                gameStatus.textContent = `ゲーム終了！引き分け (${blackScore} - ${whiteScore})`;
                gameStatus.className = 'game-status draw';
            }
        } else if (this.validMoves.length === 0) {
            gameStatus.textContent = `${this.currentPlayer === 1 ? '黒' : '白'}は置ける場所がありません。スキップします。`;
            gameStatus.className = 'game-status';
        } else {
            gameStatus.textContent = `${this.currentPlayer === 1 ? '黒' : '白'}のターンです`;
            gameStatus.className = 'game-status';
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.updateDisplay();
    }
    
    resetGame() {
        this.board = [];
        this.currentPlayer = 1;
        this.gameOver = false;
        this.validMoves = [];
        
        this.initializeBoard();
        this.updateDisplay();
        this.findValidMoves();
        this.maybeAIMove();
    }
}

// ゲームを開始
document.addEventListener('DOMContentLoaded', () => {
    new ReversiGame();
}); 