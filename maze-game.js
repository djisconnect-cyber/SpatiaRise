/*
Maze Game using Origin Shift Algorithm
Adapted from reference code
*/

// Game constants
const MAZE_SIZE = 6;
const CELL_SIZE = 50;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;
const DISPLAY_TIME = 5000; // 5 seconds

// Game state
let gameState = 'generating'; // 'generating', 'memorizing', 'playing', 'revealing', 'gameover'
let score = 0;
let maze = null;
let player = null;
let view = null;
let memorizeTimer = null;
let finishX = MAZE_SIZE - 1;
let finishY = MAZE_SIZE - 1;

// DOM elements
let canvas, ctx, scoreDisplay, gameStatus, restartBtn;

// Initialize game
function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;

    scoreDisplay = document.getElementById('score-display');
    gameStatus = document.getElementById('game-status');
    restartBtn = document.getElementById('restart-btn');

    restartBtn.addEventListener('click', restartGame);

    // Add touch event listeners for swipe gestures on canvas
    canvas.addEventListener('touchstart', (e) => {
        if (gameState !== 'playing') return;
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        if (gameState !== 'playing') return;
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Check if swipe distance is sufficient
        if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE && Math.abs(deltaY) < MIN_SWIPE_DISTANCE) return;

        // Determine swipe direction (prioritize larger delta)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0) {
                movePlayer(1, 0); // Right
            } else {
                movePlayer(-1, 0); // Left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                movePlayer(0, 1); // Down
            } else {
                movePlayer(0, -1); // Up
            }
        }
    }, { passive: false });

    view = new GameView();
    startNewMaze();
}

// Start a new maze
function startNewMaze() {
    gameState = 'generating';
    updateStatus('Generating maze...');

    maze = new GameMaze(MAZE_SIZE, MAZE_SIZE);
    // Generate maze with many iterations for complexity
    for (let i = 0; i < MAZE_SIZE * MAZE_SIZE * 20; i++) {
        maze.iterate();
    }

    // Randomize finish position
    finishX = getRandomInt(0, MAZE_SIZE);
    finishY = getRandomInt(0, MAZE_SIZE);

    // Randomize player position
    let playerX = getRandomInt(0, MAZE_SIZE);
    let playerY = getRandomInt(0, MAZE_SIZE);

    // Ensure player and finish are not at the same position
    while ((playerX === finishX && playerY === finishY)) {
        playerX = getRandomInt(0, MAZE_SIZE);
        playerY = getRandomInt(0, MAZE_SIZE);
    }

    player = new Player(playerX, playerY);

    gameState = 'memorizing';
    let countdown = 5;
    updateStatus(`Memorize the maze! Movement starts in ${countdown} seconds...`);

    // Clear any existing timer
    if (memorizeTimer) clearTimeout(memorizeTimer);

    // Start countdown timer
    memorizeTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            updateStatus(`Memorize the maze! Movement starts in ${countdown} seconds...`);
        } else {
            clearInterval(memorizeTimer);
            gameState = 'playing';
            updateStatus('Navigate to the red square! Use WASD or arrow keys, or swipe on mobile.');
        }
    }, 1000);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // No timer needed - maze is always visible
}

