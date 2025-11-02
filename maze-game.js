/*
Maze Game using Origin Shift Algorithm
Adapted from reference code
*/

// Game constants
const MAZE_SIZE = 8;
const CELL_SIZE = 50;
const CANVAS_SIZE = MAZE_SIZE * CELL_SIZE;
const DISPLAY_TIME = 5000; // 5 seconds

// Game state
let gameState = 'generating'; // 'generating', 'displaying', 'playing', 'gameover'
let score = 0;
let displayTimer = 0;
let maze = null;
let player = null;
let view = null;

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

    player = new Player(0, 0); // Start at top-left
    displayTimer = Date.now() + DISPLAY_TIME;

    gameState = 'displaying';
    updateStatus('Memorize the maze! (5 seconds)');
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    if (gameState === 'displaying') {
        if (Date.now() >= displayTimer) {
            gameState = 'playing';
            updateStatus('Navigate to the red square! Use WASD keys.');
        }
    }
}

// Render game
function render() {
    view.clearCanvas();

    if (gameState === 'displaying' || gameState === 'playing') {
        view.drawMaze(maze, gameState === 'displaying');
        view.drawFinish(MAZE_SIZE - 1, MAZE_SIZE - 1);
        view.drawPlayer(player);
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
    if (player.x === MAZE_SIZE - 1 && player.y === MAZE_SIZE - 1) {
        score++;
        updateScore();
        startNewMaze();
    }
}

// Check if movement would hit a wall
function isWallCollision(x, y, dx, dy) {
    const node = maze.map[y][x];
    // If trying to move in opposite direction of node's direction, it's a wall
    if ((dx === -node.direction.x && dy === -node.direction.y) ||
        (dx === node.direction.x && dy === node.direction.y)) {
        return false; // Can move in direction of arrow or opposite
    }
    return true; // Wall in other directions
}

// Game over
function gameOver() {
    gameState = 'gameover';
    updateStatus('Game Over! Click Restart to play again.');
    restartBtn.style.display = 'block';
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

// Event listeners
document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;

    switch (e.key.toLowerCase()) {
        case 'w':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 's':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'a':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'd':
            e.preventDefault();
            movePlayer(1, 0);
            break;
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
        this.map = this.newMap();
        this.origin = {x: this.width - 1, y: this.height - 1};
        this.nextOrigin = {x: null, y: null};
        this.possibleDirections = [
            {x: -1, y: 0},
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: 0, y: 1}
        ];
    }

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

    iterate() {
        let direction = this.possibleDirections[getRandomInt(0, this.possibleDirections.length)];
        this.setNextOrigin(this.origin.x + direction.x, this.origin.y + direction.y);
        if (this.nextOrigin.x < 0 || this.nextOrigin.x >= this.width || this.nextOrigin.y < 0 || this.nextOrigin.y >= this.height) return;

        this.map[this.origin.y][this.origin.x].setDirection(direction.x, direction.y);
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
        this.ctx.fillStyle = "#1a1a1a";
        this.ctx.fillRect(0, 0, this.cnv.width, this.cnv.height);
    }

    drawMaze(maze, showWalls = true) {
        if (!showWalls) return;

        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 2;

        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const node = maze.map[y][x];
                const xPos = x * CELL_SIZE + CELL_SIZE / 2;
                const yPos = y * CELL_SIZE + CELL_SIZE / 2;

                // Draw walls based on node directions
                this.ctx.beginPath();
                this.ctx.moveTo(xPos, yPos);

                // Draw line in direction of node
                const endX = xPos + node.direction.x * CELL_SIZE / 2;
                const endY = yPos + node.direction.y * CELL_SIZE / 2;
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();

                // Draw perpendicular walls (simplified representation)
                if (node.direction.x === 0) { // vertical movement allowed
                    // Draw horizontal walls
                    this.ctx.beginPath();
                    this.ctx.moveTo(x * CELL_SIZE, y * CELL_SIZE);
                    this.ctx.lineTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
                    this.ctx.moveTo(x * CELL_SIZE, (y + 1) * CELL_SIZE);
                    this.ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                    this.ctx.stroke();
                } else { // horizontal movement allowed
                    // Draw vertical walls
                    this.ctx.beginPath();
                    this.ctx.moveTo(x * CELL_SIZE, y * CELL_SIZE);
                    this.ctx.lineTo(x * CELL_SIZE, (y + 1) * CELL_SIZE);
                    this.ctx.moveTo((x + 1) * CELL_SIZE, y * CELL_SIZE);
                    this.ctx.lineTo((x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE);
                    this.ctx.stroke();
                }
            }
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
