/**
 * Tic Tac Toe Game - Complete Implementation
 * Features: Two-player mode, Computer AI, Score tracking, Animations
 */

class TicTacToeGame {
    constructor() {
        // Game state
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.gameMode = 'two-player'; // 'two-player' or 'computer'
        this.difficulty = 'medium'; // 'easy', 'medium', 'hard', 'expert'
        this.currentGameMode = 'classic'; // 'classic', 'speed', 'blitz', 'tournament'
        this.scores = {
            X: 0,
            O: 0
        };
        this.statistics = {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        this.tournamentScore = { X: 0, O: 0 };
        this.moveTimer = null;
        this.timeLimit = null;
        
        // Winning combinations (indices)
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        // DOM elements
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('currentPlayer');
        this.gameMessageElement = document.getElementById('gameMessage');
        this.scoreXElement = document.getElementById('scoreX');
        this.scoreOElement = document.getElementById('scoreO');
        this.resetBtn = document.getElementById('resetBtn');
        this.modeToggleBtn = document.getElementById('modeToggle');
        this.winningLineElement = document.getElementById('winningLine');
        this.difficultySelector = document.getElementById('difficultySelector');
        this.difficultySelect = document.getElementById('difficulty');
        this.gameModeBtn = document.getElementById('gameModeBtn');
        this.statsBtn = document.getElementById('statsBtn');
        this.gameModesModal = document.getElementById('gameModesModal');
        this.statsModal = document.getElementById('statsModal');
        
        // Initialize the game
        this.initializeGame();
        this.loadScores();
        this.loadStatistics();
    }
    
    /**
     * Initialize the game and set up event listeners
     */
    initializeGame() {
        // Add click listeners to cells
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCellClick(index);
                }
            });
        });
        
        // Add event listeners to buttons
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.modeToggleBtn.addEventListener('click', () => this.toggleGameMode());
        this.difficultySelect.addEventListener('change', (e) => this.changeDifficulty(e.target.value));
        this.gameModeBtn.addEventListener('click', () => this.openGameModesModal());
        this.statsBtn.addEventListener('click', () => this.openStatsModal());
        
        // Modal event listeners
        this.gameModesModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('game-mode-card')) {
                this.selectGameMode(e.target.dataset.mode);
            }
        });
        
        // Close modal listeners
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Make cells focusable for keyboard navigation
        this.cells.forEach(cell => {
            cell.setAttribute('tabindex', '0');
        });
        
        this.updateDisplay();
    }
    
    /**
     * Handle cell click events
     * @param {number} index - The index of the clicked cell
     */
    handleCellClick(index) {
        // Check if cell is empty and game is active
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        // Make the move
        this.makeMove(index);
        
        // Check for win or draw
        if (this.checkWinner()) {
            this.handleGameEnd('win');
            return;
        }
        
        if (this.checkDraw()) {
            this.handleGameEnd('draw');
            return;
        }
        
        // Switch player
        this.switchPlayer();
        
        // If playing against computer and it's computer's turn
        if (this.gameMode === 'computer' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.computerMove(), 500); // Small delay for better UX
        }
    }
    
    /**
     * Make a move on the board
     * @param {number} index - The index where to make the move
     */
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        const cell = this.cells[index];
        
        // Update cell content and styling
        cell.textContent = this.currentPlayer;
        cell.classList.add('occupied', this.currentPlayer.toLowerCase());
        
        // Add animation
        cell.style.animation = 'cellPop 0.3s ease-out';
        setTimeout(() => {
            cell.style.animation = '';
        }, 300);
    }
    
    /**
     * Check if current player has won
     * @returns {boolean} - True if current player won
     */
    checkWinner() {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                // Store winning combination for animation
                this.winningCombination = combination;
                return true;
            }
            return false;
        });
    }
    
    /**
     * Check if the game is a draw
     * @returns {boolean} - True if game is a draw
     */
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    /**
     * Switch to the next player
     */
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    /**
     * Handle game end scenarios
     * @param {string} result - 'win' or 'draw'
     */
    handleGameEnd(result) {
        this.gameActive = false;
        
        if (result === 'win') {
            // Update scores
            this.scores[this.currentPlayer]++;
            this.saveScores();
            
            // Update statistics
            if (this.gameMode === 'computer') {
                if (this.currentPlayer === 'X') {
                    this.updateGameStatistics('win');
                } else {
                    this.updateGameStatistics('loss');
                }
            }
            
            // Show winning message
            this.gameMessageElement.textContent = `Player ${this.currentPlayer} Wins!`;
            this.gameMessageElement.classList.add('winner');
            
            // Animate winning cells and line
            this.animateWinningCombination();
            
        } else if (result === 'draw') {
            this.gameMessageElement.textContent = "It's a Draw!";
            this.gameMessageElement.classList.add('draw');
            
            // Update statistics
            if (this.gameMode === 'computer') {
                this.updateGameStatistics('draw');
            }
        }
        
        this.updateScores();
    }
    
    /**
     * Animate the winning combination
     */
    animateWinningCombination() {
        if (!this.winningCombination) return;
        
        // Add winning class to winning cells
        this.winningCombination.forEach(index => {
            this.cells[index].classList.add('winning');
        });
        
        // Draw winning line
        this.drawWinningLine();
    }
    
    /**
     * Create enhanced winning line animation
     */
    drawWinningLine() {
        // Create a new winning line element with enhanced features
        this.createEnhancedWinningLine();
    }
    
    /**
     * Create enhanced winning line with particles and glow effects
     */
    createEnhancedWinningLine() {
        const [a, b, c] = this.winningCombination;
        const gameBoard = document.querySelector('.game-board');
        
        // Clear any existing winning line
        this.winningLineElement.innerHTML = '';
        this.winningLineElement.className = 'winning-line-container';
        
        // Create the main line
        const line = document.createElement('div');
        line.className = 'enhanced-winning-line';
        
        // Create particle effects
        const particles = document.createElement('div');
        particles.className = 'winning-particles';
        
        // Add particles along the line
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particles.appendChild(particle);
        }
        
        // Create glow effect
        const glow = document.createElement('div');
        glow.className = 'winning-glow';
        
        this.winningLineElement.appendChild(glow);
        this.winningLineElement.appendChild(line);
        this.winningLineElement.appendChild(particles);
        
        // Position the line based on winning combination
        this.positionEnhancedLine(line, particles, glow, [a, b, c]);
        
        // Start animations
        setTimeout(() => {
            this.winningLineElement.classList.add('show');
            this.animateParticles(particles);
        }, 100);
    }
    
    /**
     * Position the enhanced winning line
     */
    positionEnhancedLine(line, particles, glow, combination) {
        const gameBoard = document.querySelector('.game-board');
        const boardRect = gameBoard.getBoundingClientRect();
        
        // Determine line type and position
        let lineType = '';
        let positions = [];
        
        if (combination.includes(0) && combination.includes(1) && combination.includes(2)) {
            lineType = 'horizontal-top';
            positions = [0, 1, 2];
        } else if (combination.includes(3) && combination.includes(4) && combination.includes(5)) {
            lineType = 'horizontal-middle';
            positions = [3, 4, 5];
        } else if (combination.includes(6) && combination.includes(7) && combination.includes(8)) {
            lineType = 'horizontal-bottom';
            positions = [6, 7, 8];
        } else if (combination.includes(0) && combination.includes(3) && combination.includes(6)) {
            lineType = 'vertical-left';
            positions = [0, 3, 6];
        } else if (combination.includes(1) && combination.includes(4) && combination.includes(7)) {
            lineType = 'vertical-middle';
            positions = [1, 4, 7];
        } else if (combination.includes(2) && combination.includes(5) && combination.includes(8)) {
            lineType = 'vertical-right';
            positions = [2, 5, 8];
        } else if (combination.includes(0) && combination.includes(4) && combination.includes(8)) {
            lineType = 'diagonal-main';
            positions = [0, 4, 8];
        } else if (combination.includes(2) && combination.includes(4) && combination.includes(6)) {
            lineType = 'diagonal-anti';
            positions = [2, 4, 6];
        }
        
        // Apply positioning
        line.className = `enhanced-winning-line ${lineType}`;
        particles.className = `winning-particles ${lineType}`;
        glow.className = `winning-glow ${lineType}`;
    }
    
    /**
     * Animate particles along the winning line
     */
    animateParticles(particles) {
        const particleElements = particles.querySelectorAll('.particle');
        particleElements.forEach((particle, index) => {
            particle.style.animationDelay = `${index * 0.2}s`;
            particle.classList.add('animate');
        });
    }
    
    /**
     * Computer AI move (simple strategy)
     */
    computerMove() {
        if (!this.gameActive) return;
        
        let moveIndex;
        
        // Strategy 1: Try to win
        moveIndex = this.findWinningMove('O');
        if (moveIndex !== -1) {
            this.handleCellClick(moveIndex);
            return;
        }
        
        // Strategy 2: Block player from winning
        moveIndex = this.findWinningMove('X');
        if (moveIndex !== -1) {
            this.handleCellClick(moveIndex);
            return;
        }
        
        // Strategy 3: Take center if available
        if (this.board[4] === '') {
            this.handleCellClick(4);
            return;
        }
        
        // Strategy 4: Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            this.handleCellClick(randomCorner);
            return;
        }
        
        // Strategy 5: Take any available position
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        if (availableMoves.length > 0) {
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            this.handleCellClick(randomMove);
        }
    }
    
    /**
     * Find a winning move for a player
     * @param {string} player - 'X' or 'O'
     * @returns {number} - Index of winning move or -1 if none
     */
    findWinningMove(player) {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            const values = [this.board[a], this.board[b], this.board[c]];
            
            // Count player's pieces and empty spaces
            const playerCount = values.filter(value => value === player).length;
            const emptyCount = values.filter(value => value === '').length;
            
            // If player has 2 pieces and 1 empty space, return the empty index
            if (playerCount === 2 && emptyCount === 1) {
                if (this.board[a] === '') return a;
                if (this.board[b] === '') return b;
                if (this.board[c] === '') return c;
            }
        }
        return -1;
    }
    
    /**
     * Toggle between two-player and computer mode
     */
    toggleGameMode() {
        this.gameMode = this.gameMode === 'two-player' ? 'computer' : 'two-player';
        
        if (this.gameMode === 'computer') {
            this.modeToggleBtn.textContent = 'Switch to Two Player';
            this.modeToggleBtn.classList.add('computer-mode');
            this.difficultySelector.style.display = 'flex';
        } else {
            this.modeToggleBtn.textContent = 'Switch to Computer';
            this.modeToggleBtn.classList.remove('computer-mode');
            this.difficultySelector.style.display = 'none';
        }
        
        // Reset game when switching modes
        this.resetGame();
    }
    
    /**
     * Reset the game to initial state
     */
    resetGame() {
        // Reset game state
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningCombination = null;
        
        // Clear cells
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('occupied', 'x', 'o', 'winning');
            cell.style.animation = '';
        });
        
        // Clear winning line
        this.winningLineElement.classList.remove('show');
        this.winningLineElement.className = 'winning-line';
        
        // Clear game message
        this.gameMessageElement.textContent = '';
        this.gameMessageElement.classList.remove('winner', 'draw');
        
        // Update display
        this.updateDisplay();
    }
    
    /**
     * Update the display elements
     */
    updateDisplay() {
        // Update current player display
        if (this.gameActive) {
            if (this.gameMode === 'computer' && this.currentPlayer === 'O') {
                this.currentPlayerElement.textContent = "Computer's Turn";
            } else {
                this.currentPlayerElement.textContent = `Player ${this.currentPlayer}'s Turn`;
            }
            
            // Update current player styling
            this.currentPlayerElement.className = `current-player ${this.currentPlayer.toLowerCase()}-turn`;
        }
        
        // Update scores
        this.updateScores();
    }
    
    /**
     * Update score display
     */
    updateScores() {
        this.scoreXElement.textContent = this.scores.X;
        this.scoreOElement.textContent = this.scores.O;
    }
    
    /**
     * Save scores to localStorage
     */
    saveScores() {
        try {
            localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
        } catch (error) {
            console.warn('Could not save scores to localStorage:', error);
        }
    }
    
    /**
     * Load scores from localStorage
     */
    loadScores() {
        try {
            const savedScores = localStorage.getItem('ticTacToeScores');
            if (savedScores) {
                this.scores = JSON.parse(savedScores);
                this.updateScores();
            }
        } catch (error) {
            console.warn('Could not load scores from localStorage:', error);
        }
    }
    
    /**
     * Change AI difficulty level
     */
    changeDifficulty(difficulty) {
        this.difficulty = difficulty;
        if (this.gameMode === 'computer') {
            this.resetGame();
        }
    }
    
    /**
     * Open game modes modal
     */
    openGameModesModal() {
        this.gameModesModal.style.display = 'block';
    }
    
    /**
     * Open statistics modal
     */
    openStatsModal() {
        this.updateStatisticsDisplay();
        this.statsModal.style.display = 'block';
    }
    
    /**
     * Select a game mode
     */
    selectGameMode(mode) {
        this.currentGameMode = mode;
        this.gameModesModal.style.display = 'none';
        
        // Set time limits for timed modes
        if (mode === 'speed') {
            this.timeLimit = 5000; // 5 seconds
        } else if (mode === 'blitz') {
            this.timeLimit = 3000; // 3 seconds
        } else {
            this.timeLimit = null;
        }
        
        this.resetGame();
    }
    
    /**
     * Enhanced computer AI with difficulty levels
     */
    computerMove() {
        if (!this.gameActive) return;
        
        let moveIndex;
        
        switch (this.difficulty) {
            case 'easy':
                moveIndex = this.getEasyMove();
                break;
            case 'medium':
                moveIndex = this.getMediumMove();
                break;
            case 'hard':
                moveIndex = this.getHardMove();
                break;
            case 'expert':
                moveIndex = this.getExpertMove();
                break;
            default:
                moveIndex = this.getMediumMove();
        }
        
        if (moveIndex !== -1) {
            this.handleCellClick(moveIndex);
        }
    }
    
    /**
     * Easy AI - mostly random moves
     */
    getEasyMove() {
        // 30% chance to make a smart move
        if (Math.random() < 0.3) {
            return this.getMediumMove();
        }
        
        // Otherwise random
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }
    
    /**
     * Medium AI - basic strategy
     */
    getMediumMove() {
        // Try to win
        let moveIndex = this.findWinningMove('O');
        if (moveIndex !== -1) return moveIndex;
        
        // Block player
        moveIndex = this.findWinningMove('X');
        if (moveIndex !== -1) return moveIndex;
        
        // Take center
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Random move
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }
    
    /**
     * Hard AI - advanced strategy
     */
    getHardMove() {
        // Try to win
        let moveIndex = this.findWinningMove('O');
        if (moveIndex !== -1) return moveIndex;
        
        // Block player
        moveIndex = this.findWinningMove('X');
        if (moveIndex !== -1) return moveIndex;
        
        // Take center
        if (this.board[4] === '') return 4;
        
        // Advanced corner strategy
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            // Prefer corners that create threats
            for (let corner of availableCorners) {
                if (this.wouldCreateThreat(corner, 'O')) {
                    return corner;
                }
            }
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Random move
        const availableMoves = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        return availableMoves.length > 0 ? availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }
    
    /**
     * Expert AI - minimax algorithm
     */
    getExpertMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }
    
    /**
     * Minimax algorithm for expert AI
     */
    minimax(board, depth, isMaximizing) {
        // Check for terminal states
        if (this.checkWinnerForBoard(board)) {
            return isMaximizing ? -10 + depth : 10 - depth;
        }
        
        if (board.every(cell => cell !== '')) {
            return 0;
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }
    
    /**
     * Check if a move would create a threat
     */
    wouldCreateThreat(index, player) {
        const testBoard = [...this.board];
        testBoard[index] = player;
        
        // Check if this move creates a winning opportunity
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (testBoard[a] === player && testBoard[b] === player && testBoard[c] === '') {
                return true;
            }
            if (testBoard[a] === player && testBoard[c] === player && testBoard[b] === '') {
                return true;
            }
            if (testBoard[b] === player && testBoard[c] === player && testBoard[a] === '') {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check winner for a given board state
     */
    checkWinnerForBoard(board) {
        return this.winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });
    }
    
    /**
     * Save statistics to localStorage
     */
    saveStatistics() {
        try {
            localStorage.setItem('ticTacToeStats', JSON.stringify(this.statistics));
        } catch (error) {
            console.warn('Could not save statistics to localStorage:', error);
        }
    }
    
    /**
     * Load statistics from localStorage
     */
    loadStatistics() {
        try {
            const savedStats = localStorage.getItem('ticTacToeStats');
            if (savedStats) {
                this.statistics = JSON.parse(savedStats);
            }
        } catch (error) {
            console.warn('Could not load statistics from localStorage:', error);
        }
    }
    
    /**
     * Update statistics display
     */
    updateStatisticsDisplay() {
        document.getElementById('gamesPlayed').textContent = this.statistics.gamesPlayed;
        document.getElementById('totalWins').textContent = this.statistics.wins;
        document.getElementById('totalLosses').textContent = this.statistics.losses;
        document.getElementById('totalDraws').textContent = this.statistics.draws;
        
        const winRate = this.statistics.gamesPlayed > 0 ? 
            Math.round((this.statistics.wins / this.statistics.gamesPlayed) * 100) : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        document.getElementById('bestStreak').textContent = this.statistics.bestStreak;
    }
    
    /**
     * Update statistics after game end
     */
    updateGameStatistics(result) {
        this.statistics.gamesPlayed++;
        
        if (result === 'win') {
            this.statistics.wins++;
            this.statistics.currentStreak++;
            if (this.statistics.currentStreak > this.statistics.bestStreak) {
                this.statistics.bestStreak = this.statistics.currentStreak;
            }
        } else if (result === 'loss') {
            this.statistics.losses++;
            this.statistics.currentStreak = 0;
        } else if (result === 'draw') {
            this.statistics.draws++;
            this.statistics.currentStreak = 0;
        }
        
        this.saveStatistics();
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToeGame();
    
    // Handle window resize to recalculate winning line position
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // If there's a winning line showing, redraw it
            const winningLine = document.getElementById('winningLine');
            if (winningLine && winningLine.classList.contains('show')) {
                // Temporarily hide and redraw the line
                winningLine.classList.remove('show');
                setTimeout(() => {
                    if (game.winningCombination) {
                        game.drawWinningLine();
                    }
                }, 100);
            }
        }, 250);
    });
});

// Add some additional utility functions for enhanced user experience

/**
 * Add keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
    // R key to reset game
    if (e.key === 'r' || e.key === 'R') {
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) resetBtn.click();
    }
    
    // M key to toggle mode
    if (e.key === 'm' || e.key === 'M') {
        const modeBtn = document.getElementById('modeToggle');
        if (modeBtn) modeBtn.click();
    }
});

/**
 * Add touch support for mobile devices
 */
document.addEventListener('touchstart', (e) => {
    // Prevent zoom on double tap
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

/**
 * Add service worker registration for PWA capabilities (optional)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment the following lines if you want to add PWA support
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
    });
}