// Render game
function render() {
    view.clearCanvas();

    if (gameState === 'memorizing') {
        view.drawGrid(); // Draw grid lines first
        view.drawMaze(maze); // Draw walls on top
        view.drawFinish(finishX, finishY);
        view.drawPlayer(player);
    } else if (gameState === 'playing') {
        // No walls during playing, only grid, finish and player
        view.drawGrid(); // Show grid lines
        view.drawFinish(finishX, finishY);
        view.drawPlayer(player);
    } else if (gameState === 'revealing') {
        view.drawGrid(); // Draw grid lines first
        view.drawMaze(maze); // Draw walls on top
        view.drawFinish(finishX, finishY);
        view.drawPlayer(player);
        // Add radial gradient overlay: dark red at edges, transparent in center
        const gradient = ctx.createRadialGradient(CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, 'rgba(139, 0, 0, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }

    if (gameState === 'gameover') {
        view.drawGameOver();
    }
}

// Handle player movement
function movePlayer(dx, dy) {
    if (gameState !== 'playing') return;

    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check bounds
    if (newX < 0 || newX >= MAZE_SIZE || newY < 0 || newY >= MAZE_SIZE) return;

    // Check collision with walls
    if (isWallCollision(player.x, player.y, dx, dy)) {
        gameOver();
        return;
    }

    // Move player
    player.x = newX;
    player.y = newY;

    // Check if reached finish
    if (player.x === finishX && player.y === finishY) {
        score++;
        updateScore();
        startNewMaze();
    }
}

// Check if movement would hit a wall
function isWallCollision(x, y, dx, dy) {
    const node = maze.map[y][x];

    // Check if the current node points in the direction we want to move
    if (dx === 1 && node.direction.x === 1) return false; // can move right
    if (dx === -1 && node.direction.x === -1) return false; // can move left
    if (dy === 1 && node.direction.y === 1) return false; // can move down
    if (dy === -1 && node.direction.y === -1) return false; // can move up

    // Check adjacent nodes for bidirectional connections
    if (dx === 1 && x < MAZE_SIZE - 1) {
        const rightNode = maze.map[y][x + 1];
        if (rightNode.direction.x === -1) return false; // right node points left
    }
    if (dx === -1 && x > 0) {
        const leftNode = maze.map[y][x - 1];
        if (leftNode.direction.x === 1) return false; // left node points right
    }
    if (dy === 1 && y < MAZE_SIZE - 1) {
        const bottomNode = maze.map[y + 1][x];
        if (bottomNode.direction.y === -1) return false; // bottom node points up
    }
    if (dy === -1 && y > 0) {
        const topNode = maze.map[y - 1][x];
        if (topNode.direction.y === 1) return false; // top node points down
    }

    return true; // wall collision
}

// Game over
function gameOver() {
    gameState = 'revealing';
    updateStatus('Maze revealed! Showing your progress...');

    // Reveal the maze for 3 seconds, then game over
    setTimeout(() => {
        gameState = 'gameover';
        updateStatus('Game Over! Click Restart to play again.');
        restartBtn.style.display = 'block';
    }, 3000);
}

// Restart game
function restartGame() {
    score = 0;
    updateScore();
    restartBtn.style.display = 'none';
    startNewMaze();
}

// Update UI
function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function updateStatus(text) {
    gameStatus.textContent = text;
}

// Touch event variables for swipe detection
let touchStartX = 0;
let touchStartY = 0;
const MIN_SWIPE_DISTANCE = 30; // Minimum pixels for a swipe

// Event listeners
document.addEventListener('keydown', (e) => {
    if (gameState === 'playing') {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                e.preventDefault();
                movePlayer(0, -1);
                break;
            case 's':
            case 'arrowdown':
                e.preventDefault();
                movePlayer(0, 1);
                break;
            case 'a':
            case 'arrowleft':
                e.preventDefault();
                movePlayer(-1, 0);
                break;
            case 'd':
            case 'arrowright':
                e.preventDefault();
                movePlayer(1, 0);
                break;
        }
    } else if (gameState === 'gameover') {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'a':
            case 's':
            case 'd':
            case 'arrowup':
            case 'arrowdown':
            case 'arrowleft':
            case 'arrowright':
                e.preventDefault();
                restartGame();
                break;
        }
    }
});



// Adapted classes from reference code

class Node {
    constructor(directionX = 0, directionY = 0) {
        this.direction = {x: directionX, y: directionY};
    }

    setDirection(x, y) {
        this.direction.x = x;
        this.direction.y = y;
    }
}

class GameMaze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.map = this.newMap(); // the array of nodes defining the maze
        this.origin = {x: this.width - 1, y: this.height - 1}; // position of the origin point
        this.nextOrigin = {x: null, y: null}; // position of the next origin point. this is defined here to improve performance
        this.possibleDirections = [
            {x: -1, y: 0},
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: 0, y: 1}
        ]; // an array containing the possible directions the origin can travel in
    }

    // returns a map of a valid maze
    newMap() {
        let map = [];
        for (let y = 0; y < this.height; y++) {
            map.push([]);
            for (let x = 0; x < this.width - 1; x++) {
                map[y].push(new Node(1, 0));
            }
            map[y].push(new Node(0, 1));
        }
        map[this.height - 1][this.width - 1].setDirection(0, 0);

        return map;
    }

    setOrigin(x, y) {
        this.origin.x = x;
        this.origin.y = y;
    }

    setNextOrigin(x, y) {
        this.nextOrigin.x = x;
        this.nextOrigin.y = y;
    }

    // performs one iteration of the algorithm
    iterate() {
        // select a random direction
        let direction = this.possibleDirections[getRandomInt(0, this.possibleDirections.length)];

        // check if out of bounds
        this.setNextOrigin(this.origin.x + direction.x, this.origin.y + direction.y);
        if (this.nextOrigin.x < 0 || this.nextOrigin.x >= this.width || this.nextOrigin.y < 0 || this.nextOrigin.y >= this.height) return;

        // set the origin nodes direction to this direction
        this.map[this.origin.y][this.origin.x].setDirection(direction.x, direction.y);

        // the node in this direction becomes the new origin node
        this.setOrigin(this.nextOrigin.x, this.nextOrigin.y);
        this.map[this.origin.y][this.origin.x].setDirection(0, 0);
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class GameView {
    constructor() {
        this.cnv = document.getElementById('game-canvas');
        this.ctx = this.cnv.getContext('2d');
    }

    clearCanvas() {
        this.ctx.fillStyle = "#FDECEF";
        this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
    }

    drawMaze(maze) {
        this.ctx.strokeStyle = "#BF3853"; // Wall color
        this.ctx.lineWidth = 3; // Increased thickness for better visibility

        // Draw outer walls
        this.ctx.strokeRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw internal walls
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const node = maze.map[y][x];

                // Check right wall (between this cell and right neighbor)
                if (x < maze.width - 1) {
                    const rightNode = maze.map[y][x + 1];
                    // Draw wall if no connection to the right
                    if (!(node.direction.x === 1 || rightNode.direction.x === -1)) {
                        this.ctx.beginPath();
                        this.ctx.moveTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
                        this.ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                        this.ctx.stroke();
                    }
                }

                // Check bottom wall (between this cell and bottom neighbor)
                if (y < maze.height - 1) {
                    const bottomNode = maze.map[y + 1][x];
                    // Draw wall if no connection downward
                    if (!(node.direction.y === 1 || bottomNode.direction.y === -1)) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x * CELL_SIZE, (y + 1) * CELL_SIZE);
                        this.ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                        this.ctx.stroke();
                    }
                }
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = "#ffb6c1"; // Pink grid lines to match theme
        this.ctx.lineWidth = 1;

        // Draw horizontal grid lines
        for (let y = 1; y < MAZE_SIZE; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * CELL_SIZE);
            this.ctx.lineTo(CANVAS_SIZE, y * CELL_SIZE);
            this.ctx.stroke();
        }

        // Draw vertical grid lines
        for (let x = 1; x < MAZE_SIZE; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * CELL_SIZE, 0);
            this.ctx.lineTo(x * CELL_SIZE, CANVAS_SIZE);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        this.ctx.fillStyle = "#00ff00";
        this.ctx.beginPath();
        this.ctx.arc(
            player.x * CELL_SIZE + CELL_SIZE / 2,
            player.y * CELL_SIZE + CELL_SIZE / 2,
            CELL_SIZE / 4,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }

    drawFinish(x, y) {
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillRect(
            x * CELL_SIZE + CELL_SIZE / 4,
            y * CELL_SIZE + CELL_SIZE / 4,
            CELL_SIZE / 2,
            CELL_SIZE / 2
        );
    }

    drawGameOver() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);

        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "36px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText("GAME OVER", this.cnv.width / 2, this.cnv.height / 2 - 20);
        this.ctx.font = "24px Arial";
        this.ctx.fillText(`Final Score: ${score}`, this.cnv.width / 2, this.cnv.height / 2 + 20);
        this.ctx.textAlign = "left";
    }
}

// Helper function
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// Start game when page loads
window.addEventListener('load', () => {
    initGame();
    gameLoop();
});
